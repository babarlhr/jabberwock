import { YoutubeNode } from './YoutubeNode';
import { AbstractParser } from '../core/src/AbstractParser';
import { DomParsingEngine } from '../plugin-dom/DomParsingEngine';

export class YoutubeDomParser extends AbstractParser<Node> {
    static id = 'dom';
    engine: DomParsingEngine;

    predicate = (item: Node): boolean => {
        const isYoutubeVideo =
            item instanceof Element &&
            item.nodeName === 'IFRAME' &&
            item.getAttribute('src').includes('youtu');
        return isYoutubeVideo;
    };

    async parse(item: Element): Promise<YoutubeNode[]> {
        const youtube = new YoutubeNode();
        youtube.attributes = this.engine.parseAttributes(item);
        return [youtube];
    }
}