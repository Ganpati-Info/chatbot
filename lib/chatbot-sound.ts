"use client";

type ChatbotSoundType = "notification" | "message";

const SOUND_PATHS: Record<ChatbotSoundType, string> = {
  notification: "/sounds/chatbot-notification.wav",
  message: "/sounds/chatbot-message.mp3",
};

const SOUND_VOLUME: Record<ChatbotSoundType, number> = {
  notification: 0.3,
  message: 1,
};

export function playChatbotSound(type: ChatbotSoundType) {
  if (typeof window === "undefined") {
    return;
  }

  const audio = new Audio(SOUND_PATHS[type]);

  audio.volume = SOUND_VOLUME[type];
  audio.preload = "auto";

  audio.play().catch(() => {
    // Browsers can block autoplay before the user interacts
    // with the page. Ignore that case silently.
  });
}
