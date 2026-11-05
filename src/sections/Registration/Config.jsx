// ---- Edit these values ------------------------------------------------------

// Paste your deployed Google Apps Script Web App URL here (see README.md)
export const SHEET_URL = "https://script.google.com/macros/s/AKfycbwhGlGSZCtPVjvmPd3wHnZJ_mUK-lcuGwc5LMryLCF3Lzeu6YE4FiVKlzy1f8MoPCPZ/exec";
export const SHEET_ID = "1jn1Y63GEsg6-53aZLomtYrVOPT3zDigwSXYjF7UkRhs";
export const SHEET_NAME = "Registrations";
export const Drive_URL = "https://drive.google.com/drive/folders/1qNr9TcJce4nEkXvQFVi8vjKXP0DcSPYy?usp=sharing";

export const LCS = ["Babez", "Bennak", "Bejaia", "Blida", "Oran", "Tlemcen", "MC"];
export const PICKUP_POINTS = ["Zouaghi", "4 Chemins", "El Khroub"];

export const POSITIONS = ["LCP", "VP", "TL", "Member", "Alumni", "MC"];
export const POSITIONS_AiC = ["TL", "Member", "Alumni"];

export const DEPARTMENTS = ["PRESIDENT", "MX", "BD", "F&L", "OGT", "OGV", "MKT", "PM&iGV", "MCP", "MCVP"];
export const DEPARTMENTS_AiC = ["PRESIDENT", "MX", "BD", "F&L", "OGT", "OGV", "MKT", "PM&iGV"];

// "transport" and "accommodation" lines are hidden automatically when they don't apply
export const PASSES = [
    {
        id: "small",
        emoji: "🌵",
        name: "Small-Time Outlaw",
        tagline: "One day on the trail",
        includes: [
            { key: "days", label: "1 day of the Rodeo (you pick which)" },
            { key: "transport", label: "Transportation" },
        ],
    },
    {
        id: "bounty",
        emoji: "💰",
        name: "Highest Bounty",
        tagline: "Both days, full ride",
        includes: [
            { key: "days", label: "2 full days of the Rodeo" },
            { key: "transport", label: "Transportation" },
        ],
    },
    {
        id: "wanted",
        emoji: "🎯",
        name: "Most Wanted #1",
        tagline: "All-access, saloon bed included",
        ribbon: "ALL ACCESS",
        includes: [
            { key: "days", label: "2 full days of the Rodeo" },
            { key: "transport", label: "Transportation" },
            { key: "accommodation", label: "Accommodation" },
        ],
    },
];

// ---- Pricing (DZD) -----------------------------------------------------------
// LC Constantine members: price depends on which pass they choose.
// Externals: flat rate regardless of pass (full access only).
export const PRICING = {
    constantine: {
        alumni: 4900,
        wanted: 4500,  // full 2 days + accommodation
        bounty: 3200,  // 2 days, no accommodation
        small: 2200,   // 1 day only
    },
    external: 4900, // full 2 days + accommodation
};

export function getDelegatePrice(form) {
    if (form.fromConstantine === false) return PRICING.external;
    if (form.position === "Alumni") return PRICING.constantine.alumni;
    return PRICING.constantine[form.pass] ?? 0;
}

// ---- Transportation notices ---------------------------------------------------

export const TRANSPORT_NOTICE_EXTERNAL =
    "Transportation fees for externals will be decided and communicated later.";

export const TRANSPORT_NOTICE_LOCAL_RETURN =
    "If return transportation is provided for your chosen day(s), additional transportation fees will apply.";

// ---- Required policy documents -------------------------------------------------

export const CONDUCT_POLICY_DOC_URL =
    "https://docs.google.com/document/d/1sDk3SYTDLSmzWnWfwxRfWdOaltdAN8msO3HVux03Etw/edit?usp=sharing";

// TODO: paste the real parental authorization document link here
export const PARENTAL_AUTH_DOC_URL = "https://docs.google.com/document/d/1aY6nonqzXih0zkNeRQ19PF3K3Gqn3df8dcC713ghFAA/edit?usp=sharing";

export const POLICY_TEXT =
    "We have a firm policy regarding fees. If you don't attend the kick-off, the fees are non-refundable. " +
    "Additionally, if you apply and later cancel, there are cancellation fees of 100% of the fees. " +
    "Do you agree to these terms?";

export const ATTENDANCE_QUESTION = {
    small: (day) =>
        `Since you chose the Small-Time Outlaw pass, are you certain you can attend ${day || "your chosen day"
        } of the conference, from 8AM to 5PM?`,
    bounty:
        "Since you chose the Highest Bounty pass, are you certain you can attend the full 2 days, from 8AM to 5PM?",
    wanted:
        "Since you chose the Most Wanted #1 pass, are you certain you can attend the full 2 days, including accommodation?",
};