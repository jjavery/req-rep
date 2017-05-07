
class ReqRep {
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

	reply(req, rep) {
		const id = req[this._reqName];

		if (!id) { return rep; }

		if (!this._mutate) { rep = Object.assign({}, rep); }

		rep[this._repName] = id;

		return rep;
	}

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
