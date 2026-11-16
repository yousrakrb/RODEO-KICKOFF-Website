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

export function makeInvoiceNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RK-${stamp}-${rand}`;
}

export async function generateInvoice({
  number,
  customer,
  lines,
  conferenceFee,
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
  let y = 46;
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("RODEO KICKOFF INVOICE", margin, y);

  // --- Two-Column Header: "Issued by:" & "Billed to:" ---
  y += 14;
  const rightColX = 112;

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Issued by:", margin, y);
  doc.text("Billed to:", rightColX, y);

  y += 7;
  doc.setFontSize(10.5);
  doc.setFont(undefined, "normal");

  // Left Column (Issued by)
  doc.text("AIESEC in Constantine", margin, y);
  doc.text("RODEO KICKOFF Constantine.", margin, y + 6);
  doc.text("Constantine, Algeria.", margin, y + 12);

  // Right Column (Billed to)
  doc.text(`Name: ${customer.fullName || ""}`, rightColX, y);
  doc.text(`Email: ${customer.email || ""}`, rightColX, y + 6);
  doc.text(`Phone number: ${customer.phone || ""}`, rightColX, y + 12);
  doc.text(`LC: ${customer.lc || "-"}`, rightColX, y + 18);

  // --- Items Table (ITEM | SIZE | QTY | UNIT | AMOUNT) ---
  y += 30;
  const tableWidth = rightEdge - margin;
  const rowHeight = 8.5;
  const colX = {
    item: margin + 3,
    size: margin + 78,
    qty: margin + 102,
    unit: margin + 124,
    amount: rightEdge - 3,
  };

  // Table Header Bar
  doc.setFillColor(235, 235, 235);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, tableWidth, rowHeight, "FD");

  doc.setFontSize(9.5);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("ITEM", colX.item, y + 5.8);
  doc.text("SIZE", colX.size, y + 5.8);
  doc.text("QTY", colX.qty, y + 5.8);
  doc.text("UNIT", colX.unit, y + 5.8);
  doc.text("AMOUNT", colX.amount, y + 5.8, { align: "right" });

  y += rowHeight;
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);

  (lines || []).forEach((line) => {
    const subtotal = line.price * line.qty;
    doc.rect(margin, y, tableWidth, rowHeight, "S");
    doc.text(String(line.name), colX.item, y + 5.8);
    doc.text(line.size || "-", colX.size, y + 5.8);
    doc.text(String(line.qty), colX.qty, y + 5.8);
    doc.text(`${line.price.toLocaleString("en-US")} DZD`, colX.unit, y + 5.8);
    doc.text(`${subtotal.toLocaleString("en-US")} DZD`, colX.amount, y + 5.8, {
      align: "right",
    });
    y += rowHeight;
  });

  if (conferenceFee != null) {
    doc.rect(margin, y, tableWidth, rowHeight, "S");
    doc.setFont(undefined, "bold");
    doc.text("Conference Fee", colX.item, y + 5.8);
    doc.text("-", colX.size, y + 5.8);
    doc.text("1", colX.qty, y + 5.8);
    doc.text(`${conferenceFee.toLocaleString("en-US")} DZD`, colX.unit, y + 5.8);
    doc.text(`${conferenceFee.toLocaleString("en-US")} DZD`, colX.amount, y + 5.8, {
      align: "right",
    });
    y += rowHeight;
    doc.setFont(undefined, "normal");
  }

  // --- Total Row ---
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, tableWidth, rowHeight + 1, "FD");
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("TOTAL", colX.unit - 18, y + 6.2);
  doc.text(`${total.toLocaleString("en-US")} DZD`, colX.amount, y + 6.2, {
    align: "right",
  });

  // --- Payment Notice ---
  y += 22;
  doc.setFontSize(10.5);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("You will be contacted very soon to proceed with the payment.", margin, y);

  // --- Signatures ---
  y += 16;
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

  y += 13;
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

  const filename = `rodeo-kickoff-invoice-${(customer.fullName || "delegate").replace(
    /\s+/g,
    "_"
  )}.pdf`;
  const blob = doc.output("blob");
  const base64 = doc.output("datauristring").split(",")[1];
  return { blob, base64, filename };
}