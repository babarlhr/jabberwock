import { describePlugin } from '../../utils/src/testUtils';
import { Align, AlignType } from '../src/Align';
import { BasicEditor } from '../../../bundles/BasicEditor';

/**
 * Return a function that takes an editor and executes the 'align' command with
 * the given type.
 *
 * @param type
 */
function align(type: AlignType) {
    return async function(editor: BasicEditor): Promise<void> {
        await editor.execCommand('align', { type: type });
    };
}

describePlugin(Align, async testEditor => {
    describe('align', () => {
        describe('left', async () => {
            it('should align left', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<p>ab</p><p>c[]d</p>',
                    stepFunction: align(AlignType.LEFT),
                    contentAfter: '<p>ab</p><p style="text-align: left;">c[]d</p>',
                });
            });
            it('should align several paragraphs left', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<p>a[b</p><p>c]d</p>',
                    stepFunction: align(AlignType.LEFT),
                    contentAfter:
                        '<p style="text-align: left;">a[b</p><p style="text-align: left;">c]d</p>',
                });
            });
            it('should left align a node within a right-aligned node', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<div style="text-align: right;"><p>ab</p><p>c[d]e</p></div>',
                    stepFunction: align(AlignType.LEFT),
                    contentAfter:
                        '<div style="text-align: right;"><p>ab</p><p style="text-align: left;">c[d]e</p></div>',
                });
            });
            it('should left align a node within a right-aligned node and a paragraph', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p>',
                    stepFunction: align(AlignType.LEFT),
                    contentAfter:
                        '<div style="text-align: right;"><p>ab</p><p style="text-align: left;">c[d</p></div><p style="text-align: left;">e]f</p>',
                });
            });
            it('should left align a node within a right-aligned node and a paragraph, with a center-aligned common ancestor', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: center;"><div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p></div>',
                    stepFunction: align(AlignType.LEFT),
                    contentAfter:
                        '<div style="text-align: center;"><div style="text-align: right;"><p>ab</p><p style="text-align: left;">c[d</p></div><p style="text-align: left;">e]f</p></div>',
                });
            });
            it('should left align a node within a right-aligned node and a paragraph, with a left-aligned common ancestor', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: left;"><div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p></div>',
                    stepFunction: align(AlignType.LEFT),
                    contentAfter:
                        '<div style="text-align: left;"><div style="text-align: right;"><p>ab</p><p style="text-align: left;">c[d</p></div><p>e]f</p></div>',
                });
            });
            it('should not left align a node that is already within a left-aligned node', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<div style="text-align: left;"><p>ab</p><p>c[d]e</p></div>',
                    stepFunction: align(AlignType.LEFT),
                    contentAfter: '<div style="text-align: left;"><p>ab</p><p>c[d]e</p></div>',
                });
            });
        });
        describe('center', async () => {
            it('should align center', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<p>ab</p><p>c[]d</p>',
                    stepFunction: align(AlignType.CENTER),
                    contentAfter: '<p>ab</p><p style="text-align: center;">c[]d</p>',
                });
            });
            it('should align several paragraphs center', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<p>a[b</p><p>c]d</p>',
                    stepFunction: align(AlignType.CENTER),
                    contentAfter:
                        '<p style="text-align: center;">a[b</p><p style="text-align: center;">c]d</p>',
                });
            });
            it('should center align a node within a right-aligned node', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<div style="text-align: right;"><p>ab</p><p>c[d]e</p></div>',
                    stepFunction: align(AlignType.CENTER),
                    contentAfter:
                        '<div style="text-align: right;"><p>ab</p><p style="text-align: center;">c[d]e</p></div>',
                });
            });
            it('should center align a node within a right-aligned node and a paragraph', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p>',
                    stepFunction: align(AlignType.CENTER),
                    contentAfter:
                        '<div style="text-align: right;"><p>ab</p><p style="text-align: center;">c[d</p></div><p style="text-align: center;">e]f</p>',
                });
            });
            it('should center align a node within a right-aligned node and a paragraph, with a left-aligned common ancestor', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: left;"><div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p></div>',
                    stepFunction: align(AlignType.CENTER),
                    contentAfter:
                        '<div style="text-align: left;"><div style="text-align: right;"><p>ab</p><p style="text-align: center;">c[d</p></div><p style="text-align: center;">e]f</p></div>',
                });
            });
            it('should center align a node within a right-aligned node and a paragraph, with a center-aligned common ancestor', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: center;"><div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p></div>',
                    stepFunction: align(AlignType.CENTER),
                    contentAfter:
                        '<div style="text-align: center;"><div style="text-align: right;"><p>ab</p><p style="text-align: center;">c[d</p></div><p>e]f</p></div>',
                });
            });
            it('should not center align a node that is already within a center-aligned node', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<div style="text-align: center;"><p>ab</p><p>c[d]e</p></div>',
                    stepFunction: align(AlignType.CENTER),
                    contentAfter: '<div style="text-align: center;"><p>ab</p><p>c[d]e</p></div>',
                });
            });
        });
        describe('right', async () => {
            it('should align right', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<p>ab</p><p>c[]d</p>',
                    stepFunction: align(AlignType.RIGHT),
                    contentAfter: '<p>ab</p><p style="text-align: right;">c[]d</p>',
                });
            });
            it('should align several paragraphs right', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<p>a[b</p><p>c]d</p>',
                    stepFunction: align(AlignType.RIGHT),
                    contentAfter:
                        '<p style="text-align: right;">a[b</p><p style="text-align: right;">c]d</p>',
                });
            });
            it('should right align a node within a center-aligned node', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<div style="text-align: center;"><p>ab</p><p>c[d]e</p></div>',
                    stepFunction: align(AlignType.RIGHT),
                    contentAfter:
                        '<div style="text-align: center;"><p>ab</p><p style="text-align: right;">c[d]e</p></div>',
                });
            });
            it('should right align a node within a center-aligned node and a paragraph', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: center;"><p>ab</p><p>c[d</p></div><p>e]f</p>',
                    stepFunction: align(AlignType.RIGHT),
                    contentAfter:
                        '<div style="text-align: center;"><p>ab</p><p style="text-align: right;">c[d</p></div><p style="text-align: right;">e]f</p>',
                });
            });
            it('should right align a node within a center-aligned node and a paragraph, with a justify-aligned common ancestor', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: justify;"><div style="text-align: center;"><p>ab</p><p>c[d</p></div><p>e]f</p></div>',
                    stepFunction: align(AlignType.RIGHT),
                    contentAfter:
                        '<div style="text-align: justify;"><div style="text-align: center;"><p>ab</p><p style="text-align: right;">c[d</p></div><p style="text-align: right;">e]f</p></div>',
                });
            });
            it('should right align a node within a center-aligned node and a paragraph, with a right-aligned common ancestor', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: right;"><div style="text-align: center;"><p>ab</p><p>c[d</p></div><p>e]f</p></div>',
                    stepFunction: align(AlignType.RIGHT),
                    contentAfter:
                        '<div style="text-align: right;"><div style="text-align: center;"><p>ab</p><p style="text-align: right;">c[d</p></div><p>e]f</p></div>',
                });
            });
            it('should not right align a node that is already within a right-aligned node', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<div style="text-align: right;"><p>ab</p><p>c[d]e</p></div>',
                    stepFunction: align(AlignType.RIGHT),
                    contentAfter: '<div style="text-align: right;"><p>ab</p><p>c[d]e</p></div>',
                });
            });
        });
        describe('justify', async () => {
            it('should align justify', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<p>ab</p><p>c[]d</p>',
                    stepFunction: align(AlignType.JUSTIFY),
                    contentAfter: '<p>ab</p><p style="text-align: justify;">c[]d</p>',
                });
            });
            it('should align several paragraphs justify', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<p>a[b</p><p>c]d</p>',
                    stepFunction: align(AlignType.JUSTIFY),
                    contentAfter:
                        '<p style="text-align: justify;">a[b</p><p style="text-align: justify;">c]d</p>',
                });
            });
            it('should justify align a node within a right-aligned node', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<div style="text-align: right;"><p>ab</p><p>c[d]e</p></div>',
                    stepFunction: align(AlignType.JUSTIFY),
                    contentAfter:
                        '<div style="text-align: right;"><p>ab</p><p style="text-align: justify;">c[d]e</p></div>',
                });
            });
            it('should justify align a node within a right-aligned node and a paragraph', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p>',
                    stepFunction: align(AlignType.JUSTIFY),
                    contentAfter:
                        '<div style="text-align: right;"><p>ab</p><p style="text-align: justify;">c[d</p></div><p style="text-align: justify;">e]f</p>',
                });
            });
            it('should justify align a node within a right-aligned node and a paragraph, with a center-aligned common ancestor', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: center;"><div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p></div>',
                    stepFunction: align(AlignType.JUSTIFY),
                    contentAfter:
                        '<div style="text-align: center;"><div style="text-align: right;"><p>ab</p><p style="text-align: justify;">c[d</p></div><p style="text-align: justify;">e]f</p></div>',
                });
            });
            it('should justify align a node within a right-aligned node and a paragraph, with a justify-aligned common ancestor', async () => {
                await testEditor(BasicEditor, {
                    contentBefore:
                        '<div style="text-align: justify;"><div style="text-align: right;"><p>ab</p><p>c[d</p></div><p>e]f</p></div>',
                    stepFunction: align(AlignType.JUSTIFY),
                    contentAfter:
                        '<div style="text-align: justify;"><div style="text-align: right;"><p>ab</p><p style="text-align: justify;">c[d</p></div><p>e]f</p></div>',
                });
            });
            it('should not justify align a node that is already within a justify-aligned node', async () => {
                await testEditor(BasicEditor, {
                    contentBefore: '<div style="text-align: justify;"><p>ab</p><p>c[d]e</p></div>',
                    stepFunction: align(AlignType.JUSTIFY),
                    contentAfter: '<div style="text-align: justify;"><p>ab</p><p>c[d]e</p></div>',
                });
            });
        });
    });
});