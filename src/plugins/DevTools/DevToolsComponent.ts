import { TreeComponent } from './TreeComponent.js';
import { Component } from '../../../lib/owl/dist/owl.js';

////////////////////////////// todo: use API ///////////////////////////////////

export class DevToolsComponent extends Component<any, any, any> {
    components = { TreeComponent };
    template = 'devtools';

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    toggleOpen(event: Event): void {
        let target: Element = event.target as Element;
        while (target && !this._isRootElement(target)) {
            target = target.parentElement;
        }
        if (target) {
            this._toggleClass(target, 'closed');
        }
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    _isRootElement(element: Element): boolean {
        return element.tagName === 'JW-DEVTOOLS';
    }
    _toggleClass (element: Element, className: string): void {
            const currentClass: string = element.getAttribute('class') || '';
            if (currentClass.indexOf(className) !== -1) {
                const regex: RegExp = new RegExp('\\s*' + className + '\\s*');
                element.setAttribute('class', currentClass.replace(regex, ''));
            } else {
                element.setAttribute('class', currentClass + ' ' + className);
            }
        }
    }

    // constructor (env) {
    //     super(env);
    //     // this._updateInspectedNode(this.env.editor.vDocument.contents);

    // }

    // _addChildren (node: VNode): Element {
    //     let children: VNode [] = node.children.slice();
    //     let container: Element = document.createElement('ol');
    //     document.createElement('li').appendChild(container);
    //     while (children.length) {
    //         const child: VNode = children.shift();
    //         container.appendChild(this._addOne(child));
    //         if (child.children.length) {
    //             container.appendChild(this._addChildren(child));
    //         }
    //     }
    //     return container;
    // }
    // _addOne (node: VNode): Element {
    //     let li: Element = document.createElement('li');
    //     let contents: string = node.type;
    //     if (node.type === VNodeType.CHAR) {
    //         contents += ': "' + node.value + '"';
    //     }
    //     li.appendChild(document.createTextNode(contents));
    //     return li;
    // }
    // _getTypeInfo (node: VNode): string {
    //     if (!node.type) {
    //         return 'Unknown node type';
    //     }
    //     if (node.type === VNodeType.CHAR) {
    //         return node.type + ': "' + node.value + '"';
    //     }
    //     let typeInfo: string = node.type.toLowerCase().replace('_', ' ');
    //     return typeInfo.charAt(0).toUpperCase() + typeInfo.substring(1);
    // }
    // _updateInspectedNode (node: VNode) {
    //     this.state.currentNode = node;
    //     let typeContainer: Element = this.ui.about.querySelector('.type');
    //     typeContainer.innerHTML = this._getTypeInfo(node);
    //     this.ui.properties.innerHTML = '<div>Length: ' + node.length + '</div>';
    //     if (node.parent) {
    //         this.ui.properties.innerHTML += '<div>Parent: ' + node.parent.type + '</div>';
    //     }
    // }
}
