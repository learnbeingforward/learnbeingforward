"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { Label } from "@/components/ui/label";

export function FileUploadField({
  name,
  label,
  category,
  defaultUrl,
  typeFieldName,
}: {
  name: string;
  label: string;
  category: "cv" | "content" | "photo";
  defaultUrl?: string | null;
  typeFieldName?: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [fileType, setFileType] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Upload failed.");
        setStatus("error");
        return;
      }
      setUrl(body.url);
      setFileType(body.fileType ?? "");
      setStatus("idle");
    } catch {
      setError("Upload failed. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
      <Label htmlFor={`${name}-file`}>{label}</Label>
      <input type="hidden" name={name} value={url} />
      {typeFieldName && <input type="hidden" name={typeFieldName} value={fileType} />}
      <div className="mt-1.5 flex items-center gap-3">
        <label
          htmlFor={`${name}-file`}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm text-indigo hover:bg-cream"
        >
          <Paperclip className="size-4" />
          {url ? "Replace file" : "Choose file"}
        </label>
        <input
          id={`${name}-file`}
          type="file"
          accept={category === "photo" ? ".jpg,.jpeg,.png,.webp" : ".pdf,.ppt,.pptx,.doc,.docx"}
          className="hidden"
          onChange={handleChange}
        />
        {status === "uploading" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        {status === "idle" && url && (
          <span className="flex items-center gap-1 text-xs text-green-700">
            <CheckCircle2 className="size-3.5" /> Uploaded
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
