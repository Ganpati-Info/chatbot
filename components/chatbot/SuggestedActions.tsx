"use client";

import { ArrowUpRight, Globe, Search } from "lucide-react";

import type { ChatMode } from "./Chatbot";

interface SuggestedActionsProps {
  onSelect: (action: ChatMode) => void;
}

export function SuggestedActions({ onSelect }: SuggestedActionsProps) {
  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      <p className="mb-2.5 text-[12px] text-gray-400">Or choose an option</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect("build")}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-gray-200
            bg-white
            px-3
            py-2
            text-[12px]
            text-gray-700
            transition
            hover:border-[#25499F]/30
            hover:bg-[#25499F]/5
          "
        >
          <Globe className="h-3.5 w-3.5" />I want to build a website
        </button>

        <button
          type="button"
          onClick={() => onSelect("website-check")}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-gray-200
            bg-white
            px-3
            py-2
            text-[12px]
            text-gray-700
            transition
            hover:border-[#25499F]/30
            hover:bg-[#25499F]/5
          "
        >
          <Search className="h-3.5 w-3.5" />
          Check my website
        </button>

        <button
          type="button"
          onClick={() => onSelect("general")}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-gray-200
            bg-white
            px-3
            py-2
            text-[12px]
            text-gray-700
            transition
            hover:border-[#25499F]/30
            hover:bg-[#25499F]/5
          "
        >
          <ArrowUpRight className="h-3.5 w-3.5" />I have a question
        </button>
      </div>
    </div>
  );
}
