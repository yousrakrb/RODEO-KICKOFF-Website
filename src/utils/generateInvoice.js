import jsPDF from "jspdf";

function loadImageAsDataURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || "");
      resolve(res.includes(",") ? res.split(",")[1] : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateInvoice({
  name,
  lc,
  email,
  phone,
  passName,
  price = 0,
  transportation = "No",
  items = [],
  total,
  logoUrl = "/assets/invoice/aiesec-logo.png",
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const rightEdge = pageWidth - margin;

  // --- Top-Left AIESEC Logo ---
  if (logoUrl) {
    try {
      const resolvedLogo = logoUrl.startsWith("http")
        ? logoUrl
        : `${import.meta.env.BASE_URL || "/"}${logoUrl.replace(/^\//, "")}`;
      const { dataUrl, width, height } = await loadImageAsDataURL(resolvedLogo);
      const logoWidth = 52;
      const logoHeight = (height / width) * logoWidth;
      doc.addImage(dataUrl, "PNG", margin, 14, logoWidth, logoHeight);
    } catch {
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.setTextColor(3, 126, 243);
      doc.text("AIESEC", margin, 24);
    }
  }

  // --- Top-Right Date & Location ---
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}/${today.getFullYear()}`;

  doc.setFontSize(10.5);
  doc.setFont(undefined, "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(dateStr, rightEdge, 20, { align: "right" });
  doc.text("Constantine, Algeria", rightEdge, 26, { align: "right" });

  // --- Title ---
  let y = 44;
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("RODEO KICKOFF INVOICE", margin, y);

  // --- Two-Column Header: "Issued by:" & "Billed to:" ---
  y += 12;
  const rightColX = 112;

  doc.setFontSize(11.5);
  doc.setFont(undefined, "bold");
  doc.text("Issued by:", margin, y);
  doc.text("Billed to:", rightColX, y);

  y += 6.5;
  doc.setFontSize(10.5);
  doc.setFont(undefined, "normal");

  // Left Column (Issued by)
  doc.text("AIESEC in Constantine", margin, y);
  doc.text("RODEO KICKOFF Constantine.", margin, y + 6);
  doc.text("Constantine, Algeria.", margin, y + 12);

  // Right Column (Billed to)
  doc.text(`Name: ${name || ""}`, rightColX, y);
  doc.text(`Email: ${email || ""}`, rightColX, y + 6);
  doc.text(`Phone number: ${phone || ""}`, rightColX, y + 12);
  doc.text(`LC: ${lc || "-"}`, rightColX, y + 18);

  // --- Invoice Details ---
  y += 28;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Invoice Details:", margin, y);
  const detailsWidth = doc.getTextWidth("Invoice Details:");
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1, margin + detailsWidth, y + 1);

  y += 7;
  doc.setFontSize(10.5);
  doc.setFont(undefined, "bold");
  doc.text("Kickoff pass: ", margin, y);
  doc.setFont(undefined, "normal");
  doc.text(String(passName || "-"), margin + doc.getTextWidth("Kickoff pass: "), y);

  y += 6;
  doc.setFont(undefined, "bold");
  doc.text("Price: ", margin, y);
  doc.setFont(undefined, "normal");
  doc.text(`${Number(price || 0).toLocaleString("en-US")} DZD`, margin + doc.getTextWidth("Price: "), y);

  y += 6;
  doc.setFont(undefined, "bold");
  doc.text("Transportation: ", margin, y);
  doc.setFont(undefined, "normal");
  doc.text(String(transportation || "No"), margin + doc.getTextWidth("Transportation: "), y);

  // --- Pre-Order Goodies Table (shown only if items were pre-ordered) ---
  const validItems = Array.isArray(items) ? items.filter((it) => it.qty > 0) : [];
  if (validItems.length > 0) {
    y += 12;
    const tableWidth = rightEdge - margin;
    const rowHeight = 8;
    const colX = {
      item: margin + 3,
      size: margin + 78,
      qty: margin + 102,
      unit: margin + 124,
      amount: rightEdge - 3,
    };

    doc.setFillColor(235, 235, 235);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, tableWidth, rowHeight, "FD");

    doc.setFontSize(9.5);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("ITEM", colX.item, y + 5.5);
    doc.text("SIZE", colX.size, y + 5.5);
    doc.text("QTY", colX.qty, y + 5.5);
    doc.text("UNIT", colX.unit, y + 5.5);
    doc.text("AMOUNT", colX.amount, y + 5.5, { align: "right" });

    y += rowHeight;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    validItems.forEach((line) => {
      const subtotal = line.price * line.qty;
      doc.rect(margin, y, tableWidth, rowHeight, "S");
      doc.text(String(line.name), colX.item, y + 5.5);
      doc.text(line.size || "-", colX.size, y + 5.5);
      doc.text(String(line.qty), colX.qty, y + 5.5);
      doc.text(`${line.price.toLocaleString("en-US")} DZD`, colX.unit, y + 5.5);
      doc.text(`${subtotal.toLocaleString("en-US")} DZD`, colX.amount, y + 5.5, {
        align: "right",
      });
      y += rowHeight;
    });
  }

  // --- FINAL TOTAL TO PAY ---
  const goodiesTotal = validItems.reduce((s, it) => s + it.price * it.qty, 0);
  const finalTotal = typeof total === "number" ? total : Number(price || 0) + goodiesTotal;

  y += 14;
  doc.setFontSize(12.5);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`FINAL TOTAL TO PAY: ${finalTotal.toLocaleString("en-US")} DZD`, margin, y);

  // --- Payment Note ---
  y += 14;
  doc.setFontSize(10.5);
  doc.setFont(undefined, "bold");
  doc.text("You will be contacted very soon to proceed with the payment.", margin, y);

  // --- Signatures ---
  y += 15;
  doc.setFontSize(10.5);
  doc.setFont(undefined, "bold");
  doc.text(
    "Yousra KERBOUA | Local Committee President | AIESEC in Constantine 26.27",
    margin,
    y
  );
  y += 5.5;
  doc.setFont(undefined, "normal");
  doc.setTextColor(0, 0, 238);
  doc.text("Email: yousra.kerboua@aiesec.net", margin, y);
  y += 5.5;
  doc.setTextColor(0, 0, 0);
  doc.text("WhatsApp / Telegram: +213 657 44 07 22", margin, y);

  y += 12;
  doc.setFont(undefined, "bold");
  doc.text(
    "Nedjmeddine Tedjani | LCVP F&L | AIESEC in Constantine 26.27",
    margin,
    y
  );
  y += 5.5;
  doc.setFont(undefined, "normal");
  doc.setTextColor(0, 0, 238);
  doc.text("Email: nedjmeddine.tedjani@aiesec.net", margin, y);
  y += 5.5;
  doc.setTextColor(0, 0, 0);
  doc.text("WhatsApp / Telegram: +213 795 14 51 77", margin, y);

  return doc.output("blob");
}