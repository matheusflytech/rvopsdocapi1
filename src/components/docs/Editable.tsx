import { useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  as?: "div" | "h1" | "h2" | "h3" | "span";
}

export function Editable({ value, onChange, placeholder, className, multiline, as = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const Tag: any = as;

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(
        "outline-none transition-colors rounded-md px-1 -mx-1",
        "hover:bg-white/[0.03] focus:bg-white/[0.05]",
        className,
      )}
      onBlur={(e: any) => {
        const text = multiline ? e.currentTarget.innerText : e.currentTarget.innerText.replace(/\n/g, " ");
        if (text !== value) onChange(text);
      }}
      onKeyDown={(e: any) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      dangerouslySetInnerHTML={{ __html: escapeHtml(value) }}
    />
  );
}

function escapeHtml(s: string) {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}
