import { useEffect, useId, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';
import './Panel.css';

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Panel name, rendered as the <h2> and used as the dialog's accessible name. */
  title: string;
  /** Extra header content, rendered between the title and the close button. */
  headerActions?: ReactNode;
  /** Footer content, typically `.panel-btn` buttons. */
  footer: ReactNode;
  /** Any CSS length. Defaults to 30rem. */
  maxWidth?: string;
  children: ReactNode;
}

/**
 * Modal shell shared by every floating panel: backdrop, header, scrollable
 * body and footer. It owns open/close behaviour (backdrop click, Escape) and
 * dialog semantics; callers own the content and the actions.
 */
export function Panel({
  isOpen,
  onClose,
  title,
  headerActions,
  footer,
  maxWidth,
  children,
}: PanelProps) {
  const titleId = useId();

  // Listen on document: a keydown handler on the backdrop <div> only fires
  // when focus is inside it, which is not the case after opening the modal
  // with a mouse click.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const style = maxWidth ? ({ '--panel-max-width': maxWidth } as CSSProperties) : undefined;

  return (
    // The backdrop click is a pointer shortcut; keyboard users close via
    // Escape or the close button, hence role="presentation".
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className="panel-backdrop"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="panel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={style}
      >
        <header className="panel-header">
          <h2 id={titleId} className="panel-title">
            {title}
          </h2>
          {headerActions}
          <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
            <X/>
          </button>
        </header>

        <div className="panel-body">{children}</div>

        <footer className="panel-footer">{footer}</footer>
      </div>
    </div>
  );
}
