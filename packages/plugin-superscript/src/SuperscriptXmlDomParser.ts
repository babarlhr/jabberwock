import { FormatXmlDomParser } from '../../plugin-inline/src/FormatXmlDomParser';
import { VNode } from '../../core/src/VNodes/VNode';
import { SuperscriptFormat } from './SuperscriptFormat';
import { nodeName } from '../../utils/src/utils';

export class SuperscriptXmlDomParser extends FormatXmlDomParser {
    predicate = (item: Node): boolean => {
        return item instanceof Element && nodeName(item) === 'SUP';
    };

    /**
     * Parse a span node.
     *
     * @param item
     */
    async parse(item: Element): Promise<VNode[]> {
        const superscript = new SuperscriptFormat();
        const attributes = this.engine.parseAttributes(item);
        if (attributes.length) {
            superscript.modifiers.append(attributes);
        }
        const children = await this.engine.parse(...item.childNodes);
        this.applyFormat(superscript, children);

        return children;
    }
}
