type ArrayChangeListener<T> = (event: string, items: T[]) => void
type ValidationFunction<T> = (item: T) => boolean

type CustomArrayMethods<T> = {
    /**
     * Batch push items into the array.
     * @param {T[]} itemsToPush - An array of items to push into the array.
     */
    batchPush: (itemsToPush: T[]) => void

    /**
     * Search the array using a query function.
     * @param {(item: T) => boolean} queryFn - A function that returns true if the item matches the query.
     * @returns {T[]} An array of matched items.
     */
    search: (queryFn: (item: T) => boolean) => T[]

    /**
     * Set a validation function to filter items.
     * @param {ValidationFunction<T>} fn - A function that returns true if the item is valid.
     */
    setValidation: (fn: ValidationFunction<T>) => void

    /**
     * Serialize the current array into a JSON string.
     * @returns {string} A JSON string representation of the array.
     */
    serialize: () => string

    /**
     * Deserialize a JSON string into the current array.
     * @param {string} jsonString - The JSON string to deserialize into the array.
     */
    deserialize: (jsonString: string) => void

    /**
     * Retrieve a shallow copy of the items in the array.
     * @returns {T[]} A copy of the items in the array.
     */
    getItems: () => T[]
}

type LazyWrapper<T> = {
    [K in keyof ArrayActions<T>]: (...args: Parameters<ArrayActions<T>[K]>) => LazyWrapper<T>
} & {
    evaluate: () => T[]
}

type ArrayActions<T> = CustomArrayMethods<T> & {
    push: (...itemsToPush: T[]) => number
    pop: () => T | undefined
    shift: () => T | undefined
    unshift: (...itemsToUnshift: T[]) => number

    splice: (start: number, deleteCount?: number, ...addItems: T[]) => T[]
    reverse: () => T[]
    sort: (compareFn?: (a: T, b: T) => number) => T[]

    // Non-mutating methods
    includes: (value: T) => boolean
    indexOf: (value: T) => number
    lastIndexOf: (value: T) => number
    slice: (start?: number, end?: number) => T[]

    find: (
        predicate: (value: T, index: number, obj: T[]) => value is any,
        thisArg?: any
    ) => T | undefined
    findIndex: (predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any) => number
    every: (
        predicate: (value: T, index: number, array: T[]) => value is any,
        thisArg?: any
    ) => boolean
    some: (predicate: (value: T, index: number, array: T[]) => T) => boolean
    forEach: (callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any) => void

    filter: (predicate: (value: T, index: number, array: T[]) => any, thisArg?: any) => T[]
    reduce: (
        callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T,
        initialValue?: T
    ) => T

    reduceRight: (
        reducer: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T,
        initialValue?: any
    ) => T
    join: (separator?: string) => string
    concat: (...arrays: T[][]) => T[]
    fill: (value: T, start?: number, end?: number) => T[]
    copyWithin: (target: number, start: number, end?: number) => T[]
}

// History

type Checkpoint<T> = { label?: string; items: T[] }
type HistoryEntry<T> = { items: T[]; checkpoints: Checkpoint<T>[] }

/**
 * Type definition for managing and interacting with a history system.
 */
type HistoryActions<T> = {
    /**
     * Navigate to the previous state in history.
     * @example
     * historyActions.previous();
     */
    previous: () => T[]

    /**
     * Navigate to the next state in history.
     * @example
     * historyActions.next();
     */
    next: () => T[]

    /**
     * Clean the history by resetting it.
     * @example
     * historyActions.clean();
     */
    clean: () => void

    /**
     * Jump by a specified number of steps in the history.
     * @param number - The number of steps to jump.
     * @example
     * historyActions.jump(2);
     */
    jump: (number: number) => T[]

    /**
     * Go to a specific index in the history.
     * @param index - The index to go to.
     * @example
     * historyActions.goTo(5);
     */
    goTo: (index: number) => T[]

    /**
     * Save a checkpoint with an optional label.
     * @param label - Optional label for the checkpoint.
     * @example
     * historyActions.saveCheckpoint('before-change');
     */
    saveCheckpoint: (label?: string) => void

    /**
     * Restore a checkpoint by its label.
     * @param label - The label of the checkpoint to restore.
     * @example
     * historyActions.restoreCheckpoint('before-change');
     */
    restoreCheckpoint: (label: string) => void

        /**
     * Remove a checkpoint by its label.
     * @param label - The label of the checkpoint to remove.
     * @example
     * historyActions.removeCheckpoint('before-change');
     */
    removeCheckpoint: (label: string) => void

    /**
     * List all checkpoints.
     * @example
     * historyActions.listCheckpoints();
     */
    listCheckpoints: () => Checkpoint<T>[]

    /**
     * Convert the history to a JSON string.
     * @example
     * historyActions.toJSON();
     */
    toJSON: () => string

    /**
     * Convert the history to a CSV string with a given delimiter.
     * @param delimiter - The delimiter to use, defaults to a comma.
     * @example
     * historyActions.toCSV(';');
     */
    toCSV: (delimiter: string) => string

    /**
     * Import a serialized string to replace the current history.
     * @param serialized - The serialized string representing the history.
     * @example
     * historyActions.import(serializedHistory);
     */
    import: (serialized: string) => void

    /**
     * Limit the size of the history, removing older entries if necessary.
     * @param size - The maximum size for the history.
     * @example
     * historyActions.limit(10);
     */
    limit: (size: number) => void

    /**
     * Check if there are any changes in the current state compared to the history.
     * @example
     * historyActions.hasChanges();
     */
    hasChanges: () => boolean

    /**
     * Subscribe a listener to changes in the history.
     * @param listener - The listener function to notify when changes occur.
     * @example
     * historyActions.subscribe(listener);
     */
    subscribe: (listener: HistoryChangeListener) => void

    /**
     * Undo a specified number of changes, or one change if no number is provided.
     * @param times - The number of times to undo, defaults to 1.
     * @example
     * historyActions.undo(3);
     */
    undo: (times?: number) => void

    /**
     * Redo a specified number of changes, or one change if no number is provided.
     * @param times - The number of times to redo, defaults to 1.
     * @example
     * historyActions.redo(3);
     */
    redo: (times?: number) => void
}
type HistoryChangeListener = (action: string, history: any[]) => void // You can define a more specific type here if needed
