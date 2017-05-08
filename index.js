
/**
 * A generic request-reply protocol for JavaScript objects
 */
class ReqRep {
	/**
	 * Creates an instance of ReqRep.
	 * @param {Object} [options] - Optional parameters
	 * @param {string} [options.req='req'] - Property name for request ID
	 * @param {string} [options.rep='rep'] - Property name for reply ID
	 * @param {bool} [options.mutate=true] - Whether to mutate req/rep objects or return new instances
	 * @param {number} [options.timeout=0] - Request timeout in milliseconds
	 * @param {number} [options.prune=0] - Prune interval in milliseconds
	 */
	constructor(options) {
		options = options || {};

		this._callbacks = {};
		this._timeouts = [];

		this._id = 0;

		this._reqName = options.req || 'req';
		this._repName = options.rep || 'rep';

		this._mutate = options.mutate === false ? false : true;

		const timeout = this._timeout = options.timeout || 0;
		if (timeout !== 0 && options.prune !== 0) {
			const prune = options.prune || 1000;
			const timer = setInterval(this.prune.bind(this), prune);
			timer.unref();
		}
	}

	/**
	 * Initialize a request
	 *
	 * @param {Object} req - The request to initialize
	 * @param {function} callback - The callback to call when the request's reply is handled
	 * @returns {Object} - The initialized request object
	 */
	request(req, callback) {
		const id = ++this._id;

		if (!this._mutate) { req = Object.assign({}, req); }

		req[this._reqName] = id;

		this._callbacks[id] = callback;

		if (this._timeout) {
			this._timeouts.push({ t: Date.now() + this._timeout, id });
		}

		return req;
	}

	/**
	 * Reply to a request
	 *
	 * @param {Object} req - The request to reply to
	 * @param {Object} rep - The reply to initialize
	 * @returns {Object} - The initialized reply object
	 */
	reply(req, rep) {
		const id = req[this._reqName];

		if (!id) { return rep; }

		if (!this._mutate) { rep = Object.assign({}, rep); }

		rep[this._repName] = id;

		return rep;
	}

	/**
	 * Handle a reply
	 *
	 * @param {Object} rep - The reply to initialize and dispatch a callback for
	 * @returns {Object} - The initialized reply object
	 */
	handle(rep) {
		const id = rep[this._repName];

		if (!id) { return rep; }

		const callback = this._callbacks[id];

		if (!callback) { return rep; }

		delete this._callbacks[id];

		if (!this._mutate) { rep = Object.assign({}, rep); }

		delete rep[this._repName];

		setImmediate(callback, null, rep);

		return rep;
	}

	/**
	 * Fire callbacks with timeout errors for any past-due timeouts
	 */
	prune() {
		const now = Date.now();

		let deleteCount = 0;

		for (let i = 0, len = this._timeouts.length; i < len; ++i) {
			let timeout = this._timeouts[i];

			if (timeout.t <= now) {
				deleteCount = i + 1;

				let callback = this._callbacks[timeout.id];

				if (!callback) { continue; }

				callback(new Error('The request timed out'));

				delete this._callbacks[timeout.id];
			}
		}

		if (deleteCount) { this._timeouts.splice(0, deleteCount); }
	}
}

module.exports = ReqRep;
