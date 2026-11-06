import { useEffect, useMemo, useState } from "react";
import {
    SHEET_URL,
    LCS,
    PICKUP_POINTS,
    POSITIONS,
    DEPARTMENTS,
    POSITIONS_AiC,
    DEPARTMENTS_AiC,
    PASSES,
    POLICY_TEXT,
    ATTENDANCE_QUESTION,
    TRANSPORT_NOTICE_EXTERNAL,
    TRANSPORT_NOTICE_LOCAL_RETURN,
    CONDUCT_POLICY_DOC_URL,
    PARENTAL_AUTH_DOC_URL,
    getDelegatePrice,
} from "./Config";
import { generateInvoice, downloadBlob, blobToBase64 } from "../../utils/generateInvoice";
import "./RegistrationPage.css";

const STORAGE_KEY = "rodeo-registration-v1";
const STEP_KEY = "rodeo-registration-step";

const EMPTY = {
    fromConstantine: null, // true | false
    lc: "",
    needsTransport: "",
    pickupPoint: "",
    pass: "",
    fullName: "",
    age: "",
    aiesecMail: "",
    phone: "",
    facebook: "",
    photoFile: null,
    position: "",
    department: "",
    conductPolicyFile: null,
    parentalAuthAcknowledged: "",
    previousDelegate: "",
    previousConference: "",
    motivation: "",
    paymentMethod: "",
    day: "",
    attendanceConfirmed: "",
    policyAgreed: "",
    hype: 0,
    notes: "",
};

/* ---------- small building blocks ---------- */

const EMOJI_CODES = {
    "🌵": "1f335",
    "💰": "1f4b0",
    "🎯": "1f3af",
    "🤠": "1f920",
    "🐎": "1f40e",
    "⚠️": "26a0-fe0f",
    "📜": "1f4dc",
    "👨‍👩‍👧": "1f468-200d-1f469-200d-1f467",
};
function Emoji({ char }) {
    const code = EMOJI_CODES[char];
    if (!code) return <>{char}</>;
    return (
        <img
            className="emoji"
            src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/${code}.png`}
            alt={char}
            draggable={false}
        />
    );
}

function Field({ label, hint, error, children }) {
    return (
        <div className={`field ${error ? "has-error" : ""}`}>
            <label className="field-label">{label}</label>
            {hint && <p className="field-hint">{hint}</p>}
            {children}
            {error && <p className="field-error">{error}</p>}
        </div>
    );
}

function Chips({ options, value, onChange }) {
    return (
        <div className="chips" role="radiogroup">
            {options.map((opt) => {
                const v = typeof opt === "string" ? opt : opt.value;
                const l = typeof opt === "string" ? opt : opt.label;
                return (
                    <button
                        type="button"
                        key={v}
                        role="radio"
                        aria-checked={value === v}
                        className={`chip ${value === v ? "active" : ""}`}
                        onClick={() => onChange(v)}
                    >
                        {l}
                    </button>
                );
            })}
        </div>
    );
}

function BigChoice({ title, text, active, onClick, emoji }) {
    return (
        <button
            type="button"
            className={`big-choice ${active ? "active" : ""}`}
            onClick={onClick}
        >
            <span className="big-choice-emoji"><Emoji char={emoji} /></span>
            <span className="big-choice-title">{title}</span>
            <span className="big-choice-text">{text}</span>
        </button>
    );
}

// showThumbnail renders a small 32px preview inline in the button — used for
// the photo upload so it doesn't blow up into a giant standalone image.
function FileDrop({ accept, file, onChange, label, showThumbnail = false }) {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (showThumbnail && file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
    }, [file, showThumbnail]);

    return (
        <div className="file-drop">
            <label className="wood-btn file-drop-btn">
                {previewUrl && <img src={previewUrl} alt="" className="file-drop-thumb" />}
                {file ? `✓ ${file.name}` : label}
                <input
                    type="file"
                    accept={accept}
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                    hidden
                />
            </label>
        </div>
    );
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsDataURL(file);
    });
}

/* ---------- main component ---------- */

export default function RegistrationPage() {
    const [form, setForm] = useState(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? { ...EMPTY, ...JSON.parse(saved) } : EMPTY;
        } catch {
            return EMPTY;
        }
    });
    const [stepIndex, setStepIndex] = useState(() => {
        try {
            return Number(sessionStorage.getItem(STEP_KEY)) || 0;
        } catch {
            return 0;
        }
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle"); // idle | sending | done | failed
    const [invoiceBlob, setInvoiceBlob] = useState(null);
    const [generating, setGenerating] = useState(false);

    // File objects can't be JSON.stringify'd into sessionStorage — strip them before saving
    useEffect(() => {
        try {
            const { photoFile, conductPolicyFile, ...rest } = form;
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
        } catch {
            /* storage unavailable: the form still works */
        }
    }, [form]);

    useEffect(() => {
        try {
            sessionStorage.setItem(STEP_KEY, String(stepIndex));
        } catch {
            /* ignore */
        }
    }, [stepIndex]);

    const set = (key, value) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    // Steps adapt to the answers: LC step only for non-Constantine delegates,
    // "parental" step only appears once age is known and under 21
    const steps = useMemo(() => {
        const s = ["origin"];
        if (form.fromConstantine === false) s.push("lc");
        s.push("pass", "personal", "aiesec", "conduct");
        const age = Number(form.age);
        if (form.age && Number.isFinite(age) && age < 21) s.push("parental");
        s.push("rodeo", "fine");
        return s;
    }, [form.fromConstantine, form.age]);

    const stepId = status === "done" ? "done" : steps[stepIndex] || "origin";
    const reachedPass = stepIndex >= steps.indexOf("pass");
    const pass = PASSES.find((p) => p.id === form.pass);
    const price = useMemo(() => getDelegatePrice(form), [form]);

    const passIncludes = (p) =>
        p.includes.filter(
            (i) => i.key !== "transport" || form.fromConstantine !== true
        );

    /* ---------- validation ---------- */

    const validate = (id) => {
        const e = {};
        const req = (k, msg = "Partner, this one's required.") => {
            if (!String(form[k]).trim()) e[k] = msg;
        };

        if (id === "origin" && form.fromConstantine === null)
            e.fromConstantine = "Pick one, stranger.";

        if (id === "lc") {
            req("lc", "Which LC are you riding in from?");
            req("needsTransport", "Do you need a ride or not?");
            if (form.needsTransport === "Yes")
                req("pickupPoint", "Choose your pickup point.");
        }

        if (id === "pass") {
            req("pass", "Choose your pass to continue.");
            if (
                form.fromConstantine === true &&
                pass?.includes.some((item) => item.key === "transport")
            ) {
                req("pickupPoint", "Choose your pickup point.");
            }
        }

        if (id === "personal") {
            req("fullName");
            const age = Number(form.age);
            if (!form.age || !Number.isFinite(age) || age < 14 || age > 99)
                e.age = "Enter a valid age.";
            if (!/^[^\s@]+@aiesec\.net$/i.test(form.aiesecMail.trim()))
                e.aiesecMail = "Must be an @aiesec.net address, partner.";
            if (!/^(\+?213|0)[5-7]\d{8}$/.test(form.phone.replace(/[\s.-]/g, "")))
                e.phone = "Use an Algerian number, e.g. 0555 12 34 56.";
            if (!/^https?:\/\/.+\..+/.test(form.facebook.trim()))
                e.facebook = "Paste the full link to your Facebook profile (https://...).";
            if (!form.photoFile)
                e.photoFile = "Upload a profile photo to complete registration, partner.";
        }

        if (id === "aiesec") {
            req("position", "Pick your position.");
            req("department", "Pick your department.");
        }

        if (id === "conduct") {
            if (!form.conductPolicyFile)
                e.conductPolicyFile = "Upload your signed policy document to continue, partner.";
        }

        if (id === "parental") {
            if (!form.parentalAuthAcknowledged)
                e.parentalAuthAcknowledged = "Pick an answer.";
            else if (form.parentalAuthAcknowledged !== "Yes")
                e.parentalAuthAcknowledged =
                    "You must confirm you'll send the parental authorization to the DxP team.";
        }

        if (id === "rodeo") {
            req("previousDelegate", "Yes or no?");
            if (form.previousDelegate === "Yes") req("previousConference", "Which one?");
            req("motivation", "Tell us why you're riding with us.");
            req("paymentMethod", "Choose a payment method.");
            if (form.pass === "small") req("day", "Which day are you coming?");
            if (!form.attendanceConfirmed) e.attendanceConfirmed = "Pick an answer.";
            else if (form.attendanceConfirmed === "No")
                e.attendanceConfirmed =
                    "We need full attendance to hold your spot. Choose another pass or come back when you're sure.";
        }

        if (id === "fine") {
            if (!form.policyAgreed) e.policyAgreed = "Pick an answer.";
            else if (form.policyAgreed === "No")
                e.policyAgreed = "You must accept the fee policy to register.";
            if (!form.hype) e.hype = "Rate your hype!";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => {
        if (!validate(stepId)) return;
        if (stepId === "fine") return submit();
        setStepIndex((i) => i + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const back = () => {
        setErrors({});
        setStepIndex((i) => Math.max(0, i - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const chooseOrigin = (isLocal) => {
        if (form.fromConstantine === isLocal) return;
        setErrors((e) => ({ ...e, fromConstantine: undefined }));
        setForm((f) => ({
            ...f,
            fromConstantine: isLocal,
            position: "",
            department: "",
            pickupPoint: "",
            ...(isLocal ? { lc: "", needsTransport: "" } : {}),
        }));
    };

    /* ---------- submit to Google Sheets ---------- */

    const submit = async () => {
        if (status === "sending") return;
        setStatus("sending");
        setGenerating(true);

        const transportation =
            form.fromConstantine === false
                ? form.needsTransport === "Yes" ? "Yes" : "No"
                : pass?.includes.some((i) => i.key === "transport") ? "Yes" : "No";

        const payload = {
            formType: "registration", // tells the Apps Script which handler to use
            submitted_at: new Date().toISOString(),
            from_constantine: form.fromConstantine ? "Yes" : "No",
            lc: form.fromConstantine ? "Constantine" : form.lc,
            needs_transport: form.fromConstantine ? "N/A" : form.needsTransport,
            pickup_point: transportation === "Yes" ? form.pickupPoint : "",
            pass: pass?.name || "",
            price,
            full_name: form.fullName.trim(),
            age: form.age,
            aiesec_mail: form.aiesecMail.trim().toLowerCase(),
            phone: form.phone.trim(),
            facebook: form.facebook.trim(),
            position: form.position,
            department: form.department,
            previous_delegate: form.previousDelegate,
            previous_conference:
                form.previousDelegate === "Yes" ? form.previousConference.trim() : "",
            motivation: form.motivation.trim(),
            payment_method: form.paymentMethod,
            day: form.pass === "small" ? form.day : "",
            attendance_confirmed: form.attendanceConfirmed,
            policy_agreed: form.policyAgreed,
            parental_auth_acknowledged: form.parentalAuthAcknowledged || "N/A",
            transportation,
            hype: form.hype,
            notes: form.notes.trim(),
            conduct_policy_filename: form.conductPolicyFile?.name || "",
            photo_filename: form.photoFile?.name || "",
            photo_mime_type: form.photoFile?.type || "image/jpeg",
        };

        try {
            // --- Step 1: build everything the payload needs (invoice PDF,
            // photo, conduct policy) — nothing is downloaded or shown to the
            // user yet, this is all just preparing data to send ---
            const blob = await generateInvoice({
                name: form.fullName,
                lc: form.fromConstantine ? "Constantine" : form.lc,
                email: form.aiesecMail,
                phone: form.phone,
                passName: pass?.name || "",
                price,
                transportation,
            });
            setInvoiceBlob(blob);

            const invoiceFilename = `rodeo-kickoff-invoice-${form.fullName.replace(/\s+/g, "_")}.pdf`;
            payload.invoice_pdf_base64 = await blobToBase64(blob);
            payload.invoice_filename = invoiceFilename;

            payload.photo_base64 = await fileToDataUrl(form.photoFile);
            payload.conduct_policy_base64 = await fileToDataUrl(form.conductPolicyFile);

            // --- Step 2: submit to the sheet FIRST, before anything that
            // could interrupt page execution. iOS Safari in particular can
            // suspend a page's JavaScript when a file download/preview is
            // triggered — so the critical network request must complete
            // BEFORE we ever call downloadBlob() below. mode: 'no-cors' was
            // removed so we can actually read whether this succeeded. ---
            const response = await fetch(SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!result.ok) {
                throw new Error(result.error || "Submission failed");
            }

            // --- Step 3: ONLY now, after the sheet row is confirmed written,
            // trigger the invoice download — safe even if iOS interrupts
            // execution right after this point, since the critical part
            // already succeeded ---
            downloadBlob(blob, invoiceFilename);

            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(STEP_KEY);
            setStatus("done");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error("Registration submission failed:", err);
            setStatus("failed");
        } finally {
            setGenerating(false);
        }
    };

    /* ---------- derived UI data ---------- */

    const paymentOptions =
        form.pass === "wanted" && form.fromConstantine === false
            ? ["Baridimob/CCP"]
            : ["Main à main", "Baridimob/CCP"];

    useEffect(() => {
        if (form.paymentMethod && !paymentOptions.includes(form.paymentMethod)) {
            setForm((f) => ({ ...f, paymentMethod: "" }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.pass, form.fromConstantine]);

    const attendanceText =
        form.pass === "small"
            ? ATTENDANCE_QUESTION.small(form.day)
            : ATTENDANCE_QUESTION[form.pass];

    const titles = {
        origin: ["Who goes there?", "First things first, stranger."],
        lc: ["Where are you riding from?", "Tell us which LC you saddle up with."],
        pass: ["Pick your pass", "Every outlaw has a price on their head."],
        personal: ["Your details", "Tell us who you are, partner."],
        aiesec: ["Your AIESEC badge", "Show us your star."],
        conduct: ["Sign the code of the trail", "Every outlaw follows the rules of the land."],
        parental: ["A word for your folks", "Underage outlaws need a permission slip."],
        rodeo: ["The Rodeo questions", "A few things before we hand you the ticket."],
        fine: ["The fine print", "Read it twice, partner."],
    };

    /* ---------- render ---------- */

    if (stepId === "done") {
        return (
            <main className="rodeo-page">
                <div className="leather-card success">
                    <h1 className="script-title">Yeehaw!</h1>
                    <p className="lead">You're on the list, {form.fullName.split(" ")[0]}.</p>
                    <div className="ticket">
                        <span className="ticket-stamp">REWARD</span>
                        <p className="ticket-name">{form.fullName}</p>
                        <p className="ticket-pass">
                            <Emoji char={pass?.emoji} /> {pass?.name}
                        </p>
                        {form.pass === "small" && <p className="ticket-line">Day: {form.day}</p>}
                        <p className="ticket-line">Price: {price.toLocaleString('en-US')} DZD</p>
                    </div>

                    <ul className="next-steps">
                        <li>Our team will contact you on the phone number you gave to confirm payment.</li>
                        <li>Payment method: {form.paymentMethod}.</li>
                        {form.pass === "small" && (
                            <li>Need to switch days? Tell the DS at least 3 days before the conference.</li>
                        )}
                        <li>Fees are non-refundable if you miss the kick-off, and cancelling costs 100% of the fees.</li>
                        {steps.includes("parental") && (
                            <li>
                                Don't forget to send your signed parental authorization directly to the DxP team —
                                it is not submitted here.
                            </li>
                        )}
                    </ul>

                    <div className="downloads">
                        <h3>Your downloads</h3>
                        {generating && <p className="field-hint">Saddling up your documents…</p>}

                        {invoiceBlob && (
                            <div className="download-row">
                                <button
                                    type="button"
                                    className="wood-btn"
                                    onClick={() =>
                                        downloadBlob(
                                            invoiceBlob,
                                            `rodeo-kickoff-invoice-${form.fullName.replace(/\s+/g, "_")}.pdf`
                                        )
                                    }
                                >
                                    ⬇ Download your invoice (PDF)
                                </button>
                            </div>
                        )}

                    </div>

                    <p className="field-hint">Pack your boots and hat. See you on 20–21 Nov.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="rodeo-page">
            <header className="page-head">
                <h1 className="script-title">Book your rodeo ticket</h1>
                <p className="lead">DZ-25 · 20–21 NOV · EAST</p>
            </header>

            <div className="layout">
                <section className="leather-card form-card">
                    <div className="progress" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
                        <div className="trail">
                            {steps.map((s, i) => (
                                <span
                                    key={s}
                                    className={`dot ${i < stepIndex ? "past" : ""} ${i === stepIndex ? "current" : ""}`}
                                >
                                    {i === stepIndex && (
                                        <img className="sheriff-marker" src="/Sherifstar.png" alt="" draggable={false} />
                                    )}
                                </span>
                            ))}
                        </div>
                        <p className="progress-text">
                            Step {stepIndex + 1} of {steps.length}
                        </p>
                    </div>

                    <h2 className="step-title">{titles[stepId][0]}</h2>
                    <p className="step-sub">{titles[stepId][1]}</p>

                    {/* STEP: origin */}
                    {stepId === "origin" && (
                        <Field label="Are you an AIESECer from Constantine?" error={errors.fromConstantine}>
                            <div className="big-choices">
                                <BigChoice
                                    emoji="🤠"
                                    title="Local sheriff"
                                    text="I'm from LC Constantine"
                                    active={form.fromConstantine === true}
                                    onClick={() => chooseOrigin(true)}
                                />
                                <BigChoice
                                    emoji="🐎"
                                    title="Stranger in town"
                                    text="I'm riding in from another LC"
                                    active={form.fromConstantine === false}
                                    onClick={() => chooseOrigin(false)}
                                />
                            </div>
                        </Field>
                    )}

                    {/* STEP: LC */}
                    {stepId === "lc" && (
                        <>
                            <Field label="Which LC do you belong to?" error={errors.lc}>
                                <Chips options={LCS} value={form.lc} onChange={(v) => set("lc", v)} />
                            </Field>
                            <Field label="Do you need transportation?" error={errors.needsTransport}>
                                <Chips
                                    options={["Yes", "No"]}
                                    value={form.needsTransport}
                                    onChange={(v) => {
                                        set("needsTransport", v);
                                        if (v !== "Yes") set("pickupPoint", "");
                                    }}
                                />
                            </Field>
                            {form.needsTransport === "Yes" && (
                                <Field label="Which pickup point will you use?" error={errors.pickupPoint}>
                                    <Chips
                                        options={PICKUP_POINTS}
                                        value={form.pickupPoint}
                                        onChange={(v) => set("pickupPoint", v)}
                                    />
                                </Field>
                            )}
                            <div className="notice">
                                <strong><Emoji char="⚠️" /> Heads up</strong>
                                <p>{TRANSPORT_NOTICE_EXTERNAL}</p>
                            </div>
                        </>
                    )}

                    {/* STEP: pass */}
                    {stepId === "pass" && (
                        <Field label="" error={errors.pass}>
                            <div className="passes">
                                {PASSES.map((p) => (
                                    <button
                                        type="button"
                                        key={p.id}
                                        className={`pass-card pass-${p.id} ${form.pass === p.id ? "active" : ""}`}
                                        onClick={() => set("pass", p.id)}
                                    >
                                        {p.ribbon && <span className="ribbon">{p.ribbon}</span>}
                                        <span className="pass-label">WANTED</span>
                                        <span className="pass-emoji"><Emoji char={p.emoji} /></span>
                                        <span className="pass-name">{p.name}</span>
                                        <span className="pass-tagline">{p.tagline}</span>
                                        <ul>
                                            {passIncludes(p).map((i) => (
                                                <li key={i.key}>✓ {i.label}</li>
                                            ))}
                                        </ul>
                                    </button>
                                ))}
                            </div>

                            {form.fromConstantine === true &&
                                pass?.includes.some((i) => i.key === "transport") && (
                                    <Field
                                        label="Which pickup point will you use?"
                                        hint="Transportation is included with your pass."
                                        error={errors.pickupPoint}
                                    >
                                        <Chips
                                            options={PICKUP_POINTS}
                                            value={form.pickupPoint}
                                            onChange={(v) => set("pickupPoint", v)}
                                        />
                                    </Field>
                                )}

                            {form.fromConstantine === true &&
                                pass?.includes.some((i) => i.key === "transport") && (
                                    <div className="notice">
                                        <strong><Emoji char="⚠️" /> Heads up</strong>
                                        <p>{TRANSPORT_NOTICE_LOCAL_RETURN}</p>
                                    </div>
                                )}
                        </Field>
                    )}

                    {/* STEP: personal */}
                    {stepId === "personal" && (
                        <>
                            <Field label="Full name" error={errors.fullName}>
                                <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />
                            </Field>
                            <Field label="Age" error={errors.age}>
                                <input type="number" inputMode="numeric" value={form.age} onChange={(e) => set("age", e.target.value)} />
                            </Field>
                            <Field label="AIESEC mail" error={errors.aiesecMail}>
                                <input
                                    type="email"
                                    placeholder="you@aiesec.net"
                                    value={form.aiesecMail}
                                    onChange={(e) => set("aiesecMail", e.target.value)}
                                    autoComplete="email"
                                />
                            </Field>
                            <Field label="Phone number" error={errors.phone}>
                                <input type="tel" placeholder="0555 12 34 56" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
                            </Field>
                            <Field label="Facebook link" error={errors.facebook}>
                                <input type="url" placeholder="https://facebook.com/..." value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
                            </Field>
                            <Field
                                label="Your photo"
                                hint="Used to generate your personalized Wanted poster."
                                error={errors.photoFile}
                            >
                                <FileDrop
                                    accept="image/*"
                                    file={form.photoFile}
                                    onChange={(file) => set("photoFile", file)}
                                    label="Upload your photo"
                                    showThumbnail
                                />
                            </Field>
                        </>
                    )}

                    {/* STEP: aiesec */}
                    {stepId === "aiesec" && (
                        <>
                            <Field label="What is your position in AIESEC?" error={errors.position}>
                                <Chips
                                    options={form.fromConstantine ? POSITIONS_AiC : POSITIONS}
                                    value={form.position}
                                    onChange={(v) => set("position", v)}
                                />
                            </Field>
                            <Field label="Which department are you in?" error={errors.department}>
                                <Chips
                                    options={form.fromConstantine ? DEPARTMENTS_AiC : DEPARTMENTS}
                                    value={form.department}
                                    onChange={(v) => set("department", v)}
                                />
                            </Field>
                        </>
                    )}

                    {/* STEP: conduct policy */}
                    {stepId === "conduct" && (
                        <Field
                            label="Anti-Substance Abuse & Anti-Sexual Harassment Policy"
                            hint="Read, sign, and export it as a PDF, then upload your signed copy below."
                            error={errors.conductPolicyFile}
                        >
                            <a
                                href={CONDUCT_POLICY_DOC_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-btn"
                            >
                                <Emoji char="📜" /> Open the policy document
                            </a>
                            <FileDrop
                                accept=".pdf"
                                file={form.conductPolicyFile}
                                onChange={(file) => set("conductPolicyFile", file)}
                                label="Upload your signed policy (PDF)"
                            />
                        </Field>
                    )}

                    {/* STEP: parental authorization (only shown when age < 21) */}
                    {stepId === "parental" && (
                        <Field
                            label="Parental Authorization"
                            hint="Fill, sign, and send this DIRECTLY to the DxP team. Do not upload it here."
                            error={errors.parentalAuthAcknowledged}
                        >
                            <a
                                href={PARENTAL_AUTH_DOC_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-btn"
                            >
                                <Emoji char="👨‍👩‍👧" /> Open the parental authorization document
                            </a>
                            <p className="field-hint">
                                Once signed, send it to the DxP team — not through this form.
                            </p>
                            <Chips
                                options={["Yes", "No"]}
                                value={form.parentalAuthAcknowledged}
                                onChange={(v) => set("parentalAuthAcknowledged", v)}
                            />
                        </Field>
                    )}

                    {/* STEP: rodeo questions */}
                    {stepId === "rodeo" && (
                        <>
                            <Field
                                label="Have you previously been a delegate in a KICK-OFF conference with AIESEC in Constantine?"
                                error={errors.previousDelegate}
                            >
                                <Chips options={["Yes", "No"]} value={form.previousDelegate} onChange={(v) => set("previousDelegate", v)} />
                            </Field>

                            {form.previousDelegate === "Yes" && (
                                <Field label="Which conference?" error={errors.previousConference}>
                                    <input value={form.previousConference} onChange={(e) => set("previousConference", e.target.value)} />
                                </Field>
                            )}

                            <Field label="Why do you want to take part in the RODEO KICK-OFF?" error={errors.motivation}>
                                <textarea rows={4} value={form.motivation} onChange={(e) => set("motivation", e.target.value)} />
                            </Field>

                            <Field
                                label="Which payment method do you prefer?"
                                hint={
                                    paymentOptions.length === 1
                                        ? "For external delegates on this pass, payment is via Baridimob/CCP."
                                        : undefined
                                }
                                error={errors.paymentMethod}
                            >
                                <Chips options={paymentOptions} value={form.paymentMethod} onChange={(v) => set("paymentMethod", v)} />
                            </Field>

                            {form.pass === "small" && (
                                <Field
                                    label="Which day will you be able to attend?"
                                    hint="If this changes, inform the DS at least 3 days before."
                                    error={errors.day}
                                >
                                    <Chips options={["Day 1", "Day 2"]} value={form.day} onChange={(v) => set("day", v)} />
                                </Field>
                            )}

                            <Field label={attendanceText} error={errors.attendanceConfirmed}>
                                <Chips options={["Yes", "No"]} value={form.attendanceConfirmed} onChange={(v) => set("attendanceConfirmed", v)} />
                            </Field>
                        </>
                    )}

                    {/* STEP: fine print */}
                    {stepId === "fine" && (
                        <>
                            <div className="notice">
                                <strong><Emoji char="⚠️" /> Fees policy</strong>
                                <p>{POLICY_TEXT}</p>
                            </div>
                            <Field label="Do you agree to these terms?" error={errors.policyAgreed}>
                                <Chips options={["Yes", "No"]} value={form.policyAgreed} onChange={(v) => set("policyAgreed", v)} />
                            </Field>

                            <Field label="How pumped are you to attend the RODEO KICK-OFF with us?" error={errors.hype}>
                                <div className="hype">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                            type="button"
                                            key={n}
                                            className={`hype-btn ${form.hype >= n ? "on" : ""}`}
                                            onClick={() => set("hype", n)}
                                            aria-label={`Hype ${n} of 5`}
                                        >
                                            <Emoji char="🤠" />
                                        </button>
                                    ))}
                                </div>
                                <div className="hype-scale">
                                    <span>Lukewarm</span>
                                    <span>Yeehaw!</span>
                                </div>
                            </Field>

                            <Field label="Anything to add?">
                                <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                            </Field>

                            {status === "failed" && (
                                <p className="field-error">
                                    The telegraph line is down. Check your connection and try again.
                                </p>
                            )}
                        </>
                    )}

                    {/* nav */}
                    <div className="nav">
                        {stepIndex > 0 ? (
                            <button type="button" className="link-btn" onClick={back}>
                                ← Back
                            </button>
                        ) : (
                            <span />
                        )}
                        <button type="button" className="wood-btn" onClick={next} disabled={status === "sending"}>
                            {stepId === "fine"
                                ? status === "sending"
                                    ? "Sending…"
                                    : "Sign me up, Sheriff"
                                : "Continue"}
                        </button>
                    </div>
                </section>

                {/* sticky summary */}
                <aside className="summary">
                    <div className="paper">
                        <h3>Your ticket</h3>
                        {pass && reachedPass ? (
                            <>
                                <p className="sum-pass">
                                    <Emoji char={pass.emoji} /> {pass.name}
                                </p>
                                <ul>
                                    {passIncludes(pass).map((i) => {
                                        if (i.key === "transport" && form.fromConstantine === false && form.needsTransport === "No")
                                            return null;
                                        return <li key={i.key}>✓ {i.label}</li>;
                                    })}
                                </ul>
                                {form.fromConstantine === false && form.lc && <p className="sum-line">From LC {form.lc}</p>}
                                <p className="sum-price">{price.toLocaleString('en-US')} DZD</p>
                            </>
                        ) : (
                            <p className="sum-line">No pass chosen yet.</p>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
}