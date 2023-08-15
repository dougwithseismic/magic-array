/**
 * Function to create a magic array with various array manipulations, including history tracking.
 *
 * @param initialItems - The initial items of the array.
 * @param validationFn - An optional validation function to validate items.
 *
 * @example
 * const magicArray = createMagicArray([1, 2, 3], (item) => item > 2);
 * magicArray.push(4); // [1, 2, 3, 4]
 * magicArray.push(1) // [1, 2, 3] (1 is not greater than 2 so validation catches it)
 */

function magicArray<T>(initialItems: T[] = [], validationFn?: ValidationFunction<T>) {
    let items: T[] = [...initialItems]
    const history: HistoryEntry<T>[] = [{ items: [...items], checkpoints: [] }]
    let historyIndex = 0

    const listeners: ArrayChangeListener<T>[] = []

    const notifyListeners = (event: string) => {
        listeners.forEach((listener) => listener(event, [...items]))
    }

    const arrayActions: ArrayActions<T> = {
        batchPush: (itemsToPush: T[]) => {
            if (validationFn) {
                itemsToPush = itemsToPush.filter(validationFn)
            }
            items.push(...itemsToPush)
            notifyListeners('batchAdd')
        },
        search: (queryFn: (item: T) => boolean) => items.filter(queryFn),
        setValidation: (fn: ValidationFunction<T>) => {
            validationFn = fn
        },
        serialize: () => JSON.stringify(items),
        deserialize: (jsonString: string) => {
            try {
                items = JSON.parse(jsonString)
                notifyListeners('deserialize')
            } catch (e) {
                console.error('Deserialization failed:', e)
            }
        },

        push: (...itemsToPush: T[]) => {
            if (validationFn) {
                itemsToPush = itemsToPush.filter(validationFn)
            }
            items.push(...itemsToPush)
            notifyListeners('add')
            return items.length
        },
        pop: () => {
            const poppedItem = items.pop()
            notifyListeners('remove')
            return poppedItem
        },

        shift: () => {
            const shiftedItem = items.shift()
            notifyListeners('shift')
            return shiftedItem
        },
        unshift: (...itemsToUnshift: T[]) => {
            items.unshift(...itemsToUnshift)
            notifyListeners('unshift')
            return items.length
        },
        splice: (start: number, deleteCount?: number, ...addItems: T[]) => {
            const result = items.splice(start, deleteCount ?? items.length - start, ...addItems)
            notifyListeners('splice')
            return result
        },
        reverse: () => {
            items.reverse()
            notifyListeners('reverse')
            return items
        },
        sort: (compareFn?: (a: T, b: T) => number) => {
            items.sort(compareFn)
            notifyListeners('sort')
            return items
        },
        // Non-mutating methods
        includes: (value: T) => items.includes(value),
        indexOf: (value: T) => items.indexOf(value),
        lastIndexOf: (value: T) => items.lastIndexOf(value),
        slice: (start?: number, end?: number) => items.slice(start, end),
        find: (predicate: (value: T, index: number, obj: T[]) => value is any, thisArg?: any) =>
            items.find(predicate),
        findIndex: (predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any) =>
            items.findIndex(predicate),
        every: (predicate: (value: T, index: number, array: T[]) => value is any, thisArg?: any) =>
            items.every(predicate),
        some: (predicate: (value: T, index: number, array: T[]) => T) => items.some(predicate),
        forEach: (callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any) =>
            items.forEach(callbackfn),

        filter: (predicate: (value: T, index: number, array: T[]) => any, thisArg?: any) =>
            items.filter(predicate),
        reduce: (
            callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T,
            initialValue?: T
        ) => items.reduce(callbackfn, initialValue as T),
        reduceRight: (
            reducer: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T,
            initialValue?: any
        ) => items.reduceRight(reducer, initialValue),
        join: (separator?: string) => items.join(separator),
        concat: (...arrays: T[][]) => items.concat(...arrays),
        fill: (value: T, start?: number, end?: number) => {
            items.fill(value, start, end)
            notifyListeners('fill')
            return items
        },
        copyWithin: (target: number, start: number, end?: number) => {
            items.copyWithin(target, start, end)
            notifyListeners('copyWithin')
            return items
        },
        getItems: () => [...items],
    }

    const updateHistory = () => {
        history.splice(historyIndex + 1) // Remove future history
        history.push({ items: [...items], checkpoints: [] })
        historyIndex = history.length - 1
    }

    type MutatingMethods<T> = {
        [K in keyof ArrayActions<T>]: ArrayActions<T>[K] extends (...args: any[]) => any ? K : never
    }[keyof ArrayActions<T>]

    const mutatingMethods: MutatingMethods<T>[] = [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'reverse',
        'sort',
        'fill',
        'copyWithin',
    ]

    mutatingMethods.forEach((method) => {
        const originalMethod = arrayActions[method] as any

        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        arrayActions[method] = ((...args: any[]) => {
            const result = originalMethod(...args)
            updateHistory()
            return result
        }) as ArrayActions<T>[typeof method]
    })

    const historyActions: HistoryActions<T> = {
        previous: () => {
            const result = historyIndex > 0 ? history[--historyIndex].items : items
            notifySubscribers('previous', result)
            return result
        },
        next: () => {
            const result = historyIndex < history.length - 1 ? history[++historyIndex].items : items
            notifySubscribers('next', result)
            return result
        },
        clean: () => {
            history.length = 1
            historyIndex = 0
            notifySubscribers('clean', history)
        },
        jump: (number: number) => {
            historyIndex += number
            items = history[historyIndex].items
            notifySubscribers('jump', items)
            return items
        },
        goTo: (index: number) => {
            historyIndex = index
            items = history[historyIndex].items
            notifySubscribers('goTo', items)
            return items
        },
        saveCheckpoint: (label?: string) => {
            history[historyIndex].checkpoints.push({ label, items: [...items] })
            notifySubscribers('saveCheckpoint', history[historyIndex].checkpoints)
        },
        removeCheckpoint: (label: string) => {
            const checkpointIndex = history[historyIndex].checkpoints.findIndex(
                (cp) => cp.label === label
            )
            if (checkpointIndex !== -1) {
                history[historyIndex].checkpoints.splice(checkpointIndex, 1)
                notifySubscribers('removeCheckpoint', history[historyIndex].checkpoints)
            }
        },

        restoreCheckpoint: (label: string) => {
            const checkpoint = history[historyIndex].checkpoints.find((cp) => cp.label === label)
            if (checkpoint) items = [...checkpoint.items]
            notifySubscribers('restoreCheckpoint', checkpoint)
        },
        import: (serialized: string) => {
            const importedHistory = JSON.parse(serialized)
            history.length = 0
            history.push(...importedHistory)
            historyIndex = history.length - 1
            notifySubscribers('import', history)
        },
        limit: (size: number) => {
            if (size < history.length) {
                history.splice(0, history.length - size)
                historyIndex = history.length - 1
                notifySubscribers('limit', history)
            }
        },
        subscribe: (listener: HistoryChangeListener) => {
            listeners.push(listener)
            // Notify for subscription might not be necessary, but can be added if required
        },
        undo: (times: number = 1) => {
            while (times-- && historyIndex > 0) {
                historyIndex--
            }
            items = [...history[historyIndex].items]
            notifySubscribers('undo', items)
        },
        redo: (times: number = 1) => {
            while (times-- && historyIndex < history.length - 1) {
                historyIndex++
            }
            items = [...history[historyIndex].items]
            notifySubscribers('redo', items)
        },

        // Helpers
        hasChanges: () => {
            const currentItems = history[historyIndex].items
            return items.some((item, index) => item !== currentItems[index])
        },
        listCheckpoints: () => history[historyIndex].checkpoints,
        toJSON: () => JSON.stringify(history),
        toCSV: (delimiter = ',') => toCSV(history, delimiter),
    }

    const notifySubscribers = (action: string, history: any) => {
        listeners.forEach((listener) => listener(action, history))
    }

    return {
        history: historyActions,
        lazy: () => createLazyWrapper(arrayActions),
        addListener: (listener: ArrayChangeListener<T>) => {
            listeners.push(listener)
            listener('initialize', [...items])

            // Return a remove function that can be called to unsubscribe the listener
            return () => {
                const index = listeners.indexOf(listener)
                if (index !== -1) {
                    listeners.splice(index, 1)
                }
            }
        },

        ...arrayActions,
    }
}

/**
 * Utility function to create a lazy wrapper around array actions.
 *
 * @param arrayActions - Array actions object.
 *
 * @example
 * const lazyWrapper = createLazyWrapper(arrayActions);
 * lazyWrapper.push(5).pop().evaluate(); // [1, 2, 3, 4]
 */

const createLazyWrapper = <T>(arrayActions: ArrayActions<T>): LazyWrapper<T> => {
    let actions: { method: keyof typeof arrayActions; args: any[] }[] = []

    const lazyWrapper: LazyWrapper<T> = new Proxy({} as any, {
        get(target: any, property: PropertyKey) {
            if (property === 'evaluate') {
                return () => {
                    let result = arrayActions.getItems()
                    actions.forEach((action) => {
                        const { method, args } = action
                        result = (arrayActions[method] as (...args: any[]) => any)(...args)
                    })
                    actions = [] // Reset the actions
                    return result
                }
            }
            return (...args: any[]) => {
                actions.push({ method: property as keyof typeof arrayActions, args })
                return lazyWrapper // Return the same lazy wrapper to allow chaining
            }
        },
    })

    return lazyWrapper
}

export default magicArray

const deepFlatten = (arr: any[]): any[] => {
    return arr.reduce(
        (acc, val) => (Array.isArray(val) ? [...acc, ...deepFlatten(val)] : [...acc, val]),
        []
    )
}

const toCSV = (arr: any[], delimiter: string = ','): string => {
    const flatArray = deepFlatten(arr)
    return flatArray.join(delimiter)
}

