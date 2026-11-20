"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/lbf/icons";
import { createCourseOrder, type CreateOrderState } from "@/lib/actions/buy";

const STEPS = ["Your details", "Pay by UPI", "Done"] as const;

export function CheckoutForm({
  listingId,
  price,
  payeeName,
  upiId,
  qrDataUrl,
}: {
  listingId: string;
  price: number;
  payeeName: string | null;
  upiId: string | null;
  qrDataUrl: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState<CreateOrderState, FormData>(
    createCourseOrder.bind(null, listingId),
    null
  );

  useEffect(() => {
    if (state?.ok && state.orderId && state.token) {
      router.push(`/buy/order/${state.orderId}?token=${state.token}`);
    }
  }, [state, router]);

  function continueToPayment() {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setDetailsError("Enter your name and a valid email.");
      return;
    }
    setDetailsError(null);
    setStep(2);
  }

  return (
    <>
      <ol className="ed-steps" style={{ margin: "0 0 20px" }}>
        {STEPS.map((label, i) => (
          <li key={label} className={i + 1 < step ? "done" : i + 1 === step ? "now" : ""}>
            <span>{i + 1 < step ? <Icon name="check" size={14} /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <>
          <h2 className="h3" style={{ marginBottom: 14 }}>
            Where should we send your books?
          </h2>
          <div className="stack" style={{ gap: 14 }}>
            <label className="field">
              <span>
                Your name <span className="req">*</span>
              </span>
              <input className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              <span>
                Email — your books are sent here <span className="req">*</span>
              </span>
              <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="field">
              Phone <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
              <input className="input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            {detailsError && <span className="error-text">{detailsError}</span>}
            <button className="btn btn-gold" type="button" onClick={continueToPayment}>
              Continue to payment
              <Icon name="arrowR" size={16} />
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="h3" style={{ marginBottom: 14 }}>
            Pay ₹{price} by UPI
          </h2>
          <div className="by-pay" style={{ marginTop: 0 }}>
            <div style={{ textAlign: "center" }}>
              {qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="UPI QR code" width={168} height={168} style={{ margin: "0 auto" }} />
              )}
              {payeeName && <div className="strong" style={{ marginTop: 8 }}>{payeeName}</div>}
              {upiId && <div className="small muted">{upiId}</div>}
            </div>
            <form action={formAction} className="stack" style={{ gap: 12 }}>
              <input type="hidden" name="buyerName" value={name} />
              <input type="hidden" name="buyerEmail" value={email} />
              <input type="hidden" name="buyerPhone" value={phone} />
              <ol className="small" style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                <li>
                  Open any UPI app and scan the QR, or pay to <b>{upiId}</b>.
                </li>
                <li>
                  Pay exactly <b>₹{price}</b>.
                </li>
                <li>Copy the 12-digit UTR / transaction ID from the app and enter it below.</li>
              </ol>
              <label className="field">
                <span>
                  UPI transaction ID (UTR) <span className="req">*</span>
                </span>
                <input className="input" name="utr" inputMode="numeric" pattern="\d{12}" maxLength={12} required placeholder="12-digit number" />
              </label>
              {state?.error && <span className="error-text">{state.error}</span>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn" type="button" onClick={() => setStep(1)}>
                  <Icon name="arrowL" size={16} />
                  Back
                </button>
                <button className="btn btn-gold" type="submit" disabled={isPending}>
                  {isPending ? "Submitting…" : "I have paid — submit"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
