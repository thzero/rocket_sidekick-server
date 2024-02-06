import AppConstants from '../../constants.js';

import NotImplementedError from '@thzero/library_common/errors/notImplemented.js';

import BaseService from '@thzero/library_server/service/index.js';

class MotorSearchExternalService extends BaseService {
	constructor() {
		super();

		this._serviceCommunicationRest = null;
	}

	async init(injector) {
		await super.init(injector);

		this._serviceCommunicationRest = injector.getService(AppConstants.InjectorKeys.SERVICE_COMMUNICATION_REST);
	}

	nameLocale() {
		this.notImplementedError();
	}

	async manufacturers(correlationId) {
		try {
			const response = await this._manufacturers(correlationId);
			this._logger.debug('MotorSearchExternalService', 'manufacturers', 'response', response, correlationId);
			return response;
		}
		catch (err) {
			return this._error('MotorSearchExternalService', 'manufacturers', null, err, null, null, correlationId);
		}
	}

	async motor(correlationId, motorId) {
		try {
			const response = await this._motor(correlationId, motorId);
			this._logger.debug('MotorSearchExternalService', 'motor', 'response', response, correlationId);
			return response;
		}
		catch (err) {
			return this._error('MotorSearchExternalService', 'motor', null, err, null, correlationId);
		}
	}

	async motors(correlationId, params) {
		try {
			const response = await this._search(correlationId, params);
			this._logger.debug('MotorSearchExternalService', 'search', 'response', response, correlationId);
			return response;
		}
		catch (err) {
			return this._error('MotorSearchExternalService', 'search', null, err, null, correlationId);
		}
	}

	async _manufacturers(correlationId) {
		throw new NotImplementedError();
	}

	async _motor(correlationId, motorId) {
		throw new NotImplementedError();
	}

	async _search(correlationId, criteria) {
		throw new NotImplementedError();
	}
}

export default MotorSearchExternalService;
