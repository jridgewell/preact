import { extend } from './util';
import { h } from './h';

type VNode = import('./internal').VNode;

/**
 * Clones the given VNode, optionally adding attributes/props and replacing its
 * children.
 * @param {import('./vnode').VNode} vnode The virtual DOM element to clone
 * @param {object} props Attributes/props to add when cloning
 * @param {Array<import('./vnode').VNode>} [rest] Any additional arguments will be used as replacement
 *  children.
 */
export function cloneElement(vnode: VNode, props: object) {
	return h(
		vnode.nodeName as any,
		extend(extend({}, vnode.attributes), props),
		arguments.length>2 ? [].slice.call(arguments, 2) : vnode.children
	);
}
