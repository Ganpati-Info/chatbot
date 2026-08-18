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

    Object.assign(iframe.style, {
      position: "fixed",
      right: "0",
      bottom: "0",
      width: "430px",
      height: "750px",
      border: "0",
      background: "transparent",
      zIndex: "999999",
      display: "block",
    });

    document.body.appendChild(iframe);

    function resize() {
      if (window.innerWidth <= 640) {
        iframe.style.width = "100vw";
        iframe.style.height = "100vh";
      } else {
        iframe.style.width = "430px";
        iframe.style.height = "750px";
      }
    }

    resize();

    window.addEventListener("resize", resize);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createChatbot);
  } else {
    createChatbot();
  }
})();
