import { jsPDF } from "jspdf"; // npm i jspdf

// Same palette as the site (RGB)
const BROWN = [40, 23, 0];
const COPPER = [200, 112, 42];
const CREAM = [233, 214, 180];

const money = (n) => `${Number(n).toLocaleString("en-US")} DZD`;

export function makeInvoiceNumber() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `RK-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// loads an image from your site (e.g. "/assets/logo.png") so it can be drawn on the PDF. Fails silently.
async function loadImage(url) {
    try {
        const blob = await (await fetch(url)).blob();
        const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
        const dims = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res({ w: i.width, h: i.height }); i.onerror = rej; i.src = dataUrl; });
        return { dataUrl, ...dims };
    } catch { return null; }
}

/**
 * Builds the invoice (facture) PDF in the browser.
 * lines: [{ name, size, qty, price }]   conferenceFee: number | null
 * returns { blob, base64, filename }
 */
export async function generateInvoice({ number, date = new Date(), customer, lines, conferenceFee, total, logoUrl }) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, M = 16;

    // --- header band ---
    doc.setFillColor(...BROWN); doc.rect(0, 0, W, 40, "F");
    doc.setFillColor(...COPPER); doc.rect(0, 40, W, 1.4, "F");
    const logo = logoUrl ? await loadImage(logoUrl) : null;
    if (logo) { const h = 24, w = (logo.w / logo.h) * h; doc.addImage(logo.dataUrl, "PNG", M, 8, w, h); }
    doc.setTextColor(...CREAM);
    doc.setFont("times", "bold"); doc.setFontSize(26); doc.text("FACTURE", W - M, 19, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`N° ${number}`, W - M, 27, { align: "right" });
    doc.text(date.toLocaleDateString("fr-DZ"), W - M, 33, { align: "right" });

    // --- issuer + customer ---
    let y = 56;
    doc.setTextColor(...BROWN);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...COPPER);
    doc.text("ISSUED BY", M, y); doc.text("BILLED TO", W / 2 + 6, y);
    doc.setTextColor(...BROWN); doc.setFontSize(11);
    y += 6;
    doc.setFont("helvetica", "bold"); doc.text("AIESEC in Constantine", M, y);
    doc.text(customer.fullName || "-", W / 2 + 6, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text("Rodeo Kick Off", M, y + 6);
    doc.text("Constantine, Algeria", M, y + 12);
    const right = [customer.email, customer.phone, customer.lc].filter(Boolean);
    right.forEach((t, i) => doc.text(String(t), W / 2 + 6, y + 6 + i * 6));

    // --- table ---
    y = 96;
    const col = { item: M + 3, size: 98, qty: 120, unit: 156, amt: W - M - 3 };
    doc.setFillColor(...BROWN); doc.rect(M, y, W - 2 * M, 10, "F");
    doc.setTextColor(...CREAM); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("ITEM", col.item, y + 6.5); doc.text("SIZE", col.size, y + 6.5); doc.text("QTY", col.qty, y + 6.5);
    doc.text("UNIT", col.unit, y + 6.5, { align: "right" }); doc.text("AMOUNT", col.amt, y + 6.5, { align: "right" });
    y += 10;

    const rows = [];
    if (conferenceFee != null) rows.push({ name: "Conference registration", size: "", qty: 1, price: conferenceFee });
    lines.forEach((l) => rows.push(l));

    doc.setTextColor(...BROWN); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    rows.forEach((r, i) => {
        if (i % 2 === 0) { doc.setFillColor(247, 241, 230); doc.rect(M, y, W - 2 * M, 10, "F"); }
        doc.text(r.name, col.item, y + 6.5);
        doc.text(r.size || "-", col.size, y + 6.5);
        doc.text(String(r.qty), col.qty, y + 6.5);
        doc.text(money(r.price), col.unit, y + 6.5, { align: "right" });
        doc.text(money(r.price * r.qty), col.amt, y + 6.5, { align: "right" });
        y += 10;
    });

    // --- total ---
    y += 6;
    doc.setDrawColor(...COPPER); doc.setLineWidth(0.6); doc.line(W - M - 80, y, W - M, y);
    y += 9;
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("TOTAL", W - M - 80, y);
    doc.setTextColor(...COPPER); doc.setFontSize(15); doc.text(money(total), W - M, y, { align: "right" });

    // --- footer ---
    doc.setTextColor(...BROWN); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Thank you for being part of Rodeo Kick Off. Please keep this invoice and show it when collecting your goodies.", M, 276);
    doc.setFillColor(...COPPER); doc.rect(0, 291, W, 6, "F");

    const filename = `Facture-${number}.pdf`;
    const blob = doc.output("blob");
    const base64 = doc.output("datauristring").split(",")[1];
    return { blob, base64, filename };
}