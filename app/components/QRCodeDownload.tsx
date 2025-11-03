// app/components/QRCodeDownload.tsx
"use client";

import { Download } from "lucide-react";

export default function QRCodeDownload({ url }: { url: string }) {
  const download = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `vrukshaveda-qr-${Date.now()}.png`;
    link.click();
  };

  return (
    <button
      onClick={download}
      className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      <Download size={16} />
      Download PNG
    </button>
  );
}