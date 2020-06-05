import { AbstractRenderer } from '../../plugin-renderer/src/AbstractRenderer';
import { HtmlNode } from './HtmlNode';
import { DomObjectRenderingEngine, DomObject } from './DomObjectRenderingEngine';

export class HtmlHtmlDomRenderer extends AbstractRenderer<DomObject> {
    static id = DomObjectRenderingEngine.id;
    engine: DomObjectRenderingEngine;
    predicate = HtmlNode;

    constructor(engine, superRenderer) {
        super(engine, superRenderer);
    }

    async render(node: HtmlNode): Promise<DomObject> {
        const domObject: DomObject = { dom: [node.domNode] };
        return domObject;
    }
}
