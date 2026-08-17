import { dashboard, type Panel } from 'dashcat';

/**
 * Anchor a dashcat panel to the top-right corner. dashcat positions panels with
 * left/top from the viewport, so we clear `left` and pin `right` instead — this
 * survives window resizes (until the user drags the panel, which restores left).
 */
export function pinTopRight(panel: Panel, margin = 16): void {
    panel.root.style.left = 'auto';
    panel.root.style.right = `${margin}px`;
    panel.root.style.top = `${margin}px`;
}

/**
 * The common example setup: a dashboard with a single panel, pinned top-right.
 * Fill the returned panel directly with `.add` / `.monitor` / `.button`.
 */
export function createPanel(title: string): Panel {
    const panel = dashboard().panel({ title });
    pinTopRight(panel);
    return panel;
}
