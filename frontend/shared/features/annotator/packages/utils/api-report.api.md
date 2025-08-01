## API Report File for "@annotator/utils"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { default as isEqual } from 'lodash.isequal';
import { default as isEqualWith } from 'lodash.isequalwith';
import { default as throttle } from 'lodash.throttle';
import { default as uniq } from 'lodash.uniq';

// @internal
export function annotateError(error: unknown, annotations: Partial<ErrorAnnotations>): void;

// @internal (undocumented)
export function areArraysShallowEqual<T>(arr1: readonly T[], arr2: readonly T[]): boolean;

// @internal (undocumented)
export function areObjectsShallowEqual<T extends object>(obj1: T, obj2: T): boolean;

// @internal (undocumented)
export const assert: (value: unknown, message?: string) => asserts value;

// @internal (undocumented)
export const assertExists: <T>(value: T, message?: string | undefined) => NonNullable<T>;

// @public
export function bind<T extends (...args: any[]) => any>(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>;

// @public
export function bind<This extends object, T extends (...args: any[]) => any>(originalMethod: T, context: ClassMethodDecoratorContext<This, T>): void;

// @internal
export function clearLocalStorage(): void;

// @internal
export function clearSessionStorage(): void;

// @internal (undocumented)
export function compact<T>(arr: T[]): NonNullable<T>[];

// @public
export function debounce<T extends unknown[], U>(callback: (...args: T) => PromiseLike<U> | U, wait: number): {
    (...args: T): Promise<U>;
    cancel(): void;
};

// @public
export function dedupe<T>(input: T[], equals?: (a: any, b: any) => boolean): T[];

// @public (undocumented)
export const DEFAULT_SUPPORT_VIDEO_TYPES: readonly ("video/mp4" | "video/quicktime" | "video/webm")[];

// @public (undocumented)
export const DEFAULT_SUPPORTED_IMAGE_TYPES: readonly ("image/apng" | "image/avif" | "image/gif" | "image/jpeg" | "image/png" | "image/svg+xml" | "image/webp")[];

// @public (undocumented)
export const DEFAULT_SUPPORTED_MEDIA_TYPE_LIST: string;

// @public (undocumented)
export const DEFAULT_SUPPORTED_MEDIA_TYPES: readonly ("image/apng" | "image/avif" | "image/gif" | "image/jpeg" | "image/png" | "image/svg+xml" | "image/webp" | "video/mp4" | "video/quicktime" | "video/webm")[];

// @internal
export function deleteFromLocalStorage(key: string): void;

// @internal
export function deleteFromSessionStorage(key: string): void;

// @public (undocumented)
export interface ErrorAnnotations {
    // (undocumented)
    extras: Record<string, unknown>;
    // (undocumented)
    tags: Record<string, bigint | boolean | null | number | string | symbol | undefined>;
}

// @public (undocumented)
export interface ErrorResult<E> {
    // (undocumented)
    readonly error: E;
    // (undocumented)
    readonly ok: false;
}

// @internal (undocumented)
export class ExecutionQueue {
    constructor(timeout?: number | undefined);
    // (undocumented)
    close(): void;
    // (undocumented)
    isEmpty(): boolean;
    // (undocumented)
    push<T>(task: () => T): Promise<Awaited<T>>;
}

// @internal (undocumented)
export function exhaustiveSwitchError(value: never, property?: string): never;

// @public (undocumented)
export type Expand<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;

// @internal
function fetch_2(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
export { fetch_2 as fetch }

// @public
export class FileHelpers {
    static blobToDataUrl(file: Blob): Promise<string>;
    static blobToText(file: Blob): Promise<string>;
    // @deprecated (undocumented)
    static dataUrlToArrayBuffer(dataURL: string): Promise<ArrayBuffer>;
    // (undocumented)
    static rewriteMimeType(blob: Blob, newMimeType: string): Blob;
    // (undocumented)
    static rewriteMimeType(blob: File, newMimeType: string): File;
    // (undocumented)
    static urlToArrayBuffer(url: string): Promise<ArrayBuffer>;
    // (undocumented)
    static urlToBlob(url: string): Promise<Blob>;
    // (undocumented)
    static urlToDataUrl(url: string): Promise<string>;
}

// @internal
export function filterEntries<Key extends string, Value>(object: {
    [K in Key]: Value;
}, predicate: (key: Key, value: Value) => boolean): {
    [K in Key]: Value;
};

// @internal
export function fpsThrottle(fn: {
    (): void;
    cancel?(): void;
}): {
    (): void;
    cancel?(): void;
};

// @internal (undocumented)
export function getChangedKeys<T extends object>(obj1: T, obj2: T): (keyof T)[];

// @internal (undocumented)
export function getErrorAnnotations(error: Error): ErrorAnnotations;

// @public
export function getFirstFromIterable<T = unknown>(set: Map<any, T> | Set<T>): T;

// @internal
export function getFromLocalStorage(key: string): null | string;

// @internal
export function getFromSessionStorage(key: string): null | string;

// @public
export function getHashForBuffer(buffer: ArrayBuffer): string;

// @public
export function getHashForObject(obj: any): string;

// @public
export function getHashForString(string: string): string;

// @public
export function getIndexAbove(below?: IndexKey | null | undefined): IndexKey;

// @public
export function getIndexBelow(above?: IndexKey | null | undefined): IndexKey;

// @public
export function getIndexBetween(below: IndexKey | null | undefined, above: IndexKey | null | undefined): IndexKey;

// @public
export function getIndices(n: number, start?: IndexKey): IndexKey[];

// @public
export function getIndicesAbove(below: IndexKey | null | undefined, n: number): IndexKey[];

// @public
export function getIndicesBelow(above: IndexKey | null | undefined, n: number): IndexKey[];

// @public
export function getIndicesBetween(below: IndexKey | null | undefined, above: IndexKey | null | undefined, n: number): IndexKey[];

// @internal (undocumented)
export function getOwnProperty<K extends string, V>(obj: Partial<Record<K, V>>, key: K): undefined | V;

// @internal (undocumented)
export function getOwnProperty<O extends object>(obj: O, key: string): O[keyof O] | undefined;

// @internal (undocumented)
export function getOwnProperty(obj: object, key: string): unknown;

// @internal (undocumented)
export function groupBy<K extends string, V>(array: ReadonlyArray<V>, keySelector: (value: V) => K): Record<K, V[]>;

// @internal (undocumented)
export function hasOwnProperty(obj: object, key: string): boolean;

// @internal
const Image_2: (width?: number, height?: number) => HTMLImageElement;
export { Image_2 as Image }

// @public
export type IndexKey = string & {
    __brand: 'indexKey';
};

// @public
export function invLerp(a: number, b: number, t: number): number;

// @public
export function isDefined<T>(value: T): value is typeof value extends undefined ? never : T;

export { isEqual }

// @internal (undocumented)
export function isEqualAllowingForFloatingPointErrors(obj1: object, obj2: object, threshold?: number): boolean;

export { isEqualWith }

// @internal (undocumented)
export const isNativeStructuredClone: boolean;

// @public
export function isNonNull<T>(value: T): value is typeof value extends null ? never : T;

// @public
export function isNonNullish<T>(value: T): value is typeof value extends undefined ? never : typeof value extends null ? never : T;

// @public (undocumented)
export type JsonArray = JsonValue[];

// @public (undocumented)
export interface JsonObject {
    // (undocumented)
    [key: string]: JsonValue | undefined;
}

// @public (undocumented)
export type JsonPrimitive = boolean | null | number | string;

// @public (undocumented)
export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

// @internal (undocumented)
export function last<T>(arr: readonly T[]): T | undefined;

// @public
export function lerp(a: number, b: number, t: number): number;

// @public (undocumented)
export function lns(str: string): string;

// @public (undocumented)
export type MakeUndefinedOptional<T extends object> = Expand<{
    [P in {
        [K in keyof T]: undefined extends T[K] ? never : K;
    }[keyof T]]: T[P];
} & {
    [P in {
        [K in keyof T]: undefined extends T[K] ? K : never;
    }[keyof T]]?: T[P];
}>;

// @internal
export function mapObjectMapValues<Key extends string, ValueBefore, ValueAfter>(object: {
    readonly [K in Key]: ValueBefore;
}, mapper: (key: Key, value: ValueBefore) => ValueAfter): {
    [K in Key]: ValueAfter;
};

// @internal (undocumented)
export function maxBy<T>(arr: readonly T[], fn: (item: T) => number): T | undefined;

// @internal (undocumented)
export function measureAverageDuration(_target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;

// @internal (undocumented)
export function measureCbDuration(name: string, cb: () => any): any;

// @internal (undocumented)
export function measureDuration(_target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;

// @public
export class MediaHelpers {
    static getImageAndDimensions(src: string): Promise<{
        h: number;
        image: HTMLImageElement;
        w: number;
    }>;
    static getImageSize(blob: Blob): Promise<{
        h: number;
        w: number;
    }>;
    // (undocumented)
    static getVideoFrameAsDataUrl(video: HTMLVideoElement, time?: number): Promise<string>;
    static getVideoSize(blob: Blob): Promise<{
        h: number;
        w: number;
    }>;
    // (undocumented)
    static isAnimated(file: Blob): Promise<boolean>;
    // (undocumented)
    static isAnimatedImageType(mimeType: null | string): boolean;
    // (undocumented)
    static isImageType(mimeType: string): boolean;
    // (undocumented)
    static isStaticImageType(mimeType: null | string): boolean;
    // (undocumented)
    static isVectorImageType(mimeType: null | string): boolean;
    static loadVideo(src: string): Promise<HTMLVideoElement>;
    // (undocumented)
    static usingObjectURL<T>(blob: Blob, fn: (url: string) => Promise<T>): Promise<T>;
}

// @internal (undocumented)
export function mergeArraysAndReplaceDefaults<const Key extends string, T extends {
    [K in Key]: string;
}>(key: Key, customEntries: readonly T[], defaults: readonly T[]): T[];

// @internal (undocumented)
export function minBy<T>(arr: readonly T[], fn: (item: T) => number): T | undefined;

// @internal (undocumented)
export function mockUniqueId(fn: (size?: number) => string): void;

// @public
export function modulate(value: number, rangeA: number[], rangeB: number[], clamp?: boolean): number;

// @internal
export const noop: () => void;

// @internal
export function objectMapEntries<Key extends string, Value>(object: {
    [K in Key]: Value;
}): Array<[Key, Value]>;

// @internal
export function objectMapEntriesIterable<Key extends string, Value>(object: {
    [K in Key]: Value;
}): IterableIterator<[Key, Value]>;

// @internal
export function objectMapFromEntries<Key extends string, Value>(entries: ReadonlyArray<readonly [Key, Value]>): {
    [K in Key]: Value;
};

// @internal
export function objectMapKeys<Key extends string>(object: {
    readonly [K in Key]: unknown;
}): Array<Key>;

// @internal
export function objectMapValues<Key extends string, Value>(object: {
    [K in Key]: Value;
}): Array<Value>;

// @public (undocumented)
export interface OkResult<T> {
    // (undocumented)
    readonly ok: true;
    // (undocumented)
    readonly value: T;
}

// @internal (undocumented)
export function omit(obj: Record<string, unknown>, keys: ReadonlyArray<string>): Record<string, unknown>;

// @internal
export function omitFromStackTrace<Args extends Array<unknown>, Return>(fn: (...args: Args) => Return): (...args: Args) => Return;

// @internal
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]];

// @public (undocumented)
export class PerformanceTracker {
    // (undocumented)
    isStarted(): boolean;
    // (undocumented)
    recordFrame: () => void;
    // (undocumented)
    start(name: string): void;
    // (undocumented)
    stop(): void;
}

// @public (undocumented)
export class PngHelpers {
    // (undocumented)
    static findChunk(view: DataView, type: string): {
        dataOffset: number;
        size: number;
        start: number;
    };
    // (undocumented)
    static getChunkType(view: DataView, offset: number): string;
    // (undocumented)
    static isPng(view: DataView, offset: number): boolean;
    // (undocumented)
    static parsePhys(view: DataView, offset: number): {
        ppux: number;
        ppuy: number;
        unit: number;
    };
    // (undocumented)
    static readChunks(view: DataView, offset?: number): Record<string, {
        dataOffset: number;
        size: number;
        start: number;
    }>;
    // (undocumented)
    static setPhysChunk(view: DataView, dpr?: number, options?: BlobPropertyBag): Blob;
}

// @internal (undocumented)
export function promiseWithResolve<T>(): Promise<T> & {
    reject(reason?: any): void;
    resolve(value: T): void;
};

// @public (undocumented)
export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

// @internal (undocumented)
export function registerAnnotatorLibraryVersion(name?: string, version?: string, modules?: string): void;

// @internal (undocumented)
type Required_2<T, K extends keyof T> = Expand<Omit<T, K> & {
    [P in K]-?: T[P];
}>;
export { Required_2 as Required }

// @internal (undocumented)
export function restoreUniqueId(): void;

// @public (undocumented)
export type Result<T, E> = ErrorResult<E> | OkResult<T>;

// @public (undocumented)
export const Result: {
    err<E>(error: E): ErrorResult<E>;
    ok<T>(value: T): OkResult<T>;
};

// @internal (undocumented)
export function retry<T>(fn: () => Promise<T>, { attempts, waitDuration, abortSignal, matchError, }?: {
    abortSignal?: AbortSignal;
    attempts?: number;
    matchError?(error: unknown): boolean;
    waitDuration?: number;
}): Promise<T>;

// @public
export function rng(seed?: string): () => number;

// @public
export function rotateArray<T>(arr: T[], offset: number): T[];

// @public (undocumented)
export const safeParseUrl: (url: string, baseUrl?: string | URL) => undefined | URL;

// @internal
export function setInLocalStorage(key: string, value: string): void;

// @internal
export function setInSessionStorage(key: string, value: string): void;

// @internal (undocumented)
export function sleep(ms: number): Promise<void>;

// @public (undocumented)
export function sortById<T extends {
    id: any;
}>(a: T, b: T): -1 | 1;

// @public
export function sortByIndex<T extends {
    index: IndexKey;
}>(a: T, b: T): -1 | 0 | 1;

// @internal (undocumented)
export function stringEnum<T extends string>(...values: T[]): {
    [K in T]: K;
};

// @internal
export const STRUCTURED_CLONE_OBJECT_PROTOTYPE: any;

// @public
const structuredClone_2: <T>(i: T) => T;
export { structuredClone_2 as structuredClone }

export { throttle }

// @internal
export function throttleToNextFrame(fn: () => void): () => void;

// @public (undocumented)
export class Timers {
    constructor();
    // (undocumented)
    dispose(contextId: string): void;
    // (undocumented)
    disposeAll(): void;
    // (undocumented)
    forContext(contextId: string): {
        dispose: () => void;
        requestAnimationFrame: (callback: FrameRequestCallback) => number;
        setInterval: (handler: TimerHandler, timeout?: number, ...args: any[]) => number;
        setTimeout: (handler: TimerHandler, timeout?: number, ...args: any[]) => number;
    };
    // (undocumented)
    requestAnimationFrame(contextId: string, callback: FrameRequestCallback): number;
    // (undocumented)
    setInterval(contextId: string, handler: TimerHandler, timeout?: number, ...args: any[]): number;
    // (undocumented)
    setTimeout(contextId: string, handler: TimerHandler, timeout?: number, ...args: any[]): number;
}

export { uniq }

// @public
export function uniqueId(size?: number): string;

// @internal (undocumented)
export function validateIndexKey(index: string): asserts index is IndexKey;

// @internal (undocumented)
export function warnDeprecatedGetter(name: string): void;

// @internal (undocumented)
export function warnOnce(message: string): void;

// @public
export class WeakCache<K extends object, V> {
    get<P extends K>(item: P, cb: (item: P) => V): NonNullable<V>;
    items: WeakMap<K, V>;
}

// @public
export const ZERO_INDEX_KEY: IndexKey;

// (No @packageDocumentation comment for this package)

```
