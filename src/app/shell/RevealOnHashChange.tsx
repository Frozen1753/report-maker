
import { useEffect } from "react";
import { useLocation } from "react-router";
import { revealAnchor } from "../../core/utils/link/revealAnchor";

export function RevealOnHashChange() {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) return;

        let cancelled = false;
        let frame = 0;

        const id = decodeURIComponent(location.hash.slice(1));

        const attemptReveal = () => {
            if (cancelled) return;

            const target = document.getElementById(id);

            if (target) {
                revealAnchor(id);
                return;
            }

            if (frame++ < 60) {
                requestAnimationFrame(attemptReveal);
            }
        };

        const initialFrame = requestAnimationFrame(attemptReveal);

        return () => {
            cancelled = true;
            cancelAnimationFrame(initialFrame);
        };
    }, [location.pathname, location.search, location.hash]);

    return null;
}
