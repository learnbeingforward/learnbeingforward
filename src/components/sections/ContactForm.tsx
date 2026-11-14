"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormInput } from "@/lib/validation";
import { Icon } from "@/components/lbf/icons";

const ROLES = ["College / University", "Company", "Student", "Trainer"] as const;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormInput) => {
    setServerError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="empty stack" style={{ alignItems: "center", gap: 10 }}>
        <h3 className="h3">Message sent</h3>
        <p className="muted">Thanks for reaching out — our team will get back to you shortly.</p>
        <button type="button" className="btn btn-sm" onClick={() => setSubmitted(false)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="stack" style={{ gap: 16, marginTop: 22 }}>
      <div className="grid" style={{ ["--min" as string]: "220px" }}>
        <label className="field">
          <span>
            Name <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" {...register("name")} />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </label>
        <label className="field">
          <span>
            Email <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="email" {...register("email")} />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </label>
      </div>
      <div className="grid" style={{ ["--min" as string]: "220px" }}>
        <label className="field">
          I am a
          <select className="select" {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Phone (optional)
          <input className="input" type="tel" {...register("phone")} />
        </label>
      </div>
      <label className="field">
        <span>
          Message <span className="req" aria-hidden="true">*</span>
        </span>
        <textarea className="textarea" rows={5} {...register("message")} />
        {errors.message && <span className="error-text">{errors.message.message}</span>}
      </label>

      {serverError && <p className="error-text">{serverError}</p>}

      <div className="split">
        <span className="hint">We usually reply within one working day.</span>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"} <Icon name="arrowR" size={16} />
        </button>
      </div>
    </form>
  );
}
