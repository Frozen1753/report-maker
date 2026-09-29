import hljs from "highlight.js";
import { Copy, CopyCheck } from "lucide-react";
import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

type CodeProps = {
    type?: "inline" | "bloc";
    copy?: boolean;
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
            // Fall through to the older fallback.
        }
    }

    return copyFallback(text);
}

export function Code({ type = "inline", copy, lang, children }: CodeProps) {
    const codeRef = useRef<HTMLElement>(null);
    const [copied, setCopied] = useState(false);

    // Ideally, block-code children should be a string.
    const code = typeof children === "string" ? children : String(children);

    useEffect(() => {
        if (type === "bloc" && codeRef.current) {
            delete codeRef.current.dataset.highlighted;
            hljs.highlightElement(codeRef.current);
        }
    }, [type, code, lang]);

    if (type === "inline") {
        return <span className="c">{children}</span>;
    }

    async function handleCopy() {
        const success = await copyText(code);

        if (success) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }
    }

    return (
        <div className="code-wrapper">
            {copy &&
                <button
                    type="button"
                    className={copied ? "copy-button copied-button" : "copy-button"}
                    onClick={handleCopy}
                    aria-label={copied ? "Code copied" : "Copy code"}
                >
                    {copied ? <CopyCheck size={18} /> : <Copy size={18} />}
                </button>
            }
            <pre className="code-bloc">
                <code
                    ref={codeRef}
                    className={lang ? `language-${lang}` : undefined}
                >
                    {code}
                </code>
            </pre>
        </div>
    );
}