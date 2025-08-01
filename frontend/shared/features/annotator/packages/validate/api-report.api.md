## API Report File for "@annotator/validate"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { IndexKey } from '@annotator/utils';
import { JsonValue } from '@annotator/utils';
import { MakeUndefinedOptional } from '@annotator/utils';

// @public
const any: Validator<any>;

// @public
const array: Validator<unknown[]>;

// @public
function arrayOf<T>(itemValidator: Validatable<T>): ArrayOfValidator<T>;

// @public (undocumented)
export class ArrayOfValidator<T> extends Validator<T[]> {
    constructor(itemValidator: Validatable<T>);
    // (undocumented)
    readonly itemValidator: Validatable<T>;
    // (undocumented)
    lengthGreaterThan1(): Validator<T[]>;
    // (undocumented)
    nonEmpty(): Validator<T[]>;
}

// @public
const bigint: Validator<bigint>;

// @public
const boolean: Validator<boolean>;

// @public
function dict<Key extends string, Value>(keyValidator: Validatable<Key>, valueValidator: Validatable<Value>): DictValidator<Key, Value>;

// @public (undocumented)
export class DictValidator<Key extends string, Value> extends Validator<Record<Key, Value>> {
    constructor(keyValidator: Validatable<Key>, valueValidator: Validatable<Value>);
    // (undocumented)
    readonly keyValidator: Validatable<Key>;
    // (undocumented)
    readonly valueValidator: Validatable<Value>;
}

// @public
const httpUrl: Validator<string>;

// @public
const indexKey: Validator<IndexKey>;

// @public
const integer: Validator<number>;

// @public
function jsonDict(): DictValidator<string, JsonValue>;

// @public
const jsonValue: Validator<JsonValue>;

// @public
const linkUrl: Validator<string>;

// @public
function literal<T extends boolean | number | string>(expectedValue: T): Validator<T>;

// @public (undocumented)
function literalEnum<const Values extends readonly unknown[]>(...values: Values): Validator<Values[number]>;

// @public
function model<T extends {
    readonly id: string;
}>(name: string, validator: Validatable<T>): Validator<T>;

// @public
const nonZeroInteger: Validator<number>;

// @public
const nonZeroNumber: Validator<number>;

// @public (undocumented)
function nullable<T>(validator: Validatable<T>): Validator<null | T>;

// @public
const number: Validator<number>;

// @internal (undocumented)
function numberUnion<Key extends string, Config extends UnionValidatorConfig<Key, Config>>(key: Key, config: Config): UnionValidator<Key, Config>;

// @public
function object<Shape extends object>(config: {
    readonly [K in keyof Shape]: Validatable<Shape[K]>;
}): ObjectValidator<MakeUndefinedOptional<Shape>>;

// @public (undocumented)
export class ObjectValidator<Shape extends object> extends Validator<Shape> {
    constructor(config: {
        readonly [K in keyof Shape]: Validatable<Shape[K]>;
    }, shouldAllowUnknownProperties?: boolean);
    // (undocumented)
    allowUnknownProperties(): ObjectValidator<Shape>;
    // (undocumented)
    readonly config: {
        readonly [K in keyof Shape]: Validatable<Shape[K]>;
    };
    extend<Extension extends Record<string, unknown>>(extension: {
        readonly [K in keyof Extension]: Validatable<Extension[K]>;
    }): ObjectValidator<Shape & Extension>;
}

// @public (undocumented)
function optional<T>(validator: Validatable<T>): Validator<T | undefined>;

// @public
function or<T1, T2>(v1: Validatable<T1>, v2: Validatable<T2>): Validator<T1 | T2>;

// @public
const positiveInteger: Validator<number>;

// @public
const positiveNumber: Validator<number>;

// @public (undocumented)
function setEnum<T>(values: ReadonlySet<T>): Validator<T>;

// @public
const srcUrl: Validator<string>;

// @public
const string: Validator<string>;

declare namespace T {
    export {
        literal,
        arrayOf,
        object,
        jsonDict,
        dict,
        union,
        numberUnion,
        model,
        setEnum,
        optional,
        nullable,
        literalEnum,
        or,
        ValidatorFn,
        ValidatorUsingKnownGoodVersionFn,
        Validatable,
        ValidationError,
        TypeOf,
        Validator,
        ArrayOfValidator,
        ObjectValidator,
        UnionValidatorConfig,
        UnionValidator,
        DictValidator,
        unknown,
        any,
        string,
        number,
        positiveNumber,
        nonZeroNumber,
        integer,
        positiveInteger,
        nonZeroInteger,
        boolean,
        bigint,
        array,
        unknownObject,
        jsonValue,
        linkUrl,
        srcUrl,
        httpUrl,
        indexKey
    }
}
export { T }

// @public (undocumented)
type TypeOf<V extends Validatable<any>> = V extends Validatable<infer T> ? T : never;

// @public
function union<Key extends string, Config extends UnionValidatorConfig<Key, Config>>(key: Key, config: Config): UnionValidator<Key, Config>;

// @public (undocumented)
export class UnionValidator<Key extends string, Config extends UnionValidatorConfig<Key, Config>, UnknownValue = never> extends Validator<TypeOf<Config[keyof Config]> | UnknownValue> {
    constructor(key: Key, config: Config, unknownValueValidation: (value: object, variant: string) => UnknownValue, useNumberKeys: boolean);
    // (undocumented)
    validateUnknownVariants<Unknown>(unknownValueValidation: (value: object, variant: string) => Unknown): UnionValidator<Key, Config, Unknown>;
}

// @public (undocumented)
export type UnionValidatorConfig<Key extends string, Config> = {
    readonly [Variant in keyof Config]: Validatable<any> & {
        validate(input: any): {
            readonly [K in Key]: Variant;
        };
    };
};

// @public
const unknown: Validator<unknown>;

// @public (undocumented)
const unknownObject: Validator<Record<string, unknown>>;

// @public (undocumented)
interface Validatable<T> {
    // (undocumented)
    validate(value: unknown): T;
    validateUsingKnownGoodVersion?(knownGoodValue: T, newValue: unknown): T;
}

// @public (undocumented)
class ValidationError extends Error {
    constructor(rawMessage: string, path?: ReadonlyArray<number | string>);
    // (undocumented)
    name: string;
    // (undocumented)
    readonly path: ReadonlyArray<number | string>;
    // (undocumented)
    readonly rawMessage: string;
}

// @public (undocumented)
export class Validator<T> implements Validatable<T> {
    constructor(validationFn: ValidatorFn<T>, validateUsingKnownGoodVersionFn?: undefined | ValidatorUsingKnownGoodVersionFn<T>);
    check(name: string, checkFn: (value: T) => void): Validator<T>;
    // (undocumented)
    check(checkFn: (value: T) => void): Validator<T>;
    isValid(value: unknown): value is T;
    nullable(): Validator<null | T>;
    optional(): Validator<T | undefined>;
    refine<U>(otherValidationFn: (value: T) => U): Validator<U>;
    validate(value: unknown): T;
    // (undocumented)
    validateUsingKnownGoodVersion(knownGoodValue: T, newValue: unknown): T;
    // (undocumented)
    readonly validateUsingKnownGoodVersionFn?: undefined | ValidatorUsingKnownGoodVersionFn<T>;
    // (undocumented)
    readonly validationFn: ValidatorFn<T>;
}

// @public (undocumented)
type ValidatorFn<T> = (value: unknown) => T;

// @public (undocumented)
type ValidatorUsingKnownGoodVersionFn<In, Out = In> = (knownGoodValue: In, value: unknown) => Out;

// (No @packageDocumentation comment for this package)

```
