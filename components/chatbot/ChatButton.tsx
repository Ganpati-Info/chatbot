"use client";

import { MessageCircle, X } from "lucide-react";

interface ChatButtonProps {
  onClick: () => void;
  showWelcomeNotification?: boolean;
}

export function ChatButton({
  onClick,
  showWelcomeNotification = false,
}: ChatButtonProps) {
  return (
    <>
      {showWelcomeNotification && (
        <div
          className="
            fixed
            bottom-[88px]
            right-6
            z-50
            flex
            items-center
            gap-2
            rounded-xl
            bg-white
            px-4
            py-3
            text-[13px]
            font-medium
            text-[#172033]
            shadow-[0_8px_30px_rgba(15,23,42,0.16)]
          "
        >
          <span>Hey, how may I help you?</span>
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        aria-label="Chat with Ganpati Info Solutions"
        className="
          fixed
          bottom-6
          right-6
          z-50
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-[#25499F]
          text-white
          shadow-[0_8px_30px_rgba(37,73,159,0.28)]
          transition-all
          duration-200
          hover:scale-105
          hover:bg-[#1f3f8b]
          hover:shadow-[0_10px_35px_rgba(37,73,159,0.35)]
          focus:outline-none
          focus:ring-2
          focus:ring-[#25499F]
          focus:ring-offset-2
        "
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2} />
      </button>
    </>
  );
}
