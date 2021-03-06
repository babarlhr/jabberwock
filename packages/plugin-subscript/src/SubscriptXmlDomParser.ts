import { FormatXmlDomParser } from '../../plugin-inline/src/FormatXmlDomParser';
import { VNode } from '../../core/src/VNodes/VNode';
import { SubscriptFormat } from './SubscriptFormat';
import { nodeName } from '../../utils/src/utils';

export class SubscriptXmlDomParser extends FormatXmlDomParser {
    predicate = (item: Node): boolean => {
        return item instanceof Element && nodeName(item) === 'SUB';
    };

    /**
     * Parse a span node.
     *
     * @param item
     */
    async parse(item: Element): Promise<VNode[]> {
        const subscript = new SubscriptFormat();
        const attributes = this.engine.parseAttributes(item);
        if (attributes.length) {
            subscript.modifiers.append(attributes);
        }
        const children = await this.engine.parse(...item.childNodes);
        this.applyFormat(subscript, children);

        return children;
    }
}
