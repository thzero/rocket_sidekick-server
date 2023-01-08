import Joi from 'joi';
import JoiDate from '@joi/date';
Joi.extend(JoiDate);

// import SharedConstants from '../../../common/constants.js';

import GamerJoiValidationService from '@thzero/library_server_validation_joi/gamer.js';

class JoiValidationService extends GamerJoiValidationService {
	_any = Joi.any().allow(null);

	_measurementId = Joi.string()
		.trim()
		.alphanum()
		.min(2)
		.max(10);
	
	syncFrom = Joi.object({
		collections: Joi.array().items(Joi.string()),
		lastSyncTimestamp: Joi.number().allow(null),
		objects: Joi.array().items(this._any)
	});

	syncTo = Joi.object({
		lastSyncTimestamp: Joi.number().allow(null)
	});

	_settingsMeasurementUnitsSchema = Joi.object({
		id: this._measurementId.allow(null).allow(''),
		acceleration: this._measurementId.allow(null).allow(''),
		area: this._measurementId.allow(null).allow(''),
		distance: this._measurementId.allow(null).allow(''),
		length: this._measurementId.allow(null).allow(''),
		velocity: this._measurementId.allow(null).allow(''),
		volume: this._measurementId.allow(null).allow(''),
		weight: this._measurementId.allow(null).allow('')
	});

	settingSchema() {
		const validation = super.settingSchema();
		return validation.concat(Joi.object({
			measurementUnits: this._settingsMeasurementUnitsSchema.required()
		}));
	}
}

export default JoiValidationService;
