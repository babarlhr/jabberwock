import JWEditor from './JWEditor';

export type CommandIdentifier = string;
export interface CommandDefinition {
    title?: string;
    description?: string;
    handler: CommandHandler;
}
export type CommandHandler = <T = {}>(args: CommandArgs) => T;
export interface CommandArgs {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export class Dispatcher {
    __nextHandlerTokenID = 0;
    editor: JWEditor;
    el: Element;
    commands: Record<CommandIdentifier, CommandDefinition[]> = {};

    constructor(editor: JWEditor) {
        this.editor = editor;
        this.el = editor.el;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Call all hooks registred for the command `id`.
     *
     * @param commandId The name of the command.
     * @param args The arguments of the command.
     */
    async dispatch<T = {}>(commandId: CommandIdentifier, args: CommandArgs = {}): Promise<T> {
        const commands = this.commands[commandId];
        if (commands) {
            for (const command of commands) {
                return await command.handler(args);
            }
        }
    }

    /**
     * Register all handlers declared in a plugin, and match them with their
     * corresponding command.
     *
     */
    registerCommand(id: CommandIdentifier, def: CommandDefinition): void {
        if (!this.commands[id]) {
            this.commands[id] = [def];
        } else {
            this.commands[id].push(def);
        }
    }
}
