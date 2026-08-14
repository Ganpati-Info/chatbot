"use client";

import { Bot, X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full
            bg-[#25499F]
            text-white
          "
        >
          <Bot className="h-[19px] w-[19px]" strokeWidth={1.8} />
        </div>

        <div>
          <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-gray-900">
            Ganpati Info Solutions
          </h2>

          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <p className="text-[11px] text-gray-500">How can we help?</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="
          flex h-8 w-8 items-center justify-center
          rounded-full
          text-gray-400
          transition-colors
          hover:bg-gray-100
          hover:text-gray-700
        "
      >
        <X className="h-[19px] w-[19px]" strokeWidth={1.8} />
      </button>
    </header>
  );
}
