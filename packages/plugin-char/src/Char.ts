import { JWPlugin, JWPluginConfig } from '../../core/src/JWPlugin';
import { CharNode } from './CharNode';
import { CommandParams } from '../../core/src/Dispatcher';
import { Inline } from '../../plugin-inline/src/Inline';
import { CharDomObjectRenderer } from './CharDomObjectRenderer';
import { CharXmlDomParser } from './CharXmlDomParser';
import { Modifiers } from '../../core/src/Modifiers';
import { Loadables } from '../../core/src/JWEditor';
import { Parser } from '../../plugin-parser/src/Parser';
import { Renderer } from '../../plugin-renderer/src/Renderer';

export interface InsertTextParams extends CommandParams {
    text: string;
    select?: boolean;
    formats?: Modifiers;
}

export class Char<T extends JWPluginConfig = JWPluginConfig> extends JWPlugin<T> {
    static dependencies = [Inline];
    readonly loadables: Loadables<Parser & Renderer> = {
        parsers: [CharXmlDomParser],
        renderers: [CharDomObjectRenderer],
    };
    commands = {
        insertText: {
            handler: this.insertText,
        },
    };

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Insert text at the current position of the selection.
     *
     * If the selection is collapsed, add `text` to the vDocument and copy the
     * formating of the previous char or the next char.
     *
     * If the selection is not collapsed, replace the text with the formating
     * that was present in the selection.
     *
     * @param params
     */
    insertText(params: InsertTextParams): void {
        const range = params.context.range;
        const text = params.text;
        // Remove the contents of the range if needed.
        if (!range.isCollapsed()) {
            range.empty();
        }
        if (params.formats) {
            range.modifiers.set(...params.formats.map(format => format.clone()));
        }
        // Split the text into CHAR nodes and insert them at the range.
        const characters = text.split('');
        const charNodes = characters.map(char => {
            if (range.modifiers.length) {
                return new CharNode({ char: char, modifiers: range.modifiers.clone() });
            } else {
                return new CharNode({ char: char });
            }
        });
        charNodes.forEach(charNode => {
            range.start.before(charNode);
        });
        if (params.select && charNodes.length) {
            this.editor.selection.select(charNodes[0], charNodes[charNodes.length - 1]);
        }
        if (params.formats) {
            // Invalidate the cache.
            range.modifiers = undefined;
        }
    }
}
