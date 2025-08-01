## API Report File for "@annotator/store"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Atom } from '@annotator/state';
import { Computed } from '@annotator/state';
import { Expand } from '@annotator/utils';
import { Result } from '@annotator/utils';
import { Signal } from '@annotator/state';
import { UNINITIALIZED } from '@annotator/state';

// @public
export function assertIdType<R extends UnknownRecord>(id: string | undefined, type: RecordType<R, any>): asserts id is IdOf<R>;

// @public
export class AtomMap<K, V> implements Map<K, V> {
    // (undocumented)
    [Symbol.iterator](): Generator<[K, V], undefined, unknown>;
    // (undocumented)
    [Symbol.toStringTag]: string;
    constructor(name: string, entries?: Iterable<readonly [K, V]>);
    // (undocumented)
    __unsafe__getWithoutCapture(key: K): undefined | V;
    // (undocumented)
    __unsafe__hasWithoutCapture(key: K): boolean;
    // (undocumented)
    clear(): void;
    // (undocumented)
    delete(key: K): boolean;
    // (undocumented)
    deleteMany(keys: Iterable<K>): [K, V][];
    // (undocumented)
    entries(): Generator<[K, V], undefined, unknown>;
    // (undocumented)
    forEach(callbackfn: (value: V, key: K, map: AtomMap<K, V>) => void, thisArg?: any): void;
    // (undocumented)
    get(key: K): undefined | V;
    // @internal (undocumented)
    getAtom(key: K): Atom<UNINITIALIZED | V> | undefined;
    // (undocumented)
    has(key: K): boolean;
    // (undocumented)
    keys(): Generator<K, undefined, unknown>;
    // (undocumented)
    set(key: K, value: V): this;
    // (undocumented)
    get size(): number;
    // (undocumented)
    update(key: K, updater: (value: V) => V): void;
    // (undocumented)
    values(): Generator<V, undefined, unknown>;
}

// @public
export interface BaseRecord<TypeName extends string, Id extends RecordId<UnknownRecord>> {
    // (undocumented)
    readonly id: Id;
    // (undocumented)
    readonly typeName: TypeName;
}

// @public (undocumented)
export type ChangeSource = 'remote' | 'user';

// @public
export interface CollectionDiff<T> {
    // (undocumented)
    added?: Set<T>;
    // (undocumented)
    removed?: Set<T>;
}

// @public
export interface ComputedCache<Data, R extends UnknownRecord> {
    // (undocumented)
    get(id: IdOf<R>): Data | undefined;
}

// @public
export function createComputedCache<Context extends StoreObject<any>, Result, Record extends StoreObjectRecordType<Context> = StoreObjectRecordType<Context>>(name: string, derive: (context: Context, record: Record) => Result | undefined, opts?: CreateComputedCacheOpts<Result, Record>): {
    get(context: Context, id: IdOf<Record>): Result | undefined;
};

// @public (undocumented)
export interface CreateComputedCacheOpts<Data, R extends UnknownRecord> {
    // (undocumented)
    areRecordsEqual?(a: R, b: R): boolean;
    // (undocumented)
    areResultsEqual?(a: Data, b: Data): boolean;
}

// @internal (undocumented)
export function createEmptyRecordsDiff<R extends UnknownRecord>(): RecordsDiff<R>;

// @public
export function createMigrationIds<const ID extends string, const Versions extends Record<string, number>>(sequenceId: ID, versions: Versions): {
    [K in keyof Versions]: `${ID}/${Versions[K]}`;
};

// @public
export function createMigrationSequence({ sequence, sequenceId, retroactive, }: {
    retroactive?: boolean;
    sequence: Array<Migration | StandaloneDependsOn>;
    sequenceId: string;
}): MigrationSequence;

// @internal (undocumented)
export function createRecordMigrationSequence(opts: {
    filter?(record: UnknownRecord): boolean;
    recordType: string;
    retroactive?: boolean;
    sequence: Omit<Extract<Migration, {
        scope: 'record';
    }>, 'scope'>[];
    sequenceId: string;
}): MigrationSequence;

// @public
export function createRecordType<R extends UnknownRecord>(typeName: R['typeName'], config: {
    ephemeralKeys?: {
        readonly [K in Exclude<keyof R, 'id' | 'typeName'>]: boolean;
    };
    scope: RecordScope;
    validator?: StoreValidator<R>;
}): RecordType<R, keyof Omit<R, 'id' | 'typeName'>>;

// @public @deprecated (undocumented)
export function defineMigrations(opts: {
    currentVersion?: number;
    firstVersion?: number;
    migrators?: Record<number, LegacyMigration>;
    subTypeKey?: string;
    subTypeMigrations?: Record<string, LegacyBaseMigrationsInfo>;
}): LegacyMigrations;

// @public
export function devFreeze<T>(object: T): T;

// @public
export interface HistoryEntry<R extends UnknownRecord = UnknownRecord> {
    // (undocumented)
    changes: RecordsDiff<R>;
    // (undocumented)
    source: ChangeSource;
}

// @public (undocumented)
export type IdOf<R extends UnknownRecord> = R['id'];

// @internal
export class IncrementalSetConstructor<T> {
    constructor(
    previousValue: Set<T>);
    // @public
    add(item: T): void;
    // @public
    get(): {
        diff: CollectionDiff<T>;
        value: Set<T>;
    } | undefined;
    // @public
    remove(item: T): void;
}

// @internal
export function isRecordsDiffEmpty<T extends UnknownRecord>(diff: RecordsDiff<T>): boolean;

// @public (undocumented)
export interface LegacyBaseMigrationsInfo {
    // (undocumented)
    currentVersion: number;
    // (undocumented)
    firstVersion: number;
    // (undocumented)
    migrators: {
        [version: number]: LegacyMigration;
    };
}

// @public (undocumented)
export interface LegacyMigration<Before = any, After = any> {
    // (undocumented)
    down: (newState: After) => Before;
    // (undocumented)
    up: (oldState: Before) => After;
}

// @public (undocumented)
export interface LegacyMigrations extends LegacyBaseMigrationsInfo {
    // (undocumented)
    subTypeKey?: string;
    // (undocumented)
    subTypeMigrations?: Record<string, LegacyBaseMigrationsInfo>;
}

// @public (undocumented)
export type Migration = {
    readonly dependsOn?: readonly MigrationId[] | undefined;
    readonly id: MigrationId;
} & ({
    readonly down?: (newState: SerializedStore<UnknownRecord>) => SerializedStore<UnknownRecord> | void;
    readonly scope: 'store';
    readonly up: (oldState: SerializedStore<UnknownRecord>) => SerializedStore<UnknownRecord> | void;
} | {
    readonly down?: (newState: UnknownRecord) => UnknownRecord | void;
    readonly filter?: (record: UnknownRecord) => boolean;
    readonly scope: 'record';
    readonly up: (oldState: UnknownRecord) => UnknownRecord | void;
});

// @public (undocumented)
export enum MigrationFailureReason {
    // (undocumented)
    IncompatibleSubtype = "incompatible-subtype",
    // (undocumented)
    MigrationError = "migration-error",
    // (undocumented)
    TargetVersionTooNew = "target-version-too-new",
    // (undocumented)
    TargetVersionTooOld = "target-version-too-old",
    // (undocumented)
    UnknownType = "unknown-type",
    // (undocumented)
    UnrecognizedSubtype = "unrecognized-subtype"
}

// @public (undocumented)
export type MigrationId = `${string}/${number}`;

// @public (undocumented)
export type MigrationResult<T> = {
    reason: MigrationFailureReason;
    type: 'error';
} | {
    type: 'success';
    value: T;
};

// @public (undocumented)
export interface MigrationSequence {
    retroactive: boolean;
    // (undocumented)
    sequence: Migration[];
    // (undocumented)
    sequenceId: string;
}

// @internal (undocumented)
export function parseMigrationId(id: MigrationId): {
    sequenceId: string;
    version: number;
};

// @public (undocumented)
export type QueryExpression<R extends object> = {
    [k in keyof R & string]?: QueryValueMatcher<R[k]>;
};

// @public (undocumented)
export type QueryValueMatcher<T> = {
    eq: T;
} | {
    gt: number;
} | {
    neq: T;
};

// @public (undocumented)
export type RecordFromId<K extends RecordId<UnknownRecord>> = K extends RecordId<infer R> ? R : never;

// @public (undocumented)
export type RecordId<R extends UnknownRecord> = string & {
    __type__: R;
};

// @public
export type RecordScope = 'document' | 'presence' | 'session';

// @public
export interface RecordsDiff<R extends UnknownRecord> {
    // (undocumented)
    added: Record<IdOf<R>, R>;
    // (undocumented)
    removed: Record<IdOf<R>, R>;
    // (undocumented)
    updated: Record<IdOf<R>, [from: R, to: R]>;
}

// @public
export class RecordType<R extends UnknownRecord, RequiredProperties extends keyof Omit<R, 'id' | 'typeName'>> {
    constructor(
    typeName: R['typeName'], config: {
        readonly createDefaultProperties: () => Exclude<Omit<R, 'id' | 'typeName'>, RequiredProperties>;
        readonly ephemeralKeys?: {
            readonly [K in Exclude<keyof R, 'id' | 'typeName'>]: boolean;
        };
        readonly scope?: RecordScope;
        readonly validator?: StoreValidator<R>;
    });
    clone(record: R): R;
    create(properties: Expand<Pick<R, RequiredProperties> & Omit<Partial<R>, RequiredProperties>>): R;
    // @deprecated
    createCustomId(id: string): IdOf<R>;
    // (undocumented)
    readonly createDefaultProperties: () => Exclude<Omit<R, 'id' | 'typeName'>, RequiredProperties>;
    createId(customUniquePart?: string): IdOf<R>;
    // (undocumented)
    readonly ephemeralKeys?: {
        readonly [K in Exclude<keyof R, 'id' | 'typeName'>]: boolean;
    };
    // (undocumented)
    readonly ephemeralKeySet: ReadonlySet<string>;
    isId(id?: string): id is IdOf<R>;
    isInstance(record?: UnknownRecord): record is R;
    parseId(id: IdOf<R>): string;
    // (undocumented)
    readonly scope: RecordScope;
    readonly typeName: R['typeName'];
    validate(record: unknown, recordBefore?: R): R;
    // (undocumented)
    readonly validator: StoreValidator<R>;
    withDefaultProperties<DefaultProps extends Omit<Partial<R>, 'id' | 'typeName'>>(createDefaultProperties: () => DefaultProps): RecordType<R, Exclude<RequiredProperties, keyof DefaultProps>>;
}

// @public (undocumented)
export function reverseRecordsDiff(diff: RecordsDiff<any>): RecordsDiff<any>;

// @public (undocumented)
export type RSIndex<R extends UnknownRecord, Property extends string & keyof R = string & keyof R> = Computed<RSIndexMap<R, Property>, RSIndexDiff<R, Property>>;

// @public (undocumented)
export type RSIndexDiff<R extends UnknownRecord, Property extends string & keyof R = string & keyof R> = Map<R[Property], CollectionDiff<IdOf<R>>>;

// @public (undocumented)
export type RSIndexMap<R extends UnknownRecord, Property extends string & keyof R = string & keyof R> = Map<R[Property], Set<IdOf<R>>>;

// @public (undocumented)
export type SerializedSchema = SerializedSchemaV1 | SerializedSchemaV2;

// @public (undocumented)
export interface SerializedSchemaV1 {
    recordVersions: Record<string, {
        subTypeKey: string;
        subTypeVersions: Record<string, number>;
        version: number;
    } | {
        version: number;
    }>;
    schemaVersion: 1;
    storeVersion: number;
}

// @public (undocumented)
export interface SerializedSchemaV2 {
    // (undocumented)
    schemaVersion: 2;
    // (undocumented)
    sequences: {
        [sequenceId: string]: number;
    };
}

// @public
export type SerializedStore<R extends UnknownRecord> = Record<IdOf<R>, R>;

// @public
export function squashRecordDiffs<T extends UnknownRecord>(diffs: RecordsDiff<T>[]): RecordsDiff<T>;

// @internal
export function squashRecordDiffsMutable<T extends UnknownRecord>(target: RecordsDiff<T>, diffs: RecordsDiff<T>[]): void;

// @public (undocumented)
export interface StandaloneDependsOn {
    // (undocumented)
    readonly dependsOn: readonly MigrationId[];
}

// @public
export class Store<R extends UnknownRecord = UnknownRecord, Props = unknown> {
    constructor(config: {
        schema: StoreSchema<R, Props>;
        initialData?: SerializedStore<R>;
        id?: string;
        props: Props;
    });
    // @internal (undocumented)
    addHistoryInterceptor(fn: (entry: HistoryEntry<R>, source: ChangeSource) => void): () => void;
    allRecords(): R[];
    // (undocumented)
    applyDiff(diff: RecordsDiff<R>, { runCallbacks, ignoreEphemeralKeys, }?: {
        ignoreEphemeralKeys?: boolean;
        runCallbacks?: boolean;
    }): void;
    // @internal (undocumented)
    atomic<T>(fn: () => T, runCallbacks?: boolean, isMergingRemoteChanges?: boolean): T;
    clear(): void;
    createCache<Result, Record extends R = R>(create: (id: IdOf<Record>, recordSignal: Signal<R>) => Signal<Result>): {
        get: (id: IdOf<Record>) => Result | undefined;
    };
    createComputedCache<Result, Record extends R = R>(name: string, derive: (record: Record) => Result | undefined, opts?: CreateComputedCacheOpts<Result, Record>): ComputedCache<Result, Record>;
    // (undocumented)
    dispose(): void;
    // @internal (undocumented)
    ensureStoreIsUsable(): void;
    extractingChanges(fn: () => void): RecordsDiff<R>;
    filterChangesByScope(change: RecordsDiff<R>, scope: RecordScope): {
        added: { [K in IdOf<R>]: R; };
        removed: { [K in IdOf<R>]: R; };
        updated: { [K_1 in IdOf<R>]: [from: R, to: R]; };
    } | null;
    // (undocumented)
    _flushHistory(): void;
    get<K extends IdOf<R>>(id: K): RecordFromId<K> | undefined;
    // @deprecated (undocumented)
    getSnapshot(scope?: 'all' | RecordScope): StoreSnapshot<R>;
    getStoreSnapshot(scope?: 'all' | RecordScope): StoreSnapshot<R>;
    has<K extends IdOf<R>>(id: K): boolean;
    readonly history: Atom<number, RecordsDiff<R>>;
    readonly id: string;
    // @internal (undocumented)
    isPossiblyCorrupted(): boolean;
    listen(onHistory: StoreListener<R>, filters?: Partial<StoreListenerFilters>): () => void;
    // @deprecated (undocumented)
    loadSnapshot(snapshot: StoreSnapshot<R>): void;
    loadStoreSnapshot(snapshot: StoreSnapshot<R>): void;
    // @internal (undocumented)
    markAsPossiblyCorrupted(): void;
    mergeRemoteChanges(fn: () => void): void;
    migrateSnapshot(snapshot: StoreSnapshot<R>): StoreSnapshot<R>;
    // (undocumented)
    readonly props: Props;
    put(records: R[], phaseOverride?: 'initialize'): void;
    readonly query: StoreQueries<R>;
    remove(ids: IdOf<R>[]): void;
    // (undocumented)
    readonly schema: StoreSchema<R, Props>;
    // (undocumented)
    readonly scopedTypes: {
        readonly [K in RecordScope]: ReadonlySet<R['typeName']>;
    };
    serialize(scope?: 'all' | RecordScope): SerializedStore<R>;
    // (undocumented)
    readonly sideEffects: StoreSideEffects<R>;
    unsafeGetWithoutCapture<K extends IdOf<R>>(id: K): RecordFromId<K> | undefined;
    update<K extends IdOf<R>>(id: K, updater: (record: RecordFromId<K>) => RecordFromId<K>): void;
    // (undocumented)
    validate(phase: 'createRecord' | 'initialize' | 'tests' | 'updateRecord'): void;
}

// @public (undocumented)
export type StoreAfterChangeHandler<R extends UnknownRecord> = (prev: R, next: R, source: 'remote' | 'user') => void;

// @public (undocumented)
export type StoreAfterCreateHandler<R extends UnknownRecord> = (record: R, source: 'remote' | 'user') => void;

// @public (undocumented)
export type StoreAfterDeleteHandler<R extends UnknownRecord> = (record: R, source: 'remote' | 'user') => void;

// @public (undocumented)
export type StoreBeforeChangeHandler<R extends UnknownRecord> = (prev: R, next: R, source: 'remote' | 'user') => R;

// @public (undocumented)
export type StoreBeforeCreateHandler<R extends UnknownRecord> = (record: R, source: 'remote' | 'user') => R;

// @public (undocumented)
export type StoreBeforeDeleteHandler<R extends UnknownRecord> = (record: R, source: 'remote' | 'user') => false | void;

// @public (undocumented)
export interface StoreError {
    // (undocumented)
    error: Error;
    // (undocumented)
    isExistingValidationIssue: boolean;
    // (undocumented)
    phase: 'createRecord' | 'initialize' | 'tests' | 'updateRecord';
    // (undocumented)
    recordAfter: unknown;
    // (undocumented)
    recordBefore?: unknown;
}

// @public
export type StoreListener<R extends UnknownRecord> = (entry: HistoryEntry<R>) => void;

// @public (undocumented)
export interface StoreListenerFilters {
    // (undocumented)
    scope: 'all' | RecordScope;
    // (undocumented)
    source: 'all' | ChangeSource;
}

// @public (undocumented)
export type StoreObject<R extends UnknownRecord> = {
    store: Store<R>;
} | Store<R>;

// @public (undocumented)
export type StoreObjectRecordType<Context extends StoreObject<any>> = Context extends Store<infer R> ? R : Context extends {
    store: Store<infer R>;
} ? R : never;

// @public (undocumented)
export type StoreOperationCompleteHandler = (source: 'remote' | 'user') => void;

// @public
export class StoreQueries<R extends UnknownRecord> {
    constructor(recordMap: AtomMap<IdOf<R>, R>, history: Atom<number, RecordsDiff<R>>);
    // @internal
    __uncached_createIndex<TypeName extends R['typeName'], Property extends string & keyof Extract<R, {
        typeName: TypeName;
    }>>(typeName: TypeName, property: Property): RSIndex<Extract<R, {
        typeName: TypeName;
    }>, Property>;
    // (undocumented)
    exec<TypeName extends R['typeName']>(typeName: TypeName, query: QueryExpression<Extract<R, {
        typeName: TypeName;
    }>>): Array<Extract<R, {
        typeName: TypeName;
    }>>;
    filterHistory<TypeName extends R['typeName']>(typeName: TypeName): Computed<number, RecordsDiff<Extract<R, {
        typeName: TypeName;
    }>>>;
    ids<TypeName extends R['typeName']>(typeName: TypeName, queryCreator?: () => QueryExpression<Extract<R, {
        typeName: TypeName;
    }>>, name?: string): Computed<Set<IdOf<Extract<R, {
        typeName: TypeName;
    }>>>, CollectionDiff<IdOf<Extract<R, {
        typeName: TypeName;
    }>>>>;
    index<TypeName extends R['typeName'], Property extends string & keyof Extract<R, {
        typeName: TypeName;
    }>>(typeName: TypeName, property: Property): RSIndex<Extract<R, {
        typeName: TypeName;
    }>, Property>;
    record<TypeName extends R['typeName']>(typeName: TypeName, queryCreator?: () => QueryExpression<Extract<R, {
        typeName: TypeName;
    }>>, name?: string): Computed<Extract<R, {
        typeName: TypeName;
    }> | undefined>;
    records<TypeName extends R['typeName']>(typeName: TypeName, queryCreator?: () => QueryExpression<Extract<R, {
        typeName: TypeName;
    }>>, name?: string): Computed<Array<Extract<R, {
        typeName: TypeName;
    }>>>;
}

// @internal (undocumented)
export type StoreRecord<S extends Store<any>> = S extends Store<infer R> ? R : never;

// @public (undocumented)
export class StoreSchema<R extends UnknownRecord, P = unknown> {
    // (undocumented)
    static create<R extends UnknownRecord, P = unknown>(types: {
        [TypeName in R['typeName']]: {
            createId: any;
        };
    }, options?: StoreSchemaOptions<R, P>): StoreSchema<R, P>;
    // @internal (undocumented)
    createIntegrityChecker(store: Store<R, P>): (() => void) | undefined;
    // (undocumented)
    getMigrationsSince(persistedSchema: SerializedSchema): Result<Migration[], string>;
    // @internal (undocumented)
    getType(typeName: string): RecordType<R, any>;
    // (undocumented)
    migratePersistedRecord(record: R, persistedSchema: SerializedSchema, direction?: 'down' | 'up'): MigrationResult<R>;
    // (undocumented)
    migrateStoreSnapshot(snapshot: StoreSnapshot<R>, opts?: {
        mutateInputStore?: boolean;
    }): MigrationResult<SerializedStore<R>>;
    // (undocumented)
    readonly migrations: Record<string, MigrationSequence>;
    // (undocumented)
    serialize(): SerializedSchemaV2;
    // @deprecated (undocumented)
    serializeEarliestVersion(): SerializedSchema;
    // (undocumented)
    readonly sortedMigrations: readonly Migration[];
    // (undocumented)
    readonly types: {
        [Record in R as Record['typeName']]: RecordType<R, any>;
    };
    // (undocumented)
    validateRecord(store: Store<R>, record: R, phase: 'createRecord' | 'initialize' | 'tests' | 'updateRecord', recordBefore: null | R): R;
}

// @public (undocumented)
export interface StoreSchemaOptions<R extends UnknownRecord, P> {
    // @internal (undocumented)
    createIntegrityChecker?(store: Store<R, P>): void;
    // (undocumented)
    migrations?: MigrationSequence[];
    // (undocumented)
    onValidationFailure?(data: StoreValidationFailure<R>): R;
}

// @public
export class StoreSideEffects<R extends UnknownRecord> {
    constructor(store: Store<R>);
    // @internal (undocumented)
    handleAfterChange(prev: R, next: R, source: 'remote' | 'user'): void;
    // @internal (undocumented)
    handleAfterCreate(record: R, source: 'remote' | 'user'): void;
    // @internal (undocumented)
    handleAfterDelete(record: R, source: 'remote' | 'user'): void;
    // @internal (undocumented)
    handleBeforeChange(prev: R, next: R, source: 'remote' | 'user'): R;
    // @internal (undocumented)
    handleBeforeCreate(record: R, source: 'remote' | 'user'): R;
    // @internal (undocumented)
    handleBeforeDelete(record: R, source: 'remote' | 'user'): boolean;
    // @internal (undocumented)
    handleOperationComplete(source: 'remote' | 'user'): void;
    // @internal (undocumented)
    isEnabled(): boolean;
    // @internal
    register(handlersByType: {
        [T in R as T['typeName']]?: {
            afterChange?: StoreAfterChangeHandler<T>;
            afterCreate?: StoreAfterCreateHandler<T>;
            afterDelete?: StoreAfterDeleteHandler<T>;
            beforeChange?: StoreBeforeChangeHandler<T>;
            beforeCreate?: StoreBeforeCreateHandler<T>;
            beforeDelete?: StoreBeforeDeleteHandler<T>;
        };
    }): () => void;
    registerAfterChangeHandler<T extends R['typeName']>(typeName: T, handler: StoreAfterChangeHandler<R & {
        typeName: T;
    }>): () => void;
    registerAfterCreateHandler<T extends R['typeName']>(typeName: T, handler: StoreAfterCreateHandler<R & {
        typeName: T;
    }>): () => void;
    registerAfterDeleteHandler<T extends R['typeName']>(typeName: T, handler: StoreAfterDeleteHandler<R & {
        typeName: T;
    }>): () => void;
    registerBeforeChangeHandler<T extends R['typeName']>(typeName: T, handler: StoreBeforeChangeHandler<R & {
        typeName: T;
    }>): () => void;
    registerBeforeCreateHandler<T extends R['typeName']>(typeName: T, handler: StoreBeforeCreateHandler<R & {
        typeName: T;
    }>): () => void;
    registerBeforeDeleteHandler<T extends R['typeName']>(typeName: T, handler: StoreBeforeDeleteHandler<R & {
        typeName: T;
    }>): () => void;
    registerOperationCompleteHandler(handler: StoreOperationCompleteHandler): () => void;
    // @internal (undocumented)
    setIsEnabled(enabled: boolean): void;
}

// @public (undocumented)
export interface StoreSnapshot<R extends UnknownRecord> {
    // (undocumented)
    schema: SerializedSchema;
    // (undocumented)
    store: SerializedStore<R>;
}

// @public (undocumented)
export interface StoreValidationFailure<R extends UnknownRecord> {
    // (undocumented)
    error: unknown;
    // (undocumented)
    phase: 'createRecord' | 'initialize' | 'tests' | 'updateRecord';
    // (undocumented)
    record: R;
    // (undocumented)
    recordBefore: null | R;
    // (undocumented)
    store: Store<R>;
}

// @public (undocumented)
export interface StoreValidator<R extends UnknownRecord> {
    // (undocumented)
    validate(record: unknown): R;
    // (undocumented)
    validateUsingKnownGoodVersion?(knownGoodVersion: R, record: unknown): R;
}

// @public (undocumented)
export type StoreValidators<R extends UnknownRecord> = {
    [K in R['typeName']]: StoreValidator<Extract<R, {
        typeName: K;
    }>>;
};

// @public (undocumented)
export type UnknownRecord = BaseRecord<string, RecordId<UnknownRecord>>;

// (No @packageDocumentation comment for this package)

```
