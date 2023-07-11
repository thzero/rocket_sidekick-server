import Joi from 'joi';
import JoiDate from '@joi/date';
Joi.extend(JoiDate);

import Constants from 'rocket_sidekick_common/constants.js';

import GamerJoiValidationService from '@thzero/library_server_validation_joi/gamer.js';

class JoiValidationService extends GamerJoiValidationService {
	_any = Joi.any().allow(null);

	_measurementId = Joi.string()
		.trim()
		.alphanum()
		.min(2)
		.max(10);
	_type = Joi.string()
		.trim()
		.alphanum()
		.min(2)
		.max(16);
	
	// checklistId = this._id.required();
	checklistId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);

	// ownerId = this._id.required();
	ownerId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);
	
	// checklistId = this._id.required();
	partId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);
	
	
	// rocketId = this._id.required();
	rocketId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);

	checklistStep = Joi.object({
		id: this.checklistId,
		checklistId: this.checklistId,
		parentId: this.checklistId,
		typeId: this._type,
		description: this._description.allow(null),
		altimeterRecoveryTypeId: Joi.string().allow(null),
		altimeterTypeId: this._type,
		chuteRelease: Joi.boolean().allow(null),
		completedDateTime: this._timestamp.allow(null),
		description: this._description,
		motorLocationTypeId: this._type,
		order: this._number.allow(null),
		trail: Joi.array().items(Joi.string()).allow(null),
		rootName: this._extendedName.allow(null),
		stage: Joi.object().allow(null),
		statusId: this._type,
		steps: Joi.array().items(Joi.any()).allow(null)
	});
	
	checklist = Joi.object({
		id: this.checklistId,
		createdTimestamp: Joi.number(),
		createdUserId: this._id.allow(null),
		typeId: this._type,
		deleted: Joi.boolean().allow(null),
		deletedTimestamp: Joi.number().allow(null),
		deletedUserId: this._id.allow(null),
		description: this._description.allow(null).allow(''),
		launchTypeId: this._type,
		name: this._extendedName,
		ownerId: this.ownerId.allow(null),
		rocketId: this.rocketId.allow(null),
		rocketSetupId: this.rocketId.allow(null),
		statusId: this._type,
		steps: Joi.array().items(Joi.any()).allow(null),
		syncTimestamp: Joi.number().allow(null),
		updatedTimestamp: Joi.number(),
		updatedUserId: this._id.allow(null)
	});
	
	checklistCopyParams = Joi.object({
		id: this.checklistId,
		name: this._extendedName
	});
	
	checklistsParams = Joi.object({
		isCompleted: Joi.boolean(),
		isDefault: Joi.boolean(),
		isInProgress: Joi.boolean(),
		isUser: Joi.boolean()
	});

	contentLicenses() {
		const licenseIds = [];
		Object.entries(Constants.Licenses.Free).map(entry => {
			licenseIds.push(entry[1].id);
		});
		Object.entries(Constants.Licenses.Public).map(entry => {
			licenseIds.push(entry[1].id);
		});
		return licenseIds;
	}

	contentLicense = Joi.string()
		.trim()
		.lowercase()
		.valid(...this.contentLicenses());
	contentLocale = Joi.string()
		.trim()
		.lowercase()
		.min(2)
		.max(5);
	
	content = Joi.object({
		locale: this.contentLocale
	});
	
	contentMarkup = Joi.object({
		locale: this.contentLocale,
		contentId: Joi.string()
			.trim()
			// .alphanum()
			.regex(/^info\.[a-zA-Z0-9-_]*$/)
			.min(2)
			.max(30)
	});
	
	contentReset = Joi.object({
		contentId: Joi.string()
			.trim()
			// .alphanum()
			.regex(/^info\.[a-zA-Z0-9-_]*$/)
			.min(2)
			.max(30)
			.allow(null)
			.allow('')
	});
	
	// manufacturersId = this._id.required();
	manufacturersId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);
	
	manufacturersParams = Joi.object({
	});
	
	parts = Joi.object({
		id: this.partId,
		createdTimestamp: Joi.number(),
		createdUserId: this._id.allow(null),
		typeId: this._type.required(),
		deleted: Joi.boolean().allow(null),
		deletedTimestamp: Joi.number().allow(null),
		deletedUserId: this._id.allow(null),
		description: this._description.allow(null).allow(''),
		manufacturerId: this.manufacturersId.required(),
		manufacturerStockId: this.partId.allow(null).allow(''),
		name: this._extendedName,
		ownerId: this.ownerId.allow(null),
		syncTimestamp: Joi.number().allow(null),
		updatedTimestamp: Joi.number(),
		updatedUserId: this._id.allow(null),
		weight: Joi.number().allow(null),
		weightMeasurementUnitId: this._measurementId.allow(null),
		weightMeasurementUnitsId: this._measurementId.allow(null),
	}).unknown();
	
	partsAltimeter = this.parts.concat(Joi.object({
	})).unknown();
	
	partsChuteProtector = this.parts.concat(Joi.object({
		diameter: Joi.number().required(),
	})).unknown();
	
	partsChuteRelease = this.parts.concat(Joi.object({
	})).unknown();
	
	partsCopyParams = Joi.object({
		id: this.partId,
		name: this._extendedName
	});
	
	partsDeploymentBag = this.parts.concat(Joi.object({
	})).unknown();
	
	partsMotor = this.parts.concat(Joi.object({
	})).unknown();
	
	partsMotorCase = this.parts.concat(Joi.object({
	})).unknown();
	
	partsParams = Joi.object({
		isPublic: Joi.boolean(),
		isUser: Joi.boolean(),
		type: this._type,
	});
	
	partsParachute = this.parts.concat(Joi.object({
		diameter: Joi.number().required(),
		loadMax: Joi.number().allow(null),
		loadMin: Joi.number().allow(null),
		thinMill: Joi.boolean().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		loadMaxWeightMeasurementUnitId: this._measurementId.allow(null),
		loadMaxWeightMeasurementUnitsId: this._measurementId.allow(null),
		loadMinWeightMeasurementUnitId: this._measurementId.allow(null),
		loadMinWeightMeasurementUnitsId: this._measurementId.allow(null)
	}));
	
	partsStreamer = this.parts.concat(Joi.object({
	})).unknown();
	
	partsTrackere = this.parts.concat(Joi.object({
	})).unknown();
	
	rocket = Joi.object({
		id: this.rocketId,
		createdTimestamp: Joi.number(),
		createdUserId: this._id.allow(null),
		typeId: this._type,
		deleted: Joi.boolean().allow(null),
		deletedTimestamp: Joi.number().allow(null),
		deletedUserId: this._id.allow(null),
		description: this._description.allow(null).allow(''),
		name: this._extendedName,
		ownerId: this.ownerId.allow(null),
		syncTimestamp: Joi.number().allow(null),
		updatedTimestamp: Joi.number(),
		updatedUserId: this._id.allow(null)
	});
	
	rocketsCopyParams = Joi.object({
		id: this.checklistId,
		name: this._extendedName
	});
	
	rocketsParams = Joi.object({
	});
	
	syncFrom = Joi.object({
		collections: Joi.array().items(Joi.string().valid('checklists', 'launches', 'parachutes', 'rockets')),
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
