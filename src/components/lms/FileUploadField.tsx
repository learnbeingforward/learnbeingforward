"use client";

import { useState } from "react";
import { Icon } from "@/components/lbf/icons";

export function FileUploadField({
  name,
  label,
  category,
  defaultUrl,
  typeFieldName,
  compact,
  listRow,
  emptyText,
}: {
  name: string;
  label: string;
  category: "cv" | "content" | "photo";
  defaultUrl?: string | null;
  typeFieldName?: string;
  compact?: boolean;
  listRow?: boolean;
  emptyText?: string;
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

  const fileInput = (
    <input
      id={`${name}-file`}
      type="file"
      accept={category === "photo" ? ".jpg,.jpeg,.png,.webp" : ".pdf,.ppt,.pptx,.doc,.docx"}
      style={{ display: "none" }}
      onChange={handleChange}
    />
  );

  if (compact) {
    return (
      <>
        <input type="hidden" name={name} value={url} />
        {typeFieldName && <input type="hidden" name={typeFieldName} value={fileType} />}
        <label className="btn btn-sm" style={{ cursor: "pointer" }} htmlFor={`${name}-file`}>
          <Icon name="upload" size={16} />
          {status === "uploading" ? "Uploading…" : url ? `Replace ${label.toLowerCase()}` : label}
        </label>
        {fileInput}
        {error && <span className="error-text">{error}</span>}
      </>
    );
  }

  if (listRow) {
    return (
      <div className="field">
        {label}
        <input type="hidden" name={name} value={url} />
        {typeFieldName && <input type="hidden" name={typeFieldName} value={fileType} />}
        <div className="list-row">
          <Icon name="file" size={20} />
          <span className="grow small">{status === "uploading" ? "Uploading…" : url ? "Uploaded." : emptyText ?? "No file uploaded yet."}</span>
          <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }} htmlFor={`${name}-file`}>
            <Icon name="upload" size={16} />
            {url ? "Replace" : "Upload"}
          </label>
        </div>
        {fileInput}
        {error && <span className="error-text">{error}</span>}
      </div>
    );
  }

  return (
    <div className="field">
      {label}
      <input type="hidden" name={name} value={url} />
      {typeFieldName && <input type="hidden" name={typeFieldName} value={fileType} />}
      <div className="box" style={{ borderStyle: "dashed", display: "flex", gap: 12, alignItems: "center", background: "var(--surface)" }}>
        <Icon name="file" size={20} />
        <span className="grow small">
          {status === "uploading" ? (
            "Uploading…"
          ) : url ? (
            <>
              Uploaded —{" "}
              <label htmlFor={`${name}-file`} className="link-btn" style={{ cursor: "pointer" }}>
                replace
              </label>
            </>
          ) : (
            <>
              Drop a file or{" "}
              <label htmlFor={`${name}-file`} className="link-btn" style={{ cursor: "pointer" }}>
                browse
              </label>
            </>
          )}
        </span>
        {fileInput}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
