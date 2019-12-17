export const memoryProxyNotVersionableKey = Symbol('jabberwockMemoryNotVersionable');
export const memoryProxyPramsKey = Symbol('jabberwockMemoryParams');
export const removedItem = Symbol('jabberwockMemoryRemovedItem');

export function NotVersionableErrorMessage(): void {
    throw new Error(
        'You can only link to the memory the instance of VersionableObject, VersionableArray or VersionableSet.' +
            "\nIf that's not possible, then you can also use makeVersionable method on your custom object." +
            '\nIf you do not want to make versionable this object, indicate it using MarkNotVersionable method' +
            '\nPlease read the Jabberwock documentation.',
    );
}
export function VersionableAllreadyVersionableErrorMessage(): void {
    throw new Error('This object was already update and a proxy was create to be versionable.');
}
export function FroozenErrorMessage(): void {
    throw new Error('Can not update a memory version who content memory dependencies');
}