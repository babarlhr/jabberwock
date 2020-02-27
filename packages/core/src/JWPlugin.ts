import JWEditor from './JWEditor';
import { CommandIdentifier, CommandDefinition, CommandHook } from './Dispatcher';
import { Shortcut } from './JWEditor';
import { RendererConstructor, RenderingEngineConstructor } from './RenderingEngine';
import { ParserConstructor, ParsingEngineConstructor } from './ParsingEngine';
import { Constructor } from '../../utils/src/utils';

export interface JWPluginConfig {
    name?: string;
}
interface JWPluginConstructor {
    new <T extends Constructor<JWPlugin>>(...args: ConstructorParameters<T>): this;
}
export interface JWPlugin {
    constructor: JWPluginConstructor & this;
}
export class JWPlugin {
    static readonly dependencies: Array<typeof JWPlugin> = [];
    readonly parsingEngines: ParsingEngineConstructor[];
    readonly parsers: ParserConstructor[];
    readonly renderingEngines: RenderingEngineConstructor[] = [];
    readonly renderers: RendererConstructor[];
    name: string;
    editor: JWEditor;
    commands: Record<CommandIdentifier, CommandDefinition> = {};
    commandHooks: Record<CommandIdentifier, CommandHook> = {};
    shortcuts: Shortcut[];

    constructor(editor: JWEditor, options: JWPluginConfig = {}) {
        this.editor = editor;
        // by default the name is that of its constructor (eg.: 'JWPlugin')
        // todo: namespace
        this.name = options.name || this.constructor.name;
    }

    /**
     * Start the plugin. Called when the editor starts.
     */
    async start(): Promise<void> {
        // This is where plugins can do asynchronous work when the editor is
        // starting (e.g. retrieve data from a server, render stuff, etc).
    }

    /**
     * Stop the plugin. Called when the editor stops.
     */
    async stop(): Promise<void> {
        // This is where plugins can do asynchronous work when the editor is
        // stopping (e.g. save on a server, close connections, etc).
    }
}
