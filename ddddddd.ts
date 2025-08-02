import { ArraySet } from './ArraySet'
import { HistoryBuffer } from './HistoryBuffer'
import { maybeCaptureParent } from './capture'
import { EMPTY_ARRAY, equals, singleton } from './helpers'
import { advanceGlobalEpoch, atomDidChange, getGlobalEpoch } from './transactions'
import { Child, ComputeDiff, RESET_VALUE, Signal } from './types'

export interface AtomOptions<Value, Diff> {
	historyLength?: number
	computeDiff?: ComputeDiff<Value, Diff>
	isEqual?(a: any, b: any): boolean
}
 
export interface Atom<Value, Diff = unknown> extends Signal<Value, Diff> {
	set(value: Value, diff?: Diff): Value
	update(updater: (value: Value) => Value): Value
}
class __Atom__<Value, Diff = unknown> implements Atom<Value, Diff> {
	constructor(
		public readonly name: string,
		private current: Value,
		options?: AtomOptions<Value, Diff>
	) {
		this.isEqual = options?.isEqual ?? null
		if (!options) return

		if (options.historyLength) {
			this.historyBuffer = new HistoryBuffer(options.historyLength)
		}
		this.computeDiff = options.computeDiff
	}
	readonly isEqual: null | ((a: any, b: any) => boolean)
	computeDiff?: ComputeDiff<Value, Diff>
	lastChangedEpoch = getGlobalEpoch()
	children = new ArraySet<Child>()
	historyBuffer?: HistoryBuffer<Diff>

	__unsafe__getWithoutCapture(_ignoreErrors?: boolean): Value {
		return this.current
	}

	get() {
		maybeCaptureParent(this)
		return this.current
	}

	set(value: Value, diff?: Diff): Value {
		// If the value has not changed, do nothing.
		if (this.isEqual?.(this.current, value) ?? equals(this.current, value)) {
			return this.current
		}

		// Tick forward the global epoch
		advanceGlobalEpoch()

		// Add the diff to the history buffer.
		if (this.historyBuffer) {
			this.historyBuffer.pushEntry(
				this.lastChangedEpoch,
				getGlobalEpoch(),
				diff ??
					this.computeDiff?.(this.current, value, this.lastChangedEpoch, getGlobalEpoch()) ??
					RESET_VALUE
			)
		}

		// Update the atom's record of the epoch when last changed.
		this.lastChangedEpoch = getGlobalEpoch()

		const oldValue = this.current
		this.current = value

		// Notify all children that this atom has changed.
		atomDidChange(this as any, oldValue)

		return value
	}

	update(updater: (value: Value) => Value): Value {
		return this.set(updater(this.current))
	}

	getDiffSince(epoch: number): RESET_VALUE | Diff[] {
		maybeCaptureParent(this)

		// If no changes have occurred since the given epoch, return an empty array.
		if (epoch >= this.lastChangedEpoch) {
			return EMPTY_ARRAY
		}

		return this.historyBuffer?.getChangesSince(epoch) ?? RESET_VALUE
	}
}

export const _Atom = singleton('Atom', () => __Atom__)
export type _Atom = InstanceType<typeof _Atom>



export function atom<Value, Diff = unknown>(
	name: string,
	initialValue: Value,
	options?: AtomOptions<Value, Diff>
): Atom<Value, Diff> {
	return new _Atom(name, initialValue, options)
}

export function isAtom(value: unknown): value is Atom<unknown> {
	return value instanceof _Atom
}







export const globalEditor = atom<Editor | null>('globalEditor', null)