"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ImageUpload({
  label,
  folder,
  value,
  onChange,
  round,
}: {
  label: string;
  folder: "teachers" | "courses";
  value: string;
  onChange: (url: string) => void;
  round?: boolean;
}) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div>
      <label className="text-xs text-paper/50 block mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className={`w-14 h-14 object-cover border border-white/10 ${round ? "rounded-full" : "rounded-lg"}`}
          />
        ) : (
          <div
            className={`w-14 h-14 bg-ink border border-dashed border-white/15 flex items-center justify-center text-paper/20 text-[10px] shrink-0 ${
              round ? "rounded-full" : "rounded-lg"
            }`}
          >
            None
          </div>
        )}
        <div className="flex-1 min-w-0">
          <label className="inline-block cursor-pointer text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition">
            {uploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
          </label>
          {value && !uploading && (
            <button type="button" onClick={() => onChange("")} className="ml-2 text-xs text-red-400 hover:underline">
              Remove
            </button>
          )}
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
