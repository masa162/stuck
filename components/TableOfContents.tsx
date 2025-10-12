"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // Markdownから見出しを抽出
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));

    const extractedHeadings = matches.map((match) => ({
      level: match[1].length,
      text: match[2],
      id: match[2].toLowerCase().replace(/\s+/g, "-"),
    }));

    setHeadings(extractedHeadings);
  }, [content]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (headings.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        見出しがありません
      </div>
    );
  }

  return (
    <nav className="space-y-1">
      {headings.map((heading, index) => (
        <button
          key={index}
          onClick={() => handleClick(heading.id)}
          className="block text-sm text-left hover:text-blue-600 transition-colors w-full"
          style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
        >
          {heading.text}
        </button>
      ))}
    </nav>
  );
}
