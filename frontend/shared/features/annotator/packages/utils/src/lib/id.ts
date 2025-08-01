/*!
 * MIT License: https://github.com/ai/nanoid/blob/main/LICENSE
 * Modified code originally from <https://github.com/ai/nanoid>
 * Copyright 2017 Andrey Sitnik <andrey@sitnik.ru>
 *
 * `nanoid` is currently only distributed as an ES module. Some tools (jest, playwright) don't
 * properly support ESM-only code yet, and annotator itself is distributed as both an ES module and a
 * CommonJS module. By including nanoid here, we can make sure it works well in every environment
 * where annotator is used. We can also remove some unused features like custom alphabets.
 */

// all environments that annotator runs in (browser, workers, recent node versions) have global
// `crypto`
const crypto = globalThis.crypto

// This alphabet uses `A-Za-z0-9_-` symbols.
// The order of characters is optimized for better gzip and brotli compression.
// Same as in non-secure/index.js
const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

// It is best to make fewer, larger requests to the crypto module to
// avoid system call overhead. So, random numbers are generated in a
// pool. The pool is a Buffer that is larger than the initial random
// request size by this multiplier. The pool is enlarged if subsequent
// requests exceed the maximum buffer size.
const POOL_SIZE_MULTIPLIER = 128
let pool: Uint8Array, poolOffset: number

function fillPool(bytes: number) {
	if (!pool || pool.length < bytes) {
		pool = new Uint8Array(bytes * POOL_SIZE_MULTIPLIER)
		crypto.getRandomValues(pool)
		poolOffset = 0
	} else if (poolOffset + bytes > pool.length) {
		crypto.getRandomValues(pool)
		poolOffset = 0
	}
	poolOffset += bytes
}

function nanoid(size = 21) {
	// `-=` convert `size` to number to prevent `valueOf` abusing
	fillPool((size -= 0))
	let id = ''
	// We are reading directly from the random pool to avoid creating new array
	for (let i = poolOffset - size; i < poolOffset; i++) {
		// It is incorrect to use bytes exceeding the alphabet size.
		// The following mask reduces the random byte in the 0-255 value
		// range to the 0-63 value range. Therefore, adding hacks, such
		// as empty string fallback or magic numbers, is unnecessary because
		// the bitmask trims bytes down to the alphabet size.
		id += urlAlphabet[pool[i] & 63]
	}
	return id
}

let impl = nanoid
/** @internal */
export function mockUniqueId(fn: (size?: number) => string) {
	impl = fn
}

/** @internal */
export function restoreUniqueId() {
	impl = nanoid
}

/**
 * Generate a unique id.
 *
 * @example
 *
 * ```ts
 * const id = uniqueId()
 * ```
 *
 * @public
 */
export function uniqueId(size?: number): string {
	return impl(size)
}
