import { AbstractParser } from '../core/src/AbstractParser';
import { DomParsingEngine } from '../plugin-dom/DomParsingEngine';
import { TableNode } from './TableNode';

export class TableDomParser extends AbstractParser<Node> {
    static id = 'dom';
    engine: DomParsingEngine;

    predicate = (item: Node): boolean => {
        return item instanceof Element && item.nodeName === 'TABLE';
    };

    async parse(item: Element): Promise<TableNode[]> {
        const table = new TableNode();
        table.attributes = this.engine.parseAttributes(item);
        const nodes = await this.engine.parse(...item.childNodes);
        table.append(...nodes);
        return [table];
    }
}