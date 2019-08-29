import { FORCE_RENDER } from './constants';
import { extend } from './util';
import { renderComponent } from './vdom/component';
import { enqueueRender } from './render-queue';

type ComponentType = import('./internal').Component;
type PreactElement = import('./internal').PreactElement;
type Ref<T> = import('./internal').Ref<T>;

/**
 * Base Component class.
 * Provides `setState()` and `forceUpdate()`, which trigger rendering.
 * @typedef {object} Component
 * @param {object} props The initial component props
 * @param {object} context The initial context from parent components' getChildContext
 * @public
 *
 * @example
 * class MyFoo extends Component {
 *   render(props, state) {
 *     return <div />;
 *   }
 * }
 */
export class Component {
	state: Readonly<object>;
	props: object;
	context: object;
	base?: PreactElement | Text | null;

	_renderCallbacks: ((this: Component) => void)[];
	__key: any;
	__ref?: Ref<any>;
	_component?: Component | null;
	_parentComponent?: Component;
	_dirty: boolean;
	_disable?: boolean;
	nextBase?: PreactElement | Text | null;
	prevContext?: object | null;
	prevProps?: object | null;
	prevState?: object | null;

	constructor(props: object, context: object) {
		this._dirty = true;

		/**
		 * @public
		 * @type {object}
		 */
		this.context = context;

		/**
		 * @public
		 * @type {object}
		 */
		this.props = props;

		/**
		 * @public
		 * @type {object}
		 */
		this.state = (this as any).state || {};

		this._renderCallbacks = [];
	}

	/**
	 * Update component state and schedule a re-render.
	 * @param {object} state A dict of state properties to be shallowly merged
	 * 	into the current state, or a function that will produce such a dict. The
	 * 	function is called with the current state and props.
	 * @param {() => void} callback A function to be called once component state is
	 * 	updated
	 */
	setState(state: object, callback: (this: Component) => void) {
		if (!this.prevState) this.prevState = this.state;
		this.state = extend(
			extend({}, this.state),
			typeof state === 'function' ? state(this.state, this.props) : state
		);
		if (callback) this._renderCallbacks.push(callback);
		enqueueRender(this as any);
	}


	/**
	 * Immediately perform a synchronous re-render of the component.
	 * @param {() => void} callback A function to be called after component is
	 * 	re-rendered.
	 * @private
	 */
	forceUpdate(callback: (this: Component) => void) {
		if (callback) this._renderCallbacks.push(callback);
		renderComponent(this as any, FORCE_RENDER);
	}


	/**
	 * Accepts `props` and `state`, and returns a new Virtual DOM tree to build.
	 * Virtual DOM is generally constructed via [JSX](http://jasonformat.com/wtf-is-jsx).
	 * @param {object} props Props (eg: JSX attributes) received from parent
	 * 	element/component
	 * @param {object} state The component's current state
	 * @param {object} context Context object, as returned by the nearest
	 *  ancestor's `getChildContext()`
	 * @returns {import('./vnode').VNode | void}
	 */
	render() {}
}
