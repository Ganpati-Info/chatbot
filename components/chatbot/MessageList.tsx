"use client";

import type { UIMessage } from "ai";
import type { ChatMode } from "./Chatbot";

import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: UIMessage[];
  mode: ChatMode;
  actionSelected: boolean;

  checkingWebsite: boolean;
  checkingMessage: string;

  pendingWebsiteUrl?: string | null;

  status: "submitted" | "streaming" | "ready" | "error";
}

export function MessageList({
  messages,
  mode,
  actionSelected,
  checkingWebsite,
  checkingMessage,
  pendingWebsiteUrl,
  status,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, checkingWebsite, checkingMessage, pendingWebsiteUrl, status]);

  const showTyping =
    (status === "submitted" || status === "streaming") && !checkingWebsite;

  return (
    <div
      className="
        flex-1
        overflow-y-auto
        px-4
        py-4
        scrollbar-thin
      "
    >
      {messages.length === 0 && !actionSelected && (
        <div className="flex justify-start">
          <div
            className="
              max-w-[82%]
              rounded-2xl
              rounded-tl-md
              bg-gray-100
              px-4
              py-3
              text-[13px]
              leading-5
              text-[#172033]
            "
          >
            Hi! How can we help you today?
          </div>
        </div>
      )}

      {mode === "website-check" &&
        actionSelected &&
        messages.length === 0 &&
        !checkingWebsite &&
        !pendingWebsiteUrl && (
          <div className="flex justify-start">
            <div
              className="
                max-w-[82%]
                rounded-2xl
                rounded-tl-md
                bg-gray-100
                px-4
                py-3
                text-[13px]
                leading-5
                text-[#172033]
              "
            >
              Sure, send me your website URL and I&apos;ll take a look.
            </div>
          </div>
        )}

      <div className="flex flex-col gap-3">
        {messages.map((message) => {
          const text = message.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("");

          if (!text.trim()) {
            return null;
          }

          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[82%]
                  rounded-2xl
                  px-4
                  py-3
                  text-[13px]
                  leading-5
                  whitespace-pre-wrap
                  ${
                    isUser
                      ? `
                        rounded-br-md
                        bg-[#2D52AA]
                        text-white
                      `
                      : `
                        rounded-tl-md
                        bg-gray-100
                        text-[#172033]
                      `
                  }
                `}
              >
                {text}
              </div>
            </div>
          );
        })}

        {pendingWebsiteUrl && (
          <div className="flex justify-end">
            <div
              className="
                max-w-[82%]
                rounded-2xl
                rounded-br-md
                bg-[#2D52AA]
                px-4
                py-3
                text-[13px]
                leading-5
                text-white
                break-all
              "
            >
              {pendingWebsiteUrl}
            </div>
          </div>
        )}
      </div>

      {checkingWebsite && (
        <div className="mt-3 flex justify-start">
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-2xl
              rounded-tl-md
              bg-gray-100
              px-4
              py-3
              text-[13px]
              text-gray-600
            "
          >
            <span>{checkingMessage}</span>

            <span className="flex gap-1">
              <span
                className="
                  h-1
                  w-1
                  animate-bounce
                  rounded-full
                  bg-gray-400
                  [animation-delay:-0.3s]
                "
              />

              <span
                className="
                  h-1
                  w-1
                  animate-bounce
                  rounded-full
                  bg-gray-400
                  [animation-delay:-0.15s]
                "
              />

              <span
                className="
                  h-1
                  w-1
                  animate-bounce
                  rounded-full
                  bg-gray-400
                "
              />
            </span>
          </div>
        </div>
      )}

      {showTyping && (
        <div className="mt-3 flex justify-start">
          <div
            className="
              inline-flex
              items-center
              gap-1
              rounded-2xl
              rounded-tl-md
              bg-gray-100
              px-4
              py-3
            "
          >
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
