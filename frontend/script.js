/* =========================================================
   PLANT-GPT
   SIMPLE WORKING INDUSTRIAL AI FRONTEND
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       BACKEND URL
    ===================================================== */

    const API_URL = "http://127.0.0.1:8000/ask";


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
       MICROPHONE BUTTONS
    ===================================================== */

    const micBtn =
        document.getElementById("micBtn");

    const bottomMicBtn =
        document.getElementById("bottomMicBtn");


    /* =====================================================
       STATE
    ===================================================== */

    let isSending = false;
    let isListening = false;


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
       TEXT TO SPEECH
    ===================================================== */

    function speakAnswer(text) {

        if (!("speechSynthesis" in window)) {

            alert(
                "Text-to-Speech is not supported by this browser."
            );

            return;
        }

        /* Stop any speech that is already playing */

        window.speechSynthesis.cancel();


        /* Create speech */

        const speech =
            new SpeechSynthesisUtterance(text);


        /* Indian English */

        speech.lang = "en-IN";


        /* Speech settings */

        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;


        /* Speak */

        window.speechSynthesis.speak(speech);
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


        /* =================================================
           ADD SPEAK BUTTON TO AI MESSAGES
        ================================================= */

        bubbleCol.appendChild(bubble);


        if (type === "ai") {

            const speakBtn =
                document.createElement("button");


            speakBtn.type =
                "button";


            speakBtn.className =
                "speak-btn";


            speakBtn.textContent =
                "🔊 Speak";


            speakBtn.title =
                "Read this answer aloud";


            speakBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    speakAnswer(text);

                }
            );


            bubbleCol.appendChild(
                speakBtn
            );
        }


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


            /* Show AI answer */

            addMessage(
                answer,
                "ai"
            );

            /*
               IMPORTANT:
               We DO NOT call speakAnswer()
               here.

               The user must click the
               🔊 Speak button.
            */


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
       SPEECH TO TEXT
    ===================================================== */

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    let recognition = null;


    if (SpeechRecognition) {

        recognition =
            new SpeechRecognition();

        recognition.continuous = false;

        recognition.interimResults = true;

        recognition.lang = "en-IN";


        recognition.onstart = function () {

            isListening = true;

            console.log(
                "Speech recognition started"
            );


            if (micBtn) {

                micBtn.classList.add(
                    "listening"
                );

                micBtn.title =
                    "Listening...";
            }


            if (bottomMicBtn) {

                bottomMicBtn.classList.add(
                    "listening"
                );

                bottomMicBtn.textContent =
                    "🔴";

                bottomMicBtn.title =
                    "Listening...";
            }
        };


        recognition.onresult =
            function (event) {

                let finalText = "";

                let interimText = "";


                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {

                    const transcript =
                        event.results[i][0].transcript;


                    if (
                        event.results[i].isFinal
                    ) {

                        finalText +=
                            transcript;

                    } else {

                        interimText +=
                            transcript;
                    }
                }


                /*
                   Put speech text into
                   the active message box.
                */

                if (finalText) {

                    const text =
                        finalText.trim();


                    if (messageInput) {

                        messageInput.value =
                            text;
                    }

                    if (bottomMessageInput) {

                        bottomMessageInput.value =
                            text;
                    }

                } else if (interimText) {

                    if (messageInput) {

                        messageInput.value =
                            interimText;
                    }

                    if (bottomMessageInput) {

                        bottomMessageInput.value =
                            interimText;
                    }
                }
            };


        recognition.onerror =
            function (event) {

                console.error(
                    "Speech recognition error:",
                    event.error
                );


                if (event.error === "not-allowed") {

                    alert(
                        "Microphone permission was denied. Please allow microphone access in your browser."
                    );

                } else if (
                    event.error === "no-speech"
                ) {

                    console.log(
                        "No speech detected."
                    );
                }
            };


        recognition.onend =
            function () {

                isListening = false;


                if (micBtn) {

                    micBtn.classList.remove(
                        "listening"
                    );

                    micBtn.title =
                        "Voice input";
                }


                if (bottomMicBtn) {

                    bottomMicBtn.classList.remove(
                        "listening"
                    );

                    bottomMicBtn.textContent =
                        "🎙";

                    bottomMicBtn.title =
                        "Voice input";
                }


                console.log(
                    "Speech recognition ended"
                );
            };


    } else {

        console.warn(
            "Speech Recognition is not supported by this browser."
        );
    }


    /* =====================================================
       START / STOP SPEECH RECOGNITION
    ===================================================== */

    function toggleSpeechRecognition() {

        if (!recognition) {

            alert(
                "Speech-to-Text is not supported by this browser. Please use Google Chrome or Microsoft Edge."
            );

            return;
        }


        if (isListening) {

            recognition.stop();

        } else {

            try {

                recognition.start();

            } catch (error) {

                console.error(
                    "Could not start microphone:",
                    error
                );
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
       MICROPHONE BUTTONS
    ===================================================== */

    if (micBtn) {

        micBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                toggleSpeechRecognition();

            }
        );
    }


    if (bottomMicBtn) {

        bottomMicBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                toggleSpeechRecognition();

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