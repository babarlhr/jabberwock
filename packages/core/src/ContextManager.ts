import { VNode } from './VNodes/VNode';
import { CommandDefinition } from './Dispatcher';
import JWEditor from './JWEditor';

export class ContextManager {
    editor: JWEditor;

    constructor(editor: JWEditor) {
        this.editor = editor;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Match a command from the current context (the `vDocument` selection).
     *
     * Search through all command with `commandId` and return the last
     * `CommandDefinition` that match a particular context.
     *
     * Commands with more specificity will have priority.  If there is multiples
     * commands with the same specificity, the last defined will be retured.
     *
     * The context is the `vDocument.selection.range.start.ancestors()`.
     *
     * Specificity is defined with:
     * - `lvl2`: if the last predicate of a command "a" is deeper in the tree
     *   than the last predicate of a command "b"; command "a" have more
     *   specificity
     * - `lvl1`: if two or more commands have the same `lvl2` specificity; the
     *   command with predicates with higher length will have more specificity
     * - `lvl0`: if the command has no predicates, there is no specificity
     *
     * For example:
     * ```typescript
     * const commandUlP: CommandDefinition = {
     *     predicates: [isUl, isP],
     *     callback: () =>{},
     * }
     * const commandP: CommandDefinition = {
     *     predicates: [isP],
     *     callback: () =>{},
     * }
     * const commandUl: CommandDefinition = {
     *     predicates: [isUl],
     *     callback: () =>{},
     * }
     * const commandImage: CommandDefinition = {
     *     predicates: [isImage],
     *     callback: () =>{},
     * }
     * const commandAny: CommandDefinition = {
     *     predicates: [],
     *     callback: () =>{},
     * }
     * dispatcher.registerCommand('command', commandUlP)
     * dispatcher.registerCommand('command', commandP)
     * dispatcher.registerCommand('command', commandUl)
     * dispatcher.registerCommand('command', commandImage)
     * dispatcher.registerCommand('command', commandAny)
     * const result = dispatcher._mach('command')
     * ```
     *
     * If the document looks like:
     * ```html
     * <ul>
     *     <li>
     *         <!-- The char "[]" represent the collapsed selection -->
     *         <p>[]a</p>
     *     </li>
     * </ul>
     * ```
     *
     * The ancestors list is `['ul', 'li', 'p']`.
     *
     * The 4 command `commandUlP`, `commandP`, `commandUl`, `commandAny` could
     * match the `command` identifier but not `commandImage`.
     *
     * The priority is calculated with "`lvl2`,`lvl1`".
     * - `commandUlP` specificity: 2,2 `lvl2`: 2 means the last predicate
     *   (`isP`) is found at index 2 in ancestors `lvl1`: 2 means there is 2
     *   predicates in `commandUlP`
     * - `commandP` specificity: 2,1 `lvl2`: 2 means the last predicate (`isP`)
     *   is found at index 2 in ancestors `lvl1`: 1 means there is 1 predicates
     *   in `commandP`
     * - `commandUl` specificity: 0,1 `lvl0`: 0 means the last predicate
     *   (`isUl`) is found at index 0 in ancestors `lvl1`: 1 means there is 1
     *   predicates in `commandP`
     * - `commandAny` specificity: -1,0 No predicates means no specificity.
     *   `lvl0`: -1 means it has no index.  `lvl1`: 0 means there is 0
     *   predicates in `commandAny`
     *
     * The result will be `commandUlP` because it has the highest specificity.
     *
     * @param commandId
     */
    match(commands: CommandDefinition[]): CommandDefinition | undefined {
        let currentMaxFirstMatchDepth = -1;
        let currentMaxLength = 0;
        let currentCommand;

        let ancestors: VNode[] = [];
        if (this.editor.vDocument) {
            ancestors = this.editor.vDocument.selection.range.start.ancestors();
        }
        const maximumDepth = ancestors.length - 1;
        for (const command of commands) {
            const predicates = command.predicates || [];
            let firstMatchDepth = -1;
            let ancestorIndex = 0;
            let match;
            if (predicates.length === 0) {
                match = true;
            } else {
                for (const predicate of [...predicates].reverse()) {
                    match = false;
                    while (!match && ancestorIndex < ancestors.length) {
                        if (ancestors[ancestorIndex].test(predicate)) {
                            match = true;
                            if (firstMatchDepth === -1) {
                                // Deeper match has higher specificity. So lower
                                // index in ancestors, means higher specificity.
                                firstMatchDepth = maximumDepth - ancestorIndex;
                            }
                        }
                        ancestorIndex++;
                    }
                    // Stop checking the predicates of this particular command
                    // since at least one of them don't match the context.
                    if (!match) break;
                }
            }

            if (
                match &&
                currentMaxFirstMatchDepth <= firstMatchDepth &&
                currentMaxLength <= predicates.length
            ) {
                currentMaxFirstMatchDepth = firstMatchDepth;
                currentMaxLength = predicates.length;
                currentCommand = command;
            }
        }
        return currentCommand;
    }
}