import { Sun } from "lucide-react"

export function ThemeButton() {


    return (
        <>
            <button
                className="top-button"
                onClick={() => window.location.href = "#top"}
            >
                <Sun />
            </button>
        </>
    )
}
