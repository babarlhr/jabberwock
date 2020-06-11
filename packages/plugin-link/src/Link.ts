import { JWPlugin, JWPluginConfig } from '../../core/src/JWPlugin';
import { Inline } from '../../plugin-inline/src/Inline';
import { LinkXmlDomParser } from './LinkXmlDomParser';
import { CommandParams } from '../../core/src/Dispatcher';
import { InlineNode } from '../../plugin-inline/src/InlineNode';
import { LinkFormat } from './LinkFormat';
import { Char } from '../../plugin-char/src/Char';
import { Modifiers } from '../../core/src/Modifiers';
import { VNode, Typeguard } from '../../core/src/VNodes/VNode';
import { AbstractNode } from '../../core/src/VNodes/AbstractNode';
import JWEditor, { Loadables } from '../../core/src/JWEditor';
import { Parser } from '../../plugin-parser/src/Parser';
import { Keymap } from '../../plugin-keymap/src/Keymap';
import { Layout } from '../../plugin-layout/src/Layout';
import linkForm from '../assets/LinkForm.xml';
import { OwlNode } from '../../plugin-owl/src/ui/OwlNode';
import { LinkComponent } from './components/LinkComponent';
import { Owl } from '../../plugin-owl/src/Owl';
import { ActionableNode } from '../../plugin-toolbar/src/ActionableNode';
import { Attributes } from '../../plugin-xml/src/Attributes';

export interface LinkParams extends CommandParams {
    label?: string;
    url?: string;
}

export class Link<T extends JWPluginConfig = JWPluginConfig> extends JWPlugin<T> {
    static isLink(node: VNode): node is InlineNode;
    static isLink(link: LinkFormat, node: VNode): node is InlineNode;
    static isLink(link: LinkFormat | VNode, node?: VNode): node is InlineNode {
        if (link instanceof AbstractNode) {
            node = link;
        }
        const format = node.is(InlineNode) && node.modifiers.find(LinkFormat);
        return link instanceof AbstractNode ? !!format : format === link;
    }
    static dependencies = [Inline];
    commands = {
        link: {
            handler: this.link,
        },
        unlink: {
            handler: this.unlink,
        },
    };
    readonly loadables: Loadables<Parser & Keymap & Layout & Owl> = {
        parsers: [LinkXmlDomParser],
        shortcuts: [
            {
                pattern: 'CTRL+K',
                selector: [(node: VNode): boolean => !Link.isLink(node)],
                commandId: 'link',
            },
            {
                pattern: 'CTRL+K',
                selector: [Link.isLink],
                commandId: 'unlink',
            },
        ],
        components: [
            {
                id: 'link',
                async render(): Promise<OwlNode[]> {
                    return [new OwlNode({ Component: LinkComponent, props: {} })];
                },
            },
            {
                id: 'LinkButton',
                async render(): Promise<ActionableNode[]> {
                    const button = new ActionableNode({
                        name: 'link',
                        label: 'Insert link',
                        commandId: 'link',
                        selected: (editor: JWEditor): boolean => {
                            const range = editor.selection.range;
                            const node = range.start.nextSibling() || range.start.previousSibling();
                            return node && node.is(InlineNode) && !!node.modifiers.find(LinkFormat);
                        },
                        modifiers: [new Attributes({ class: 'fas fa-link fa-fw' })],
                    });
                    return [button];
                },
            },
            {
                id: 'UnlinkButton',
                async render(): Promise<ActionableNode[]> {
                    const button = new ActionableNode({
                        name: 'unlink',
                        label: 'Remove italic',
                        commandId: 'unlink',
                        enabled: (editor: JWEditor): boolean => {
                            const range = editor.selection.range;
                            const node = range.start.nextSibling() || range.start.previousSibling();
                            return node && node.is(InlineNode) && !!node.modifiers.find(LinkFormat);
                        },
                        modifiers: [new Attributes({ class: 'fas fa-unlink fa-fw' })],
                    });
                    return [button];
                },
            },
        ],
        componentZones: [
            ['link', 'float'],
            ['LinkButton', 'actionables'],
            ['UnlinkButton', 'actionables'],
        ],
        owlTemplates: [linkForm],
    };

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    async link(params: LinkParams): Promise<void> {
        // If the url is undefined, ask the user to provide one.
        if (!params.url) {
            const layout = this.editor.plugins.get(Layout);
            await layout.remove('link');
            await layout.add('link');

            return this.editor.execCommand('show', { componentID: 'link' });
        }

        // Otherwise create a link and insert it.
        const link = new LinkFormat(params.url);
        return this.editor.execCommand<Char>('insertText', {
            text: params.label || link.url,
            formats: new Modifiers(link),
        });
    }
    unlink(params: LinkParams): void {
        const range = params.context.range;
        const node = range.start.previousSibling() || range.start.nextSibling();
        if (!node.is(InlineNode)) return;

        const link = node.modifiers.find(LinkFormat);
        if (!link) return;

        const sameLink: Typeguard<InlineNode> = Link.isLink.bind(Link, link);
        for (const inline of [node, ...node.adjacents(sameLink)]) {
            inline.modifiers.remove(link);
        }
    }
}
