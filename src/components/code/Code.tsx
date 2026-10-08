import { Copy, CopyCheck } from "lucide-react";
import {
    useEffect,
    useState,
    type ReactNode
} from "react";
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

/**
 * Highlights the same code in both the light and dark theme.
 *
 * Dev: uses the full `shiki` package directly — any of its ~65 bundled themes
 * and ~180 languages can be requested, since `vite dev` never produces one
 * shipped bundle; nothing here is downloaded by a reader.
 *
 * Prod: uses `src/generated/shiki-bundle.generated.ts`, written at build time
 * by scripts/shiki-codegen.ts from exactly the languages found in report.mdx
 * and the two themes chosen in style.css — nothing else is bundled. Because
 * the two branches live behind `import.meta.env.DEV` (a compile-time
 * constant), Rollup fully removes whichever one doesn't apply.
 */
async function highlightBothThemes(
    code: string,
    lang: string,
    themePair: ShikiThemePair,
): Promise<{ light: string; dark: string }> {
    const requestedLang = lang || "text";

    if (import.meta.env.DEV) {
        const { codeToHtml } = await import("shiki");
        const [light, dark] = await Promise.all([
            codeToHtml(code, { lang: requestedLang, theme: themePair.light }),
            codeToHtml(code, { lang: requestedLang, theme: themePair.dark }),
        ]);
        return { light, dark };
    }

    const { highlighterPromise } = await import("../../generated/shiki-bundle.generated");
    const h = await highlighterPromise;

    const safeHighlight = (theme: string) => {
        try {
            return h.codeToHtml(code, { lang: requestedLang, theme });
        } catch {
            // A language the build-time scan didn't catch (e.g. a dynamic
            // lang={expr} instead of a literal string) — fall back to
            // unhighlighted rather than crash the whole report.
            return h.codeToHtml(code, { lang: "text", theme });
        }
    };

    return { light: safeHighlight(themePair.light), dark: safeHighlight(themePair.dark) };
}

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
        // Only fires in dev — ThemePanel (the only thing that dispatches this
        // event) never renders in production.
        function handlePreview(e: Event) {
            setThemePair((e as CustomEvent<ShikiThemePair>).detail);
        }
        window.addEventListener(SHIKI_PREVIEW_EVENT, handlePreview);
        return () => window.removeEventListener(SHIKI_PREVIEW_EVENT, handlePreview);
    }, []);

    useEffect(() => {
        if (type !== "bloc") return;

        let cancelled = false;

        highlightBothThemes(code, lang || "", themePair).then((result) => {
            if (!cancelled) setHighlighted(result);
        });

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
