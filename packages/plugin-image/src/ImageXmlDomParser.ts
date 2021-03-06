import { ImageNode } from './ImageNode';
import { AbstractParser } from '../../plugin-parser/src/AbstractParser';
import { XmlDomParsingEngine } from '../../plugin-xml/src/XmlDomParsingEngine';
import { nodeName } from '../../utils/src/utils';

export class ImageXmlDomParser extends AbstractParser<Node> {
    static id = XmlDomParsingEngine.id;
    engine: XmlDomParsingEngine;

    predicate = (item: Node): boolean => {
        return item instanceof Element && nodeName(item) === 'IMG';
    };

    async parse(item: Element): Promise<ImageNode[]> {
        const image = new ImageNode();
        image.modifiers.append(this.engine.parseAttributes(item));
        return [image];
    }
}
