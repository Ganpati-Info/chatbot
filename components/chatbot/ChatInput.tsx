"use client";

import { ArrowUp } from "lucide-react";
import { FormEvent, useState } from "react";

import type { ChatMode } from "./Chatbot";

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;

  disabled?: boolean;

  mode: ChatMode;
}

export function ChatInput({ onSend, disabled = false, mode }: ChatInputProps) {
  const [value, setValue] = useState("");

  const isWebsiteCheck = mode === "website-check";

  const placeholder = isWebsiteCheck
    ? "Enter your website URL..."
    : "Tell us what you're looking for...";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = value.trim();

    if (!message || disabled) {
      return;
    }

    setValue("");

    await onSend(message);
  }

  return (
    <div className="border-t border-gray-100 bg-white p-3">
      <form
        onSubmit={handleSubmit}
        className="
          flex
          items-center
          gap-2
          rounded-[14px]
          border
          border-gray-200
          bg-white
          px-3
          py-2
          transition
          focus-within:border-[#25499F]/40
          focus-within:ring-2
          focus-within:ring-[#25499F]/10
        "
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="
            min-w-0
            flex-1
            bg-transparent
            text-[13px]
            text-gray-700
            outline-none
            placeholder:text-gray-400
          "
        />

        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            bg-[#004cff]
            text-white
            transition
            disabled:cursor-not-allowed
            disabled:opacity-60
            enabled:hover:bg-[#25499F]
          "
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-2 text-center text-[9px] text-gray-400">
        Ganpati AI Assistant
      </p>
    </div>
  );
}
