import { Component } from '../../../lib/owl/dist/owl.js';
import { VNode } from '../../core/stores/VNode.js';

interface TreeNode {
    node: VNode
    level: number
    id: number
}

type Tree = TreeNode[];

export class TreeComponent extends Component<any, any, any> {
    tree: Tree
    __uniqueID = 0
    constructor (parent) {
        super(parent);
        this.tree = this._getFlatTree(parent.env.editor.vDocument.contents);
    }

    _getFlatTree (node: VNode, level = 0): Tree {
        let tree: Tree = [{
            node: node,
            level: level,
            id: this._uniqueID,
        }];
        level += 1;
        node.children.forEach((node: VNode) => {
            tree = tree.concat(this._getFlatTree(node, level));
        });
        return tree;
    }
    get _uniqueID (): number {
        let id = this.__uniqueID;
        this.__uniqueID += 1;
        return id;
    }
    // /* _bindEventToNode (node: VNode, element: Element): void {
    //     element.addEventListener('click', () => {
    //         this._updateInspectedNode(node);
    //     });
    // } */
    // _createElement (node: VNode): Element {
    //     let element: Element;
    //     const hasChildren: boolean = node.children.length > 0;
    //     const type:string = node.type && node.type.toLowerCase() || '?';
    //     if (node.type === VNodeType.CHAR) {
    //         element = document.createElement('span');
    //         element.appendChild(document.createTextNode(node.value));
    //         // this._bindEventToNode(node, element);
    //     } else {
    //         element = document.createElement('div');
    //         let openingTag: Element = document.createElement('span');
    //         const value: string = '<' + type + (hasChildren ? '>' : '/>');
    //         openingTag.appendChild(document.createTextNode(value));
    //         openingTag.setAttribute('class', 'element-name ' +
    //             (hasChildren ? 'opening' : 'self-closing'));
    //         element.appendChild(openingTag);
    //         // this._bindEventToNode(node, openingTag);
    //     }
    //     if (hasChildren) {
    //         let childrenDiv: Element = document.createElement('div');
    //         childrenDiv.setAttribute('class', 'children');
    //         node.children.slice().forEach(child => {
    //             childrenDiv.appendChild(this._createElement(child));
    //         });
    //         element.appendChild(childrenDiv);
    //         let closingTag: Element = document.createElement('span');
    //         let value: string = '</' + type + '>';
    //         closingTag.appendChild(document.createTextNode(value));
    //         closingTag.setAttribute('class', 'element-name closing');
    //         element.appendChild(closingTag);
    //     }
    //     return element;
    // }
    // _createTree (): Element {
    //     const root: VNode = this.env.editor.vDocument.contents;
    //     let div: Element = this._createElement(root);
    //     this.ui.main.appendChild(div);
    //     this._foldableElements();
    // }
    // _foldableElements (): void {
    //     const elements: Element [] = utils._collectionToArray(
    //         this.ui.main.querySelectorAll('.element-name')
    //     );
    //     elements.slice().forEach((element: HTMLElement) => {
    //         element.addEventListener('click', (event: MouseEvent) => {
    //             if (event.offsetX < 10) { // only toggle on click caret
    //                 this._toggleClass(element.parentElement, 'folded');
    //             }
    //         });
    //         this._toggleClass(element.parentElement, 'folded');
    //     });
    //     this.ui.toolbar.addEventListener('click', () => {
    //         this._toggleClass(this.ui.el, 'closed');
    //     });
    // }
}
