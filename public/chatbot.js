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
    iframe.setAttribute("scrolling", "no");

    Object.assign(iframe.style, {
      position: "fixed",
      right: "0",
      bottom: "0",

      width: "min(430px, 100vw)",
      height: "min(750px, 100vh)",

      maxWidth: "100vw",
      maxHeight: "100vh",

      border: "0",
      background: "transparent",
      zIndex: "999999",
      display: "block",
    });

    document.body.appendChild(iframe);

    function resize() {
      var viewportWidth = window.innerWidth;
      var viewportHeight = window.innerHeight;

      var width = Math.min(430, viewportWidth);
      var height = Math.min(750, viewportHeight);

      iframe.style.width = width + "px";
      iframe.style.height = height + "px";
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
