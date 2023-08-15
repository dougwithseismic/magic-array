# MagicArray

MagicArray is a TypeScript library designed to provide extensive array manipulation features, extending the traditional array functionality with added operations and validation support. It comes with a unique history tracking system and enables an extra level of validation and manipulation for array data structures.

## Table of Contents

1. [Installation](#installation)
2. [Features](#features)
3. [Array Methods](#array-methods)
4. [History Actions](#history-actions)
5. [Usage Examples](#usage-examples)
6. [License](#license)

## Installation

Install MagicArray using npm:

```bash
npm install @dougwithseismic/magicarray
```

Or using yarn:

```bash
yarn add @dougwithseismic/magicarray
```

## Usage

``` typescript
import createMagicArray  from '@dougwithseismic/magicarray';
```

## Features

- **Array Manipulation**: Perform standard and custom array operations.
- **Validation Support**: Enforce rules with validation functions.
- **Serialization and Deserialization**: Easily convert arrays to JSON strings and back.
- **History Tracking**: Track changes, undo, redo, save checkpoints, and navigate history.
- **Batch Operations**: Conduct batch operations like batch push.

## Array Methods

MagicArray supports all standard JavaScript array methods, enhancing them with additional capabilities.

### Custom Methods

#### `batchPush(itemsToPush: T[]): void`

Batch push items into the array.

##### Example

```typescript
const magicArray = createMagicArray<number>();
magicArray.batchPush([4, 5, 6]);
```

#### `search(queryFn: (item: T) => boolean): T[]`

Search the array using a query function.

##### Search Example

```typescript
const magicArray = createMagicArray<number>();
const result = magicArray.search(item => item > 2);
```

#### `setValidation(fn: ValidationFunction<T>): void`

Set a validation function to filter items.

##### setValidation Example

```typescript
const magicArray = createMagicArray<number>();
magicArray.setValidation(item => item > 0);
```

#### `serialize(): string`

Serialize the current array into a JSON string.

##### serialize Example

```typescript
const magicArray = createMagicArray<number>();
const jsonString = magicArray.serialize();
```

#### `deserialize(jsonString: string): void`

Deserialize a JSON string into the current array.

##### Example

```typescript
const magicArray = createMagicArray<number>();
magicArray.deserialize(jsonString);
```

#### `getItems(): T[]`

Retrieve a shallow copy of the items in the array.

##### Example

```typescript
const magicArray = createMagicArray<number>();
const items = magicArray.getItems();
```

### Standard Methods

The library supports all standard JavaScript array methods, enhancing them with additional capabilities.

## History Actions

MagicArray comes with a history system to track changes and enable navigation through past states. Here are the functionalities:

### `previous(): T[]`

Navigate to the previous state in history.

#### Example

```typescript
const prevState = magicArray.history.previous();
```

### `next(): T[]`

Navigate to the next state in history.

#### Example

```typescript
const nextState = magicArray.history.next();
```

### `clean(): void`

Clean the history by resetting it.

#### Example

```typescript
magicArray.history.clean();
```

#### `jump(number: number): T[]`

Jump by a specified number of steps in the history.

#### Example

```typescript
magicArray.history.jump(2);
```

### `goTo(index: number): T[]`

Go to a specific index in the history.

#### Example

```typescript
magicArray.history.goTo(5);
```

### `saveCheckpoint(label?: string): void`

Save a checkpoint with an optional label.

#### Example

```typescript
magicArray.history.saveCheckpoint('before-change');
```

### `restoreCheckpoint(label: string): void`

Restore a checkpoint by its label.

#### Example

```typescript
magicArray.history.restoreCheckpoint('before-change');
```

### `listCheckpoints(): Checkpoint<T>[]`

List all checkpoints.

#### Example

```typescript
const checkpoints = magicArray.history.listCheckpoints();
```

### `toJSON(): string`

Convert the history to a JSON string.

#### Example

```typescript
const jsonHistory = magicArray.history.toJSON();
```

### `toCSV(delimiter: string): string`

Convert the history to a CSV string with a given delimiter.

#### Example

```typescript
const csvHistory = magicArray.history.toCSV(';');
```

### `import(serialized: string): void`

Import a serialized string to replace the current history.

#### Example

```typescript
magicArray.history.import(serializedHistory);
```

### `limit(size: number): void`

Limit the size of the history, removing older entries if necessary.

#### Example

```typescript
magicArray.history.limit(10);
```

### `hasChanges(): boolean`

Check if there are any changes in the current state compared to the history.

#### Example

```typescript
const changes = magicArray.history.hasChanges();
```

### `subscribe(listener: HistoryChangeListener): void`

Subscribe a listener to changes in the history.

#### Example

```typescript
magicArray.history.subscribe(listener);
```

### `undo(times?: number): void`

Undo a specified number of changes, or one change if no number is provided.

#### Example

```typescript
magicArray.history.undo(3);
```

### `redo(times?: number): void`

Redo a specified number of changes, or one change if no number is provided.

#### Example

```typescript
magicArray.history.redo(3);
```

## Usage Examples

### For Game Development

Managing game states and allowing players to undo and redo actions:

```typescript
const gameState = createMagicArray<Game>();
gameState.magicArray.history.saveCheckpoint('level-1');
// Player makes moves...
gameState.magicArray.history.undo(); // Undo last move
```

### For Task Management

Managing tasks in a project with the ability to track the changes, undo/redo task updates, and save checkpoints:

```typescript
const tasks = createMagicArray<Task>();
tasks.batchPush([
  { title: 'Write code', status: 'done' },
  { title: 'Write tests', status: 'in-progress' }
]);
tasks.magicArray.history.saveCheckpoint('initial-tasks');
tasks.search(task => task.status === 'in-progress'); // Search tasks in progress
tasks.magicArray.history.undo(); // Undo the last change
```

### For User Profile Management

Handling user profiles and tracking changes, making it easy to revert to previous states:

```typescript
const users = createMagicArray<UserProfile>();
users.setValidation(user => user.age > 18); // Validate user's age
users.batchPush(newUserProfiles);
users.magicArray.history.saveCheckpoint('after-new-users');
// Make updates...
users.magicArray.history.restoreCheckpoint('after-new-users'); // Restore to previous state
```

### For Shopping Cart Management

Manipulating shopping cart items, searching for products, and maintaining history checkpoints:

```typescript
const cart = createMagicArray<Product>();
cart.batchPush(selectedProducts);
cart.search(product => product.category === 'electronics'); // Search for electronics
cart.magicArray.history.saveCheckpoint('after-adding-electronics');
// Remove some items...
cart.magicArray.history.restoreCheckpoint('after-adding-electronics'); // Restore to previous state
```

### For Timeline Creation in Social Media

Building a timeline for social media applications, with features to go back and forth through user posts and actions:

```typescript
const timeline = createMagicArray<Post>();
timeline.batchPush(newPosts);
timeline.history.next(); // Navigate to the next state in history
timeline.history.previous(); // Navigate to the previous state in history
timeline.history.saveCheckpoint('user-login'); // Save a specific point in time
```

### For Health Data Tracking

Tracking patients' health data with the ability to analyze, search, and maintain historical records:

```typescript
const patientData = createMagicArray<HealthRecord>();
patientData.search(record => record.condition === 'diabetes'); // Search for diabetic patients
patientData.history.saveCheckpoint('end-of-year'); // Save end-of-year records
// Analyzing data...
patientData.history.restoreCheckpoint('end-of-year'); // Restore to end-of-year state
```

### For Configuration Management

Saving and restoring configurations:

```typescript
const config = createMagicArray<Config>();
config.magicArray.history.saveCheckpoint('stable');
// Make changes...
config.magicArray.history.restoreCheckpoint('stable'); // Restore to stable
```

### Obstacle Avoidance and Path Planning for Drone Swarms

Planning and adjusting paths for a swarm of drones to avoid obstacles, with the ability to revert to previous paths:

```typescript
const obstacleAvoidancePaths = createMagicArray<Path>();
obstacleAvoidancePaths.setValidation(path => !path.hasObstacle); // Validate paths without obstacles
obstacleAvoidancePaths.batchPush(plannedPaths);
obstacleAvoidancePaths.history.saveCheckpoint('obstacle-free');
// Replan paths if new obstacles are detected...
obstacleAvoidancePaths.history.restoreCheckpoint('obstacle-free'); // Revert to obstacle-free paths
```

#### Synchronized Movement of Drone Swarm

Synchronizing the movement of a swarm of drones by batch updating waypoints and saving key checkpoints:

```typescript
const swarmWaypoints = createMagicArray<DroneSwarm>();
swarmWaypoints.batchPush(swarmFormation1);
swarmWaypoints.history.saveCheckpoint('formation-1');
swarmWaypoints.batchPush(swarmFormation2);
swarmWaypoints.history.saveCheckpoint('formation-2');
// Transition between formations...
swarmWaypoints.history.restoreCheckpoint('formation-1'); // Restore to formation 1
```

... You get the picture.

## License

MagicArray is [MIT licensed](LICENSE).
