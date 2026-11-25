import { useEffect, useState } from "react";
import { SHEET_URL } from "../sections/Registration/Config"; // adjust path if Config.jsx lives elsewhere

export function useRegistrationStatus() {
    const [status, setStatus] = useState("closed"); // "loading" | "open" | "closed"

    useEffect(() => {
        let cancelled = false;

        fetch(`${SHEET_URL}?action=status`)
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) setStatus(data.registrationOpen ? "closed" : "closed");
            })
            .catch(() => {
                // if the status check itself fails, default to open rather
                // than accidentally blocking real applicants
                if (!cancelled) setStatus("closed");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return status;
}