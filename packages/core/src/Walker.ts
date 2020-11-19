import { AbstractNode } from './VNodes/AbstractNode';
import { ContainerNode } from './VNodes/ContainerNode';
import { Predicate, VNode } from './VNodes/VNode';

type WalkerFilter = {
    tangible?: boolean;
};

export class Walker {
    constructor(private readonly _filter: WalkerFilter = {}) {}

    /**
     * Test this node against the Walker given filter.
     *
     * @param ref The node to test
     */
    private _applyFilter(ref: VNode): boolean {
        if (this._filter.tangible && !ref.tangible) {
            return false;
        }
        return true;
    }
    /**
     * Test this node against the given predicate.
     *
     * If the predicate is falsy, return true. If the predicate is a constructor
     * of a VNode class, return whether this node is an instance of that class.
     * If the predicate is a standard function, return the result of this
     * function when called with the node as parameter.
     *
     * @param ref The node to test
     * @param predicate The predicate to test this node against.
     */
    test(ref: VNode, predicate?: Predicate): boolean {
        if (!predicate) {
            return true;
        } else if (AbstractNode.isConstructor(predicate)) {
            return ref instanceof predicate;
        } else {
            return predicate(ref);
        }
    }
    /**
     * Return true if the given node is a leaf in the VDocument, that is a node that
     * has no children.
     *
     * @param node node to check
     */
    isLeaf(node: VNode): boolean {
        return !this.hasChildren(node);
    }
    /**
     * Return the tangible children of ref VNode which satisfy the given
     * predicate.
     *
     * @param ref
     */
    children<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T[];
    children(ref: VNode, predicate?: Predicate): VNode[];
    children(ref: VNode, predicate?: Predicate): VNode[] {
        const children: VNode[] = [];
        const stack = [...ref.childVNodes];
        while (stack.length) {
            const node = stack.shift();
            if (this._filter.tangible && !node.tangible) {
                stack.unshift(...node.childVNodes);
            } else if (this._applyFilter(node) && this.test(node, predicate)) {
                children.push(node);
            }
        }
        return children;
    }
    /**
     * Return true if ref VNode has children.
     *
     * @param ref
     */
    hasChildren(ref: VNode): boolean {
        if (this._filter.tangible) {
            const stack = [...ref.childVNodes];
            for (const child of stack) {
                if (child.tangible) {
                    return true;
                } else {
                    stack.push(...child.childVNodes);
                }
            }
        } else {
            return !!ref.childVNodes.length;
        }
        return false;
    }
    /**
     * Return true if ref VNode comes before the given VNode in the pre-order
     * traversal.
     *
     * @param ref
     * @param vNode
     */
    isBefore(ref: VNode, vNode: VNode): boolean {
        const thisPath = [ref];
        let parent = ref.parentVNode;
        while (parent) {
            thisPath.push(parent);
            parent = parent.parentVNode;
        }
        const nodePath = [vNode];
        parent = vNode.parentVNode;
        while (parent) {
            nodePath.push(parent);
            parent = parent.parentVNode;
        }
        // Find the last distinct ancestors in the path to the root.
        let thisAncestor: VNode;
        let nodeAncestor: VNode;
        do {
            thisAncestor = thisPath.pop();
            nodeAncestor = nodePath.pop();
        } while (thisAncestor && nodeAncestor && thisAncestor === nodeAncestor);

        if (thisAncestor && nodeAncestor) {
            const thisParent = thisAncestor.parentVNode;
            const nodeParent = nodeAncestor.parentVNode;
            if (thisParent && thisParent === nodeParent) {
                // Compare the indices of both ancestors in their shared parent.
                const thisIndex = thisParent.childVNodes.indexOf(thisAncestor);
                const nodeIndex = nodeParent.childVNodes.indexOf(nodeAncestor);
                return thisIndex < nodeIndex;
            } else {
                // The very first ancestor of both nodes are different so
                // they actually come from two different trees altogether.
                return false;
            }
        } else {
            // One of the nodes was in the ancestors path of the other.
            return !thisAncestor && !!nodeAncestor;
        }
    }
    /**
     * Return true if ref VNode comes after the given VNode in the pre-order
     * traversal.
     *
     * @param ref
     * @param vNode
     */
    isAfter(ref: VNode, vNode: VNode): boolean {
        return this.isBefore(vNode, ref as VNode);
    }
    /**
     * Return the closest node from ref node that matches the given predicate.
     * Start with ref node then go up the ancestors tree until finding a match.
     *
     * @param ref
     * @param predicate
     */
    closest<T extends VNode>(ref: VNode, predicate: Predicate<T>): T;
    closest(ref: VNode, predicate: Predicate): VNode;
    closest(ref: VNode, predicate: Predicate): VNode {
        if (this._applyFilter(ref) && this.test(ref, predicate)) {
            return ref as VNode;
        } else {
            return this.ancestor(ref, predicate);
        }
    }
    /**
     * Return the first parent of the ref node that satisfies the tangible
     * filter.
     *
     * @param ref
     * @param [predicate]
     */
    parent<T extends VNode>(ref: VNode): T;
    parent(ref: VNode): ContainerNode;
    parent(ref: VNode): ContainerNode {
        let ancestor = ref.parentVNode;
        while (ancestor && this._filter.tangible && !ancestor.tangible) {
            ancestor = ancestor.parentVNode;
        }
        return ancestor;
    }
    /**
     * Return the first ancestor of ref VNode that satisfies the given
     * predicate and statifies the Walker fitlers.
     *
     * @param ref
     * @param [predicate]
     */
    ancestor<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    ancestor(ref: VNode, predicate?: Predicate): ContainerNode;
    ancestor(ref: VNode, predicate?: Predicate): ContainerNode {
        let ancestor = ref.parentVNode;
        while (ancestor && (!this._applyFilter(ancestor) || !this.test(ancestor, predicate))) {
            ancestor = ancestor.parentVNode;
        }
        return ancestor;
    }
    /**
     * Return all ancestors of the current node that satisfy the given
     * predicate. If no predicate is given return all the ancestors of the
     * current node.
     *
     * @param ref
     * @param [predicate]
     */
    ancestors<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T[];
    ancestors(ref: VNode, predicate?: Predicate): ContainerNode[];
    ancestors(ref: VNode, predicate?: Predicate): ContainerNode[] {
        const ancestors: ContainerNode[] = [];
        let ancestor = ref.parentVNode;
        while (ancestor) {
            if (this._applyFilter(ancestor) && this.test(ancestor, predicate)) {
                ancestors.push(ancestor);
            }
            ancestor = ancestor.parentVNode;
        }
        return ancestors;
    }
    /**
     * Return the lowest common ancestor between ref VNode and the given one.
     *
     * @param ref
     * @param node
     */
    commonAncestor<T extends VNode>(ref: VNode, node: VNode, predicate?: Predicate<T>): T;
    commonAncestor(ref: VNode, node: VNode, predicate?: Predicate): ContainerNode;
    commonAncestor(ref: VNode, node: VNode, predicate?: Predicate): ContainerNode {
        const refPath = this.ancestors(ref, predicate);
        if (
            ref !== node &&
            ref.childVNodes.length &&
            this._applyFilter(ref) &&
            this.test(ref, predicate)
        ) {
            refPath.unshift(ref as ContainerNode);
        }
        let commonAncestor = node as ContainerNode;
        while (commonAncestor && !refPath.includes(commonAncestor)) {
            commonAncestor = commonAncestor.parentVNode;
        }
        return commonAncestor;
    }
    /**
     * Return the nodes siblings to ref VNode that satisfy the walker filter
     * except for the reference. The referance are present every time.
     * Note: include ref VNode within the return value, in order of appearance.
     *
     * @param ref
     */
    private _siblingsAndRef(ref: VNode): VNode[] {
        const parent = this.parent(ref);
        if (!parent) return [ref];
        const children: VNode[] = [];
        const stack = [...parent.childVNodes];
        while (stack.length) {
            const node = stack.shift();
            if (node === ref) {
                // Do not filter the reference.
                children.push(node);
            } else if (this._filter.tangible && !node.tangible) {
                stack.unshift(...node.childVNodes);
            } else if (this._applyFilter(node)) {
                children.push(node);
            }
        }
        return children;
    }
    /**
     * Return the siblings of ref VNode which satisfy the given predicate.
     *
     * @param ref
     * @param [predicate]
     */
    siblings<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T[];
    siblings(ref: VNode, predicate?: Predicate): VNode[];
    siblings(ref: VNode, predicate?: Predicate): VNode[] {
        const siblings = this._siblingsAndRef(ref);
        siblings.splice(siblings.indexOf(ref), 1);
        return predicate ? siblings.filter(node => this.test(node, predicate)) : siblings;
    }
    /**
     * Return the nodes adjacent to ref VNode that satisfy the given predicate.
     * Note: include ref VNode within the return value, in order of appearance
     * (if it satisfies the given predicate).
     *
     * @param ref
     * @param [predicate]
     */
    adjacents<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T[];
    adjacents(ref: VNode, predicate?: Predicate): VNode[];
    adjacents(ref: VNode, predicate?: Predicate): VNode[] {
        const siblings = this._siblingsAndRef(ref);
        const adjacents: VNode[] = [];
        for (let i = siblings.indexOf(ref) - 1; i >= 0; i--) {
            const sibling = siblings[i];
            if (this.test(sibling, predicate)) {
                // Skip ignored siblings and those failing the predicate test.
                adjacents.unshift(sibling);
            } else {
                break;
            }
        }
        if (this._applyFilter(ref) && this.test(ref, predicate)) {
            // Skip ignored siblings and those failing the predicate test.
            adjacents.push(ref);
        }
        for (let i = siblings.indexOf(ref) + 1; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (this.test(sibling, predicate)) {
                // Skip ignored siblings and those failing the predicate test.
                adjacents.push(sibling);
            } else {
                break;
            }
        }
        return adjacents;
    }
    /**
     * Return the previous sibling of ref VNode that satisfies the predicate.
     * If no predicate is given, return the previous sibling of ref VNode.
     *
     * @param ref
     * @param [predicate]
     */
    previousSibling<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    previousSibling(ref: VNode, predicate?: Predicate): VNode;
    previousSibling(ref: VNode, predicate?: Predicate): VNode {
        do {
            const parentVNode = ref.parentVNode;
            if (!parentVNode) return;
            const childVNodes = parentVNode.childVNodes;
            const index = childVNodes.indexOf(ref);
            if (index === 0) {
                if (this._filter.tangible && !parentVNode.tangible) {
                    // If it has no siblings either then climb up to the closest
                    // parent which has a previous sibiling.
                    ref = parentVNode;
                    continue;
                }
                return;
            }
            ref = childVNodes[index - 1];
            if (this._filter.tangible && !ref.tangible) {
                ref = this.lastChild(ref) || ref;
            }
            // Skip ignored siblings and those failing the predicate test.
        } while (!this._applyFilter(ref) || !this.test(ref, predicate));

        return ref;
    }
    /**
     * Return the next sibling of ref VNode that satisfies the given predicate.
     * If no predicate is given, return the next sibling of ref VNode.
     *
     * @param ref
     * @param [predicate]
     */
    nextSibling<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    nextSibling(ref: VNode, predicate?: Predicate): VNode;
    nextSibling(ref: VNode, predicate?: Predicate): VNode {
        do {
            const parentVNode = ref.parentVNode;
            if (!parentVNode) return;
            const childVNodes = parentVNode.childVNodes;
            const len = childVNodes.length;
            const index = childVNodes.indexOf(ref);
            if (index >= len - 1) {
                if (this._filter.tangible && !parentVNode.tangible) {
                    // If it has no siblings either then climb up to the closest
                    // parent which has a next sibiling.
                    ref = parentVNode;
                    continue;
                }
                return;
            }
            ref = childVNodes[index + 1];
            if (this._filter.tangible && !ref.tangible) {
                ref = this.firstChild(ref) || ref;
            }
            // Skip ignored siblings and those failing the predicate test.
        } while (!this._applyFilter(ref) || !this.test(ref, predicate));

        return ref;
    }
    /**
     * Return the previous node in a depth-first pre-order traversal of the
     * tree that satisfies the given predicate. If no predicate is given return
     * the previous node in a depth-first pre-order traversal of the tree.
     *
     * @param ref
     * @param [predicate]
     */
    previous<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    previous(ref: VNode, predicate?: Predicate): VNode;
    previous(ref: VNode, predicate?: Predicate): VNode {
        let previous: VNode;
        do {
            const node = previous || ref;
            previous = this.previousSibling(node);
            if (previous) {
                // The previous node is the last leaf of the previous sibling.
                previous = this.lastLeaf(previous);
            } else {
                // If it has no siblings either then climb up to the closest parent
                // which has a next sibiling.
                previous = this.parent(node);
            }
        } while (previous && (!this._applyFilter(previous) || !this.test(previous, predicate)));
        return previous;
    }
    /**
     * Return the next node in a depth-first pre-order traversal of the tree
     * that satisfies the given predicate. If no predicate is given return the
     * next node in a depth-first pre-order traversal of the tree.
     *
     * @param ref
     * @param [predicate]
     */
    next<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    next(ref: VNode, predicate?: Predicate): VNode;
    next(ref: VNode, predicate?: Predicate): VNode {
        let next: VNode;
        do {
            const node = next || ref;
            // The node after node is its first child.
            next = this.firstChild(node);
            if (!next) {
                // If it has no children then it is its next sibling.
                next = this.nextSibling(node);
            }
            if (!next) {
                // If it has no siblings either then climb up to the closest parent
                // which has a next sibiling.
                let ancestor = this.parent(node);
                while (ancestor && !(next = this.nextSibling(ancestor))) {
                    ancestor = this.parent(ancestor);
                }
                if (!ancestor) next = undefined;
            }
        } while (next && (!this._applyFilter(next) || !this.test(next, predicate)));
        return next;
    }
    /**
     * Return the previous leaf in a depth-first pre-order traversal of the
     * tree that satisfies the given predicate. If no predicate is given return
     * the previous leaf in a depth-first pre-order traversal of the tree.
     *
     * @param ref
     * @param [predicate]
     */
    previousLeaf<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    previousLeaf(ref: VNode, predicate?: Predicate): VNode;
    previousLeaf(ref: VNode, predicate?: Predicate): VNode {
        return this.previous(
            ref,
            (node: VNode): boolean => this.isLeaf(node) && this.test(node, predicate),
        );
    }
    /**
     * Return the next leaf in a depth-first pre-order traversal of the tree
     * that satisfies the given predicate. If no predicate is given return the
     * next leaf in a depth-first pre-order traversal of the tree.
     *
     * @param ref
     * @param [predicate]
     */
    nextLeaf<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    nextLeaf(ref: VNode, predicate?: Predicate): VNode;
    nextLeaf(ref: VNode, predicate?: Predicate): VNode {
        return this.next(
            ref,
            (node: VNode): boolean => this.isLeaf(node) && this.test(node, predicate),
        );
    }
    /**
     * Return all previous siblings of the current node that satisfy the given
     * predicate. If no predicate is given return all the previous siblings of
     * the current node.
     *
     * @param ref
     * @param [predicate]
     */
    previousSiblings<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T[];
    previousSiblings(ref: VNode, predicate?: Predicate): VNode[];
    previousSiblings(ref: VNode, predicate?: Predicate): VNode[] {
        const siblings = this._siblingsAndRef(ref);
        const previousSiblings: VNode[] = [];
        for (let index = siblings.indexOf(ref) - 1; index >= 0; index--) {
            const sibling = siblings[index];
            if (this.test(sibling, predicate)) {
                // Skip ignored siblings and those failing the predicate test.
                previousSiblings.push(sibling);
            }
        }
        return previousSiblings;
    }
    /**
     * Return all next siblings of the current node that satisfy the given
     * predicate. If no predicate is given return all the next siblings of the
     * current node.
     *
     * @param ref
     * @param [predicate]
     */
    nextSiblings<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T[];
    nextSiblings(ref: VNode, predicate?: Predicate): VNode[];
    nextSiblings(ref: VNode, predicate?: Predicate): VNode[] {
        const siblings = this._siblingsAndRef(ref);
        const nextSiblings: VNode[] = [];
        for (let index = siblings.indexOf(ref) + 1; index < siblings.length; index++) {
            const sibling = siblings[index];
            if (this.test(sibling, predicate)) {
                // Skip ignored siblings and those failing the predicate test.
                nextSiblings.push(sibling);
            }
        }
        return nextSiblings;
    }
    /**
     * Return the nth child of this node. The given `n` argument is the 1-based
     * index of the position of the child inside this node, excluding markers.
     *
     * Examples:
     * nthChild(1) returns the first (1st) child.
     * nthChild(2) returns the second (2nd) child.
     * nthChild(3) returns the second (3rd) child.
     * nthChild(4) returns the second (4th) child.
     * ...
     *
     * @param ref
     * @param n
     */
    nthChild(ref: VNode, n: number): VNode {
        return this.children(ref)[n - 1];
    }
    /**
     * Return the first child of this VNode that satisfies the given predicate.
     * If no predicate is given, return the first child of this VNode.
     *
     * @param ref
     * @param [predicate]
     */
    firstChild<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    firstChild(ref: VNode, predicate?: Predicate): VNode;
    firstChild(ref: VNode, predicate?: Predicate): VNode {
        ref = ref.childVNodes[0];
        while (ref && this._filter.tangible && !ref.tangible && ref.childVNodes.length) {
            ref = ref.childVNodes[0];
        }
        if (ref) {
            if (this._applyFilter(ref) && this.test(ref, predicate)) {
                return ref;
            }
            return this.nextSibling(ref, predicate);
        }
    }
    /**
     * Return the last child of this VNode that satisfies the given predicate.
     * If no predicate is given, return the last child of this VNode.
     *
     * @param ref
     * @param [predicate]
     */
    lastChild<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    lastChild(ref: VNode, predicate?: Predicate): VNode;
    lastChild(ref: VNode, predicate?: Predicate): VNode {
        ref = ref.childVNodes[ref.childVNodes.length - 1];
        while (ref && this._filter.tangible && !ref.tangible && ref.childVNodes.length) {
            ref = ref.childVNodes[ref.childVNodes.length - 1];
        }
        if (ref) {
            if (this._applyFilter(ref) && this.test(ref, predicate)) {
                return ref;
            }
            return this.previousSibling(ref, predicate);
        }
    }
    /**
     * Return the first leaf of this VNode that satisfies the given predicate.
     * If no predicate is given, return the first leaf of this VNode.
     *
     * @param ref
     * @param [predicate]
     */
    firstLeaf<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    firstLeaf(ref: VNode, predicate?: Predicate): VNode;
    firstLeaf(ref: VNode, predicate?: Predicate): VNode {
        const isValidLeaf = (node: VNode): boolean => {
            return this.isLeaf(node) && this.test(node, predicate);
        };
        if (isValidLeaf(ref)) {
            return ref;
        } else {
            return this.firstDescendant(ref, isValidLeaf);
        }
    }
    /**
     * Return the last leaf of this VNode that satisfies the given predicate.
     * If no predicate is given, return the last leaf of this VNode.
     *
     * @param ref
     * @param [predicate]
     */
    lastLeaf<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    lastLeaf(ref: VNode, predicate?: Predicate): VNode;
    lastLeaf(ref: VNode, predicate?: Predicate): VNode {
        const isValidLeaf = (node: VNode): boolean => {
            return this.isLeaf(node) && this.test(node, predicate);
        };
        if (isValidLeaf(ref)) {
            return ref;
        } else {
            return this.lastDescendant(ref, isValidLeaf);
        }
    }
    /**
     * Return all descendants of the current node that satisfy the given
     * predicate. If no predicate is given return all the ancestors of the
     * current node.
     *
     * @param ref
     * @param [predicate]
     */
    descendants<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T[];
    descendants(ref: VNode, predicate?: Predicate): VNode[];
    descendants(ref: VNode, predicate?: Predicate): VNode[] {
        const descendants = [];
        const stack = [...ref.childVNodes];
        while (stack.length) {
            const node = stack.shift();
            if (this._applyFilter(node) && this.test(node, predicate)) {
                descendants.push(node);
            }
            stack.unshift(...node.childVNodes);
        }
        return descendants;
    }
    /**
     * Return the first descendant of this VNode that satisfies the predicate.
     * If no predicate is given, return the first descendant of this VNode.
     *
     * @param ref
     * @param [predicate]
     */
    firstDescendant<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    firstDescendant(ref: VNode, predicate?: Predicate): VNode;
    firstDescendant(ref: VNode, predicate?: Predicate): VNode {
        const stack = [...ref.childVNodes];
        while (stack.length) {
            const node = stack.shift();
            if (this._applyFilter(node) && this.test(node, predicate)) {
                return node;
            }
            stack.unshift(...node.childVNodes);
        }
    }
    /**
     * Return the last descendant of this VNode that satisfies the predicate.
     * If no predicate is given, return the last descendant of this VNode.
     *
     * @param ref
     * @param [predicate]
     */
    lastDescendant<T extends VNode>(ref: VNode, predicate?: Predicate<T>): T;
    lastDescendant(ref: VNode, predicate?: Predicate): VNode;
    lastDescendant(ref: VNode, predicate?: Predicate): VNode {
        const childrenFetched = new Set<VNode>();
        const stack = [...ref.childVNodes];
        while (stack.length) {
            const node = stack.pop();
            if (!childrenFetched.has(node) && node.childVNodes.length) {
                childrenFetched.add(node);
                stack.push(node, ...node.childVNodes);
            } else if (this._applyFilter(node) && this.test(node, predicate)) {
                return node;
            }
        }
    }
}

export const tangibleWalker = new Walker({ tangible: true });
export const walker = new Walker();
