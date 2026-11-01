import type { ReactNode } from "react";

export type FigureProps = {
    children: ReactNode;
    lightbox?: boolean;
    className?: string;
};

export type FigurePartProps = {
    children: ReactNode;
};