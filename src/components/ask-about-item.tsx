"use client";
import { Sparkles } from "lucide-react";
import { openAssistant } from "./assistant";

const QUESTIONS = ["Is this worth buying?", "What do reviewers say?", "Cheaper alternatives?"];

export function AskAboutItem() {
  return (
    <div className="mt-4 rounded-lg border border-line p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold">
        <Sparkles size={16} className="text-orange" /> Have a question? Ask AI
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => openAssistant(q)}
            className="rounded-full border border-line bg-[#f7fafa] px-3 py-1 text-xs hover:border-link"
          >
            {q}
          </button>
        ))}
      </div>
      <button onClick={() => openAssistant()} className="link mt-2.5 text-xs">
        Ask something else ›
      </button>
    </div>
  );
}
