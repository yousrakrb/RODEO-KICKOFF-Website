import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { generateInvoice, makeInvoiceNumber } from "../Invoice/Invoice";
import { PRODUCTS, MAX_QTY } from "./products";
import { useCart } from "./useCart";
import ProductGallery from "./ProductGallery";
import "./Preorder.css";

const fmt = (n) => `${n.toLocaleString("en-US")} DZD`;
const emailOk = (s) => /^\S+@\S+\.\S+$/.test(s);

export default function PreOrder({ applicant, conferenceFee = null, sheetUrl, logoUrl, onSkip, onComplete }) {
  const attached = !!applicant;
  const fee = attached ? conferenceFee : null;

  const [cart, setItem] = useCart();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", lc: "" });
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState("idle");
  const [done, setDone] = useState(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const urlRef = useRef(null);

  useEffect(() => () => urlRef.current && URL.revokeObjectURL(urlRef.current), []);

  const lines = useMemo(
    () =>
      PRODUCTS.filter((p) => cart[p.id]?.qty > 0).map((p) => ({
        ...p,
        qty: cart[p.id].qty,
        size: cart[p.id].size,
        subtotal: p.price * cart[p.id].qty,
      })),
    [cart]
  );

  const goodiesTotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const total = goodiesTotal + (fee || 0);
  const missingSize = lines.some((l) => l.sizes.length && !l.size);

  const errors = {
    fullName: !form.fullName.trim(),
    email: !emailOk(form.email.trim()),
    phone: form.phone.replace(/\D/g, "").length < 8,
  };
  const formInvalid = !attached && (errors.fullName || errors.email || errors.phone);

  const confirm = async () => {
    if (!lines.length || status === "working") return;
    if (missingSize || formInvalid) {
      setShowErrors(true);
      return;
    }

    setStatus("working");
    const customer = attached
      ? applicant
      : {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          lc: form.lc.trim(),
        };

    const number = makeInvoiceNumber();
    const items = lines.map(({ id, name, qty, size, price }) => ({
      id,
      name,
      qty,
      size: size || "",
      price,
    }));

    const { blob, base64, filename } = await generateInvoice({
      number,
      customer,
      lines: items,
      conferenceFee: fee,
      total,
      logoUrl,
    });

    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(blob);

    let synced = !sheetUrl;
    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            formType: "preorder", // routes this to handlePreOrder on the Apps Script side
            invoiceNumber: number,
            mode: attached ? "with application" : "independent",
            customer,
            items,
            goodiesTotal,
            conferenceFee: fee,
            total,
            filename,
            pdfBase64: base64,
          }),
        });
        synced = true;
      } catch {
        synced = false;
      }
    }

    setDone({ number, url: urlRef.current, filename, synced });
    setStatus("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
    onComplete && onComplete({ order: { items, goodiesTotal, conferenceFee: fee, total }, customer, invoiceNumber: number });
  };

  /* ---------------------------- success view ---------------------------- */
  if (status === "done" && done) {
    return (
      <main className="po">
        <div className="po-wrap">
          <motion.div
            className="po-done"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="po-kicker">Pre-order confirmed</p>
            <h1 className="po-title">Yeehaw, you're set</h1>
            <p className="po-sub">
              Your invoice <b>{done.number}</b> is ready. Download it and keep it, you'll show it when you pick up your goodies.
            </p>
            <a className="po-confirm po-dl" href={done.url} download={done.filename}>
              Download my invoice (PDF)
            </a>
            {!done.synced && (
              <p className="po-err center">We couldn't send your copy to the organisers. Please download your invoice and send it to us.</p>
            )}
            <div className="po-total po-done-total">
              <span>Total</span>
              <b>{fmt(total)}</b>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  /* ---------------------------- main view ---------------------------- */
  return (
    <main className="po">
      <div className="po-wrap">
        <motion.header
          className="po-head"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {attached && (
            <ol className="po-steps" aria-label="Progress">
              <li className="done"><span>1</span>Apply</li>
              <li className="now" aria-current="step"><span>2</span>Pre-order</li>
              <li><span>3</span>Invoice</li>
            </ol>
          )}
          <h1 className="po-title">Gear up, cowboy</h1>
          <p className="po-sub">
            {attached
              ? "Your application is in. Add the official Rodeo goodies to your order, or skip and keep it simple. Whatever you pick is added to your total."
              : "Pick your Rodeo goodies and tell us who you are, so we know whose order is whose. You'll get your invoice right away."}
          </p>
        </motion.header>

        <div className="po-layout">
          <div>
            {attached ? (
              <p className="po-who">
                Ordering as <b>{applicant.fullName}</b>
                {applicant.email ? ` · ${applicant.email}` : ""}
              </p>
            ) : (
              <motion.form
                className="po-form"
                onSubmit={(e) => e.preventDefault()}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                noValidate
              >
                <h2>Your details</h2>
                <div className="po-fields">
                  {[
                    ["fullName", "Full name", "text", "name"],
                    ["email", "Email", "email", "email"],
                    ["phone", "Phone number", "tel", "tel"],
                    ["lc", "Local committee / city (optional)", "text", "organization"],
                  ].map(([k, label, type, ac]) => (
                    <label key={k} className={showErrors && errors[k] ? "bad" : ""}>
                      <span>{label}</span>
                      <input
                        type={type}
                        autoComplete={ac}
                        value={form[k]}
                        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                      />
                      {showErrors && errors[k] && (
                        <em>{k === "email" ? "Enter a valid email" : k === "phone" ? "Enter a valid number" : "Required"}</em>
                      )}
                    </label>
                  ))}
                </div>
              </motion.form>
            )}

            <section className="po-grid" aria-label="Goodies">
              {PRODUCTS.map((p, i) => {
                const item = cart[p.id];
                const qty = item?.qty || 0;
                const sizeErr = showErrors && qty > 0 && p.sizes.length && !item?.size;

                return (
                  <motion.article
                    key={p.id}
                    className={`po-card ${qty ? "is-added" : ""}`}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link to={`/preorder/${p.id}`} className="po-media" aria-label={`View ${p.name}`}>
                      <ProductGallery images={p.images} alt={p.name} />
                    </Link>

                    <div className="po-info">
                      <h2>{p.name}</h2>
                      <p className="po-note">{p.note}</p>
                      <p className="po-price">{fmt(p.price)}</p>

                      {p.sizes.length > 0 && (
                        <div className="po-sizes" role="radiogroup" aria-label={`${p.name} size`}>
                          {p.sizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              role="radio"
                              aria-checked={item?.size === s}
                              className={item?.size === s ? "on" : ""}
                              onClick={() => setItem(p.id, { size: s, qty: qty || 1 })}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                      {sizeErr && <p className="po-err">Pick a size</p>}

                      <div className="po-action">
                        {qty === 0 ? (
                          <button type="button" className="po-add" onClick={() => setItem(p.id, { qty: 1 })}>
                            Add to order
                          </button>
                        ) : (
                          <div className="po-qty" aria-label={`${p.name} quantity`}>
                            <button type="button" aria-label="Remove one" onClick={() => setItem(p.id, { qty: qty - 1 })}>
                              &minus;
                            </button>
                            <span>{qty}</span>
                            <button
                              type="button"
                              aria-label="Add one"
                              disabled={qty >= MAX_QTY}
                              onClick={() => setItem(p.id, { qty: qty + 1 })}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </section>
          </div>

          {/* ---------- summary (toggleable on mobile, sticky on desktop) ---------- */}
          <aside className={`po-summary ${mobileCartOpen ? "open" : ""}`} aria-label="Order summary">
            <button
              type="button"
              className="po-summary-toggle"
              onClick={() => setMobileCartOpen((o) => !o)}
            >
              <span>
                {lines.length
                  ? `${lines.reduce((s, l) => s + l.qty, 0)} item${lines.reduce((s, l) => s + l.qty, 0) === 1 ? "" : "s"} · ${fmt(total)}`
                  : "Your order"}
              </span>
              <span className="po-summary-toggle-chevron">{mobileCartOpen ? "▾" : "▴"}</span>
            </button>

            <div className="po-summary-body">
              <h2>Your order</h2>

              <ul className="po-lines">
                <AnimatePresence initial={false}>
                  {fee != null && (
                    <li key="conf">
                      <span>Conference</span>
                      <b>{fmt(fee)}</b>
                    </li>
                  )}
                  {lines.map((l) => (
                    <motion.li
                      key={l.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <span>
                        {l.qty} &times; {l.name}
                        {l.size ? ` (${l.size})` : ""}
                      </span>
                      <b>{fmt(l.subtotal)}</b>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {!lines.length && (
                  <li className="po-empty">
                    <span>No goodies yet</span>
                  </li>
                )}
              </ul>

              <div className="po-total">
                <span>Total</span>
                <motion.b key={total} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  {fmt(total)}
                </motion.b>
              </div>

              <button
                type="button"
                className="po-confirm"
                disabled={!lines.length || status === "working"}
                onClick={confirm}
              >
                {status === "working" ? "Creating your invoice..." : "Confirm pre-order"}
              </button>

              {attached && (
                <button
                  type="button"
                  className="po-skip"
                  onClick={() => (onSkip ? onSkip() : console.log("Skipped pre-order"))}
                >
                  Skip, just apply to the conference
                </button>
              )}

              {showErrors && (missingSize || formInvalid) && (
                <p className="po-err center">
                  {formInvalid ? "Please complete your details." : "Choose a size for your shirts first."}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}