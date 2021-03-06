import { RelativePosition } from '../../core/src/VNodes/VNode';
import { SeparatorNode } from '../../core/src/VNodes/SeparatorNode';

export class LineBreakNode extends SeparatorNode {
    get name(): string {
        return '↲';
    }

    //--------------------------------------------------------------------------
    // Lifecycle
    //--------------------------------------------------------------------------

    /**
     * Transform the given DOM location into its VDocument counterpart.
     *
     * @override
     * @param domNode DOM node corresponding to this VNode
     * @param offset The offset of the location in the given domNode
     */
    locate(domNode: Node, offset: number): [this, RelativePosition] {
        const location = super.locate(domNode, offset);
        // When clicking on a trailing line break, we need to target after the
        // line break. The DOM represents these as 2 <br> so this is a special
        // case.
        if (!this.nextSibling() && !domNode.nextSibling) {
            location[1] = RelativePosition.AFTER;
        }
        return location;
    }
}
