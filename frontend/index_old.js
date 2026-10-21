/* =========================================================
   PLANT-GPT
   PREMIUM INDUSTRIAL AI FRONTEND
========================================================= */

(() => {

    "use strict";

    /* =====================================================
       DOM
    ===================================================== */

    const chatLog = document.getElementById("chatLog");
    const chatScroll = document.getElementById("chatScroll");
    const emptyState = document.getElementById("emptyState");

    /* FIRST COMPOSER */
    const composerForm = document.getElementById("composerForm");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const micBtn = document.getElementById("micBtn");
    const attachBtn = document.getElementById("attachBtn");

    /* BOTTOM COMPOSER */
    const bottomComposer = document.getElementById("bottomComposer");
    const bottomComposerForm = document.getElementById("bottomComposerForm");
    const bottomMessageInput = document.getElementById("bottomMessageInput");
    const bottomSendBtn = document.getElementById("bottomSendBtn");
    const bottomMicBtn = document.getElementById("bottomMicBtn");
    const bottomAttachBtn = document.getElementById("bottomAttachBtn");

    /* OTHER UI */
    const fileInput = document.getElementById("fileInput");
    const uploadZone = document.getElementById("uploadZone");
    const docList = document.getElementById("docList");
    const historyList = document.getElementById("historyList");
    const newChatBtn = document.getElementById("newChatBtn");
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarClose = document.getElementById("sidebarClose");
    const toast = document.getElementById("toast");


    /* =====================================================
       STATE
    ===================================================== */

    let sessions = [];
    let activeSessionId = null;
    let uploadedDocs = [];
    let isListening = false;
    let recognition = null;

    /* Prevent multiple requests */
    let isSending = false;


    /* =====================================================
       SESSION
    ===================================================== */

    function createSession() {

        const session = {
            id: "session_" + Date.now(),
            title: "New Chat",
            messages: []
        };

        sessions.unshift(session);
        activeSessionId = session.id;

        renderHistory();
        renderChat();

        if (emptyState) {
            emptyState.style.display = "flex";
        }

        closeSidebar();
    }


    function getActiveSession() {

        return sessions.find(
            session => session.id === activeSessionId
        );

    }


    /* =====================================================
       DATE / TIME
    ===================================================== */

    function getDateLabel(date) {

        const today = new Date();
        const yesterday = new Date();

        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "TODAY";
        }

        if (date.toDateString() === yesterday.toDateString()) {
            return "YESTERDAY";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).toUpperCase();

    }


    function getTime(date) {

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =====================================================
       HISTORY
    ===================================================== */

    function renderHistory() {

        if (!historyList) {
            return;
        }

        historyList.innerHTML = "";

        if (!sessions.length) {

            historyList.innerHTML = `
                <div class="history-query">
                    No searches yet
                </div>
            `;

            return;
        }

        const groups = {};

        sessions.forEach(session => {

            if (!session.messages.length) {
                return;
            }

            const firstMessage =
                session.messages.find(
                    message => message.role === "user"
                );

            if (!firstMessage) {
                return;
            }

            const date =
                new Date(firstMessage.timestamp);

            const label =
                getDateLabel(date);

            if (!groups[label]) {
                groups[label] = [];
            }

            groups[label].push({
                session,
                date,
                text: firstMessage.text
            });

        });


        Object.keys(groups).forEach(label => {

            const dateHeading =
                document.createElement("div");

            dateHeading.className =
                "history-date";

            dateHeading.textContent =
                label;

            historyList.appendChild(
                dateHeading
            );


            groups[label].forEach(item => {

                const div =
                    document.createElement("div");

                div.className =
                    "history-item";

                div.innerHTML = `
                    <span class="history-time">
                        ${getTime(item.date)}
                    </span>

                    <span class="history-query">
                        ${escapeHtml(item.text)}
                    </span>
                `;


                div.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        activeSessionId =
                            item.session.id;

                        renderChat();

                        closeSidebar();

                    }
                );


                historyList.appendChild(div);

            });

        });

    }


    /* =====================================================
       CHAT RENDER
    ===================================================== */

    function renderChat() {

        if (!chatLog) {
            return;
        }

        const session =
            getActiveSession();

        chatLog
            .querySelectorAll(
                ".msg, .typing"
            )
            .forEach(
                element => element.remove()
            );


        if (
            !session ||
            session.messages.length === 0
        ) {

            if (emptyState) {
                emptyState.style.display = "flex";
            }

            if (bottomComposer) {
                bottomComposer.classList.remove(
                    "visible"
                );
            }

            return;
        }


        if (emptyState) {
            emptyState.style.display = "none";
        }

        if (bottomComposer) {
            bottomComposer.classList.add("visible");
        }


        session.messages.forEach(
            message => appendMessageEl(message)
        );


        scrollToBottom();

    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    function appendMessageEl(msg) {

        if (!chatLog) {
            return;
        }

        const row =
            document.createElement("div");

        row.className =
            "msg " +
            (msg.role === "user"
                ? "user"
                : "ai");


        const avatar =
            document.createElement("div");

        avatar.className =
            "avatar";

        avatar.textContent =
            msg.role === "user"
                ? "YOU"
                : "AI";


        const col =
            document.createElement("div");

        col.className =
            "bubble-col";


        const bubble =
            document.createElement("div");

        bubble.className =
            "bubble";

        bubble.textContent =
            msg.text;


        col.appendChild(bubble);


        if (
            msg.citations &&
            msg.citations.length
        ) {

            const citationRow =
                document.createElement("div");

            citationRow.className =
                "citation-row";


            msg.citations.forEach(
                citation => {

                    const chip =
                        document.createElement("span");

                    chip.className =
                        "citation-chip";

                    chip.textContent =
                        "📄 " + citation;

                    citationRow.appendChild(chip);

                }
            );


            col.appendChild(citationRow);

        }


        const meta =
            document.createElement("div");

        meta.className =
            "msg-meta";


        const date =
            new Date(msg.timestamp);


        meta.textContent =
            getTime(date);


        col.appendChild(meta);


        row.appendChild(avatar);
        row.appendChild(col);

        chatLog.appendChild(row);

    }


    /* =====================================================
       TYPING
    ===================================================== */

    function appendTypingIndicator() {

        if (!chatLog) {
            return;
        }

        const row =
            document.createElement("div");

        row.className =
            "msg ai typing";

        row.id =
            "typingRow";


        row.innerHTML = `
            <div class="avatar">
                AI
            </div>

            <div class="bubble-col">

                <div class="bubble">

                    <span>●</span>
                    <span>●</span>
                    <span>●</span>

                </div>

            </div>
        `;


        chatLog.appendChild(row);

        scrollToBottom();

    }


    function removeTypingIndicator() {

        const row =
            document.getElementById("typingRow");

        if (row) {
            row.remove();
        }

    }


    /* =====================================================
       SEND BUTTON STATE
    ===================================================== */

    function setSendingState(sending) {

        isSending = sending;

        if (sendBtn) {
            sendBtn.disabled = sending;
        }

        if (bottomSendBtn) {
            bottomSendBtn.disabled = sending;
        }

    }


    /* =====================================================
       MAIN SEND FUNCTION
    ===================================================== */

    async function handleSend(text) {

        text = text.trim();

        if (!text) {
            return;
        }

        if (isSending) {
            return;
        }


        setSendingState(true);


        let session =
            getActiveSession();


        if (!session) {

            createSession();

            session =
                getActiveSession();

        }


        if (!session) {

            setSendingState(false);

            return;

        }


        if (emptyState) {
            emptyState.style.display = "none";
        }


        if (bottomComposer) {
            bottomComposer.classList.add("visible");
        }


        const now =
            new Date();


        const userMsg = {

            role: "user",

            text: text,

            timestamp:
                now.toISOString(),

            time:
                getTime(now)

        };


        session.messages.push(userMsg);

        appendMessageEl(userMsg);

        scrollToBottom();


        if (session.title === "New Chat") {

            session.title =
                text.length > 40
                    ? text.slice(0, 40) + "…"
                    : text;

        }


        renderHistory();


        /* Clear BOTH text boxes */
        if (messageInput) {
            messageInput.value = "";
            autosizeInput(messageInput);
        }

        if (bottomMessageInput) {
            bottomMessageInput.value = "";
            autosizeInput(bottomMessageInput);
        }


        appendTypingIndicator();


        try {

            const result =
                await getAIResponse(text);


            removeTypingIndicator();


            const aiNow =
                new Date();


            const aiMsg = {

                role: "ai",

                text:
                    result.answer,

                citations:
                    result.citations || [],

                timestamp:
                    aiNow.toISOString(),

                time:
                    getTime(aiNow)

            };


            session.messages.push(aiMsg);

            appendMessageEl(aiMsg);

            renderHistory();

            scrollToBottom();


        } catch (error) {

            removeTypingIndicator();

            console.error(
                "PLANT-GPT backend error:",
                error
            );


            const errorMsg = {

                role: "ai",

                text:
                    "⚠ Unable to connect to the AI backend. Please check whether your Python RAG server and Ollama are running.",

                citations: [],

                timestamp:
                    new Date().toISOString()

            };


            session.messages.push(errorMsg);

            appendMessageEl(errorMsg);

            scrollToBottom();

        }


        /* IMPORTANT:
           Always unlock the input after response */
        setSendingState(false);

    }


    /* =====================================================
       BACKEND
    ===================================================== */

    async function getAIResponse(question) {

        const response =
            await fetch(
                "http://51.0.0.31:8000/ask",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question,
                        language: "en-IN"
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "RAG backend request failed. HTTP status: " +
                response.status
            );

        }


        const data =
            await response.json();


        const citations =
            (data.sources || [])
                .map(source => {

                    if (
                        typeof source === "string"
                    ) {
                        return source;
                    }

                    return (
                        source.source ||
                        "Industrial Manual"
                    );

                });


        return {

            answer:
                data.answer ||
                "I could not generate an answer.",

            citations:
                [...new Set(citations)]

        };

    }


    /* =====================================================
       FIRST FORM
       ===================================================== */

    if (composerForm) {

        composerForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();
                event.stopPropagation();

                if (isSending) {
                    return;
                }

                const text =
                    messageInput
                        ? messageInput.value.trim()
                        : "";

                if (!text) {
                    return;
                }

                await handleSend(text);

            }
        );

    }


    /* =====================================================
       FIRST INPUT ENTER
       ===================================================== */

    if (messageInput) {

        messageInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();
                    event.stopPropagation();

                    if (isSending) {
                        return;
                    }

                    const text =
                        messageInput.value.trim();

                    if (!text) {
                        return;
                    }

                    handleSend(text);

                }

            }
        );


        messageInput.addEventListener(
            "input",
            () => {
                autosizeInput(messageInput);
            }
        );

    }


    /* =====================================================
       BOTTOM FORM
       THIS IS THE SECOND QUESTION FIX
    ===================================================== */

    if (bottomComposerForm) {

        bottomComposerForm.addEventListener(
            "submit",
            async event => {

                /* NEVER allow the browser to reload */
                event.preventDefault();
                event.stopPropagation();

                if (isSending) {
                    return;
                }

                const text =
                    bottomMessageInput
                        ? bottomMessageInput.value.trim()
                        : "";

                if (!text) {
                    return;
                }

                await handleSend(text);

            }
        );

    }


    /* =====================================================
       BOTTOM INPUT ENTER
       ===================================================== */

    if (bottomMessageInput) {

        bottomMessageInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    /* NEVER allow page reload */
                    event.preventDefault();
                    event.stopPropagation();

                    if (isSending) {
                        return;
                    }

                    const text =
                        bottomMessageInput.value.trim();

                    if (!text) {
                        return;
                    }

                    handleSend(text);

                }

            }
        );


        bottomMessageInput.addEventListener(
            "input",
            () => {
                autosizeInput(bottomMessageInput);
            }
        );

    }


    /* =====================================================
       AUTOSIZE
    ===================================================== */

    function autosizeInput(input) {

        if (!input) {
            return;
        }

        input.style.height = "auto";

        input.style.height =
            Math.min(
                input.scrollHeight,
                140
            ) + "px";

    }


    /* =====================================================
       SUGGESTIONS
    ===================================================== */

    document
        .querySelectorAll(".suggestion")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    if (isSending) {
                        return;
                    }

                    handleSend(
                        button.dataset.q
                    );

                }
            );

        });


    /* =====================================================
       NEW CHAT
    ===================================================== */

    if (newChatBtn) {

        newChatBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                createSession();

            }
        );

    }


    /* =====================================================
       PDF
    ===================================================== */

    if (attachBtn && fileInput) {

        attachBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                fileInput.click();

            }
        );

    }


    if (bottomAttachBtn && fileInput) {

        bottomAttachBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                fileInput.click();

            }
        );

    }


    if (fileInput) {

        fileInput.addEventListener(
            "change",
            event => {

                handleFiles(
                    event.target.files
                );

                fileInput.value = "";

            }
        );

    }


    if (uploadZone) {

        ["dragenter", "dragover"]
            .forEach(eventName => {

                uploadZone.addEventListener(
                    eventName,
                    event => {

                        event.preventDefault();

                        uploadZone.style.borderColor =
                            "var(--cyan)";

                    }
                );

            });


        ["dragleave", "drop"]
            .forEach(eventName => {

                uploadZone.addEventListener(
                    eventName,
                    event => {

                        event.preventDefault();

                        uploadZone.style.borderColor =
                            "";

                    }
                );

            });


        uploadZone.addEventListener(
            "drop",
            event => {

                handleFiles(
                    event.dataTransfer.files
                );

            }
        );

    }


    function handleFiles(fileList) {

        const files =
            Array.from(fileList)
                .filter(
                    file =>
                        file.type ===
                        "application/pdf"
                );


        if (!files.length) {

            showToast(
                "Only PDF files are supported."
            );

            return;

        }


        files.forEach(file => {

            const doc = {

                name: file.name,

                status: "indexing"

            };


            uploadedDocs.push(doc);

            renderDocs();


            setTimeout(
                () => {

                    doc.status =
                        "ready";

                    renderDocs();

                    showToast(
                        `"${file.name}" is ready.`
                    );

                },
                1200
            );

        });

    }


    function renderDocs() {

        if (!docList) {
            return;
        }

        docList.innerHTML = "";


        uploadedDocs.forEach(
            doc => {

                const li =
                    document.createElement("li");


                li.className =
                    "doc-item";


                li.innerHTML = `
                    <span>📄</span>

                    <span class="doc-name">
                        ${escapeHtml(doc.name)}
                    </span>

                    <span class="doc-status ${doc.status}">
                        ${
                            doc.status === "indexing"
                                ? "INDEXING"
                                : "READY"
                        }
                    </span>
                `;


                docList.appendChild(li);

            }
        );

    }


    /* =====================================================
       VOICE
    ===================================================== */

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (SpeechRecognition) {

        recognition =
            new SpeechRecognition();

        recognition.continuous = false;

        recognition.interimResults = true;


        recognition.addEventListener(
            "result",
            event => {

                let transcript = "";

                for (
                    const result of event.results
                ) {

                    transcript +=
                        result[0].transcript;

                }


                if (messageInput) {

                    messageInput.value =
                        transcript;

                    autosizeInput(
                        messageInput
                    );

                }

            }
        );


        recognition.addEventListener(
            "end",
            () => {

                isListening = false;

                if (micBtn) {
                    micBtn.classList.remove(
                        "listening"
                    );
                }

            }
        );


        recognition.addEventListener(
            "error",
            () => {

                isListening = false;

                showToast(
                    "Microphone access failed."
                );

            }
        );

    } else {

        if (micBtn) {
            micBtn.disabled = true;
        }

        if (bottomMicBtn) {
            bottomMicBtn.disabled = true;
        }

    }


    /* =====================================================
       FIRST MIC
       ===================================================== */

    if (micBtn) {

        micBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                if (!recognition) {
                    return;
                }


                if (isListening) {

                    recognition.stop();

                    isListening = false;

                    return;

                }


                recognition.lang =
                    "en-IN";

                recognition.start();

                isListening = true;


                micBtn.classList.add(
                    "listening"
                );


                showToast(
                    "Listening..."
                );

            }
        );

    }


    /* =====================================================
       BOTTOM MIC
       ===================================================== */

    if (bottomMicBtn) {

        bottomMicBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                if (!recognition) {
                    return;
                }


                if (isListening) {

                    recognition.stop();

                    isListening = false;

                    return;

                }


                recognition.lang =
                    "en-IN";

                recognition.start();

                isListening = true;


                if (micBtn) {

                    micBtn.classList.add(
                        "listening"
                    );

                }


                showToast(
                    "Listening..."
                );

            }
        );

    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                if (sidebar) {

                    sidebar.classList.add(
                        "open"
                    );

                }

            }
        );

    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                closeSidebar();

            }
        );

    }


    function closeSidebar() {

        if (sidebar) {

            sidebar.classList.remove(
                "open"
            );

        }

    }


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer;


    function showToast(message) {

        if (!toast) {
            return;
        }


        clearTimeout(toastTimer);


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


        toastTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2600
            );

    }


    /* =====================================================
       UTIL
    ===================================================== */

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value;

        return div.innerHTML;

    }


    function scrollToBottom() {

        if (!chatScroll) {
            return;
        }

        requestAnimationFrame(
            () => {

                chatScroll.scrollTop =
                    chatScroll.scrollHeight;

            }
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    createSession();

})();