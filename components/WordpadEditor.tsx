"use client";

import React, { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

type Props = {
  containerRef: React.RefObject<HTMLDivElement>;
};

// Banned words
const bannedPhrases = [
  "Sign Up",
  "sign up",
  "SIGN UP",
  "Signup",
  "signup",
  `"Concept && Coding" YT Video Notes`,
  "Report Abuse",
];

// Remove banned phrases inside TEXT nodes only
function sanitizeHTML(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
  let current: Node | null;

  while ((current = walker.nextNode())) {
    let text = current.nodeValue || "";

    bannedPhrases.forEach((p) => {
      const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");

      text = text.replace(regex, "");
    });

    current.nodeValue = text;
  }

  return div.innerHTML;
}

export default function WordpadEditor({ containerRef }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: `<p>Paste something…</p>`,
    immediatelyRender: false,

    editorProps: {
      handlePaste(view, ev: ClipboardEvent, slice) {
        if (!ev.clipboardData) return false;

        const hasImage = Array.from(ev.clipboardData.items).some((i) =>
          i.type.startsWith("image/")
        );

        if (hasImage) {
          // allow native image paste
          return false;
        }

        // block Tiptap text paste
        return true;
      },
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!editor) return null;

  const handlePaste = (event: React.ClipboardEvent) => {
    const dt = event.clipboardData;
    if (!dt) return;

    const plain = dt.getData("text/plain") || "";
    const html = dt.getData("text/html") || "";

    const hasImage = Array.from(dt.items).some((item) =>
      item.type.startsWith("image/")
    );

    // Allow Tiptap to handle image pastes normally
    if (hasImage) {
      return;
    }

    event.preventDefault();

    // HTML paste
    if (html.trim().length > 0) {
      const cleaned = sanitizeHTML(html);
      editor.chain().focus().insertContent(cleaned).run();
      return;
    }

    // Plain text paste
    if (plain.trim().length > 0) {
      const wrappedHTML = plain.replace(/\n/g, "<br/>");
      const cleaned = sanitizeHTML(wrappedHTML);
      editor.chain().focus().insertContent(cleaned).run();
      return;
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>

        <button onClick={() => fileInputRef.current?.click()}>Image</button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (res) => {
              const src =
                typeof res.target?.result === "string" ? res.target.result : "";
              if (!src) return;

              editor
                .chain()
                .focus()
                .setImage({ src })
                .insertContent("<p></p>")
                .run();
            };
            reader.readAsDataURL(file);

            e.target.value = "";
          }}
        />
      </div>

      {/* Editor */}
      <div
        ref={containerRef}
        className="editor-page"
        style={{
          background: "white",
          padding: "40px",
          minHeight: "900px",
        }}
      >
        <EditorContent editor={editor} onPaste={handlePaste} />
      </div>
    </div>
  );
}
