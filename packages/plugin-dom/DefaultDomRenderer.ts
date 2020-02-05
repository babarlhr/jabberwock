import { AbstractRenderer } from '../core/src/AbstractRenderer';
import { VNode } from '../core/src/VNodes/VNode';
import { FragmentNode } from '../core/src/VNodes/FragmentNode';
import { VElement } from '../core/src/VNodes/VElement';

export class DefaultDomRenderer extends AbstractRenderer<Node[]> {
    static id = 'dom';
    async render(node: VNode): Promise<Node[]> {
        let domNode: Node;
        if (node.test(FragmentNode)) {
            domNode = document.createDocumentFragment();
        } else {
            let nodeName: string;
            if (node.is(VElement)) {
                nodeName = node.htmlTag;
            } else {
                nodeName = node.constructor.name.toUpperCase() + '-' + node.id;
            }
            domNode = document.createElement(nodeName);
        }
        // If a node is empty but could accomodate children,
        // fill it to make it visible.
        if (!node.hasChildren() && !node.atomic) {
            const placeholderBr = document.createElement('BR');
            domNode.appendChild(placeholderBr);
        }

        const renderedChildren = await this.renderChildren(node);
        for (const renderedChild of renderedChildren) {
            for (const domChild of renderedChild) {
                domNode.appendChild(domChild);
            }
        }
        return [domNode];
    }
}
