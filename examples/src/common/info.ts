/** A readout, stacked above any earlier ones in the bottom-left corner. */
export function createInfo(): HTMLDivElement {
    let stack = document.querySelector<HTMLDivElement>('.mc-stack');
    if (!stack) {
        stack = document.createElement('div');
        stack.className = 'mc-stack';
        document.body.appendChild(stack);
    }
    const info = document.createElement('div');
    info.className = 'mc-info';
    stack.appendChild(info);
    return info;
}
