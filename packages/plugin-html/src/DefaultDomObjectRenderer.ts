import { AbstractRenderer } from '../../plugin-renderer/src/AbstractRenderer';
import { VNode } from '../../core/src/VNodes/VNode';
import { FragmentNode } from '../../core/src/VNodes/FragmentNode';
import { VElement } from '../../core/src/VNodes/VElement';
import { DomObjectRenderingEngine, DomObject } from './DomObjectRenderingEngine';
import { Attributes } from '../../plugin-xml/src/Attributes';

export class DefaultDomObjectRenderer extends AbstractRenderer<DomObject> {
    static id = 'dom/object';
    engine: DomObjectRenderingEngine;

    async render(node: VNode): Promise<DomObject> {
        let domObject: DomObject;
        if (node.tangible) {
            if (node.is(VElement)) {
                domObject = {
                    tag: node.htmlTag,
                    children: await this.engine.renderChildren(node),
                };
                this.engine.renderAttributes(Attributes, node, domObject);
            } else if (node.test(FragmentNode)) {
                domObject = {
                    children: await this.engine.renderChildren(node),
                };
            } else {
                domObject = {
                    tag: node.name,
                    attributes: {
                        id: node.id.toString(),
                    },
                    children: await this.engine.renderChildren(node),
                };
            }
        } else {
            domObject = { children: [] };
        }
        return domObject;
    }
}
