(function () {
  if (window.__GANPATI_CHATBOT_LOADED__) {
    return;
  }

  window.__GANPATI_CHATBOT_LOADED__ = true;

  function createChatbot() {
    if (document.getElementById("ganpati-chatbot-frame")) {
      return;
    }

    var iframe = document.createElement("iframe");

    iframe.id = "ganpati-chatbot-frame";
    iframe.src = "https://chat.ganpatiinfosolutions.com/";
    iframe.title = "Ganpati Info Solutions Chatbot";

    iframe.setAttribute("allow", "autoplay; microphone");
    iframe.setAttribute("allowtransparency", "true");

    Object.assign(iframe.style, {
      position: "fixed",
      right: "0",
      bottom: "0",
      width: "90px",
      height: "100px",
      border: "0",
      background: "transparent",
      zIndex: "999999",
      display: "block",
      overflow: "hidden",
      colorScheme: "normal",
    });

    document.body.appendChild(iframe);

    function resizeIframe(open) {
      if (window.innerWidth <= 640) {
        if (open) {
          iframe.style.width = "100vw";
          iframe.style.height = "100vh";
        } else {
          iframe.style.width = "90px";
          iframe.style.height = "100px";
        }
      } else {
        if (open) {
          iframe.style.width = "430px";
          iframe.style.height = "750px";
        } else {
          iframe.style.width = "90px";
          iframe.style.height = "100px";
        }
      }
    }

    resizeIframe(false);

    window.addEventListener("message", function (event) {
      if (event.origin !== "https://chat.ganpatiinfosolutions.com") {
        return;
      }

      if (!event.data || event.data.type !== "GANPATI_CHATBOT") {
        return;
      }

      if (event.data.action === "open") {
        resizeIframe(true);
      }

      if (event.data.action === "close") {
        resizeIframe(false);
      }
    });

    window.addEventListener("resize", function () {
      resizeIframe(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createChatbot);
  } else {
    createChatbot();
  }
})();
