"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

export function MarkdownToHtml({ markdown, className = "" }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    // Convert markdown to HTML
    const rawHtml = marked.parse(markdown);

    // Sanitize HTML to prevent XSS attacks
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    setHtml(cleanHtml);
  }, [markdown]);

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
