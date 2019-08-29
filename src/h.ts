import options from './options';


type ComponentConstructor = import('./internal').ComponentConstructor;
type VNode = import('./internal').VNode;
type ComponentChildren = import('./internal').ComponentChildren;

const stack: ComponentChildren[] = [];

const EMPTY_CHILDREN: (VNode | string)[] = [];

/**
 * JSX/hyperscript reviver.
 * @see http://jasonformat.com/wtf-is-jsx
 * Benchmarks: https://esbench.com/bench/57ee8f8e330ab09900a1a1a0
 *
 * Note: this is exported as both `h()` and `createElement()` for compatibility
 * reasons.
 *
 * Creates a VNode (virtual DOM element). A tree of VNodes can be used as a
 * lightweight representation of the structure of a DOM tree. This structure can
 * be realized by recursively comparing it against the current _actual_ DOM
 * structure, and applying only the differences.
 *
 * `h()`/`createElement()` accepts an element name, a list of attributes/props,
 * and optionally children to append to the element.
 *
 * @example The following DOM tree
 *
 * `<div id="foo" name="bar">Hello!</div>`
 *
 * can be constructed using this function as:
 *
 * `h('div', { id: 'foo', name : 'bar' }, 'Hello!');`
 *
 * @param {string | function} nodeName An element name. Ex: `div`, `a`, `span`, etc.
 * @param {object | null} attributes Any attributes/props to set on the created element.
 * @param {VNode[]} [rest] Additional arguments are taken to be children to
 *  append. Can be infinitely nested Arrays.
 *
 * @public
 */
export function h(nodeName: string | ComponentConstructor, attributes: object, ..._children: ComponentChildren[]) {
	let children=EMPTY_CHILDREN, lastSimple, child, simple, i;
	for (i=arguments.length; i-- > 2; ) {
		stack.push(arguments[i]);
	}
	if (attributes && (attributes as any).children!=null) {
		if (!stack.length) stack.push((attributes as any).children);
		delete (attributes as any).children;
	}
	while (stack.length) {
		if ((child = stack.pop()) && (child as unknown as ComponentChildren[]).pop!==undefined) {
			for (i=(child as unknown as ComponentChildren[]).length; i--; ) stack.push((child as unknown as ComponentChildren[])[i]);
		}
		else {
			if (typeof child==='boolean') child = null;

			if ((simple = typeof nodeName!=='function')) {
				if (child==null) child = '';
				else if (typeof child==='number') child = String(child);
				else if (typeof child!=='string') simple = false;
			}

			if (simple && lastSimple) {
				(children[children.length-1] as string) += child;
			}
			else if (children===EMPTY_CHILDREN) {
				children = [child as VNode | string];
			}
			else {
				children.push(child as VNode | string);
			}

			lastSimple = simple;
		}
	}

	let p: VNode = {
		nodeName: nodeName,
		children: children,
		attributes: attributes==null ? undefined : attributes,
		key: attributes==null ? undefined : (attributes as any).key
	};

	// if a "vnode hook" is defined, pass every created VNode to it
	if (options.vnode!==undefined) options.vnode(p);

	return p;
}

const EMPTY_STATIC_CHILDREN: StaticChild[] = [];
const staticStack: StaticChild[] = [];

type StaticChild = VNode | string | number | boolean | null;
export function jsx2(nodeName: string | ComponentConstructor, attributes: object, ..._children: StaticChild[]) {
	let children=EMPTY_STATIC_CHILDREN, lastSimple, child, simple, i;
	for (i=arguments.length; i-- > 2; ) {
		staticStack.push(arguments[i]);
	}
	if (attributes && (attributes as any).children!=null) {
		if (!staticStack.length) staticStack.push((attributes as any).children);
		delete (attributes as any).children;
	}
	while (staticStack.length) {
		if ((child = staticStack.pop()) && (child as unknown as StaticChild[]).pop!==undefined) {
			for (i=(child as unknown as StaticChild[]).length; i--; ) staticStack.push((child as unknown as StaticChild[])[i]);
		}
		else {
			if (typeof child==='boolean') child = '';

			if ((simple = typeof nodeName!=='function')) {
				if (child==null) child = '';
				else if (typeof child==='number') child = String(child);
				else if (typeof child!=='string') simple = false;
			}

			if (simple && lastSimple) {
				(children[children.length-1] as string) += child;
			}
			else if (children===EMPTY_CHILDREN) {
				children = [child as VNode | string];
			}
			else {
				children.push(child as VNode | string);
			}

			lastSimple = simple;
		}
	}

	let p: VNode = {
		nodeName: nodeName,
		children: children as (VNode | string)[],
		attributes: attributes==null ? undefined : attributes,
		key: attributes==null ? undefined : (attributes as any).key
	};

	// if a "vnode hook" is defined, pass every created VNode to it
	if (options.vnode!==undefined) options.vnode(p);

	return p;
}

type Template = import('./internal').Template;
type Expression = import('./internal').Expression;
export function createTemplate(tree: VNode, expressions: Expression[]): Template {
	return {
		tree,
		expressions,
		constructor: void 0,
	};
}