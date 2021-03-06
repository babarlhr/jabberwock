import { describePlugin, unformat } from '../../utils/src/testUtils';
import JWEditor from '../../core/src/JWEditor';
import { Indent } from '../src/Indent';
import { VRange } from '../../core/src/VRange';
import { BasicEditor } from '../../bundle-basic-editor/BasicEditor';
import { Layout } from '../../plugin-layout/src/Layout';

const indent = async (editor: JWEditor): Promise<void> => {
    await editor.execCommand<Indent>('indent');
};
const outdent = async (editor: JWEditor): Promise<void> => {
    await editor.execCommand<Indent>('outdent');
};

describePlugin(Indent, testEditor => {
    describe('List', () => {
        describe('indent', () => {
            describe('with selection collapsed', () => {
                it('should indent the first element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a[]</li>
                        <li>b</li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li style="list-style: none;">
                            <ul>
                                <li>a[]</li>
                            </ul>
                        </li>
                        <li>b</li>
                    </ul>`),
                    });
                });
                it('should indent the last element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a</li>
                        <li>[]b</li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>[]b</li>
                            </ul>
                        </li>
                    </ul>`),
                    });
                });
                it('should indent multi-level', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>
                            a
                            <ul>
                                <li>[]b</li>
                            </ul>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>[]b</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                    });
                });
                it('should indent the last element of a list with proper with unordered list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ol>
                        <li>a</li>
                        <li>[]b</li>
                    </ol>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ol>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ol>
                                <li>[]b</li>
                            </ol>
                        </li>
                    </ol>`),
                    });
                });
                it('should indent the middle element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a</li>
                        <li>[]b</li>
                        <li>c</li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>[]b</li>
                            </ul>
                        </li>
                        <li>
                            c
                        </li>
                    </ul>`),
                    });
                });
                it('should indent even if the first element of a list is selected', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>[]a</li>
                        <li>b</li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li style="list-style: none;">
                            <ul>
                                <li>[]a</li>
                            </ul>
                        </li>
                        <li>b</li>
                    </ul>`),
                    });
                });
                it('should indent only one element of a list with sublist', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a</li>
                        <li>
                            []b
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>c</li>
                            </ul>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>[]b</li>
                                <li>c</li>
                            </ul>
                        </li>
                    </ul>`),
                    });
                });
                it('should convert mixed lists', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a</li>
                        <li>
                            []b
                        </li>
                        <li style="list-style: none;">
                            <ol>
                                <li>c</li>
                            </ol>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ol>
                                <li>[]b</li>
                                <li>c</li>
                            </ol>
                        </li>
                    </ul>`),
                    });
                });
                it('should rejoin after indent', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li style="list-style: none;">
                            <ol>
                                <li>a</li>
                            </ol>
                        </li>
                        <li>
                            []b
                        </li>
                        <li style="list-style: none;">
                            <ol>
                                <li>c</li>
                            </ol>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li style="list-style: none;">
                            <ol>
                                <li>a</li>
                                <li>[]b</li>
                                <li>c</li>
                            </ol>
                        </li>
                    </ul>`),
                    });
                });
            });
            describe('with selection', () => {
                it('should indent the first element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>[a]</li>
                        <li>b</li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li style="list-style: none;">
                            <ul>
                                <li>[a]</li>
                            </ul>
                        </li>
                        <li>b</li>
                    </ul>`),
                    });
                });
                it('should indent the middle element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a</li>
                        <li>[b]</li>
                        <li>c</li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>[b]</li>
                            </ul>
                        </li>
                        <li>
                            c
                        </li>
                    </ul>`),
                    });
                });
                it('should indent multi-level', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>[b]</li>
                            </ul>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>[b]</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                    });
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>[b]</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li style="list-style: none;">
                                    <ul>
                                        <li style="list-style: none;">
                                            <ul>
                                                <li>[b]</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                    });
                });
                it('should indent multi-level', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>
                            a
                            <ul>
                                <li>[b
                                    <ul>
                                        <li>c]</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>[b</li>
                                        <li style="list-style: none;">
                                            <ul>
                                                <li>c]</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                    });
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>[b
                                            <ul>
                                                <li>c]</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li style="list-style: none;">
                                    <ul>
                                        <li style="list-style: none;">
                                            <ul>
                                                <li>[b</li>
                                                <li style="list-style: none;">
                                                    <ul>
                                                        <li>c]</li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                    });
                });
                it('should indent multiples list item in the middle element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a</li>
                        <li>[b</li>
                        <li>c]</li>
                        <li>d</li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>[b</li>
                                <li>c]</li>
                            </ul>
                        </li>
                        <li>
                            d
                        </li>
                    </ul>`),
                    });
                });
                it('should indent multiples list item in the middle element of a list with sublist', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a</li>
                        <li>
                            [b
                            <ul>
                                <li>c</li>
                            </ul>
                        </li>
                        <li>d]</li>
                        <li>e</li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>
                                    [b
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>c</li>
                                    </ul>
                                </li>
                                <li>d]</li>
                            </ul>
                        </li>
                        <li>e</li>
                    </ul>`),
                    });
                });
                it('should indent with mixed lists', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                    <ul>
                        <li>a</li>
                        <li>
                            [b
                            <ol>
                                <li>]c</li>
                            </ol>
                        </li>
                    </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                    <ul>
                        <li>
                            a
                        </li>
                        <li style="list-style: none;">
                            <ul>
                                <li>
                                    [b
                                </li>
                                <li style="list-style: none;">
                                    <ol>
                                        <li>]c</li>
                                    </ol>
                                </li>
                            </ul>
                        </li>
                    </ul>`),
                    });
                });
                it('should indent nested list and list with elements in a upper level than the rangestart', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>a</li>
                                <li>
                                    b
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>c</li>
                                        <li>[d</li>
                                    </ul>
                                </li>
                                <li>
                                    e
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>f</li>
                                        <li>g</li>
                                    </ul>
                                </li>
                                <li>h]</li>
                                <li>i</li>
                            </ul>`),
                        stepFunction: indent,
                        contentAfter: unformat(`
                            <ul>
                                <li>a</li>
                                <li>
                                    b
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>
                                            c
                                        </li>
                                        <li style="list-style: none;">
                                            <ul>
                                                <li>[d</li>
                                            </ul>
                                        </li>
                                        <li>
                                        e
                                        </li>
                                        <li style="list-style: none;">
                                        <ul>
                                            <li>f</li>
                                            <li>g</li>
                                        </ul>
                                    </li>
                                    <li>h]</li>
                                    </ul>
                                </li>
                                <li>i</li>
                            </ul>`),
                    });
                });
            });
        });
        describe('outdent', () => {
            describe('with selection collapsed', () => {
                it('should outdent the last element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>
                                    a
                                    <ul>
                                        <li>[]b</li>
                                    </ul>
                                </li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>a</li>
                                <li>[]b</li>
                            </ul>`),
                    });
                });
                it('should outdent the last element of a list with proper with unordered list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ol>
                                <li>
                                    a
                                </li>
                                <li style="list-style: none;">
                                    <ol>
                                        <li>[]b</li>
                                    </ol>
                                </li>
                            </ol>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ol>
                                <li>a</li>
                                <li>[]b</li>
                            </ol>`),
                    });
                });
                it('should outdent the middle element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>
                                    a
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>[]b</li>
                                    </ul>
                                </li>
                                <li>
                                    c
                                </li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>a</li>
                                <li>[]b</li>
                                <li>c</li>
                            </ul>`),
                    });
                });
                it('should outdent if the first element of a list is selected', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>[]a</li>
                                <li>b</li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <p>[]a</p>
                            <ul>
                                <li>b</li>
                            </ul>`),
                    });
                });
                it('should outdent the last element of a list with sublist', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>
                                    a
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li style="list-style: none;">
                                            <ul>
                                                <li>[]c</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>
                                    a
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>[]c</li>
                                    </ul>
                                </li>
                            </ul>`),
                    });
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>
                                    a
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>[]c</li>
                                    </ul>
                                </li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>
                                    a
                                </li>
                                <li>[]c</li>
                            </ul>`),
                    });
                });
            });
            describe('with selection', () => {
                it('should outdent the middle element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>
                                    a
                                    <ul>
                                        <li>[b]</li>
                                    </ul>
                                </li>
                                <li>
                                    c
                                </li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>a</li>
                                <li>[b]</li>
                                <li>c</li>
                            </ul>`),
                    });
                });
                it('should inoutdentdent multiples list item in the middle element of a list', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>
                                    a
                                    <ul>
                                        <li>[b</li>
                                        <li>c]</li>
                                    </ul>
                                </li>
                                <li>
                                    d
                                </li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>a</li>
                                <li>[b</li>
                                <li>c]</li>
                                <li>d</li>
                            </ul>`),
                    });
                });
                it('should outdent multiples list item in the middle element of a list with sublist', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>
                                    a
                                    <ul>
                                        <li>
                                            [b
                                            <ul>
                                                <li>c</li>
                                            </ul>
                                        </li>
                                        <li>d]</li>
                                    </ul>
                                </li>
                                <li>e</li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>a</li>
                                <li>
                                    [b
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>c</li>
                                    </ul>
                                </li>
                                <li>d]</li>
                                <li>e</li>
                            </ul>`),
                    });
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>
                                    a
                                    <ul>
                                        <li>
                                            b
                                            <ul>
                                                <li>[c</li>
                                            </ul>
                                        </li>
                                        <li>d]</li>
                                    </ul>
                                </li>
                                <li>e</li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>
                                    a
                                </li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>b</li>
                                        <li>[c</li>
                                    </ul>
                                </li>
                                <li>d]</li>
                                <li>e</li>
                            </ul>`),
                    });
                });
                it('should outdent nested list and list with elements in a upper level than the rangestart', async () => {
                    await testEditor(BasicEditor, {
                        contentBefore: unformat(`
                            <ul>
                                <li>a</li>
                                <li>
                                    b
                                    <ul>
                                        <li>
                                            c
                                            <ul>
                                                <li>[d</li>
                                            </ul>
                                        </li>
                                        <li>
                                        e
                                        <ul>
                                            <li>f</li>
                                            <li>g</li>
                                        </ul>
                                    </li>
                                    <li>h]</li>
                                    </ul>
                                </li>
                                <li>i</li>
                            </ul>`),
                        stepFunction: outdent,
                        contentAfter: unformat(`
                            <ul>
                                <li>a</li>
                                <li>b</li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>c</li>
                                        <li>[d</li>
                                    </ul>
                                </li>
                                <li>e</li>
                                <li style="list-style: none;">
                                    <ul>
                                        <li>f</li>
                                        <li>g</li>
                                    </ul>
                                </li>
                                <li>h]</li>
                                <li>i</li>
                            </ul>`),
                    });
                });
            });
        });
    });
    describe('indent', () => {
        it('should insert tabulation when range is collapsed', async () => {
            await testEditor(BasicEditor, {
                contentBefore: '<p>[]a</p>',
                stepFunction: indent,
                contentAfter: '<p>\u2003[]a</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>a[]</p>',
                stepFunction: indent,
                contentAfter: '<p>a\u2003[]</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>a[]b</p>',
                stepFunction: indent,
                contentAfter: '<p>a\u2003[]b</p>',
            });
        });
        it('should replace text with tabulation when only one parent selected', async function() {
            await testEditor(BasicEditor, {
                contentBefore: '<p>a[b]</p>',
                stepFunction: indent,
                contentAfter: '<p>a\u2003[]</p>',
            });
        });
        it('should replace text with tabulations when selection in multiples lines', async function() {
            await testEditor(BasicEditor, {
                contentBefore: '<p>a[b<br/>c]d</p>',
                stepFunction: indent,
                contentAfter: '<p>\u2003a[b<br>\u2003c]d</p>',
            });
        });

        it('should indent with tabulations when multiples paragraph', async function() {
            await testEditor(BasicEditor, {
                contentBefore: '<p>a[b</p><p>cd</p><p>e]f</p>',
                stepFunction: indent,
                contentAfter: '<p>\u2003a[b</p>' + '<p>\u2003cd</p>' + '<p>\u2003e]f</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>a[b</p><p><br/></p><p>e]f</p>',
                stepFunction: indent,
                contentAfter: '<p>\u2003a[b</p>' + '<p>\u2003</p>' + '<p>\u2003e]f</p>',
            });
        });
        it('should indent with a fake range', async function() {
            await testEditor(BasicEditor, {
                contentBefore: 'ab<br>cd[]',
                stepFunction: async (editor: JWEditor) => {
                    const domEngine = editor.plugins.get(Layout).engines.dom;
                    const editable = domEngine.components.editable[0];
                    const bNode = editable.next(node => node.name === 'b');
                    const dNode = editable.next(node => node.name === 'd');
                    await editor.execWithRange<Indent>(VRange.selecting(bNode, dNode), 'indent');
                },
                contentAfter: '\u2003ab<br>\u2003cd[]',
            });
        });
    });
    describe('outdent', function() {
        it('should do nothing if no space at the beginning of line', async function() {
            await testEditor(BasicEditor, {
                contentBefore: '<p>a[]b<br>\u2003cd</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[]b<br>\u2003cd</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>a[]b</p><p>\u2003cd</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[]b</p><p>\u2003cd</p>',
            });
        });
        it('should outdent when only one parent selected', async function() {
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[]b</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[]b</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[]b</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[]b</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[b]</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[b]</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[b]</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[b]</p>',
            });
        });
        it('should outdent when selection in multiples lines', async function() {
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[b<br/>\u2003c]d</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[b<br>c]d</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[b<br/>\u2003c]d</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[b<br>c]d</p>',
            });
        });
        it('should outdent when selection in multiples paragraph', async function() {
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[b<br/>\u2003c]d</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[b<br>c]d</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[b<br/>\u2003c]d</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[b<br>c]d</p>',
            });
            await testEditor(BasicEditor, {
                contentBefore: '<p>\u2003a[b</p>' + '<p>\u2003</p>' + '<p>\u2003e]f</p>',
                stepFunction: outdent,
                contentAfter: '<p>a[b</p><p><br></p><p>e]f</p>',
            });
        });
        it('should outdent with a fake range', async function() {
            await testEditor(BasicEditor, {
                contentBefore: '\u2003ab<br>\u2003cd[]',
                stepFunction: async (editor: JWEditor) => {
                    const domEngine = editor.plugins.get(Layout).engines.dom;
                    const editable = domEngine.components.editable[0];
                    const bNode = editable.next(node => node.name === 'b');
                    const dNode = editable.next(node => node.name === 'd');
                    await editor.execWithRange<Indent>(VRange.selecting(bNode, dNode), 'outdent');
                },
                contentAfter: 'ab<br>cd[]',
            });
        });
    });
});
