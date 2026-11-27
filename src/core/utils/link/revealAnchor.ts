export async function revealAnchor(id: string): Promise<boolean> {
    const target = document.getElementById(id);

    if (!target) {
        return false;
    }

    const ancestors: HTMLElement[] = [];

    let parent = target.parentElement;

    while (parent) {
        ancestors.push(parent);
        parent = parent.parentElement;
    }

    ancestors.reverse();

    for (const ancestor of ancestors) {
        if (
            ancestor.matches(
                'details[data-reveal-container="collapsible"]',
            )
        ) {
            const details = ancestor as HTMLDetailsElement;

            if (!details.open) {
                details.querySelector("summary")?.click();
            }
        }

        if (ancestor.hasAttribute("data-reveal-tab-panel")) {
            const tabsRoot = ancestor.closest(
                '[data-reveal-container="tabs"]',
            );

            if (!tabsRoot) continue;

            const targetIndex = ancestor.getAttribute(
                "data-reveal-tab-panel",
            );

            const activeTrigger = tabsRoot.querySelector(
                '[role="tab"][aria-selected="true"]',
            );

            const targetTrigger = Array.from(
                tabsRoot.querySelectorAll<HTMLButtonElement>(
                    "[data-reveal-tab-trigger]",
                ),
            ).find(
                (button) =>
                    button.dataset.revealTabTrigger === targetIndex,
            );

            if (
                targetTrigger &&
                targetTrigger !== activeTrigger &&
                !targetTrigger.disabled
            ) {
                targetTrigger.click();
            }
        }
    }

    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });

    const revealedTarget = document.getElementById(id);

    if (!revealedTarget) {
        return false;
    }

    revealedTarget.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });

    return true;
}
