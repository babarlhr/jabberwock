import { AbstractRenderer } from '../../plugin-renderer/src/AbstractRenderer';
import { OdooFieldNode } from './OdooFieldNode';
import { AtomicNode } from '../../core/src/VNodes/AtomicNode';
import { HtmlDomRenderingEngine } from '../../plugin-html/src/HtmlDomRenderingEngine';
import { Attributes } from '../../plugin-xml/src/Attributes';

export class OdooFieldDomRenderer extends AbstractRenderer<Node[]> {
    static id = HtmlDomRenderingEngine.id;
    engine: HtmlDomRenderingEngine;
    predicate = OdooFieldNode;

    async render(node: OdooFieldNode): Promise<Node[]> {
        const container = document.createElement(node.htmlTag);
        const fieldContainer = this._getContent(container, node);

        this.engine.renderAttributes(Attributes, node, container);
        const selectionAncestor = this.engine.editor.selection.range.start.ancestor(
            ancestor =>
                ancestor.is(OdooFieldNode) && ancestor.fieldInfo.value === node.fieldInfo.value,
        );
        if (selectionAncestor) {
            fieldContainer.classList.add('jw-focus');
        }
        fieldContainer.classList.add('jw-odoo-field');

        if (!node.fieldInfo.isValid.get()) {
            fieldContainer.classList.add('jw-odoo-field-invalid');
        }

        const renderedChildren = await this.renderChildren(node);
        for (const renderedChild of renderedChildren) {
            for (const domChild of renderedChild) {
                fieldContainer.append(domChild);
            }
        }
        if (!node.descendants(AtomicNode).length)
            fieldContainer.classList.add('jw-odoo-field-empty');

        return [container];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getContent(container: HTMLElement, node: OdooFieldNode): HTMLElement {
        return container;
    }
}