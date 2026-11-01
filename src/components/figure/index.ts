import { Figure as FigureRoot } from "./Figure";
import { FigureCaption, FigureLightbox, FigureMedia } from "./parts";

export const Figure = Object.assign(FigureRoot, {
    Media: FigureMedia,
    Caption: FigureCaption,
    Lightbox: FigureLightbox,
});

export type { FigurePartProps, FigureProps } from "./types";
