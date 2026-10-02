import { Copy, CopyCheck } from "lucide-react";
import {
    useEffect,
    useState,
    type ReactNode
} from "react";
import { codeToHtml, type BundledTheme } from "shiki";
import { useCurrentTheme } from "../../utils/theme/useCurrentTheme";
import {
    SHIKI_PREVIEW_EVENT,
    getPersistedShikiThemes,
    type ShikiThemePair,
} from "./shiki-theme-vars";

type CodeProps = {
    type?: "inline" | "bloc";
    copy?: boolean;
    bar?: boolean;
    name?: string;
    lang?: string;
    children: ReactNode;
};

function copyFallback(text: string) {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.setAttribute("readonly", "");

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    return copied;
}

async function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Use fallback below.
        }
    }

    return copyFallback(text);
}

export function Code({
    type = "inline",
    copy = false,
    bar = false,
    name,
    lang,
    children,
}: CodeProps) {
    const currentTheme = useCurrentTheme();
    const [copied, setCopied] = useState(false);
    const [highlighted, setHighlighted] = useState<{ light: string; dark: string }>({ light: "", dark: "" });
    // Initial value = whatever is persisted in style.css. Updated live while
    // ThemePanel (dev-only) is open and the reader changes a combobox.
    const [themePair, setThemePair] = useState<ShikiThemePair>(() =>
        typeof window === "undefined"
            ? { light: "github-light", dark: "github-dark" }
            : getPersistedShikiThemes(),
    );

    const code =
        typeof children === "string"
            ? children
            : String(children);

    useEffect(() => {
        function handlePreview(e: Event) {
            setThemePair((e as CustomEvent<ShikiThemePair>).detail);
        }
        window.addEventListener(SHIKI_PREVIEW_EVENT, handlePreview);
        return () => window.removeEventListener(SHIKI_PREVIEW_EVENT, handlePreview);
    }, []);

    useEffect(() => {
        if (type !== "bloc") return;

        let cancelled = false;

        async function highlightCode() {
            // Two separate single-theme passes rather than Shiki's built-in
            // themes:{light,dark} CSS-variable mechanism: that approach sets
            // the default theme's color inline on each span, which then needs
            // `!important` in the override rule to ever actually switch —
            // easy to get stuck on one theme. Duplicating the render sidesteps
            // that entirely: each variant is plain, self-contained HTML, and
            // CSS just shows/hides the one matching the current data-theme.
            const [light, dark] = await Promise.all([
                codeToHtml(code, { lang: lang || "text", theme: themePair.light as BundledTheme }),
                codeToHtml(code, { lang: lang || "text", theme: themePair.dark as BundledTheme }),
            ]);

            if (!cancelled) {
                setHighlighted({ light, dark });
            }
        }

        void highlightCode();

        return () => {
            cancelled = true;
        };
    }, [type, code, lang, themePair]);

    if (type === "inline") {
        return <code className="code-inline">{children}</code>;
    }

    async function handleCopy() {
        const success = await copyText(code);

        if (!success) return;

        setCopied(true);

        window.setTimeout(() => {
            setCopied(false);
        }, 1500);
    }

    return (
        <div className={`code-wrapper ${bar ? "has-code-bar" : ""}`}>
            {bar && (
                <div className="code-bar">
                    <div className="code-info">
                        {name && (
                            <span className="code-name">
                                {name}
                            </span>
                        )}

                        {lang && (
                            <span className="code-language">
                                {lang}
                            </span>
                        )}
                    </div>

                    {copy && (
                        <button
                            type="button"
                            className={`copy-button ${copied ? "copied-button" : ""
                                }`}
                            onClick={handleCopy}
                            aria-label={
                                copied
                                    ? "Code copied"
                                    : "Copy code"
                            }
                        >
                            {copied ? (
                                <CopyCheck size={18} />
                            ) : (
                                <Copy size={18} />
                            )}

                            <span>
                                {copied ? "Copied" : "Copy"}
                            </span>
                        </button>
                    )}
                </div>
            )}

            {!bar && copy && (
                <button
                    type="button"
                    className={`copy-button-no-bar ${copied ? "copied-button" : ""
                        }`}
                    onClick={handleCopy}
                    aria-label={
                        copied
                            ? "Code copied"
                            : "Copy code"
                    }
                >
                    {copied ? (
                        <CopyCheck size={18} />
                    ) : (
                        <Copy size={18} />
                    )}
                </button>
            )}

            {highlighted.light && highlighted.dark ? (
                <div
                    className="code-shiki"
                    dangerouslySetInnerHTML={{
                        __html: currentTheme === "dark" ? highlighted.dark : highlighted.light,
                    }}
                />
            ) : (
                <pre className="code-bloc">
                    <code>{code}</code>
                </pre>
            )}
        </div>
    );
}
