// components/WordpadEditor.tsx
"use client";

import React, { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

type Props = {
  containerRef:
    | React.RefObject<HTMLDivElement>
    | React.MutableRefObject<HTMLDivElement | null>;
};

// BANNED WORDS
const bannedPhrases = [
  "Sign Up",
  "sign up",
  "SIGN UP",
  "Signup",
  "signup",
  `"Concept && Coding" YT Video Notes`,
  "Report Abuse",
];

function sanitize(text: string) {
  console.log("--------------------------------------------------");
  console.log("[SANITIZE] RAW INPUT:", JSON.stringify(text));

  let out = text;

  bannedPhrases.forEach((phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");

    if (regex.test(out)) {
      console.log(`[SANITIZE] Removing: ${phrase}`);
      out = out.replace(regex, "");
    }
  });

  out = out.replace(/[ \t]{2,}/g, " ").trim();
  console.log("[SANITIZE] FINAL:", JSON.stringify(out));
  console.log("--------------------------------------------------");

  return out;
}

export default function WordpadEditor({ containerRef }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: `<p>Paste something…</p>`,
    immediatelyRender: false,

    // ⚠️ IMPORTANT: DO NOT block Tiptap paste fully
    editorProps: {
      transformPastedHTML(html) {
        // allow normal HTML paste unless our React handler stops it
        return html;
      },
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  if (!editor) return null;

  // MASTER PASTE HANDLER — handles text, HTML, AND images
  const handlePaste = (event: React.ClipboardEvent) => {
    console.log("==================================================");
    console.log("[PASTE] Event:", event);

    const dt = event.clipboardData;
    console.log("[PASTE] clipboard types:", dt.types);

    // 🔥 1️⃣ CHECK FOR IMAGE PASTE
    const hasImage = Array.from(dt.items).some((item) =>
      item.type.startsWith("image/")
    );

    if (hasImage) {
      console.log("[PASTE] IMAGE detected → allow Tiptap to handle it");
      return; // DO NOT preventDefault → Tiptap inserts the image
    }

    // 2️⃣ HANDLE PLAIN TEXT
    const plain = dt.getData("text/plain");
    const html = dt.getData("text/html");

    console.log("[PASTE] text/plain:", JSON.stringify(plain));
    console.log("[PASTE] text/html:", html);

    event.preventDefault(); // stop browser default paste for text

    let extracted = plain;

    // If no plain text → extract from HTML
    if (!extracted && html) {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      extracted = temp.innerText;
      console.log("[PASTE] Extracted text from HTML:", extracted);
    }

    const cleaned = sanitize(extracted);
    console.log("[PASTE] Inserting CLEANED:", cleaned);

    editor
      .chain()
      .focus()
      .insertContent(cleaned || " ")
      .run();
    console.log("==================================================");
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
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              const src = reader.result as string;

              editor
                .chain()
                .focus()
                .setImage({ src })
                .insertContent("<p></p>")
                .run();
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>

      {/* Editor */}
      <div
        ref={containerRef as any}
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
