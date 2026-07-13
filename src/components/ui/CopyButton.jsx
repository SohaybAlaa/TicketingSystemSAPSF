import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Copy-to-clipboard icon button that flips to a checkmark for 2 seconds.
// Styled to match the Employee Details copy buttons on the ticket detail page.
export default function CopyButton({ value, title, onCopy, onError }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.(value);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      onError?.(error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group p-1.5 cursor-pointer hover:bg-green-100 rounded-lg transition-all duration-200 flex-shrink-0"
      title={title}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-green-600 group-hover:text-green-700" />
      )}
    </button>
  );
}
