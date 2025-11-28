// app/page.tsx
"use client";

import { useRef } from "react";
import WordpadEditor from "../components/WordpadEditor";

export default function HomePage() {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSavePdf = async () => {
    if (!editorContainerRef.current) return;

    // Load html2pdf only on client
    const html2pdf = (await import("html2pdf.js")).default as any;

    const opt = {
      margin: 10,
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true, // helps keep images in output
        allowTaint: true,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(editorContainerRef.current).set(opt).save();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 0",
        background: "#e5e7eb",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "80vw",
          maxWidth: "1000px",
        }}
      >
        {/* Top toolbar (not inside PDF) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 600,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            Mini WordPad – Paste & Save as PDF
          </h1>
          <button
            onClick={handleSavePdf}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Save as PDF
          </button>
        </div>

        {/* Editor area (this div content goes to PDF) */}
        <WordpadEditor containerRef={editorContainerRef} />
      </div>
    </main>
  );
}
