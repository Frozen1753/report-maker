import type { FigureEntry } from '../../utils/mdx-plugins/remark-figures';

type ListOfFiguresProps = {
    title?: string;
    items: FigureEntry[];
};

export function ListOfFigures({ title = 'Liste des figures', items }: ListOfFiguresProps) {
    if (items.length === 0) return null;

    return (
        <>
            <h1>{title}</h1>

            <nav className="toc" aria-label={title}>
                <ul className="toc__list">
                    {items.map((item) => (
                        <li key={item.id} className="toc__item">
                            <div className="toc__row">
                                <a href={`#${item.id}`} className="toc__link">
                                    <span className="toc__number">Figure {item.number} :</span>
                                    {item.caption && <span>{item.caption}</span>}
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}