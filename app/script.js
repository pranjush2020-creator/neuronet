/* =========================================================
   PLANT-GPT
   SIMPLE WORKING INDUSTRIAL AI FRONTEND
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       BACKEND URL
    ===================================================== */

    const API_URL = "http://51.0.0.31:8000/ask";


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const chatLog = document.getElementById("chatLog");
    const emptyState = document.getElementById("emptyState");

    const composerForm =
        document.getElementById("composerForm");

    const messageInput =
        document.getElementById("messageInput");

    const sendBtn =
        document.getElementById("sendBtn");

    const bottomComposer =
        document.getElementById("bottomComposer");

    const bottomComposerForm =
        document.getElementById("bottomComposerForm");

    const bottomMessageInput =
        document.getElementById("bottomMessageInput");

    const bottomSendBtn =
        document.getElementById("bottomSendBtn");


    /* =====================================================
       STATE
    ===================================================== */

    let isSending = false;


    /* =====================================================
       CHECK FRONTEND
    ===================================================== */

    console.log("=================================");
    console.log("PLANT-GPT FRONTEND LOADED");
    console.log("API:", API_URL);
    console.log("=================================");


    if (!composerForm) {
        console.error("ERROR: composerForm not found");
    }

    if (!messageInput) {
        console.error("ERROR: messageInput not found");
    }

    if (!chatLog) {
        console.error("ERROR: chatLog not found");
    }


    /* =====================================================
       ADD MESSAGE
    ===================================================== */

    function addMessage(text, type) {

        if (!chatLog) {
            return;
        }

        const row =
            document.createElement("div");

        row.className =
            "msg " +
            (type === "user" ? "user" : "ai");


        const avatar =
            document.createElement("div");

        avatar.className =
            "avatar";

        avatar.textContent =
            type === "user"
                ? "YOU"
                : "AI";


        const bubbleCol =
            document.createElement("div");

        bubbleCol.className =
            "bubble-col";


        const bubble =
            document.createElement("div");

        bubble.className =
            "bubble";

        bubble.textContent =
            text;


        bubbleCol.appendChild(bubble);

        row.appendChild(avatar);

        row.appendChild(bubbleCol);

        chatLog.appendChild(row);


        chatLog.scrollTop =
            chatLog.scrollHeight;
    }


    /* =====================================================
       TYPING INDICATOR
    ===================================================== */

    function showTyping() {

        if (!chatLog) {
            return;
        }

        removeTyping();


        const row =
            document.createElement("div");

        row.id =
            "plantGPTTyping";

        row.className =
            "msg ai typing";


        row.innerHTML = `
            <div class="avatar">AI</div>

            <div class="bubble-col">

                <div class="bubble">
                    <span>●</span>
                    <span>●</span>
                    <span>●</span>
                </div>

            </div>
        `;


        chatLog.appendChild(row);

        chatLog.scrollTop =
            chatLog.scrollHeight;
    }


    function removeTyping() {

        const old =
            document.getElementById(
                "plantGPTTyping"
            );

        if (old) {
            old.remove();
        }
    }


    /* =====================================================
       SEND MESSAGE TO BACKEND
    ===================================================== */

    async function sendToBackend(question) {

        console.log(
            "Sending to backend:",
            question
        );


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            question:
                                question,

                            language:
                                "en-IN"
                        })
                }
            );


        console.log(
            "Backend HTTP status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Backend HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "Backend data:",
            data
        );


        return data;
    }


    /* =====================================================
       MAIN SEND FUNCTION
    ===================================================== */

    async function handleSend(question) {

        question =
            String(
                question || ""
            ).trim();


        if (!question) {
            return;
        }


        if (isSending) {
            return;
        }


        isSending = true;


        /* Disable buttons */

        if (sendBtn) {
            sendBtn.disabled = true;
        }

        if (bottomSendBtn) {
            bottomSendBtn.disabled = true;
        }


        /* Hide welcome screen */

        if (emptyState) {
            emptyState.style.display =
                "none";
        }


        /* Show bottom composer */

        if (bottomComposer) {
            bottomComposer.classList.add(
                "visible"
            );
        }


        /* Show user message */

        addMessage(
            question,
            "user"
        );


        /* Clear inputs */

        if (messageInput) {
            messageInput.value = "";
        }

        if (bottomMessageInput) {
            bottomMessageInput.value = "";
        }


        /* Show typing */

        showTyping();


        try {

            const data =
                await sendToBackend(
                    question
                );


            removeTyping();


            const answer =
                data.answer ||
                "No answer was returned by the AI.";


            addMessage(
                answer,
                "ai"
            );


        } catch (error) {

            console.error(
                "PLANT-GPT ERROR:",
                error
            );


            removeTyping();


            addMessage(
                "⚠ AI backend connection failed. Please make sure the PLANT-GPT server is running on port 8000.",
                "ai"
            );

        } finally {

            isSending = false;


            if (sendBtn) {
                sendBtn.disabled = false;
            }

            if (bottomSendBtn) {
                bottomSendBtn.disabled = false;
            }


            if (messageInput) {
                messageInput.focus();
            }
        }
    }


    /* =====================================================
       MAIN FORM
    ===================================================== */

    if (composerForm) {

        composerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                if (!messageInput) {
                    return;
                }


                handleSend(
                    messageInput.value
                );

            }
        );
    }


    /* =====================================================
       ENTER KEY
    ===================================================== */

    if (messageInput) {

        messageInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    handleSend(
                        messageInput.value
                    );
                }

            }
        );
    }


    /* =====================================================
       BOTTOM FORM
    ===================================================== */

    if (bottomComposerForm) {

        bottomComposerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                if (!bottomMessageInput) {
                    return;
                }


                handleSend(
                    bottomMessageInput.value
                );

            }
        );
    }


    /* =====================================================
       BOTTOM ENTER KEY
    ===================================================== */

    if (bottomMessageInput) {

        bottomMessageInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    handleSend(
                        bottomMessageInput.value
                    );
                }

            }
        );
    }


    /* =====================================================
       SUGGESTION BUTTONS
    ===================================================== */

    document
        .querySelectorAll(".suggestion")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();


                        const question =
                            button.dataset.q ||
                            button.textContent;


                        handleSend(
                            question
                        );

                    }
                );

            }
        );


    /* =====================================================
       DONE
    ===================================================== */

})();