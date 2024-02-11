import AppConstants from '../constants.js';

import Service from '@thzero/library_server/service/index.js';

class PubSubService extends Service {
	constructor() {
		super();

		this._repositorPubSub = null;

		this._hooks = {};
	}

	async init(injector) {
		await super.init(injector);

		this._repositorPubSub = this._injector.getService(AppConstants.InjectorKeys.REPOSITORY_PUBSUB);
	}

	async initialize(correlationId) {
		try {
			return await this._repositorPubSub.listen(correlationId);
		}
		catch (err) {
			return this._error('PubSubService', 'initialize', null, err, null, null, correlationId);
		}
	}

	async perform(correlationId, message) {
		this._enforceNotNull('PubSubService', 'perform', 'message', message, correlationId);
		this._enforceNotEmpty('PubSubService', 'perform', 'message.type', message.type, correlationId);

		try {
			if (String.isNullOrEmpty(message.type))
				return this._success(correlationId);

			const hook = this._hooks[message.type];
			if (!hook) 
				return this._error('PubSubService', 'perform', `No hook for '${message.type}'.`, null, null, null, correlationId);
			
			const response = hook.func.apply(hook.parent, correlationId);
			return response;
		}
		catch (err) {
			return this._error('PubSubService', 'perform', null, err, null, null, correlationId);
		}
	}

	async registerHook(correlationId, key, parent, func) {
		this._enforceNotEmpty('PubSubService', 'registerHook', 'key', key, correlationId);
		this._enforceNotNull('PubSubService', 'registerHook', 'parent', parent, correlationId);
		this._enforceNotNull('PubSubService', 'registerHook', 'func', func, correlationId);

		try {
			this._hooks[key] = { parent: parent, func: func };
		}
		catch (err) {
			return this._error('PubSubService', 'registerHook', null, err, null, null, correlationId);
		}
	}

	async send(correlationId, type) {
		this._enforceNotEmpty('PubSubService', 'send', 'type', type, correlationId);
		
		try {
			return await this._repositorPubSub.send(correlationId, type);
		}
		catch (err) {
			return this._error('PubSubService', 'send', null, err, null, null, correlationId);
		}
	}
}

export default PubSubService;
