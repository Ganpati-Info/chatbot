"use client";

import { FormEvent, useState } from "react";

interface LeadFormProps {
  websiteUrl?: string | null;
  leadType: "website-improvement" | "new-website" | "general";
  onSuccess: () => void;
}

export function LeadForm({ websiteUrl, leadType, onSuccess }: LeadFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(field: keyof typeof form, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          websiteUrl: websiteUrl ?? null,
          leadType,
          source: "chatbot",
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Server returned an unexpected response (${response.status}).`,
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to submit your request.");
      }

      onSuccess();
    } catch (error) {
      console.error("Lead submission failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "We couldn't send your details right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      <div className="mb-3">
        <p className="text-[14px] font-medium text-[#172033]">
          Talk to the Ganpati team
        </p>

        <p className="mt-1 text-[12px] leading-5 text-gray-500">
          Leave your details and our team will get in touch with you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          disabled={submitting}
          className="
            w-full
            rounded-xl
            border
            border-gray-200
            px-3
            py-2.5
            text-[12px]
            text-[#172033]
            outline-none
            placeholder:text-gray-400
            focus:border-[#25499F]
          "
        />

        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(event) => handleChange("email", event.target.value)}
          disabled={submitting}
          className="
            w-full
            rounded-xl
            border
            border-gray-200
            px-3
            py-2.5
            text-[12px]
            text-[#172033]
            outline-none
            placeholder:text-gray-400
            focus:border-[#25499F]
          "
        />

        <input
          type="tel"
          placeholder="Phone number"
          value={form.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
          disabled={submitting}
          className="
            w-full
            rounded-xl
            border
            border-gray-200
            px-3
            py-2.5
            text-[12px]
            text-[#172033]
            outline-none
            placeholder:text-gray-400
            focus:border-[#25499F]
          "
        />

        <textarea
          placeholder="Tell us briefly what you need"
          value={form.message}
          onChange={(event) => handleChange("message", event.target.value)}
          disabled={submitting}
          rows={3}
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-gray-200
            px-3
            py-2.5
            text-[12px]
            leading-5
            text-[#172033]
            outline-none
            placeholder:text-gray-400
            focus:border-[#25499F]
          "
        />

        {error && <p className="text-[11px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="
            w-full
            rounded-xl
            bg-[#25499F]
            px-4
            py-2.5
            text-[12px]
            font-medium
            text-white
            transition
            hover:bg-[#1f3e87]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {submitting ? "Sending..." : "Send request"}
        </button>
      </form>
    </div>
  );
}
