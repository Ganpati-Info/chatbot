"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

import { ChatButton } from "./ChatButton";
import { ChatWindow } from "./ChatWindow";

export type ChatMode = "general" | "build" | "website-check";

const GANPATI_HOSTNAMES = [
  "ganpatiinfosolutions.com",
  "www.ganpatiinfosolutions.com",
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [mode, setMode] = useState<ChatMode>("general");

  const [actionSelected, setActionSelected] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);

  const [showBuildContact, setShowBuildContact] = useState(false);

  const [checkingWebsite, setCheckingWebsite] = useState(false);

  const [websiteChecked, setWebsiteChecked] = useState(false);

  const [checkingMessage, setCheckingMessage] = useState(
    "Checking the website",
  );

  const [pendingWebsiteUrl, setPendingWebsiteUrl] = useState<string | null>(
    null,
  );

  const [checkedWebsiteUrl, setCheckedWebsiteUrl] = useState<string | null>(
    null,
  );

  const [checkedUrls, setCheckedUrls] = useState<string[]>([]);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  /*
   * Extract a website URL from any message.
   *
   * Examples:
   * ganpatiinfosolutions.com
   * https://ganpatiinfosolutions.com
   * www.ganpatiinfosolutions.com/about
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

  /*
   * Check whether the URL belongs to Ganpati Info Solutions.
   */
  function isGanpatiWebsite(url: string) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();

      return GANPATI_HOSTNAMES.includes(hostname);
    } catch {
      return false;
    }
  }

  /*
   * Call the website analysis API.
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
   * Get all text from the conversation.
   */
  function getConversationText() {
    return messages
      .map((message) =>
        message.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(" "),
      )
      .join(" ");
  }

  /*
   * Decide whether the visitor has provided enough
   * information about a new website/software project.
   */
  function hasEnoughBuildInformation(text: string) {
    const lower = text.toLowerCase();

    const projectKeywords = [
      "ecommerce",
      "e-commerce",
      "website",
      "web app",
      "web application",
      "software",
      "platform",
      "react",
      "next",
      "shop",
      "store",
      "dashboard",
      "admin panel",
      "admin dashboard",
      "login",
      "signup",
      "register",
      "payment",
      "checkout",
      "subscription",
      "saas",
      "software as a service",
    ];

    const featureKeywords = [
      "cart",
      "shopping cart",
      "user account",
      "user accounts",
      "accounts",
      "login",
      "payment",
      "checkout",
      "product",
      "products",
      "dashboard",
      "authentication",
      "admin",
      "admin panel",
      "admin dashboard",
      "profile",
      "profiles",
      "subscription",
      "subscriptions",
    ];

    const hasProject = projectKeywords.some((keyword) =>
      lower.includes(keyword),
    );

    const hasFeature = featureKeywords.some((keyword) =>
      lower.includes(keyword),
    );

    return hasProject && hasFeature;
  }

  /*
   * Handle every message from the visitor.
   */
  async function handleSend(message: string) {
    const websiteUrl = extractUrl(message);

    /*
     * ============================================================
     * WEBSITE URL DETECTED
     * ============================================================
     *
     * Any URL automatically switches the chatbot to
     * website-check mode.
     */
    if (websiteUrl) {
      setMode("website-check");
      setActionSelected(true);

      setShowLeadForm(false);
      setShowBuildContact(false);

      setWebsiteChecked(false);
      setCheckingWebsite(false);

      setPendingWebsiteUrl(websiteUrl);
      setCheckedWebsiteUrl(null);

      const normalizedUrl = websiteUrl.toLowerCase().replace(/\/$/, "");

      const alreadyChecked = checkedUrls.some(
        (url) => url.toLowerCase().replace(/\/$/, "") === normalizedUrl,
      );

      /*
       * If this URL was already checked in this conversation,
       * do not run PageSpeed again.
       */
      if (alreadyChecked) {
        setCheckingWebsite(false);

        await sendMessage(
          {
            text: message,
          },
          {
            body: {
              websiteUrl,
              websiteAlreadyChecked: true,
              isGanpatiWebsite: isGanpatiWebsite(websiteUrl),
            },
          },
        );

        setPendingWebsiteUrl(null);
        setCheckedWebsiteUrl(websiteUrl);
        setWebsiteChecked(true);

        return;
      }

      /*
       * Start website analysis.
       */
      setCheckingWebsite(true);
      setCheckingMessage("Checking the website");

      /*
       * Dynamic messages shown while the API is running.
       */
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

        /*
         * Remember this URL so sending the same URL again
         * does not trigger another PageSpeed request.
         */
        setCheckedUrls((previous) => {
          if (
            previous.some(
              (url) => url.toLowerCase().replace(/\/$/, "") === normalizedUrl,
            )
          ) {
            return previous;
          }

          return [...previous, websiteUrl];
        });

        /*
         * Store the URL that was successfully checked.
         */
        setCheckedWebsiteUrl(websiteResult.website);

        /*
         * Send the analysis to the AI.
         */
        await sendMessage(
          {
            text: message,
          },
          {
            body: {
              websiteUrl: websiteResult.website,
              websiteAnalysis: websiteResult.analysis,
              websiteAnalysisError: false,
              isGanpatiWebsite: ownWebsite,
              websiteAlreadyChecked: false,
            },
          },
        );

        setWebsiteChecked(true);
      } catch (error) {
        console.error("Website check failed:", error);

        /*
         * Let the AI explain that the check failed.
         * Do not invent findings.
         */
        await sendMessage(
          {
            text: message,
          },
          {
            body: {
              websiteUrl,
              websiteAnalysis: null,
              websiteAnalysisError: true,
              isGanpatiWebsite: isGanpatiWebsite(websiteUrl),
              websiteAlreadyChecked: false,
            },
          },
        );

        setWebsiteChecked(false);
      } finally {
        window.clearInterval(messageInterval);

        setCheckingWebsite(false);
        setPendingWebsiteUrl(null);
      }

      return;
    }

    /*
     * ============================================================
     * NORMAL CHAT
     * ============================================================
     */

    /*
     * Include the current message because useChat's `messages`
     * state may not contain the latest message yet.
     */
    const conversationText =
      `${getConversationText()} ${message}`.toLowerCase();

    /*
     * Send the visitor's message first.
     */
    await sendMessage({
      text: message,
    });

    /*
     * ============================================================
     * BUILD MODE
     * ============================================================
     *
     * Once enough project information exists,
     * show the contact CTA.
     */
    if (mode === "build" && hasEnoughBuildInformation(conversationText)) {
      setShowBuildContact(true);
    }
  }

  /*
   * Handle the three initial actions.
   */
  function handleAction(action: ChatMode) {
    setMode(action);
    setActionSelected(true);

    /*
     * Reset lead UI when starting a new flow.
     */
    setShowLeadForm(false);
    setShowBuildContact(false);

    /*
     * Website check waits for the URL.
     */
    if (action === "website-check") {
      return;
    }

    /*
     * Build conversation.
     */
    if (action === "build") {
      handleSend("I want to build a new website.");
      return;
    }

    /*
     * General conversation.
     */
    handleSend("I have a question about Ganpati Info Solutions.");
  }

  /*
   * Open the lead form.
   */
  function handleContact() {
    setShowLeadForm(true);
  }

  /*
   * Close the lead form.
   */
  function handleCloseLeadForm() {
    setShowLeadForm(false);
  }

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
          showBuildContact={showBuildContact}
          showLeadForm={showLeadForm}
          checkedWebsiteUrl={checkedWebsiteUrl}
          onClose={() => setIsOpen(false)}
          onSend={handleSend}
          onAction={handleAction}
          onContact={handleContact}
          onCloseLeadForm={handleCloseLeadForm}
        />
      ) : (
        <ChatButton onClick={() => setIsOpen(true)} />
      )}
    </>
  );
}
