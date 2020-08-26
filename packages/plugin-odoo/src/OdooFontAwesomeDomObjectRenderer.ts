import { DomObject } from '../../plugin-renderer-dom-object/src/DomObjectRenderingEngine';
import { RenderingEngineWorker } from '../../plugin-renderer/src/RenderingEngineCache';
import { IconNode } from '../../plugin-icon/src/IconNode';
import { odooIconPostRender } from './odooUtils';
import { FontAwesomeDomObjectRenderer } from '../../plugin-fontawesome/src/FontAwesomeDomObjectRenderer';

export class OdooFontAwesomeDomObjectRenderer extends FontAwesomeDomObjectRenderer {
    async render(node: IconNode, worker: RenderingEngineWorker<DomObject>): Promise<DomObject> {
        const domObject: DomObject = await super.render(node, worker);
        return odooIconPostRender(node, domObject, this.engine.editor);
    }
}
