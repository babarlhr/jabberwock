import { Component } from 'owl-framework';
import { Env } from 'owl-framework/src/component/component';

export class OwlUIComponent<Props, State> extends Component<Env, Props, State> {
    _storageKeyPrefix = 'OwlUI' + this.constructor.name + ':';
    localStorage: string[] = [];

    /**
     * Owl hook called exactly once before the initial rendering.
     */
    willStart(): Promise<void> {
        this._readState(localStorage, this.localStorage);
        return super.willStart();
    }

    /**
     * Called by the Owl state observer every time the state changes.
     *
     * @param force see Owl Component
     */
    render(force = false): Promise<void> {
        this._writeState(localStorage, this.localStorage);
        return super.render(force);
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Read the given storable state items from the given storage.
     *
     * @param storage from which to read the state items
     * @param storableItems names of the state items to read from storage
     */
    _readState(storage: Storage, storableItems: string[]): void {
        storableItems.forEach(itemName => {
            const storageKey = this._storageKeyPrefix + itemName;
            const value = storage.getItem(storageKey);

            // The value of items that were not yet set in storage is null.
            if (value !== null) {
                // Otherwise, the value was stored as a string in the storage.
                // Convert it to the type of the default value for the state.
                try {
                    this.state[itemName] = JSON.parse(value);
                } catch (e) {
                    // Stored item is not parseable. Keep the default value.
                    console.warn(
                        `Storage: Ignoring state.${itemName} stored value.\n` +
                            `${e.name}: ${e.message}\n` +
                            `Stored value: ${value}`,
                    );
                }
            }
        });
    }

    /**
     * write the given storable state items to the given storage.
     *
     * @param storage to write the state items to
     * @param storableItems names of the state items to write to storage
     */
    _writeState(storage: Storage, storableItems: string[]): void {
        storableItems.forEach(itemName => {
            const storageKey = this._storageKeyPrefix + itemName;
            // Storage require items to be stored as strings.
            try {
                const serializedValue = JSON.stringify(this.state[itemName]);
                storage.setItem(storageKey, serializedValue);
            } catch (e) {
                // State item is not serializable. Skip storing it.
                console.warn(
                    `Storage: Unserializable state.${itemName} value.\n` +
                        `${e.name}: ${e.message}`,
                );
            }
        });
    }
}
