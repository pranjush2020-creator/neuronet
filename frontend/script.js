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

    const composerForm = document.getElementById("composerForm");

    const messageInput = document.getElementById("messageInput");

    const sendBtn = document.getElementById("sendBtn");

    const micBtn = document.getElementById("micBtn");

    const attachBtn = document.getElementById("attachBtn");

    const fileInput = document.getElementById("fileInput");

    const uploadZone = document.getElementById("uploadZone");

    const docList = document.getElementById("docList");

    const historyList = document.getElementById("historyList");

    const newChatBtn = document.getElementById("newChatBtn");

    const sidebar = document.getElementById("sidebar");

    const sidebarToggle = document.getElementById("sidebarToggle");

    const sidebarClose = document.getElementById("sidebarClose");

    const toast = document.getElementById("toast");

    const bottomComposer = document.getElementById("bottomComposer");


    /* =====================================================
       STATE
    ===================================================== */

    let sessions = [];

    let activeSessionId = null;

    let uploadedDocs = [];

    let isListening = false;

    let recognition = null;


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


        emptyState.style.display = "flex";


        closeSidebar();
    }


    function getActiveSession() {

        return sessions.find(
            session => session.id === activeSessionId
        );
    }


    /* =====================================================
       DATE HELPERS
    ===================================================== */

    function getDateLabel(date) {

        const today = new Date();

        const yesterday = new Date();

        yesterday.setDate(today.getDate() - 1);


        if (
            date.toDateString() ===
            today.toDateString()
        ) {

            return "TODAY";

        }


        if (
            date.toDateString() ===
            yesterday.toDateString()
        ) {

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

            if (!session.messages.length)
                return;


            const firstMessage = session.messages.find(
                m => m.role === "user"
            );


            if (!firstMessage)
                return;


            const date = new Date(firstMessage.timestamp);

            const label = getDateLabel(date);


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

            dateHeading.textContent = label;

            historyList.appendChild(dateHeading);


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
                    () => {

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

        const session = getActiveSession();


        chatLog
            .querySelectorAll(
                ".msg, .typing"
            )
            .forEach(
                el => el.remove()
            );


        if (
            !session ||
            session.messages.length === 0
        ) {

            emptyState.style.display = "flex";

            bottomComposer.classList.remove(
                "visible"
            );

            return;

        }


        emptyState.style.display = "none";

        bottomComposer.classList.add(
            "visible"
        );


        session.messages.forEach(
            message => appendMessageEl(message)
        );


        scrollToBottom();

    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    function appendMessageEl(msg) {

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

                    citationRow.appendChild(
                        chip
                    );

                }
            );


            col.appendChild(
                citationRow
            );

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
            document.getElementById(
                "typingRow"
            );


        if (row)
            row.remove();

    }


    /* =====================================================
       SEND
    ===================================================== */

    async function handleSend(text) {

        text = text.trim();


        if (!text)
            return;


        let session =
            getActiveSession();


        if (!session) {

            createSession();

            session =
                getActiveSession();

        }


        emptyState.style.display =
            "none";


        bottomComposer.classList.add(
            "visible"
        );


        const now =
            new Date();


        const userMsg = {

            role: "user",

            text,

            timestamp:
                now.toISOString(),

            time:
                getTime(now)

        };


        session.messages.push(
            userMsg
        );


        appendMessageEl(
            userMsg
        );


        scrollToBottom();


        if (
            session.title ===
            "New Chat"
        ) {

            session.title =
                text.length > 40
                    ? text.slice(0, 40) + "…"
                    : text;

        }


        renderHistory();


        messageInput.value = "";

        autosizeInput();


        appendTypingIndicator();


        try {

            const result =
                await getAIResponse(
                    text
                );


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


            session.messages.push(
                aiMsg
            );


            appendMessageEl(
                aiMsg
            );


            renderHistory();

            scrollToBottom();


        } catch (error) {

            removeTypingIndicator();


            const errorMsg = {

                role: "ai",

                text:
                    "⚠ Unable to connect to the AI backend. Please check whether your Python backend and Ollama are running.",

                citations: [],

                timestamp:
                    new Date().toISOString()

            };


            session.messages.push(
                errorMsg
            );


            appendMessageEl(
                errorMsg
            );


            console.error(error);

        }

    }


    /* =====================================================
       BACKEND
    ===================================================== */

    async function getAIResponse(question) {

        /*
        =====================================================
        IMPORTANT

        Replace this URL with your Python backend.

        Example:

        http://127.0.0.1:8000/api/chat

        =====================================================
        */


        const response =
            await fetch(
                "http://127.0.0.1:8000/api/chat",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        question: question,

                        lang:
                            "en-IN",

                        session_id:
                            activeSessionId

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend request failed"
            );

        }


        const data =
            await response.json();


        return {

            answer:
                data.answer,

            citations:
                data.citations || []

        };

    }


    /* =====================================================
       FORM
    ===================================================== */

    composerForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            handleSend(
                messageInput.value
            );

        }
    );


    messageInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                handleSend(
                    messageInput.value
                );

            }

        }
    );


    /* =====================================================
       AUTOSIZE
    ===================================================== */

    function autosizeInput() {

        messageInput.style.height =
            "auto";


        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                140
            ) + "px";

    }


    messageInput.addEventListener(
        "input",
        autosizeInput
    );


    /* =====================================================
       SUGGESTIONS
    ===================================================== */

    document
        .querySelectorAll(".suggestion")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    handleSend(
                        button.dataset.q
                    );

                }
            );

        });


    /* =====================================================
       NEW CHAT
    ===================================================== */

    newChatBtn.addEventListener(
        "click",
        createSession
    );


    /* =====================================================
       PDF
    ===================================================== */

    attachBtn.addEventListener(
        "click",
        () => fileInput.click()
    );


    fileInput.addEventListener(
        "change",
        event => {

            handleFiles(
                event.target.files
            );

            fileInput.value = "";

        }
    );


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


            /*
            ============================================
            REAL BACKEND PDF UPLOAD GOES HERE
            ============================================

            Later we can replace this simulation
            with FormData + Python API.
            */


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

        docList.innerHTML = "";


        uploadedDocs.forEach(
            doc => {

                const li =
                    document.createElement(
                        "li"
                    );


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


        recognition.continuous =
            false;

        recognition.interimResults =
            true;


        recognition.addEventListener(
            "result",
            event => {

                let transcript = "";


                for (
                    const result of
                    event.results
                ) {

                    transcript +=
                        result[0]
                            .transcript;

                }


                messageInput.value =
                    transcript;


                autosizeInput();

            }
        );


        recognition.addEventListener(
            "end",
            () => {

                isListening = false;

                micBtn.classList.remove(
                    "listening"
                );

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

        micBtn.disabled = true;

    }


    micBtn.addEventListener(
        "click",
        () => {

            if (!recognition)
                return;


            if (isListening) {

                recognition.stop();

                isListening = false;

                return;

            }


            recognition.lang =
                "en-IN";


            recognition.start();

            isListening = true;


            showToast(
                "Listening..."
            );

        }
    );


    /* =====================================================
       SIDEBAR
    ===================================================== */

    sidebarToggle.addEventListener(
        "click",
        () => {

            sidebar.classList.add(
                "open"
            );

        }
    );


    sidebarClose.addEventListener(
        "click",
        closeSidebar
    );


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

    }


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer;


    function showToast(message) {

        clearTimeout(
            toastTimer
        );


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
            document.createElement(
                "div"
            );


        div.textContent =
            value;


        return div.innerHTML;

    }


    function scrollToBottom() {

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