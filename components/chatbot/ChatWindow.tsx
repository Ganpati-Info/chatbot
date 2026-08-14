"use client";

import type { UIMessage } from "ai";
import type { ChatMode } from "./Chatbot";

import { LeadForm } from "./LeadForm";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { SuggestedActions } from "./SuggestedActions";
import { ChatInput } from "./ChatInput";
import { LeadAction } from "./LeadAction";

interface ChatWindowProps {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";

  mode: ChatMode;
  actionSelected: boolean;

  checkingWebsite: boolean;
  websiteChecked: boolean;
  checkingMessage: string;

  pendingWebsiteUrl?: string | null;
  checkedWebsiteUrl?: string | null;

  showLeadForm: boolean;
  showBuildContact: boolean;

  onClose: () => void;
  onCloseLeadForm: () => void;

  onSend: (message: string) => void | Promise<void>;
  onAction: (action: ChatMode) => void;
  onContact: () => void;
}

export function ChatWindow({
  messages,
  status,
  mode,
  actionSelected,
  checkingWebsite,
  websiteChecked,
  checkingMessage,
  pendingWebsiteUrl,
  checkedWebsiteUrl,
  showLeadForm,
  showBuildContact,
  onClose,
  onCloseLeadForm,
  onSend,
  onAction,
  onContact,
}: ChatWindowProps) {
  const showWebsiteContact =
    mode === "website-check" && websiteChecked && status === "ready";

  const showContactButton =
    !showLeadForm && (showWebsiteContact || showBuildContact);

  return (
    <div
      className="
        fixed
        bottom-5
        right-5
        z-50
        flex
        h-[min(650px,calc(100vh-40px))]
        w-[400px]
        max-w-[calc(100vw-32px)]
        flex-col
        overflow-hidden
        rounded-[20px]
        border
        border-gray-200
        bg-white
        shadow-[0_20px_60px_rgba(15,23,42,0.16)]
      "
    >
      <ChatHeader onClose={onClose} />

      <MessageList
        messages={messages}
        mode={mode}
        actionSelected={actionSelected}
        checkingWebsite={checkingWebsite}
        checkingMessage={checkingMessage}
        pendingWebsiteUrl={pendingWebsiteUrl}
        status={status}
      />

      {!actionSelected && !checkingWebsite && (
        <SuggestedActions onSelect={onAction} />
      )}

      {showContactButton && <LeadAction onClick={onContact} />}

      {showLeadForm && (
        <LeadForm
          websiteUrl={mode === "website-check" ? checkedWebsiteUrl : null}
          leadType={
            mode === "website-check" ? "website-improvement" : "new-website"
          }
          onSuccess={onCloseLeadForm}
        />
      )}

      <ChatInput
        onSend={onSend}
        disabled={
          checkingWebsite || status === "submitted" || status === "streaming"
        }
        mode={mode}
      />
    </div>
  );
}
