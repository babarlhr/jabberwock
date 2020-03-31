import { removeFormattingSpace } from '../../utils/src/formattingSpace';
import { CharNode } from './CharNode';
import { AbstractParser } from '../../plugin-parser/src/AbstractParser';
import { XmlDomParsingEngine } from '../../plugin-xml/src/XmlDomParsingEngine';

export class CharXmlDomParser extends AbstractParser<Node> {
    static id = XmlDomParsingEngine.id;
    engine: XmlDomParsingEngine;

    predicate = (item: Node): boolean => {
        return item.nodeType === Node.TEXT_NODE;
    };

    async parse(item: Node): Promise<CharNode[]> {
        const nodes: CharNode[] = [];
        const text = removeFormattingSpace(item);
        for (let i = 0; i < text.length; i++) {
            const parsedVNode = new CharNode({ char: text.charAt(i) });
            nodes.push(parsedVNode);
        }
        return nodes;
    }
}