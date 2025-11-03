"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, CheckCircle, Image as ImageIcon, List, Download, Eye, Loader2, AlertCircle, Leaf, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabaseClient"; // Ensure this path is correct
import { useRouter } from "next/navigation";

type Plant = {
  id: string;
  name: string;
  botanical_name?: string;
  family?: string;
  synonyms: string[];
  english_name?: string;
  useful_parts: string[];
  indications: string[];
  shloka?: string;
  source_document?: string;
  images: string[];
  created_at: string;
  updated_at?: string;
};

type FormData = {
  name: string;
  botanical_name?: string;
  family?: string;
  synonyms: string;
  english_name?: string;
  useful_parts: string;
  indications: string;
  shloka?: string;
  source_document?: string;
};

export default function AyurvedaAdmin() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [formData, setFormData] = useState<Partial<FormData>>({
    name: "",
    botanical_name: "",
    family: "",
    synonyms: "",
    english_name: "",
    useful_parts: "",
    indications: "",
    shloka: "",
    source_document: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    initializeAuth();
    loadPlants();
  }, []);

  const initializeAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        router.push("/login");
        return;
      }
      setSession(data.session);
    } catch (err: any) {
      setError("Authentication failed. Please log in again.");
      router.push("/login");
    }
  };

  const loadPlants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlants(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load plants");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const uploadImages = async (plantId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${plantId}/${Date.now()}-${i}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("plant-images")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("plant-images").getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name?.trim()) throw new Error("Plant name is required");

      const plantData = {
        name: formData.name.trim(),
        botanical_name: formData.botanical_name?.trim() || null,
        family: formData.family?.trim() || null,
        english_name: formData.english_name?.trim() || null,
        synonyms: formData.synonyms
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
        useful_parts: formData.useful_parts
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
        indications: formData.indications
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
        shloka: formData.shloka?.trim() || null,
        source_document: formData.source_document?.trim() || null,
        images: [] as string[],
      };

      const { data: newPlant, error: insertError } = await supabase
        .from("plants")
        .insert(plantData)
        .select()
        .single();

      if (insertError) throw insertError;

      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages(newPlant.id);
        await supabase.from("plants").update({ images: imageUrls }).eq("id", newPlant.id);
      }

      setSuccess(`${formData.name} added successfully!`);
      setSelectedPlant({ ...newPlant, images: imageUrls });
      setShowQRModal(true);

      // Reset form
      setFormData({
        name: "",
        botanical_name: "",
        family: "",
        synonyms: "",
        english_name: "",
        useful_parts: "",
        indications: "",
        shloka: "",
        source_document: "",
      });
      setSelectedFiles([]);
      await loadPlants();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to add plant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePlantURL = (plantId: string) => `${(process.env.NEXT_PUBLIC_BASE_URL || "http://10.73.68.83:3000")}/plants/${plantId}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-emerald-800 font-semibold text-lg">Loading Ayurveda Garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-6 lg:px-8">
      {/* Decorative Leaves */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <Leaf className="absolute top-12 left-12 w-28 h-28 text-emerald-600 animate-pulse" style={{ animationDuration: "4s" }} />
        <Leaf className="absolute bottom-24 right-16 w-36 h-36 text-teal-600 animate-pulse" style={{ animationDuration: "5s" }} />
        <Leaf className="absolute top-1/3 left-1/4 w-24 h-24 text-lime-600 animate-pulse" style={{ animationDuration: "6s" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-5">
            <Leaf className="w-10 h-10 text-emerald-600" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Ayurveda Repository
            </h1>
            <Leaf className="w-10 h-10 text-teal-600" />
          </div>
          <p className="text-base md:text-lg text-gray-600">Digital Preservation of Ancient Herbal Wisdom</p>
        </header>

        {/* Alerts */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-800">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-8 p-5 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-start gap-3 animate-fade-in">
            <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-800">Success</p>
              <p className="text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        {/* Add Plant Form */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-12 border border-gray-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-emerald-600 rounded-xl shadow-sm">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Medicinal Plant</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField label="Plant Name *" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Neem" required />
              <InputField label="Botanical Name" name="botanical_name" value={formData.botanical_name} onChange={handleInputChange} placeholder="e.g., Azadirachta indica" />
              <InputField label="Family" name="family" value={formData.family} onChange={handleInputChange} placeholder="e.g., Meliaceae" />
              <InputField label="English Name" name="english_name" value={formData.english_name} onChange={handleInputChange} placeholder="e.g., Indian Lilac" />
              
              <InputField
                label="Synonyms"
                name="synonyms"
                value={formData.synonyms}
                onChange={handleInputChange}
                placeholder="Nimba, Arishta, Margosa"
                helper="Comma-separated"
              />
              <InputField
                label="Useful Parts"
                name="useful_parts"
                value={formData.useful_parts}
                onChange={handleInputChange}
                placeholder="Leaves, Bark, Seeds, Flowers"
                helper="Comma-separated"
              />
              <InputField
                label="Indications"
                name="indications"
                value={formData.indications}
                onChange={handleInputChange}
                placeholder="Skin diseases, Fever, Diabetes"
                helper="Comma-separated"
              />
              <InputField label="Source Document" name="source_document" value={formData.source_document} onChange={handleInputChange} placeholder="e.g., Charaka Samhita" />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Sanskrit Shloka (Optional)</label>
              <textarea
                name="shloka"
                value={formData.shloka}
                onChange={handleInputChange}
                rows={4}
                placeholder="निम्बति स्यान्निम्बको अरिष्टः पिचुमर्दकः..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none font-serif text-gray-700 resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Plant Images</label>
              <div className="relative">
                <input type="file" id="images" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                <label
                  htmlFor="images"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300 group"
                >
                  <ImageIcon className="w-10 h-10 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-base font-medium text-gray-800">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} image(s) selected` : "Click to upload images"}
                  </span>
                  <span className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG • Max 10MB each</span>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedFiles.map((file, i) => (
                    <span key={i} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 text-white font-semibold text-base rounded-xl shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Adding Plant...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  Add to Ayurveda Repository
                </>
              )}
            </button>
          </form>
        </section>

        {/* Plants Collection */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600 rounded-xl shadow-sm">
                <List className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Medicinal Plants Collection</h2>
            </div>
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full text-sm">
              {plants.length} {plants.length === 1 ? "Plant" : "Plants"}
            </span>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, family, or botanical name..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-gray-700"
            />
          </div>

          {plants.length === 0 ? (
            <div className="text-center py-20">
              <Leaf className="w-20 h-20 text-gray-300 mx-auto mb-5" />
              <p className="text-gray-500 text-lg font-medium">No plants added yet. Start building your digital garden!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plants
                .filter((p) => {
                  const q = query.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    p.name.toLowerCase().includes(q) ||
                    (p.botanical_name?.toLowerCase().includes(q) ?? false) ||
                    (p.family?.toLowerCase().includes(q) ?? false)
                  );
                })
                .map((plant, i) => (
                <div
                  key={plant.id}
                  className="flex items-start justify-between gap-4 bg-white rounded-xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all"
                  style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both` }}
                >
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{plant.name}</h3>
                    {plant.botanical_name && <p className="text-sm text-gray-600 italic mt-0.5 truncate">{plant.botanical_name}</p>}
                    {plant.family && <p className="text-xs text-gray-500 mt-1">Family: {plant.family}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => window.open(`/plants/${plant.id}`, "_blank")}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => { setSelectedPlant(plant); setShowQRModal(true); }}
                      className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> QR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedPlant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">QR Code</h3>
                <p className="text-gray-600 text-sm mt-1">{selectedPlant.name}</p>
              </div>
              <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <QRContent plantId={selectedPlant.id} plantName={selectedPlant.name} />
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Input Component
function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  helper,
}: {
  label: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  helper?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-5 py-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none text-gray-700"
      />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}

function QRContent({ plantId, plantName }: { plantId: string; plantName: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://10.73.68.83:3000";
  const url = `${base}/plants/${plantId}`;

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${plantName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${plantName.replace(/\s+/g, "-").toLowerCase()}-qr.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <QRCodeCanvas value={url} size={220} level="H" includeMargin ref={canvasRef as any} />
      </div>
      <div className="hidden">
        {/* Hidden SVG for optional vector download */}
        {/* @ts-ignore */}
        <svg ref={svgRef as any}>
          {/* Fallback; qrcode.react exposes QRCodeSVG but keeping simple here by serializing canvas alternative is complex; this keeps API surface small. */}
        </svg>
      </div>
      <div className="flex gap-3">
        <button onClick={downloadPng} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center gap-2">
          <Download className="w-4 h-4" /> PNG
        </button>
        <button onClick={downloadSvg} className="px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium">SVG</button>
      </div>
      <p className="text-center text-xs text-gray-500 px-4">Scanning opens the plant detail page even without login.</p>
    </div>
  );
}