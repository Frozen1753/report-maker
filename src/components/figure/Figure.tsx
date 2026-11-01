import styles from "./Figure.module.css";

import React, { useCallback, useState, type ReactNode } from "react";
import { Lightbox } from "./Lightbox";
import { FigureCaption, FigureLightbox, FigureMedia } from "./parts";
import type { FigurePartProps, FigureProps } from "./types";

export function Figure({
  children,
  id,
  number,
  lightbox = false,
  className = "",
}: FigureProps) {
  const label = number ? `Figure ${number}` : "Figure";
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  let media: ReactNode;
  let caption: ReactNode;
  let lightboxContent: ReactNode;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<FigurePartProps>(child)) return;

    switch (child.type) {
      case FigureMedia:
        media = child.props.children;
        break;
      case FigureCaption:
        caption = child.props.children;
        break;
      case FigureLightbox:
        lightboxContent = child.props.children;
        break;
      default:
        console.warn(
          "Figure only accepts <Figure.Media>, <Figure.Caption> and <Figure.Lightbox> as direct children.",
        );
    }
  });

  if (media === undefined) {
    console.warn("Figure requires a <Figure.Media> child.");
    return null;
  }

  const hasLightbox = lightbox || lightboxContent !== undefined;

  return (
    <>
      <figure
        id={id}
        className={`${styles.figure} ${hasLightbox ? styles.clickable : ""} ${className}`}
        onClick={hasLightbox ? () => setOpen(true) : undefined}
      >
        <div className={styles.media}>{media}</div>

        <figcaption className={styles.figcaption}>
          <span className={styles.label}>{label}</span>
          {caption && (
            <span>{" — "}{caption}</span>
          )}
        </figcaption>
      </figure>

      {open && (
        <Lightbox label={label} onClose={close}>
          {lightboxContent ?? media}
        </Lightbox>
      )}
    </>
  );
}