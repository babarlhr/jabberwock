import { HtmlDomRenderingEngine } from '../../../plugin-html/src/HtmlDomRenderingEngine';
import { AbstractRenderer } from '../../../plugin-renderer/src/AbstractRenderer';
import { Renderer } from '../../../plugin-renderer/src/RenderingEngine';
import { OwlNode } from './OwlNode';
import { Owl } from '../Owl';
import { OwlEnv } from './OwlComponent';

export class OwlHtmlDomRenderer extends AbstractRenderer<Node[]> {
    static id = HtmlDomRenderingEngine.id;
    engine: HtmlDomRenderingEngine;
    predicate = OwlNode;
    env: OwlEnv;

    constructor(engine: HtmlDomRenderingEngine, superRenderer: Renderer<Node[]>) {
        super(engine, superRenderer);
        this.env = this.engine.editor.plugins.get(Owl).env;
    }

    async render(node: OwlNode): Promise<Node[]> {
        const placeholder = document.createElement('jw-placeholer');
        document.body.appendChild(placeholder);
        const params = node.params;
        params.Component.env = this.env;
        const component = new params.Component(null, params.props);
        await component.mount(placeholder);
        placeholder.remove();
        return [...placeholder.childNodes];
    }
}
