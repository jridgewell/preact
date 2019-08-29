import { Component } from '../component';

type ComponentType = import('../internal').Component;
type ComponentConstructor = import('../internal').ComponentConstructor;
type FunctionalComponent<T> = import('../internal').FunctionalComponent<T>;
/**
 * Retains a pool of Components for re-use.
 * @type {Component[]}
 * @private
 */
export const recyclerComponents: ComponentType[] = [];


/**
 * Create a component. Normalizes differences between PFC's and classful
 * Components.
 * @param {function} Ctor The constructor of the component to create
 * @param {object} props The initial props of the component
 * @param {object} context The initial context of the component
 * @returns {import('../component').Component}
 */
export function createComponent(Ctor: ComponentConstructor, props: object, context: object) {
	let inst, i = recyclerComponents.length;

	if (Ctor.prototype && Ctor.prototype.render) {
		inst = new Ctor(props, context);
		Component.call(inst, props, context);
	}
	else {
		inst = new (Component as unknown as ComponentConstructor)(props, context);
		inst.constructor = Ctor;
		inst.render = doRender;
	}


	while (i--) {
		if (recyclerComponents[i].constructor===Ctor) {
			inst.nextBase = recyclerComponents[i].nextBase;
			recyclerComponents.splice(i, 1);
			return inst;
		}
	}

	return inst;
}


/** The `.render()` method for a PFC backing instance. */
function doRender(this: ComponentType, props: object, state: any, context: object) {
	return this.constructor(props, context);
}
