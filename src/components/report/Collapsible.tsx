import type { ReactNode } from "react";

type CollapsibleProps = {
    title: string;
    children: ReactNode;
};

export function Collapsible({ title = "Voir plus d'informations", children }: CollapsibleProps) {
    return (
        <details className="accordion">
            <summary>{title}</summary>
            {children}
        </details>
    );
};