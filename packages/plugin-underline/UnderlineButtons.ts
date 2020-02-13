import JWEditor, { Button } from '../core/src/JWEditor';
import { UnderlineFormat } from './UnderlineFormat';
import { FormatParams } from '../plugin-inline/Inline';

export const UnderlineButton: Button = {
    title: 'Toggle underline',
    class: 'fa-underline',
    commandId: 'toggleFormat',
    commandArgs: { FormatClass: UnderlineFormat } as FormatParams,
    selected: async (editor: JWEditor): Promise<boolean> =>
        editor.execCommand('query.isAllFormat', { FormatClass: UnderlineFormat }),
};
