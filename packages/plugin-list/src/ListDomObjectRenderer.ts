import { NodeRenderer } from '../../plugin-renderer/src/NodeRenderer';
import { ListNode, ListType } from './ListNode';
import {
    DomObjectRenderingEngine,
    DomObject,
    DomObjectElement,
} from '../../plugin-renderer-dom-object/src/DomObjectRenderingEngine';

import '../assets/checklist.css';
import { VNode } from '../../core/src/VNodes/VNode';
import { VRange } from '../../core/src/VRange';
import { ListItemAttributes } from './ListItemXmlDomParser';
import { RenderingEngineWorker } from '../../plugin-renderer/src/RenderingEngineCache';
import { List } from './List';

export class ListDomObjectRenderer extends NodeRenderer<DomObject> {
    static id = DomObjectRenderingEngine.id;
    engine: DomObjectRenderingEngine;
    predicate = ListNode;

    async render(listNode: ListNode, worker: RenderingEngineWorker<DomObject>): Promise<DomObject> {
        const list: DomObjectElement = {
            tag: listNode.listType === ListType.ORDERED ? 'OL' : 'UL',
            children: [],
        };
        if (ListNode.CHECKLIST(listNode)) {
            list.attributes = { class: new Set(['checklist']) };
        }
        const children = listNode.children();
        const domObjects = await worker.render(children);
        for (const index in children) {
            list.children.push(
                this._renderLi(listNode, children[index], domObjects[index], worker),
            );
        }
        return list;
    }
    private _renderLi(
        listNode: ListNode,
        listItem: VNode,
        rendering: DomObject,
        worker: RenderingEngineWorker<DomObject>,
    ): DomObject {
        let li: DomObjectElement;
        // The node was wrapped in a "LI" but needs to be rendered as well.
        if (
            'tag' in rendering &&
            (rendering.tag === 'P' || rendering.tag === 'DIV') &&
            !rendering.shadowRoot
        ) {
            // Direct ListNode's TagNode children "P" are rendered as "LI"
            // while other nodes will be rendered inside the "LI".
            li = rendering;
            li.tag = 'LI';
        } else if ('dom' in rendering && rendering.dom[0].nodeName === 'LI') {
            // If there is no child-specific renderer, the default renderer
            // is used. This takes the result of the Dom renderer which
            // itself wrap the children in LI.
            rendering.dom = [...rendering.dom[0].childNodes];
            li = {
                tag: 'LI',
                children: [rendering],
            };
            // Mark as origin. If the listItem or the listNode change, the other are invalidate.
            worker.depends(listItem, li);
            worker.depends(li, listItem);
        } else {
            li = {
                tag: 'LI',
                children: [listItem],
            };
            // Mark as dependent. If the listItem change, the listNode are invalidate. But if the
            // list change, the listItem will not invalidate.
            worker.depends(li, listItem);
        }

        worker.depends(li, listNode);
        worker.depends(listNode, li);

        // Render the node's attributes that were stored on the technical key
        // that specifies those attributes belong on the list item.
        this.engine.renderAttributes(ListItemAttributes, listItem, li, worker);

        if (listNode.listType === ListType.ORDERED) {
            // Adapt numbering to skip previous list item
            // Source: https://stackoverflow.com/a/12860083
            const previousIdentedList = listItem.previousSibling();
            if (previousIdentedList instanceof ListNode) {
                const previousLis = previousIdentedList.previousSiblings(
                    sibling => !(sibling instanceof ListNode),
                );
                const value = Math.max(previousLis.length, 1) + 1;
                li.attributes.value = value.toString();
            }
        }

        if (listItem instanceof ListNode) {
            const style = li.attributes.style || {};
            if (!style['list-style']) {
                style['list-style'] = 'none';
            }
            li.attributes.style = style;

            if (ListNode.CHECKLIST(listItem)) {
                const prev = listItem.previousSibling();
                if (prev && !ListNode.CHECKLIST(prev)) {
                    // Add dependencie to check/uncheck with previous checklist item used as title.
                    worker.depends(prev, listItem);
                    worker.depends(listItem, prev);
                }
            }
        } else if (ListNode.CHECKLIST(listNode)) {
            // Add dependencie because the modifier on the listItem change the li rendering.
            worker.depends(li, listItem);
            worker.depends(listItem, listNode);

            const className = ListNode.isChecked(listItem) ? 'checked' : 'unchecked';
            if (li.attributes.class) {
                li.attributes.class.add(className);
            } else {
                li.attributes.class = new Set([className]);
            }

            // Handle click in the checkbox.
            const handlerMouseDown = (ev: MouseEvent): void => {
                if (ev.offsetX < 0) {
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                    this.engine.editor.execWithRange<List>(
                        VRange.at(listItem.firstChild() || listItem),
                        'toggleChecked',
                    );
                }
            };
            li.attach = (el: HTMLElement): void => {
                el.addEventListener('mousedown', handlerMouseDown);
            };
            li.detach = (el: HTMLElement): void => {
                el.removeEventListener('mousedown', handlerMouseDown);
            };
        }

        return li;
    }
}
