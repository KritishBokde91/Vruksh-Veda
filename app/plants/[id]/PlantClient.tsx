// app/plants/[id]/PlantClient.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";

type Plant = {
  name: string;
  botanical_name?: string | null;
  family?: string | null;
  synonyms?: string[] | null;
  useful_parts?: string[] | null;
  indications?: string[] | null;
  shloka?: string | null;
  images: string[];
};

export default function PlantClient({ plant }: { plant: Plant }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://10.73.68.83:3000";
  const url = typeof window !== "undefined" ? `${base}${window.location.pathname}` : base;
  const downloadQr = () => {
    const canvas = document.getElementById("plant-qr-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${plant.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
      <div className="p-8 border-b border-gray-100 bg-white">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{plant.name}</h1>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 text-gray-700">
            {plant.botanical_name && (
              <p>
                <strong>Botanical:</strong> <em>{plant.botanical_name}</em>
              </p>
            )}
            {plant.family && (
              <p>
                <strong>Family:</strong> {plant.family}
              </p>
            )}
            {plant.synonyms && plant.synonyms.length > 0 && (
              <p>
                <strong>Synonyms:</strong> {plant.synonyms.join(", ")}
              </p>
            )}
            {plant.useful_parts && plant.useful_parts.length > 0 && (
              <p>
                <strong>Useful Parts:</strong> {plant.useful_parts.join(", ")}
              </p>
            )}
            {plant.indications && plant.indications.length > 0 && (
              <p>
                <strong>Indications:</strong> {plant.indications.join(" • ")}
              </p>
            )}
            {plant.shloka && (
              <blockquote className="mt-6 p-4 bg-amber-50 rounded-xl font-devanagari text-lg leading-relaxed border-l-4 border-amber-400">
                {plant.shloka}
              </blockquote>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {plant.images.length > 0 ? (
              plant.images.map((src, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  <Image
                    src={src}
                    alt={`${plant.name} ${i + 1}`}
                    width={400}
                    height={300}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))
            ) : (
              <p className="col-span-2 text-center text-gray-400 italic">No images available</p>
            )}
          </div>
          <div className="mt-8">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Share</h4>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-3">
                <QRCodeCanvas id="plant-qr-canvas" value={url} size={140} level="H" includeMargin />
              </div>
              <button onClick={downloadQr} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4" /> Download QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}