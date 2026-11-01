import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { ZoomPan } from "./ZoomPan";

type LightboxProps = {
    label: string;
    onClose: () => void;
    children: ReactNode;
};

export function Lightbox({ label, onClose, children }: LightboxProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="figure-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={onClose}
        >
            <div
                className="figure-lightbox-content"
                onClick={(event) => event.stopPropagation()}
            >
                <ZoomPan>{children}</ZoomPan>

                <button
                    type="button"
                    className="figure-lightbox-close"
                    onClick={onClose}
                    aria-label="Close figure"
                >
                    <X />
                </button>
            </div>
        </div>
    );
}