import { Renderer } from '../core/src/Renderer';
import { VDocumentMap } from '../core/src/VDocumentMap';
import { VDocument } from '../core/src/VDocument';
import { VNode, RelativePosition } from '../core/src/VNodes/VNode';
import { VSelection, Direction } from '../core/src/VSelection';
import { VElement } from '../core/src/VNodes/VElement';

export interface DomRenderingContext {
    root: VNode; // Root VNode of the current rendering.
    currentNode?: VNode; // Current VNode rendered at this step.
    parentNode?: Node | DocumentFragment; // Node to render the VNode into.
}
export type DomRenderingMap = Map<Node, VNode[]>;

export class DomRenderer extends Renderer<
    DomRenderingContext,
    [DomRenderingContext, DomRenderingMap]
> {
    readonly id = 'dom';
    _contextStack: Array<DomRenderingContext> = [];

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Render the contents of a root VNode into a given target element.
     *
     * @param root
     * @param target
     */
    render(content: VDocument | VNode, target: Element): void {
        const root = content instanceof VDocument ? content.root : content;
        if (content instanceof VDocument) {
            // TODO: the map should be on the VDocument.
            VDocumentMap.clear(); // TODO: update instead of recreate
            const fragment = document.createDocumentFragment();
            VDocumentMap.set(root, fragment);
            target.innerHTML = ''; // TODO: update instead of recreate
        }

        // Don't render `root` itself if already rendered, render its children.
        const renderedRoot = VDocumentMap.toDom(root);
        const parentNode = renderedRoot ? renderedRoot : target;
        const firstVNode = renderedRoot ? root.firstChild() : root;

        if (!firstVNode) return;

        const rootContext: DomRenderingContext = {
            root: root,
            currentNode: firstVNode,
            parentNode: parentNode,
        };
        this._contextStack.push(rootContext);

        let currentContext: DomRenderingContext = { ...rootContext };
        do {
            currentContext = this.renderNode(currentContext);
        } while ((currentContext = this._nextRenderingContext(currentContext)));

        if (content instanceof VDocument) {
            // Append the fragment corresponding to the VDocument to `target`.
            target.appendChild(renderedRoot);
            VDocumentMap.set(root, target);
            this._renderSelection(content.selection, target);
        }
    }
    /**
     * Render the element matching the current vNode and append it.
     *
     * @param currentContext
     */
    renderNode(currentContext: DomRenderingContext): DomRenderingContext {
        let renderingResult: [DomRenderingContext, DomRenderingMap];
        for (const renderingFunction of this.renderingFunctions) {
            renderingResult = renderingFunction({ ...currentContext });
            if (renderingResult) {
                currentContext = renderingResult[0];
                if (renderingResult[1]) {
                    break;
                }
            }
        }

        let [newContext, renderingMap] = renderingResult || [];
        if (!newContext) {
            newContext = { ...currentContext };
        }
        if (!renderingMap) {
            renderingMap = this._renderDefault(currentContext);
        }

        // Map the parsed nodes to the DOM nodes they represent.
        renderingMap.forEach((nodes: VNode[], domNode: Node) => {
            nodes.forEach((node: VNode, index: number) => {
                VDocumentMap.set(node, domNode, index);
            });
        });
        return newContext;
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    _renderDefault(currentContext: DomRenderingContext): DomRenderingMap {
        const node = currentContext.currentNode;
        let tagName: string;
        if (node.is(VElement)) {
            tagName = node.htmlTag;
        } else {
            tagName = node.constructor.name.toUpperCase() + '-' + node.id;
        }
        const fragment = document.createDocumentFragment();
        const renderedDomNodes: Node[] = [];
        const renderedElement = document.createElement(tagName);
        renderedDomNodes.push(renderedElement);
        fragment.appendChild(renderedElement);

        // If a node is empty but could accomodate children,
        // fill it to make it visible.
        if (!node.hasChildren() && !node.atomic) {
            const placeholderBr = document.createElement('BR');
            renderedElement.appendChild(placeholderBr);
            renderedDomNodes.push(placeholderBr);
        }

        currentContext.parentNode.appendChild(fragment);

        return new Map(
            renderedDomNodes.map(domNode => {
                return [domNode, [node]];
            }),
        );
    }
    /**
     * Return the next rendering context, based on the given context. This
     * includes the next VNode to render and the next parent element to render
     * it into.
     *
     * @param currentContext
     */
    _nextRenderingContext(currentContext: DomRenderingContext): DomRenderingContext {
        const node = currentContext.currentNode;
        if (node.hasChildren()) {
            currentContext.currentNode = node.firstChild();
            // Render the first child with the current node as parent.
            const renderedParent = VDocumentMap.toDom(node);
            if (renderedParent) {
                currentContext.parentNode = renderedParent;
            }
            this._contextStack.push({ ...currentContext });
        } else if (node.nextSibling()) {
            // Render the siblings of the current node with the same parent.
            this._contextStack[this._contextStack.length - 1].currentNode = node.nextSibling();
        } else {
            // Render the next ancestor sibling in the ancestor tree.
            let ancestor = node;
            // Climb up the ancestor tree to the first parent having a sibling.
            while (ancestor && !ancestor.nextSibling() && ancestor != currentContext.root) {
                ancestor = ancestor.parent;
                this._contextStack.pop();
            }
            if (ancestor && ancestor != currentContext.root) {
                // At this point, the found ancestor has a sibling.
                this._contextStack[
                    this._contextStack.length - 1
                ].currentNode = ancestor.nextSibling();
            } else {
                // If no next ancestor having a sibling could be found then the
                // tree has been fully rendered.
                return;
            }
        }
        return this._contextStack[this._contextStack.length - 1];
    }
    /**
     * Render the given VSelection as a DOM selection in the given target.
     *
     * @param selection
     * @param target
     */
    _renderSelection(selection: VSelection, target: Element): void {
        const [anchorNode, anchorOffset] = this._getDomLocation(selection.anchor);
        const [focusNode, focusOffset] = this._getDomLocation(selection.focus);
        const domRange = target.ownerDocument.createRange();
        if (selection.direction === Direction.FORWARD) {
            domRange.setStart(anchorNode, anchorOffset);
            domRange.collapse(true);
        } else {
            domRange.setEnd(anchorNode, anchorOffset);
            domRange.collapse(false);
        }
        const domSelection = document.getSelection();
        domSelection.removeAllRanges();
        domSelection.addRange(domRange);
        domSelection.extend(focusNode, focusOffset);
    }
    /**
     * Return the location in the DOM corresponding to the location in the
     * VDocument of the given VNode. The location in the DOM is expressed as a
     * tuple containing a reference Node and a relative position with respect to
     * the reference Node.
     *
     * @param node
     */
    _getDomLocation(node: VNode): [Node, number] {
        let reference = node.previousSibling();
        let position = RelativePosition.AFTER;
        if (reference) {
            reference = reference.lastLeaf();
        } else {
            reference = node.nextSibling();
            position = RelativePosition.BEFORE;
        }
        if (reference) {
            reference = reference.firstLeaf();
        } else {
            reference = node.parent;
            position = RelativePosition.INSIDE;
        }
        // The location is a tuple [reference, offset] implemented by an array.
        const location = VDocumentMap.toDomLocation(reference);
        if (position === RelativePosition.AFTER) {
            // Increment the offset to be positioned after the reference node.
            location[1] += 1;
        }
        return location;
    }
}
