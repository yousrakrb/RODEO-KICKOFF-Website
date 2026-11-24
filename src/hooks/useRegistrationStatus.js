import { useEffect, useState } from "react";
import { SHEET_URL } from "../sections/Registration/Config"; // adjust path if Config.jsx lives elsewhere

export function useRegistrationStatus() {
    const [status, setStatus] = useState("open"); // "loading" | "open" | "closed"

    useEffect(() => {
        let cancelled = false;

        fetch(`${SHEET_URL}?action=status`)
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) setStatus(data.registrationOpen ? "open" : "closed");
            })
            .catch(() => {
                // if the status check itself fails, default to open rather
                // than accidentally blocking real applicants
                if (!cancelled) setStatus("open");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return status;
}