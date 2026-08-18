"use client";

import type { UIMessage } from "ai";

import type { ChatMode } from "./Chatbot";
import { LeadForm } from "./LeadForm";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { SuggestedActions } from "./SuggestedActions";
import { ChatInput } from "./ChatInput";
import { LeadAction } from "./LeadAction";

interface LeadSummary {
  summary: string;
  projectType: string;
  requirements: string[];
  customerIntent: string;
}

interface ChatWindowProps {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";

  mode: ChatMode;
  actionSelected: boolean;

  checkingWebsite: boolean;
  websiteChecked: boolean;
  checkingMessage: string;
  pendingWebsiteUrl?: string | null;

  /*
   * Lead form
   */
  showLeadForm: boolean;
  showBuildContact: boolean;

  checkedWebsiteUrl?: string | null;

  leadSummary: LeadSummary;
  generatingLeadSummary: boolean;
  leadSubmitted: boolean;

  /*
   * Actions
   */
  onClose: () => void;
  onSend: (message: string) => void | Promise<void>;
  onAction: (action: ChatMode) => void;

  onContact: () => void;

  onCloseLeadForm: () => void;
  onLeadSuccess: () => void;
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

  showLeadForm,
  showBuildContact,

  checkedWebsiteUrl,

  leadSummary,
  generatingLeadSummary,
  leadSubmitted,

  onClose,
  onSend,
  onAction,

  onContact,

  onCloseLeadForm,
  onLeadSuccess,
}: ChatWindowProps) {
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

      {!actionSelected &&
        !checkingWebsite &&
        !showLeadForm &&
        !leadSubmitted && <SuggestedActions onSelect={onAction} />}

      {mode === "website-check" &&
        websiteChecked &&
        status === "ready" &&
        !showLeadForm &&
        !leadSubmitted && <LeadAction onClick={onContact} />}

      {showBuildContact && !showLeadForm && !leadSubmitted && (
        <LeadAction onClick={onContact} />
      )}

      {generatingLeadSummary && (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-[12px] font-medium text-[#172033]">
              Preparing your project summary...
            </p>

            <p className="mt-1 text-[11px] leading-4 text-gray-500">
              Just a moment.
            </p>
          </div>
        </div>
      )}

      {showLeadForm && !leadSubmitted && (
        <LeadForm
          websiteUrl={checkedWebsiteUrl}
          leadType={
            mode === "website-check" ? "website-improvement" : "new-website"
          }
          leadSummary={leadSummary}
          onSuccess={onLeadSuccess}
          onClose={onCloseLeadForm}
        />
      )}

      {leadSubmitted && (
        <div className="border-t border-gray-100 bg-white px-4 py-4">
          <div className="rounded-xl bg-gray-50 px-4 py-4">
            <p className="text-[14px] font-medium text-[#172033]">
              Thanks, we’ve got your details.
            </p>

            <p className="mt-1 text-[12px] leading-5 text-gray-500">
              Your details have been sent to the Ganpati team. We’ll get back to
              you soon.
            </p>
          </div>
        </div>
      )}

      {!showLeadForm && !leadSubmitted && !generatingLeadSummary && (
        <ChatInput
          onSend={onSend}
          disabled={
            checkingWebsite || status === "submitted" || status === "streaming"
          }
          mode={mode}
        />
      )}
    </div>
  );
}
