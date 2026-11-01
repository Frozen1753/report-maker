import type { ReactNode } from "react";

export type FigureProps = {
    id?: string;
    number?: string;
    children: ReactNode;
    lightbox?: boolean;
    className?: string;
};

export type FigurePartProps = {
    children: ReactNode;
};