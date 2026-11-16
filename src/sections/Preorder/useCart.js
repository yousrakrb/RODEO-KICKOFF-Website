import { useEffect, useState } from "react";
import { MAX_QTY } from "./products";

const STORAGE_KEY = "rodeo-preorder-cart";

function readCart() {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};

    try {
        const parsed = JSON.parse(saved);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
        console.error("Could not read the saved preorder cart.", error);
        return {};
    }
}

export function useCart() {
    const [cart, setCart] = useState(readCart);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const setItem = (id, patch) => {
        setCart((current) => {
            const next = { ...(current[id] || { qty: 0, size: "" }), ...patch };
            if (Object.prototype.hasOwnProperty.call(patch, "qty")) {
                next.qty = Math.max(0, Math.min(MAX_QTY, Number(patch.qty) || 0));
            }

            const updated = { ...current, [id]: next };
            if (next.qty <= 0) delete updated[id];
            return updated;
        });
    };

    return [cart, setItem];
}
