import hljs from 'highlight.js';
import { useEffect, useRef, type ReactNode } from "react";

type CodeProps = {
    type?: "inline" | "bloc";
    lang?: string;
    children: ReactNode;
};

export function Code({ type = "inline", lang, children }: CodeProps) {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (type === "bloc" && codeRef.current) {
            delete codeRef.current.dataset.highlighted;
            hljs.highlightElement(codeRef.current);
        }
    }, [type, children, lang]);

    if (type === "inline") {
        return <span className="c">{children}</span>;
    }

    return (
        <pre className="code-bloc">
            <code ref={codeRef} className={lang ? `language-${lang}` : undefined}>
                {children}
            </code>
        </pre>
    );
};
