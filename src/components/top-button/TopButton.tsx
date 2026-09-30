import { ArrowUp } from "lucide-react";

function topFunction() {
    document.body.scrollTop = 0; // Safari
    document.documentElement.scrollTop = 0; // Chrome, Firefox, IE and Opera
}

export function TopButton() {
    return (
        <>
            <button
                className="top-button"
                onClick={() => topFunction()}
            >
                <ArrowUp />
            </button>
        </>
    )
}
