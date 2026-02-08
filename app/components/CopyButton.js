"use client";
import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/"/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-4 text-blue-600 text-sm font-medium hover:underline flex items-center gap-2 transition-colors"
    >
      {copied ? (
        <>
          <span>✅ Copied!</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>Copy to clipboard</span>
        </>
      )}
    </button>
  );
}

