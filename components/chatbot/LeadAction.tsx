"use client";

import { ArrowUpRight } from "lucide-react";

interface LeadActionProps {
  onClick: () => void;
}

export function LeadAction({ onClick }: LeadActionProps) {
  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      <p className="mb-2 text-[12px] text-gray-400">
        Want us to help improve your website?
      </p>

      <button
        type="button"
        onClick={onClick}
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-[#25499F]
          px-4
          py-2.5
          text-[12px]
          font-medium
          text-white
          transition
          hover:bg-[#1f3e87]
        "
      >
        Talk to Ganpati
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
