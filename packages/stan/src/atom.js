/** @typedef {import('./types').WPCommonAtomConfig} WPCommonAtomConfig */
/**
 * @template T
 * @typedef {import("./types").WPAtom<T>} WPAtom
 */

/**
 * Creates a basic atom.
 *
 * @template T
 * @param {T}                   initialValue Initial value in the atom. *
 * @param {WPCommonAtomConfig=} config       Common Atom config.
 * @return {WPAtom<T>} Createtd atom.
 */
export const createAtom = ( initialValue, config = {} ) => () => {
	let value = initialValue;

	/**
	 * @type {(() => void)[]}
	 */
	let listeners = [];

	return {
		id: config.id,
		type: 'root',
		set( newValue ) {
			value = newValue;
			listeners.forEach( ( l ) => l() );
		},
		get() {
			return value;
		},
		async resolve() {
			return value;
		},
		subscribe( listener ) {
			listeners.push( listener );
			return () =>
				( listeners = listeners.filter( ( l ) => l !== listener ) );
		},
		isResolved: true,
	};
};
