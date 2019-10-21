import { VNode, VNodeType } from './VNode';
import { VRange } from './VRange';

export class VDocument {
    root: VNode;
    range = new VRange();
    constructor(root: VNode) {
        this.root = root;
        this.range.setAt(this.root);
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Insert something at range.
     *
     * @param value
     */
    insert(value: string | VNode): void {
        // Remove the contents of the selection if needed.
        if (!this.range.collapsed) {
            this.removeSelection();
        }
        // Do the inserting.
        if (typeof value === 'string') {
            this._insertText(value);
        } else if (value instanceof VNode) {
            this.range.first.before(value);
        }
    }
    /**
     * Remove everything within the current range.
     */
    removeSelection(): void {
        let firstNode = this.range.first;
        this.range.selectedNodes.slice().forEach(vNode => {
            // If the node has children, chain them after the first range node.
            vNode.children.slice().forEach(child => {
                firstNode.after(child);
                firstNode = child;
            });
            // Then remove.
            vNode.remove();
        });
        this.range.collapse(); // Ensure the direction is right.
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Insert the given text at range.
     *
     * @param text
     */
    _insertText(text: string): void {
        // Split the text into CHAR nodes and insert them before the first range
        // node.
        let lastPosition = this.range.first;
        text.split('').forEach(char => {
            const vNode = new VNode(VNodeType.CHAR, '#text', char);
            lastPosition.before(vNode);
            lastPosition = vNode;
        });
    }
}
