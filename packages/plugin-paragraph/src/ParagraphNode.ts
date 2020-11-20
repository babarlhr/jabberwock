import { TagNode } from '../../core/src/VNodes/TagNode';

export class ParagraphNode extends TagNode {
    mayContainContainers = false;
    allowEmpty = false;
    constructor() {
        super({ htmlTag: 'P' });
    }
}
