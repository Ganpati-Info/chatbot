"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

import { ChatButton } from "./ChatButton";
import { ChatWindow } from "./ChatWindow";

export type ChatMode = "general" | "build" | "website-check";

const GANPATI_HOSTNAMES = [
  "ganpatiinfosolutions.com",
  "www.ganpatiinfosolutions.com",
];

const POSITIVE_RESPONSES = [
  "yes",
  "yeah",
  "yep",
  "sure",
  "okay",
  "ok",
  "sounds good",
  "that works",
  "i'm interested",
  "im interested",
  "let's do it",
  "lets do it",
  "go ahead",
  "please do",
];

const CONTACT_INTENT_PHRASES = [
  "quick call",
  "talk with our team",
  "talk to our team",
  "speak with our team",
  "speak to our team",
  "contact our team",
  "contact details",
  "contact form",
  "get in touch",
  "connect with our team",
  "chat with our team",
  "talk with someone",
  "talk to someone",
  "reach out",
  "someone from our team",
  "contact ganpati",
  "talk to ganpati",
  "team will reach out",
];

export interface LeadSummary {
  summary: string;
  projectType: string;
  requirements: string[];
  customerIntent: string;
}

const EMPTY_LEAD_SUMMARY: LeadSummary = {
  summary:
    "Customer submitted a lead through the Ganpati Info Solutions chatbot.",
  projectType: "Not specified",
  requirements: [],
  customerIntent: "Customer submitted a lead through the chatbot.",
};

export function Chatbot() {
  /*
   * ------------------------------------------------------------
   * CHAT STATE
   * ------------------------------------------------------------
   */

  const [isOpen, setIsOpen] = useState(false);

  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showBuildContact, setShowBuildContact] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const [leadSummary, setLeadSummary] =
    useState<LeadSummary>(EMPTY_LEAD_SUMMARY);

  const [generatingLeadSummary, setGeneratingLeadSummary] = useState(false);

  const [checkedWebsiteUrl, setCheckedWebsiteUrl] = useState<string | null>(
    null,
  );

  const [mode, setMode] = useState<ChatMode>("general");
  const [actionSelected, setActionSelected] = useState(false);

  const [checkingWebsite, setCheckingWebsite] = useState(false);

  const [websiteChecked, setWebsiteChecked] = useState(false);

  const [checkingMessage, setCheckingMessage] = useState(
    "Checking the website",
  );

  const [pendingWebsiteUrl, setPendingWebsiteUrl] = useState<string | null>(
    null,
  );

  const [checkedUrls, setCheckedUrls] = useState<string[]>([]);

  /*
   * ------------------------------------------------------------
   * AUDIO
   * ------------------------------------------------------------
   *
   * Files:
   *
   * public/sounds/chatbot-message.mp3
   * public/sounds/chatbot-notification.wav
   */

  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);

  /*
   * Browser autoplay protection.
   *
   * The browser may block audio before the visitor interacts
   * with the page.
   */
  const audioUnlockedRef = useRef(false);

  /*
   * Prevent the same assistant message from playing twice.
   */
  const lastPlayedAssistantMessageIdRef = useRef<string | null>(null);

  /*
   * ------------------------------------------------------------
   * CHAT
   * ------------------------------------------------------------
   */

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  /*
   * ------------------------------------------------------------
   * AUDIO HELPERS
   * ------------------------------------------------------------
   */

  function initializeAudio() {
    if (!notificationAudioRef.current) {
      const notificationAudio = new Audio("/sounds/chatbot-notification.wav");

      notificationAudio.preload = "auto";
      notificationAudio.volume = 0.2;

      notificationAudioRef.current = notificationAudio;
    }

    if (!messageAudioRef.current) {
      const messageAudio = new Audio("/sounds/chatbot-message.mp3");

      messageAudio.preload = "auto";
      messageAudio.volume = 0.55;

      messageAudioRef.current = messageAudio;
    }
  }

  function unlockAudio() {
    if (audioUnlockedRef.current) {
      return;
    }

    initializeAudio();

    audioUnlockedRef.current = true;
  }

  async function playNotificationSound() {
    initializeAudio();

    const audio = notificationAudioRef.current;

    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      /*
       * Browser blocked autoplay.
       *
       * This is expected on many browsers when the page has
       * not received a user interaction yet.
       */
      console.debug("Notification audio blocked by browser:", error);
    }
  }

  async function playMessageSound() {
    initializeAudio();

    const audio = messageAudioRef.current;

    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error("Message audio blocked by browser:", error);
    }
  }

  /*
   * ------------------------------------------------------------
   * INITIAL PAGE LOAD
   * ------------------------------------------------------------
   *
   * Show the welcome popup and keep it visible.
   *
   * We attempt to play the notification immediately.
   * If the browser blocks autoplay, the sound will play after
   * the visitor interacts with the page.
   */

useEffect(() => {
  initializeAudio();

  const showWelcome = async () => {
    try {
      const audio = new Audio("/sounds/chatbot-notification.wav");

      audio.volume = 0.2;

      await audio.play();

      // Sound has started successfully.
      setShowWelcomeNotification(true);
    } catch (error) {
      console.error("Welcome notification sound failed:", error);

      // Still show the notification if the browser blocks autoplay.
      setShowWelcomeNotification(true);
    }
  };

  void showWelcome();

  const unlock = () => {
    unlockAudio();
  };

  window.addEventListener("pointerdown", unlock, {
    once: true,
    passive: true,
  });

  window.addEventListener("keydown", unlock, {
    once: true,
  });

  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
}, []);

  /*
   * ------------------------------------------------------------
   * PLAY SOUND WHEN BOT FINISHES RESPONDING
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role !== "assistant") {
      return;
    }

    if (lastPlayedAssistantMessageIdRef.current === lastMessage.id) {
      return;
    }

    lastPlayedAssistantMessageIdRef.current = lastMessage.id;

    void playMessageSound();
  }, [messages, status]);

  /*
   * ------------------------------------------------------------
   * URL HELPERS
   * ------------------------------------------------------------
   */

  function extractUrl(text: string) {
    const match = text
      .trim()
      .match(
        /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?/i,
      );

    if (!match) {
      return null;
    }

    let url = match[0];

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      const parsed = new URL(url);

      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
      }

      return parsed.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }

  function isGanpatiWebsite(url: string) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();

      return GANPATI_HOSTNAMES.includes(hostname);
    } catch {
      return false;
    }
  }

  /*
   * ------------------------------------------------------------
   * WEBSITE CHECK
   * ------------------------------------------------------------
   */

  async function checkWebsite(url: string) {
    const response = await fetch("/api/website-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Unable to check the website right now.");
    }

    return data;
  }

  /*
   * ------------------------------------------------------------
   * SEND CHAT MESSAGE
   * ------------------------------------------------------------
   */

  async function sendChatMessage(
    message: string,
    options?: {
      body?: Record<string, unknown>;
    },
  ) {
    try {
      await sendMessage(
        {
          text: message,
        },
        options,
      );
    } catch (error) {
      console.error("Chat request failed:", error);
    }
  }

  /*
   * ------------------------------------------------------------
   * CONVERSATION
   * ------------------------------------------------------------
   */

  function getConversationText(currentMessage?: string) {
    const previousMessages = messages
      .map((item) => {
        const role = item.role === "user" ? "Visitor" : "Ganpati Assistant";

        const text = item.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(" ");

        return `${role}: ${text}`;
      })
      .join("\n\n");

    const current = currentMessage ? `\n\nVisitor: ${currentMessage}` : "";

    return `${previousMessages}${current}`;
  }

  /*
   * ------------------------------------------------------------
   * CONTACT INTENT
   * ------------------------------------------------------------
   */

  function isPositiveResponse(message: string) {
    const normalized = message.trim().toLowerCase();

    return POSITIVE_RESPONSES.some(
      (response) =>
        normalized === response ||
        normalized.startsWith(`${response} `) ||
        normalized.startsWith(`${response},`) ||
        normalized.startsWith(`${response}.`) ||
        normalized.startsWith(`${response}!`),
    );
  }

  function hasContactIntent(conversationText: string) {
    const normalized = conversationText.toLowerCase();

    return CONTACT_INTENT_PHRASES.some((phrase) => normalized.includes(phrase));
  }

  /*
   * ------------------------------------------------------------
   * BUILD CONTEXT
   * ------------------------------------------------------------
   */

  function hasBuildContext(conversationText: string) {
    const normalized = conversationText.toLowerCase();

    const hasProjectType =
      normalized.includes("website") ||
      normalized.includes("web app") ||
      normalized.includes("web application") ||
      normalized.includes("software") ||
      normalized.includes("ecommerce") ||
      normalized.includes("e-commerce") ||
      normalized.includes("online store") ||
      normalized.includes("application") ||
      normalized.includes("app") ||
      normalized.includes("portfolio") ||
      normalized.includes("platform") ||
      normalized.includes("system");

    const hasBusinessContext =
      normalized.includes("business") ||
      normalized.includes("product") ||
      normalized.includes("products") ||
      normalized.includes("clothing") ||
      normalized.includes("garment") ||
      normalized.includes("fashion") ||
      normalized.includes("store") ||
      normalized.includes("shop") ||
      normalized.includes("marketplace") ||
      normalized.includes("brand");

    const hasFeatureContext =
      normalized.includes("cart") ||
      normalized.includes("account") ||
      normalized.includes("payment") ||
      normalized.includes("checkout") ||
      normalized.includes("inventory") ||
      normalized.includes("shipping") ||
      normalized.includes("login") ||
      normalized.includes("signup") ||
      normalized.includes("authentication");

    return hasProjectType && (hasBusinessContext || hasFeatureContext);
  }

  function shouldShowBuildContact(message: string) {
    if (showBuildContact || showLeadForm || leadSubmitted) {
      return false;
    }

    if (mode !== "build") {
      return false;
    }

    const conversationText = getConversationText(message);

    /*
     * PRIMARY CONDITION
     *
     * Assistant suggested contacting the team and the visitor
     * responded positively.
     */

    if (isPositiveResponse(message) && hasContactIntent(conversationText)) {
      return true;
    }

    /*
     * SECONDARY CONDITION
     *
     * Enough useful project information exists.
     */

    const userMessageCount =
      messages.filter((item) => item.role === "user").length + 1;

    if (userMessageCount >= 5 && hasBuildContext(conversationText)) {
      return true;
    }

    return false;
  }

  /*
   * ------------------------------------------------------------
   * MAIN SEND HANDLER
   * ------------------------------------------------------------
   */

  async function handleSend(message: string) {
    /*
     * This click/keypress counts as a user interaction.
     *
     * Therefore the browser is much more likely to allow
     * chatbot-message.mp3 to play.
     */

    unlockAudio();

    /*
     * Play the user message sound immediately.
     */

    void playMessageSound();

    const websiteUrl = extractUrl(message);

    /*
     * ----------------------------------------------------------
     * WEBSITE CHECK
     * ----------------------------------------------------------
     */

    if (websiteUrl) {
      setMode("website-check");
      setActionSelected(true);
      setWebsiteChecked(false);

      setPendingWebsiteUrl(websiteUrl);
      setCheckedWebsiteUrl(websiteUrl);

      const normalizedUrl = websiteUrl.toLowerCase();

      const alreadyChecked = checkedUrls.some(
        (url) => url.toLowerCase() === normalizedUrl,
      );

      if (alreadyChecked) {
        await sendChatMessage(message, {
          body: {
            websiteUrl,
            websiteAlreadyChecked: true,
            isGanpatiWebsite: isGanpatiWebsite(websiteUrl),
          },
        });

        setPendingWebsiteUrl(null);
        setWebsiteChecked(true);

        return;
      }

      setCheckingWebsite(true);
      setCheckingMessage("Checking the website");

      const checkingMessages = [
        "Checking the website",
        "Looking at the page experience",
        "Checking how the site loads",
        "Looking at the mobile experience",
        "Checking search visibility",
        "Reviewing a few important areas",
        "Analyzing the website",
      ];

      let messageIndex = 0;

      const messageInterval = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % checkingMessages.length;

        setCheckingMessage(checkingMessages[messageIndex]);
      }, 3500);

      try {
        const ownWebsite = isGanpatiWebsite(websiteUrl);

        const websiteResult = await checkWebsite(websiteUrl);

        setCheckedUrls((previous) => {
          if (
            previous.some(
              (url) => url.toLowerCase() === websiteUrl.toLowerCase(),
            )
          ) {
            return previous;
          }

          return [...previous, websiteUrl];
        });

        await sendChatMessage(message, {
          body: {
            websiteUrl: websiteResult.website,
            websiteAnalysis: websiteResult.analysis,
            websiteAnalysisError: false,
            isGanpatiWebsite: ownWebsite,
            websiteAlreadyChecked: false,
          },
        });

        setWebsiteChecked(true);
      } catch (error) {
        console.error("Website check failed:", error);

        await sendChatMessage(message, {
          body: {
            websiteUrl,
            websiteAnalysis: null,
            websiteAnalysisError: true,
            isGanpatiWebsite: isGanpatiWebsite(websiteUrl),
          },
        });
      } finally {
        window.clearInterval(messageInterval);

        setCheckingWebsite(false);
        setPendingWebsiteUrl(null);
      }

      return;
    }

    /*
     * ----------------------------------------------------------
     * NORMAL CHAT
     * ----------------------------------------------------------
     */

    await sendChatMessage(message);

    /*
     * ----------------------------------------------------------
     * BUILD CONTACT CTA
     * ----------------------------------------------------------
     */

    if (shouldShowBuildContact(message)) {
      setShowBuildContact(true);
    }
  }

  /*
   * ------------------------------------------------------------
   * QUICK ACTIONS
   * ------------------------------------------------------------
   */

  function handleAction(action: ChatMode) {
    unlockAudio();

    setMode(action);
    setActionSelected(true);

    if (action === "website-check") {
      return;
    }

    if (action === "build") {
      handleSend("I want to build a new website.");
      return;
    }

    handleSend("I have a question about Ganpati Info Solutions.");
  }

  /*
   * ------------------------------------------------------------
   * LEAD SUMMARY
   * ------------------------------------------------------------
   */

  async function handleContact() {
    if (showLeadForm || leadSubmitted || generatingLeadSummary) {
      return;
    }

    unlockAudio();

    setGeneratingLeadSummary(true);

    const conversation = getConversationText();

    try {
      const response = await fetch("/api/lead-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.summary) {
        throw new Error(data.error || "Unable to generate lead summary.");
      }

      setLeadSummary(data.summary);
    } catch (error) {
      console.error("Lead summary generation failed:", error);

      setLeadSummary({
        ...EMPTY_LEAD_SUMMARY,
        summary:
          "Customer contacted Ganpati Info Solutions through the chatbot. AI summary was unavailable.",
      });
    } finally {
      setGeneratingLeadSummary(false);
      setShowLeadForm(true);
      setShowBuildContact(false);
    }
  }

  /*
   * ------------------------------------------------------------
   * LEAD SUCCESS
   * ------------------------------------------------------------
   */

  function handleLeadSuccess() {
    setShowLeadForm(false);
    setShowBuildContact(false);
    setLeadSubmitted(true);
  }

  /*
   * ------------------------------------------------------------
   * OPEN CHAT
   * ------------------------------------------------------------
   */

  function handleOpenChat() {
    unlockAudio();

    /*
     * Hide the welcome notification only after the user
     * opens the chatbot.
     */

    setShowWelcomeNotification(false);

    setIsOpen(true);
  }

  /*
   * ------------------------------------------------------------
   * CLOSE CHAT
   * ------------------------------------------------------------
   */

  function handleCloseChat() {
    setIsOpen(false);

    /*
     * Keep the notification hidden after the visitor has
     * already opened the chatbot.
     */
  }

  /*
   * ------------------------------------------------------------
   * UI
   * ------------------------------------------------------------
   */

  return (
    <>
      {isOpen ? (
        <ChatWindow
          messages={messages}
          status={status}
          mode={mode}
          actionSelected={actionSelected}
          checkingWebsite={checkingWebsite}
          websiteChecked={websiteChecked}
          checkingMessage={checkingMessage}
          pendingWebsiteUrl={pendingWebsiteUrl}
          showLeadForm={showLeadForm}
          showBuildContact={showBuildContact}
          checkedWebsiteUrl={checkedWebsiteUrl}
          leadSummary={leadSummary}
          leadSubmitted={leadSubmitted}
          generatingLeadSummary={generatingLeadSummary}
          onClose={handleCloseChat}
          onSend={handleSend}
          onAction={handleAction}
          onContact={handleContact}
          onCloseLeadForm={() => setShowLeadForm(false)}
          onLeadSuccess={handleLeadSuccess}
        />
      ) : (
        <ChatButton
          onClick={handleOpenChat}
          showWelcomeNotification={showWelcomeNotification}
        />
      )}
    </>
  );
}
