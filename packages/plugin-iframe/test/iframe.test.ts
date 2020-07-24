import { expect } from 'chai';
import JWEditor from '../../core/src/JWEditor';
import { Char } from '../../plugin-char/src/Char';
import { DomLayout } from '../../plugin-dom-layout/src/DomLayout';
import { DomEditable } from '../../plugin-dom-editable/src/DomEditable';
import {
    setSelection,
    nextTick,
    triggerEvent,
} from '../../plugin-dom-editable/test/eventNormalizerUtils';
import { LineBreak } from '../../plugin-linebreak/src/LineBreak';
import { Iframe } from '../src/Iframe';
import { VNode } from '../../core/src/VNodes/VNode';
import { Parser } from '../../plugin-parser/src/Parser';
import { VElement } from '../../core/src/VNodes/VElement';
import { IframeNode } from '../src/IframeNode';
import { CharNode } from '../../plugin-char/src/CharNode';
import { Html } from '../../plugin-html/src/Html';
import { MetadataNode } from '../../plugin-metadata/src/MetadataNode';
import { Metadata } from '../../plugin-metadata/src/Metadata';
import { Attributes } from '../../plugin-xml/src/Attributes';
import { parseEditable } from '../../utils/src/configuration';

function waitIframeLoading(): Promise<void> {
    return new Promise(r => setTimeout(r, 5));
}

const container = document.createElement('div');
container.classList.add('container');
const section = document.createElement('section');

describe('Iframe', async () => {
    beforeEach(() => {
        document.body.appendChild(container);
        container.appendChild(section);
        section.innerHTML = '<p>abc</p><p>def</p>';
    });
    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = '';
        section.innerHTML = '';
    });

    describe('parse', async () => {
        describe('parse text/html', async () => {
            it('should parse a template with <t-iframe>', async () => {
                const editor = new JWEditor();
                editor.load(Html);
                editor.load(Char);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const template = '<div><t-iframe></t-iframe><t t-zone="default"/></div>';
                const nodes = await editor.plugins.get(Parser).parse('text/html', template);
                const node = nodes[0];

                await editor.stop();

                expect(node.is(VElement) && node.htmlTag).to.equal('DIV');
                const iframe = node.firstChild();
                expect(iframe.is(IframeNode)).to.equal(true);
                expect(iframe.firstChild()).to.equal(undefined);
            });
            it('should parse a template with <t-iframe> which have content', async () => {
                const editor = new JWEditor();
                editor.load(Html);
                editor.load(Char);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const template =
                    '<div><t-iframe><section>aaa</section></t-iframe><t t-zone="default"/></div>';
                const nodes = await editor.plugins.get(Parser).parse('text/html', template);
                const node = nodes[0];

                await editor.stop();

                const iframe = node.firstChild();
                const section = iframe.firstChild();
                expect(section.is(VElement) && section.htmlTag).to.equal('SECTION');
                expect(section.firstChild().is(CharNode)).to.equal(true);
            });
            it('should parse a template with <t-iframe> with style tag', async () => {
                const editor = new JWEditor();
                editor.load(Html);
                editor.load(Char);
                editor.load(Metadata);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const template =
                    '<div><t-iframe><style>* { color: red; }</style><section>aaa</section></t-iframe><t t-zone="default"/></div>';
                const nodes = await editor.plugins.get(Parser).parse('text/html', template);
                const node = nodes[0];

                await editor.stop();

                const iframe = node.firstChild() as IframeNode;
                const style = iframe.childVNodes[0];
                expect(style.is(MetadataNode) && style.htmlTag).to.equal('STYLE');
                expect(style.is(MetadataNode) && style.contents).to.equal('* { color: red; }');
                const section = iframe.firstChild();
                expect(section.is(VElement) && section.htmlTag).to.equal('SECTION');
            });
            it('should parse a template with <t-iframe> with link tag', async () => {
                const editor = new JWEditor();
                editor.load(Html);
                editor.load(Char);
                editor.load(Metadata);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const template =
                    '<div><t-iframe>' +
                    '<link rel="stylesheet" href="#href1"/>' +
                    '<link rel="stylesheet" href="#href2"/>' +
                    '<link rel="help" href="/help/"/>' +
                    '<section>aaa</section></t-iframe><t t-zone="default"/>' +
                    '</div>';
                const nodes = await editor.plugins.get(Parser).parse('text/html', template);
                const node = nodes[0];

                await editor.stop();

                const iframe = node.firstChild() as IframeNode;
                const link = iframe.childVNodes[0];
                expect(link.is(MetadataNode) && link.htmlTag).to.equal('LINK');

                expect(link.modifiers.find(Attributes).name).to.equal(
                    '{rel: "stylesheet", href: "#href1"}',
                );
                const link2 = iframe.childVNodes[1];
                expect(link2.is(MetadataNode) && link2.htmlTag).to.equal('LINK');
                expect(link2.modifiers.find(Attributes).name).to.equal(
                    '{rel: "stylesheet", href: "#href2"}',
                );
                const link3 = iframe.childVNodes[2];
                expect(link3.is(MetadataNode) && link3.htmlTag).to.equal('LINK');
                expect(link3.modifiers.find(Attributes).name).to.equal(
                    '{rel: "help", href: "/help/"}',
                );
                const section = iframe.firstChild();
                expect(section.is(VElement) && section.htmlTag).to.equal('SECTION');
            });
            it('should parse a template with <t-iframe> with style and link tag', async () => {
                const editor = new JWEditor();
                editor.load(Html);
                editor.load(Char);
                editor.load(Metadata);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const template =
                    '<div><t-iframe>' +
                    '<link rel="stylesheet" href="#href1"/>' +
                    '<style>* { color: red; }</style>' +
                    '<link rel="stylesheet" href="#href2"/>' +
                    '<section>aaa</section></t-iframe><t t-zone="default"/>' +
                    '</div>';
                const nodes = await editor.plugins.get(Parser).parse('text/html', template);
                const node = nodes[0];

                await editor.stop();

                const iframe = node.firstChild() as IframeNode;
                const link = iframe.childVNodes[0];
                expect(link.is(MetadataNode) && link.htmlTag).to.equal('LINK');
                expect(link.modifiers.find(Attributes).name).to.equal(
                    '{rel: "stylesheet", href: "#href1"}',
                );
                const style = iframe.childVNodes[1];
                expect(style.is(MetadataNode) && style.htmlTag).to.equal('STYLE');
                expect(style.is(MetadataNode) && style.contents).to.equal('* { color: red; }');
                const link2 = iframe.childVNodes[2];
                expect(link2.is(MetadataNode) && link2.htmlTag).to.equal('LINK');
                expect(link2.modifiers.find(Attributes).name).to.equal(
                    '{rel: "stylesheet", href: "#href2"}',
                );
                const section = iframe.firstChild();
                expect(section.is(VElement) && section.htmlTag).to.equal('SECTION');
            });
        });
        describe('parse dom/html', async () => {
            it('should parse a HtmlDocument with iframe container not appended in the body', async () => {
                const editor = new JWEditor();
                editor.load(Char);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const domDiv = document.createElement('div');
                const domIframe = document.createElement('iframe');
                domDiv.appendChild(domIframe);

                const nodes = await editor.plugins.get(Parser).parse('dom/html', domDiv);
                const node = nodes[0];

                await editor.stop();

                expect(node.is(VElement) && node.htmlTag).to.equal('DIV');
                const iframe = node.firstChild();
                expect(iframe.is(IframeNode)).to.equal(true);
                expect(iframe.firstChild()).to.equal(undefined);
            });
            it('should parse a HtmlDocument with iframe container', async () => {
                const editor = new JWEditor();
                editor.load(Char);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const domDiv = document.createElement('div');
                const domIframe = document.createElement('iframe');
                domDiv.appendChild(domIframe);
                container.appendChild(domDiv);
                await waitIframeLoading();

                const nodes = await editor.plugins.get(Parser).parse('dom/html', domDiv);
                const node = nodes[0];

                await editor.stop();

                expect(node.is(VElement) && node.htmlTag).to.equal('DIV');
                const iframe = node.firstChild();
                expect(iframe.is(IframeNode)).to.equal(true);
                expect(iframe.firstChild()).to.equal(undefined);
            });
            it('should parse a HtmlDocument with iframe which have content', async () => {
                const editor = new JWEditor();
                editor.load(Char);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const domDiv = document.createElement('div');
                const domIframe = document.createElement('iframe');
                domDiv.appendChild(domIframe);
                container.appendChild(domDiv);
                await waitIframeLoading();
                const iframeRoot = domIframe.contentWindow.document.body;

                const domSection = document.createElement('section');
                domSection.textContent = 'aaa';
                iframeRoot.appendChild(domSection);

                const nodes = await editor.plugins.get(Parser).parse('dom/html', domDiv);
                const node = nodes[0];

                await editor.stop();

                const iframe = node.firstChild();
                expect(iframe.is(IframeNode)).to.equal(true);
                const section = iframe.firstChild();
                expect(section.is(VElement) && section.htmlTag).to.equal('SECTION');
                expect(section.firstChild().is(CharNode)).to.equal(true);
            });
            it('should parse a HtmlDocument with iframe container with style tag', async () => {
                const editor = new JWEditor();
                editor.load(Char);
                editor.load(Metadata);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const domDiv = document.createElement('div');
                const domIframe = document.createElement('iframe');
                domDiv.appendChild(domIframe);
                container.appendChild(domDiv);
                await waitIframeLoading();
                const iframeRoot = domIframe.contentWindow.document.body;

                const domStyle = document.createElement('style');
                domStyle.textContent = '* { color: red; }';
                iframeRoot.appendChild(domStyle);
                const domSection = document.createElement('section');
                iframeRoot.appendChild(domSection);

                const nodes = await editor.plugins.get(Parser).parse('dom/html', domDiv);
                const node = nodes[0];

                await editor.stop();

                const iframe = node.firstChild() as IframeNode;
                const style = iframe.childVNodes[0];
                expect(style.is(MetadataNode) && style.htmlTag).to.equal('STYLE');
                expect(style.is(MetadataNode) && style.contents).to.equal('* { color: red; }');
                const section = iframe.firstChild();
                expect(section.is(VElement) && section.htmlTag).to.equal('SECTION');
            });
            it('should parse a HtmlDocument with iframe container with link tag', async () => {
                const editor = new JWEditor();
                editor.load(Char);
                editor.load(Metadata);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const domDiv = document.createElement('div');
                const domIframe = document.createElement('iframe');
                domDiv.appendChild(domIframe);
                container.appendChild(domDiv);
                await waitIframeLoading();
                const iframeRoot = domIframe.contentWindow.document.body;

                const domLink = document.createElement('link');
                domLink.setAttribute('rel', 'stylesheet');
                domLink.setAttribute('href', '#href1');
                iframeRoot.appendChild(domLink);
                const domLink2 = document.createElement('link');
                domLink2.setAttribute('rel', 'stylesheet');
                domLink2.setAttribute('href', '#href2');
                iframeRoot.appendChild(domLink2);
                const domLink3 = document.createElement('link');
                domLink3.setAttribute('rel', 'help');
                domLink3.setAttribute('href', '/help/');
                iframeRoot.appendChild(domLink3);
                const domSection = document.createElement('section');
                iframeRoot.appendChild(domSection);

                const nodes = await editor.plugins.get(Parser).parse('dom/html', domDiv);
                const node = nodes[0];

                await editor.stop();

                const iframe = node.firstChild() as IframeNode;
                const link = iframe.childVNodes[0];
                expect(link.is(MetadataNode) && link.htmlTag).to.equal('LINK');
                expect(link.modifiers.find(Attributes).name).to.equal(
                    '{rel: "stylesheet", href: "#href1"}',
                );
                const link2 = iframe.childVNodes[1];
                expect(link2.is(MetadataNode) && link2.htmlTag).to.equal('LINK');
                expect(link2.modifiers.find(Attributes).name).to.equal(
                    '{rel: "stylesheet", href: "#href2"}',
                );
                const link3 = iframe.childVNodes[2];
                expect(link3.is(MetadataNode) && link3.htmlTag).to.equal('LINK');
                expect(link3.modifiers.find(Attributes).name).to.equal(
                    '{rel: "help", href: "/help/"}',
                );
                const section = iframe.firstChild();
                expect(section.is(VElement) && section.htmlTag).to.equal('SECTION');
            });
            it('should parse a HtmlDocument with iframe container with style and link tag', async () => {
                const editor = new JWEditor();
                editor.load(Char);
                editor.load(Metadata);
                editor.load(Html);
                editor.load(Iframe);
                await editor.start();

                const domDiv = document.createElement('div');
                const domIframe = document.createElement('iframe');
                domDiv.appendChild(domIframe);
                container.appendChild(domDiv);
                await waitIframeLoading();
                const iframeRoot = domIframe.contentWindow.document.body;

                const domLink = document.createElement('link');
                domLink.setAttribute('rel', 'stylesheet');
                domLink.setAttribute('href', '#href1');
                iframeRoot.appendChild(domLink);
                const domStyle = document.createElement('style');
                domStyle.textContent = '* { color: red; }';
                iframeRoot.appendChild(domStyle);
                const domLink2 = document.createElement('link');
                domLink2.setAttribute('rel', 'stylesheet');
                domLink2.setAttribute('href', '#href2');
                iframeRoot.appendChild(domLink2);
                const domSection = document.createElement('section');
                iframeRoot.appendChild(domSection);

                const nodes = await editor.plugins.get(Parser).parse('dom/html', domDiv);
                const node = nodes[0];

                await editor.stop();

                const iframe = node.firstChild() as IframeNode;
                const link = iframe.childVNodes[0];
                expect(link.is(MetadataNode) && link.htmlTag).to.equal('LINK');
                expect(link.modifiers.find(Attributes).name).to.equal(
                    '{rel: "stylesheet", href: "#href1"}',
                );
                const style = iframe.childVNodes[1];
                expect(style.is(MetadataNode) && style.htmlTag).to.equal('STYLE');
                expect(style.is(MetadataNode) && style.contents).to.equal('* { color: red; }');
                const link2 = iframe.childVNodes[2];
                expect(link2.is(MetadataNode) && link2.htmlTag).to.equal('LINK');
                expect(link2.modifiers.find(Attributes).name).to.equal(
                    '{rel: "stylesheet", href: "#href2"}',
                );
                const section = iframe.firstChild();
                expect(section.is(VElement) && section.htmlTag).to.equal('SECTION');
            });
        });
    });

    describe('render', async () => {
        it('mouse setRange (ubuntu chrome)', async () => {
            const editor = new JWEditor();
            editor.load(Html);
            editor.load(Char);
            editor.load(LineBreak);
            editor.load(Iframe);
            editor.load(DomEditable);
            editor.configure(DomLayout, {
                location: [section, 'replace'],
                components: [
                    {
                        id: 'editable',
                        render: async (editor: JWEditor): Promise<VNode[]> => {
                            const nodes = await parseEditable(editor, section);
                            const iframe = new IframeNode();
                            iframe.append(...nodes);
                            return [iframe];
                        },
                    },
                ],
                componentZones: [['editable', ['main']]],
            });
            section.innerHTML = '<p>a</p>';
            await editor.start();
            await waitIframeLoading();

            const doc = container.querySelector('iframe').contentWindow.document;
            const root = doc.querySelector('jw-iframe').shadowRoot;
            expect(root.innerHTML).to.equal('<section contenteditable="true"><p>a</p></section>');
            await editor.stop();
        });
    });

    describe('normalize editable events', async () => {
        it('mouse setRange (ubuntu chrome)', async () => {
            const editor = new JWEditor();
            editor.load(Html);
            editor.load(Char);
            editor.load(LineBreak);
            editor.load(Iframe);
            editor.load(DomEditable);
            editor.configure(DomLayout, {
                location: [section, 'replace'],
                components: [
                    {
                        id: 'editable',
                        render: async (editor: JWEditor): Promise<VNode[]> => {
                            const nodes = await parseEditable(editor, section);
                            const iframe = new IframeNode();
                            iframe.append(...nodes);
                            return [iframe];
                        },
                    },
                ],
                componentZones: [['editable', ['main']]],
            });
            section.innerHTML = '<p>a</p><p>b</p><p>c<br/><br/></p>';
            await editor.start();
            await waitIframeLoading();

            expect(
                !!editor.selection.anchor.ancestor(
                    node => node instanceof VElement && node.htmlTag === 'SECTION',
                ),
            ).to.equal(false);

            const doc = container.querySelector('iframe').contentWindow.document;
            const root = doc.querySelector('jw-iframe').shadowRoot;
            const editable = root.querySelector('section');
            const p1 = editable.firstChild;
            const text1 = p1.firstChild;
            const p2 = editable.childNodes[1];
            const text2 = p2.firstChild;
            await nextTick();

            triggerEvent(p1, 'mousedown', {
                button: 2,
                detail: 1,
                clientX: 10,
                clientY: 10,
            });
            setSelection(text1, 1, text1, 1);
            setSelection(text1, 1, text2, 1);
            triggerEvent(p2, 'click', { button: 2, detail: 0, clientX: 10, clientY: 25 });
            triggerEvent(p2, 'mouseup', { button: 2, detail: 0, clientX: 10, clientY: 25 });
            await nextTick();
            await nextTick();

            const sectionNode = editor.selection.anchor.ancestor(
                node => node instanceof VElement && node.htmlTag === 'SECTION',
            );
            expect(!!sectionNode).to.equal(true);
            expect(editor.selection.anchor.previous()?.id).to.equal(
                sectionNode.firstDescendant(CharNode).id,
            );
            expect(editor.selection.focus.previous()?.id).to.equal(
                sectionNode.children()[1].firstChild().id,
            );
            await editor.stop();
        });
    });
});