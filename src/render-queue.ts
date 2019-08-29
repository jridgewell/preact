import options from './options';
import { defer } from './util';
import { renderComponent } from './vdom/component';

type Component = import('./internal').Component;

/**
 * Managed queue of dirty components to be re-rendered
 * @type {Array<import('./component').Component>}
 */
let items: Component[] = [];

/**
 * Enqueue a rerender of a component
 * @param {import('./component').Component} component The component to rerender
 */
export function enqueueRender(component: Component) {
	if (!component._dirty && (component._dirty = true) && items.push(component)==1) {
		(options.debounceRendering || defer)(rerender);
	}
}

/** Rerender all enqueued dirty components */
export function rerender() {
	let p;
	while ( (p = items.pop()) ) {
		if (p._dirty) renderComponent(p);
	}
}
