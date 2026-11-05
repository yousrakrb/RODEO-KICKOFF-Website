import jsPDF from "jspdf";

// Converts an image at a given URL into a base64 data URL, so it can be
// embedded into the PDF via doc.addImage.
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
            resolve({ dataUrl: canvas.toDataURL("image/png"), width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Builds the RODEO KICKOFF INVOICE as a PDF and returns it as a Blob.
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.lc
 * @param {string} params.email
 * @param {string} params.phone
 * @param {string} params.passName
 * @param {number} params.price
 * @param {string} params.transportation  "Yes" | "No"
 * @returns {Promise<Blob>}
 */
export async function generateInvoice({ name, lc, email, phone, passName, price, transportation }) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // --- Logo ---
    // Place your AIESEC logo file at public/assets/invoice/aiesec-logo.png
    try {
        const { dataUrl, width, height } = await loadImageAsDataURL("/assets/invoice/aiesec-logo.png");
        const logoWidth = 55; // mm — adjust to taste
        const logoHeight = (height / width) * logoWidth;
        doc.addImage(dataUrl, "PNG", 20, 12, logoWidth, logoHeight);
    } catch {
        // If the logo fails to load, continue building the rest of the invoice without it
        // rather than breaking the whole PDF generation.
    }

    const today = new Date();
    const dateStr = `${today.getDate()}/11/2026`;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(dateStr, 150, 20);
    doc.text("Constantine, Algeria", 150, 26);

    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("RODEO KICKOFF INVOICE", 20, 42);

    // Delegate details
    let y = 58;
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Delegate details:", 20, y);
    doc.setFont(undefined, "normal");
    doc.setFontSize(11);
    y += 8;
    doc.text(`Name: ${name}`, 20, y);
    y += 6;
    doc.text(`LC: ${lc}`, 20, y);
    y += 6;
    doc.text(`Email: ${email}`, 20, y);
    y += 6;
    doc.text(`Phone number: ${phone}`, 20, y);

    // Invoice details
    y += 14;
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Invoice Details:", 20, y);
    doc.setFont(undefined, "normal");
    doc.setFontSize(11);
    y += 8;
    doc.text(`Kickoff pass: ${passName}`, 20, y);
    y += 6;
    // forced to en-US locale so it always renders "4,500" with standard digits,
    // never garbled Arabic-Indic digits or odd separators from a different system locale
    doc.text(`Price: ${price.toLocaleString('en-US')} DZD`, 20, y);
    y += 6;
    doc.text(`Transportation: ${transportation}`, 20, y);

    // Total
    y += 14;
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Total Price to Pay:", 20, y);
    y += 8;
    doc.setFontSize(14);
    doc.text(`${price.toLocaleString('en-US')} DZD`, 20, y);

    // Note
    y += 14;
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("You will be contacted very soon to proceed with the payment.", 20, y);

    // Signatures
    y += 18;
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Yousra KERBOUA | Local Committee President | AIESEC in Constantine 26.27", 20, y);
    y += 6;
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 238);
    doc.text("Email: yousra.kerboua@aiesec.net", 20, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.text("WhatsApp / Telegram: +213 657 44 07 22", 20, y);

    y += 14;
    doc.setFont(undefined, "bold");
    doc.text("Nedjmeddine Tedjani | LCVP F&L | AIESEC in Constantine 26.27", 20, y);
    y += 6;
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 238);
    doc.text("Email: nedjmeddine.tedjani@aiesec.net", 20, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.text("WhatsApp / Telegram: +213 795 14 51 77", 20, y);

    return doc.output("blob");
}

/** Triggers a browser download of a blob with the given filename. */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/** Converts a Blob into a base64 string (no data: prefix) for sending over JSON. */
export function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // reader.result looks like "data:application/pdf;base64,JVBERi0x..."
            // we only want the part after the comma
            const base64 = reader.result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}