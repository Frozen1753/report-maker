
type CoverPageProps = {
    title: string;
    coverImg?: {
        coverImgSrc?: string;
        coverImgAlt?: string;
        coverImgHref?: string;
    };
    date: string;
    authors?: {
        firstName?: string;
        lastName?: string;
        alias?: string;
        authorHref?: string;
    }[];
    authorAffiliation?: string[];
};

export function CoverPage({ title = "My report", coverImg, date, authors, authorAffiliation }: CoverPageProps) {
    return (
        <div className="cover-page">
            <h1>{title}</h1>
            {coverImg &&
                <div>
                    <a href={coverImg.coverImgHref} target="_blank">
                        <img src={coverImg.coverImgSrc} className="cover-image" alt={coverImg.coverImgAlt} />
                    </a>
                </div>
            }
            <div className="cover-authors">
                <div className="info-line">{date}</div>
                {authors && authors.map((author) => (
                    <div className="info-line authors">
                        <a href={author.authorHref} target="_blank">{author.firstName} {author.lastName} ({author.alias})</a>
                    </div>
                ))}
                {authorAffiliation &&
                    authorAffiliation.map((affiliation) => (
                        <div className="info-line">{affiliation}</div>
                    ))
                }
            </div>
        </div>
    );
};
