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

export default function WordpadEditor({ containerRef }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: `
      <h1>Paste your heading here</h1>
      <p>Click here and start typing, or paste text and images.</p>
      <p>When you're done, click "Save as PDF" at the top.</p>
    `,
    // Needed for Next.js SSR to avoid hydration mismatch
    immediatelyRender: false,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!editor) return null;

  return (
    <div>
      {/* Inline toolbar just for the editor */}
      <div className="editor-toolbar">
        <button
          type="button"
          className={
            "toolbar-button" +
            (editor.isActive("bold") ? " toolbar-button-active" : "")
          }
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>

        <button
          type="button"
          className={
            "toolbar-button" +
            (editor.isActive("italic") ? " toolbar-button-active" : "")
          }
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>

        <button
          type="button"
          className={
            "toolbar-button" +
            (editor.isActive("heading", { level: 1 })
              ? " toolbar-button-active"
              : "")
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>

        <button
          type="button"
          className={
            "toolbar-button" +
            (editor.isActive("heading", { level: 2 })
              ? " toolbar-button-active"
              : "")
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>

        <button
          type="button"
          className={
            "toolbar-button" +
            (editor.isActive("bulletList") ? " toolbar-button-active" : "")
          }
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>

        <button
          type="button"
          className={
            "toolbar-button" +
            (editor.isActive("orderedList") ? " toolbar-button-active" : "")
          }
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>

        <span className="toolbar-divider" />

        <button
          type="button"
          className="toolbar-button"
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </button>
        <button
          type="button"
          className="toolbar-button"
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </button>

        <span className="toolbar-divider" />

        {/* Image upload button */}
        <button
          type="button"
          className="toolbar-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Image
        </button>

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

              // Insert image and then a new empty paragraph so cursor goes to next line
              editor
                .chain()
                .focus()
                .setImage({ src })
                .insertContent("<p></p>") // 🔥 force caret below the image
                .run();
            };
            reader.readAsDataURL(file);

            // allow re-selecting the same file
            e.target.value = "";
          }}
        />
      </div>

      {/* Editor “page” (goes into PDF) */}
      <div
        ref={containerRef as any}
        className="editor-page"
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          minHeight: "900px",
          boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          lineHeight: 1.6,
          cursor: "text",
          overflow: "hidden",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
