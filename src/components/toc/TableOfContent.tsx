import type { TocEntry } from "../../utils/mdx-plugins/remark-heading-numbers";

type TableOfContentProps = {
    title?: string;
    items: TocEntry[];
};

export function TableOfContent({ title = "Sommaire", items }: TableOfContentProps) {
    return (
        <>
            <h1>{title}</h1>
            <div className="toc">
                <ul>
                    {items.map((item) => (
                        <li key={item.id} className={`lvl${item.depth}`} style={{ marginLeft: (item.depth - 1) * 6 }}>
                            <a href={`#${item.id}`}>
                                {item.number} {item.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};