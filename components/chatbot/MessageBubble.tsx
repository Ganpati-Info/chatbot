interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`mb-3.5 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[88%]
          rounded-[16px]
          px-4 py-3
          text-[13px]
          leading-[1.65]
          ${
            isUser
              ? "rounded-br-[5px] bg-[#25499F] text-white"
              : "rounded-bl-[5px] bg-[#F4F5F7] text-gray-700"
          }
        `}
      >
        {content}
      </div>
    </div>
  );
}
