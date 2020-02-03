export const utils = {
    /**
     * Return true if the given node is a block-level element, false otherwise.
     *
     * @param node
     */
    isBlock(node: Node): boolean {
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return false;
        }
        const temporaryElement = document.createElement(node.nodeName);
        document.body.appendChild(temporaryElement);
        const display = window.getComputedStyle(temporaryElement).display;
        document.body.removeChild(temporaryElement);
        return display.includes('block') || display.includes('list');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deepEqualMaps(a: Map<any, any>, b: Map<any, any>): boolean {
        if (a.size !== b.size) return false;
        for (const key of a.keys()) {
            if (a.get(key) !== b.get(key)) {
                return false;
            }
        }
        return true;
    },
    /**
     * Convert certain special characters to unicode.
     */
    toUnicode(string: string): string {
        if (string === ' ') {
            return '\u00A0';
        }
        if (string === '\n') {
            return '\u000d';
        }
        if (string === '\t') {
            return '\u0009';
        }
        return string;
    },
    /**
     * Return the length of a DOM Node.
     *
     * @param node
     */
    nodeLength(node: Node): number {
        const isTextNode = node.nodeType === Node.TEXT_NODE;
        const content = isTextNode ? node.nodeValue : node.childNodes;
        return content.length;
    },
    /**
     * Return a duplicate-free version of an array.
     *
     * @param array
     */
    distinct<T>(array: Array<T>): Array<T> {
        return Array.from(new Set(array));
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Take a collection of nodes and return a regular array
     * with the same contents.
     */
    _collectionToArray: (collection: NodeListOf<Node> | HTMLCollection): Node[] => {
        return Array.prototype.slice.call(collection);
    },
};
