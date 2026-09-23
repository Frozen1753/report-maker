import { useState } from "react";

type FigureProps = {
    src: string;
    alt?: string;
    caption?: string;
    type?: "image" | "video" | "gif";
    lightbox?: boolean;
};

export function Figure({ src, alt = "", caption, type = "image", lightbox = false }: FigureProps) {
    const [open, setOpen] = useState(false);

    const clickable = lightbox && type !== "video";

    const media =
        type === "video" ? (
            <video src={src} controls />
        ) : (
            <img src={src} alt={alt} />
        );

    return (
        <>
            <figure className={`figure${clickable ? " clickable" : ""}`} onClick={() => clickable && setOpen(true)}>
                {media}
                {caption && <figcaption>{caption}</figcaption>}
            </figure>

            {clickable && open && (
                <div className="figure-lightbox" onClick={() => setOpen(false)}>
                    <img src={src} alt={alt} />
                </div>
            )}
        </>
    );
};
