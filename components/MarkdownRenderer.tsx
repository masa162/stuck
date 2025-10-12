"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 id={props.children?.toString().toLowerCase().replace(/\s+/g, "-")} className="text-3xl font-bold mt-8 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 id={props.children?.toString().toLowerCase().replace(/\s+/g, "-")} className="text-2xl font-bold mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 id={props.children?.toString().toLowerCase().replace(/\s+/g, "-")} className="text-xl font-bold mt-4 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 id={props.children?.toString().toLowerCase().replace(/\s+/g, "-")} className="text-lg font-bold mt-3 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
            ) : (
              <code className="block bg-gray-900 text-white p-4 rounded-lg overflow-x-auto" {...props} />
            ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-600 hover:underline" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
