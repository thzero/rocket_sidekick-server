import Joi from 'joi';
import JoiDate from '@joi/date';
Joi.extend(JoiDate);

import Constants from 'rocket_sidekick_common/constants.js';

import GamerJoiValidationService from '@thzero/library_server_validation_joi/gamer.js';

class JoiValidationService extends GamerJoiValidationService {
	_any = Joi.any().allow(null);

	_city = Joi.string()
		.trim()
		//.alphanum()
		.regex(/^[a-zA-Z0-9]+(['"._\-a-zA-Z0-9 :;,\(\\+)@]*)*$/)
		.min(3)
		.max(25);

	_country = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[A-Z]*$/).min(3).max(3);

	_postalCode = Joi.string()
		.trim()
		.alphanum()
		.min(2)
		.max(16);

	_stateProvince = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[A-Z]*$/).min(2).max(4);

	_measurementId = Joi.string()
		.trim()
		.alphanum()
		.min(1)
		.max(10);

	_partsName = Joi.string()
		.trim()
		//.alphanum()
		.regex(/^[a-zA-Z0-9]+(['"._\-a-zA-Z0-9 :;,\/\(\\+)@]*)*$/)
		.min(3)
		.max(50);

	_type = Joi.string()
		.trim()
		.alphanum()
		.min(2)
		.max(16);
	
	checklistId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);

	impulseClass = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[ABCDEFGHIJKLMNOP]*$/);
	
	launchId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);
	
	locationId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);

	motorDiameter = Joi.string()
		.trim()
		.regex(/(13|18|24|29|38|54|75|98)/);
	
	motorIndex = Joi.number().greater(-1).less(3);

	ownerId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);
	
	partId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);
	
	rocketId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);

	rocketSetupId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);

	rocketStageId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);
	
	albumOrVideoUrl = Joi.object({
		name: this._extendedName,
		type: Joi.string(),
		link: this._url
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
			.regex(/^(info|tools)\.[a-zA-Z0-9-_]*$/)
			.min(2)
			.max(30)
	});
	
	contentReset = Joi.object({
		contentId: Joi.string()
			.trim()
			// .alphanum()
			.regex(/^(info|tools)\.[a-zA-Z0-9-_]*$/)
			.min(2)
			.max(30)
			.allow(null)
			.allow('')
	});
	
	countriesParams = Joi.object({
	});

	launchReasonsFailure() {
		const reasons = [];
		Object.entries(Constants.Rocketry.Launches.Reasons.Failure).map(entry => {
			reasons.push(entry[1]);
		});
		return reasons;
	}

	launchResultsReasonsSuccess() {
		const reasons = [];
		Object.entries(Constants.Rocketry.Launches.Reasons.Success).map(entry => {
			reasons.push(entry[1]);
		});
		return reasons;
	}

	launchWeather() {
		const reasons = [];
		Object.entries(Constants.Rocketry.Launches.Weather).map(entry => {
			reasons.push(entry[1]);
		});
		return reasons;
	}
	
	locationsIterationNumber = Joi.string()
		.trim()
		.regex(/^[0-9]{0,4}$/)
		.min(1)
		.max(4);
	
	locationsIterationYear = Joi.string()
		.trim()
		.regex(/^[0-9]{0,4}$/)
		.min(4)
		.max(4);
	
	// manufacturersId = this._id.required();
	manufacturersId = Joi.string()
		.trim()
		// .alphanum()
		.regex(/^[a-zA-Z0-9-_]*$/);
	
	manufacturersParams = Joi.object({
	});
	
	rocketryOrganizations = Joi.string()
		.trim()
		.regex(/^[A-Z]{0,4}$/)
		.min(3)
		.max(4);
	
	rocketType = Joi.string()
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
		canLaunch: Joi.boolean().allow(null),
		completeTimestamp: Joi.number(),
		completedUserId: this._id.allow(null),
		statusId: this._type,
		date: Joi.number().allow(null),
		deleted: Joi.boolean().allow(null),
		deletedTimestamp: Joi.number().allow(null),
		deletedUserId: this._id.allow(null),
		description: this._description.allow(null).allow(''),
		isTemplate: Joi.boolean().allow(null),
		launched: Joi.boolean().allow(null),
		locationId: this.locationId.allow(null).allow(''),
		locationIterationId: this.locationId.allow(null),
		name: this._extendedName,
		ownerId: this.ownerId.allow(null),
		rocketId: this.rocketId.allow(null).allow(''),
		rocketSetupId: this.rocketSetupId.allow(null).allow(''),
		rocketTypes: Joi.array().items(this.rocketType).allow(null),
		searchName: this._extendedNameBase.allow(null).allow(''),
		startTimestamp: Joi.number(),
		startUserId: this._id.allow(null),
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
		checklistId: this.checklistId.allow(null).allow(''),
		isCompleted: Joi.boolean().allow(null),
		isDefault: Joi.boolean().allow(null),
		isInProgress: Joi.boolean().allow(null),
		name: this._extendedName.allow(null).allow(''),
		shared: Joi.boolean().allow(null),
		yours: Joi.boolean().allow(null),
		isUser: Joi.boolean().allow(null)
	});
	
	checklistStartParams = this.checklistId;
	
	launchResults = Joi.object({
		accelerationMax: Joi.number().allow(null),
		accelerationMaxMeasurementUnitId: this._measurementId.allow(null),
		accelerationMaxMeasurementUnitsId: this._measurementId.allow(null),
		altitudeDeployDrogue: Joi.number().allow(null),
		altitudeDeployDrogueMeasurementUnitId: this._measurementId.allow(null),
		altitudeDeployDrogueMeasurementUnitsId: this._measurementId.allow(null),
		altitudeDeployMain: Joi.number().allow(null),
		altitudeDeployMainMeasurementUnitId: this._measurementId.allow(null),
		altitudeDeployMainMeasurementUnitsId: this._measurementId.allow(null),
		altitudeMax: Joi.number().allow(null),
		altitudeMaxMeasurementUnitId: this._measurementId.allow(null),
		altitudeMaxMeasurementUnitsId: this._measurementId.allow(null),
		coordsLatLaunch: Joi.number().allow(null),
		coordsLongLaunch: Joi.number().allow(null),
		coordsLatRecovery: Joi.number().allow(null),
		coordsLongRecovery: Joi.number().allow(null),
		velocityRecovery: Joi.number().allow(null),
		velocityRecoveryMeasurementUnitId: this._measurementId.allow(null),
		velocityRecoveryMeasurementUnitsId: this._measurementId.allow(null),
		velocityMax: Joi.number().allow(null),
		velocityMaxMeasurementUnitId: this._measurementId.allow(null),
		velocityMaxMeasurementUnitsId: this._measurementId.allow(null)
	});
	
	launches = Joi.object({
		id: this.launchId,
		albumUrl: this.albumOrVideoUrl.allow(null).allow(''),
		ceiling: Joi.number().allow(null),
		ceilingMeasurementUnitId: this._measurementId.allow(null),
		ceilingMeasurementUnitsId: this._measurementId.allow(null),
		checklistId: this.checklistId.allow(null),
		createdTimestamp: Joi.number(),
		createdUserId: this._id.allow(null),
		date: Joi.number().required(),
		deleted: Joi.boolean().allow(null),
		deletedTimestamp: Joi.number().allow(null),
		deletedUserId: this._id.allow(null),
		description: this._description.allow(null).allow(''),
		failureReasons: Joi.array().items(Joi.string().valid(...this.launchReasonsFailure())).allow(null),
		locationId: this.locationId.allow(null),
		locationIterationId: this.locationId.allow(null),
		name: this._extendedName.allow(null).allow(''),
		//launchStatus: nominal, rapid unscheduled disassembly (rud), deployment failed, lost
		ownerId: this.ownerId.allow(null),
		public: Joi.boolean().required(),
		results: this.launchResults.allow(null),
		rocketId: this.rocketId,
		rocketSetupId: this.rocketSetupId.allow(null).allow(''),
		searchName: this._extendedNameBase.allow(null).allow(''),
		success: Joi.string().valid(...this.launchResultsReasonsSuccess()).allow(null),
		syncTimestamp: Joi.number().allow(null),
		temperature: Joi.number().allow(null),
		temperatureMeasurementUnitId: this._measurementId.allow(null),
		temperatureMeasurementUnitsId: this._measurementId.allow(null),
		videoUrl: this.albumOrVideoUrl.allow(null).allow(''),
		updatedTimestamp: Joi.number(),
		updatedUserId: this._id.allow(null),
		weather: Joi.array().items(Joi.string().valid(...this.launchWeather())).allow(null),
		windSpeed: Joi.number().allow(null),
		windSpeedMeasurementUnitId: this._measurementId.allow(null),
		windSpeedMeasurementUnitsId: this._measurementId.allow(null)
	});
	
	launchesParams = Joi.object({
		locationId: this.locationId.allow('').allow(null),
		name: this._extendedName.allow('').allow(null),
		organizations: Joi.array().items(this.rocketryOrganizations).allow(null),
		rocketId: this.rocketId.allow('').allow(null),
		rocketTypes: Joi.array().items(this.rocketType).allow(null)
	});
	
	locationsAddress = Joi.object({
		city: this._city.allow(null).allow(''),
		country: this._country.allow(null).allow(''),
		name: this._extendedName.allow(null).allow(''),
		postalCode: this._postalCode.allow(null).allow(''),
		stateProvince: this._stateProvince.allow(null).allow('')
	});
	
	locationsIterations = Joi.object({
		id: this.locationId,
		address: this.locationsAddress.allow(null),
		coordsLat: Joi.number().allow(null),
		coordsLong: Joi.number().allow(null),
		dates: Joi.array().items(Joi.number()).allow(null),
		experimental: Joi.boolean().allow(null),
		name: this._extendedName.allow(null).allow(''),
		number: this.locationsIterationNumber.allow(null).allow(''),
		organizations: Joi.array().items(this.rocketryOrganizations).allow(null),
		rocketTypes: Joi.array().items(this.rocketType).allow(null),
		year: this.locationsIterationYear.allow(null).allow('')
	});
	
	locations = Joi.object({
		id: this.locationId,
		alias: this._extendedName,
		createdTimestamp: Joi.number(),
		createdUserId: this._id.allow(null),
		address: this.locationsAddress.allow(null),
		coordsLat: Joi.number().allow(null),
		coordsLong: Joi.number().allow(null),
		deleted: Joi.boolean().allow(null),
		deletedTimestamp: Joi.number().allow(null),
		deletedUserId: this._id.allow(null),
		description: this._description.allow(null).allow(''),
		experimental: Joi.boolean().allow(null),
		iterations: Joi.array().items(this.locationsIterations).allow(null),
		launchId: this.launchId.allow(null).allow(''),
		link: this._url.allow(null).allow(''),
		name: this._extendedName,
		organizations: Joi.array().items(this.rocketryOrganizations).allow(null),
		ownerId: this.ownerId.allow(null),
		public: Joi.boolean().required(),
		rocketTypes: Joi.array().items(this.rocketType).allow(null),
		searchName: this._extendedNameBase.allow(null).allow(''),
		sortName: this._extendedName.allow(null).allow(''),
		syncTimestamp: Joi.number().allow(null),
		updatedTimestamp: Joi.number(),
		updatedUserId: this._id.allow(null)
	});
	
	locationsParams = Joi.object({
		city: this._city.allow(null).allow(''),
		country: this._country.allow(null).allow(''),
		locationId: this.locationId.allow(null).allow(''),
		name: this._extendedName.allow('').allow(null),
		organizations: Joi.array().items(this.rocketryOrganizations).allow(null),
		postalCode: this._postalCode.allow(null).allow(''),
		rocketTypes: Joi.array().items(this.rocketType).allow(null),
		stateProvince: this._stateProvince.allow(null).allow('')
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
		manufacturerId: this.manufacturersId.allow(null).allow(''),
		manufacturerStockId: this.partId.allow(null).allow(''),
		name: this._partsName,
		ownerId: this.ownerId.allow(null),
		public: Joi.boolean().required(),
		searchName: this._extendedNameBase.allow(null).allow(''),
		syncTimestamp: Joi.number().allow(null),
		updatedTimestamp: Joi.number(),
		updatedUserId: this._id.allow(null),
		weight: Joi.number().allow(null),
		weightMeasurementUnitId: this._measurementId.allow(null),
		weightMeasurementUnitsId: this._measurementId.allow(null)
	}).unknown();
	
	partsAltimeter = this.parts.concat(Joi.object({
	})).unknown();
	
	partsChuteProtector = this.parts.concat(Joi.object({
		diameter: Joi.number().allow(null),
		dimension: Joi.number().required(),
		cd: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		dimensionMeasurementUnitId: this._measurementId.allow(null),
		dimensionMeasurementUnitsId: this._measurementId.allow(null)
	}));
	
	partsChuteRelease = this.parts.concat(Joi.object({
	}));
	
	partsCopyParams = Joi.object({
		id: this.partId,
		name: this._partsName
	});
	
	partsDeploymentBag = this.parts.concat(Joi.object({
		diameter: Joi.number().allow(null),
		length: Joi.number().required(),
		pilotChute: Joi.boolean().required(),
		pilotChuteCd: Joi.number().allow(null),
		pilotChuteDiameter: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		lengthnMeasurementUnitId: this._measurementId.allow(null),
		lengthMeasurementUnitsId: this._measurementId.allow(null),
		pilotChuteDiameterMeasurementUnitId: this._measurementId.allow(null),
		pilotChuteDiameterMeasurementUnitsId: this._measurementId.allow(null)
	}));
	
	partsMotor = this.parts.concat(Joi.object({
	})).unknown();
	
	partsMotorCase = this.parts.concat(Joi.object({
	})).unknown();
	
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
	
	partsParams = Joi.object({
		diameter: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		dimension: Joi.number().allow(null),
		dimensionMeasurementUnitId: this._measurementId.allow(null),
		dimensionMeasurementUnitsId: this._measurementId.allow(null),
		length: Joi.number().allow(null),
		lengthMeasurementUnitId: this._measurementId.allow(null),
		lengthMeasurementUnitsId: this._measurementId.allow(null),
		manufacturerId: this.manufacturersId.allow('').allow(null),
		manufacturers: Joi.array().items(this.manufacturersId).allow(null),
		manufacturerStockId: this.partId.allow(null).allow(''),
		name: this._partsName.allow('').allow(null),
		partId: this.partId.allow(null).allow(''),
		public: Joi.number().max(3).min(0).allow(null),
		typeId: this._type,
		weight: Joi.number().allow(null),
		weightMeasurementUnitId: this._measurementId.allow(null),
		weightMeasurementUnitsId: this._measurementId.allow(null)
	}).unknown();
	
	partsParamsAltimeter = this.partsParams.concat(Joi.object({
	}));
	
	partsParamsChuteProtector = this.partsParams.concat(Joi.object({
		diameter: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		dimension: Joi.number().allow(null),
		dimensionMeasurementUnitId: this._measurementId.allow(null),
		dimensionMeasurementUnitsId: this._measurementId.allow(null)
	}));
	
	partsParamsChuteRelease = this.partsParams.concat(Joi.object({
	}));
	
	partsParamsDeploymentBag = this.partsParams.concat(Joi.object({
		diameter: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		length: Joi.number().allow(null),
		lengthMeasurementUnitId: this._measurementId.allow(null),
		lengthMeasurementUnitsId: this._measurementId.allow(null)
	}));
	
	partsParamsMotor = this.partsParams.concat(Joi.object({
	}));
	
	partsParamsMotorCase = this.partsParams.concat(Joi.object({
	}));
	
	partsParamsParachute = this.partsParams.concat(Joi.object({
		diameter: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		thinMill: Joi.boolean().allow(null)
	}));
	
	partsParamsStreamer = this.partsParams.concat(Joi.object({
		length: Joi.number().allow(null),
		lengthMeasurementUnitId: this._measurementId.allow(null),
		lengthMeasurementUnitsId: this._measurementId.allow(null)
	}));
	
	partsParamsSearchRocket = Joi.object({
		diameterMax: Joi.number().allow(null),
		diameterMin: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		lengthMax: Joi.number().allow(null),
		lengthMin: Joi.number().allow(null),
		lengthMeasurementUnitId: this._measurementId.allow(null),
		lengthMeasurementUnitsId: this._measurementId.allow(null),
		manufacturerId: this.manufacturersId.allow('').allow(null),
		manufacturers: Joi.array().items(this.manufacturersId).allow(null),
		manufacturerStockId: this.partId.allow(null).allow(''),
		motorDiameter: Joi.number().allow(null),
		motorImpulseClass: this.impulseClass.allow(null).allow(null),
		name: this._partsName.allow('').allow(null),
		partTypes: Joi.array().items(this.partId).allow(null),
		rocketTypes: Joi.array().items(this.rocketType).allow(null),
		thinMill: Joi.boolean().allow(null)
	});
	
	partsParamsTracker = this.partsParams.concat(Joi.object({
	}));
	
	partsStreamer = this.parts.concat(Joi.object({
	})).unknown();
	
	partsTracker = this.parts.concat(Joi.object({
	})).unknown();
	
	rocketRocvery = Joi.object({
		name: this._extendedName,
		type: Joi.string(),
		link: this._url
	});

	rocketPart = Joi.object({
		id: this.partId.required(),
		itemId: this.partId.required(),
		typeId: this._type.required(),
		apogeeDelay: Joi.number().allow(null).allow(''),
		altitude: Joi.number().allow(null).allow(''),
		altitudeMeasurementUnitId: this._type.allow(null).allow(''),
		altitudeMeasurementUnitsId: this._type.allow(null).allow(''),
		altitudeMain: Joi.number().allow(null).allow(''),
		altitudeMainMeasurementUnitId: this._type.allow(null).allow(''),
		altitudeMainMeasurementUnitsId: this._type.allow(null).allow(''),
		motorDelay: Joi.number().allow(null).allow(''),
		reefed: Joi.boolean().allow(null),
		reefedLength: Joi.number().allow(null).allow(''),
		reefedLengthMeasurementUnitId: this._type.allow(null).allow(''),
		reefedLengthMeasurementUnitsId: this._type.allow(null).allow('')
	});

	rocketStageMotor = Joi.object({
		id: this.partId.allow(null),
		index: this.motorIndex.required(),
		diameter: this.motorDiameter.allow(null).allow(''),
		count: Joi.number().allow(null)
	});

	rocketStage = Joi.object({
		id: this.rocketStageId,
		rocketId: this.rocketId.allow(null),
		altimeters: Joi.array().items(this.rocketPart).allow(null),
		chuteProtectors: Joi.array().items(this.rocketPart).allow(null),
		chuteReleases: Joi.array().items(this.rocketPart).allow(null),
		deploymentBags: Joi.array().items(this.rocketPart).allow(null),
		// cg: Joi.number().allow(null),
		// cgFrom: this.partId.allow(null),
		// cgMeasurementUnitId: this._measurementId.allow(null),
		// cgMeasurementUnitsId: this._measurementId.allow(null),
		cp: Joi.number().allow(null),
		cpFrom: this.partId.allow(null),
		cpMeasurementUnitId: this._measurementId.allow(null),
		cpMeasurementUnitsId: this._measurementId.allow(null),
		description: this._description.allow(null).allow(''),
		diameterMajor: Joi.number().allow(null),
		diameterMajorMeasurementUnitId: this._measurementId.allow(null),
		diameterMajorMeasurementUnitsId: this._measurementId.allow(null),
		diameterMinor: Joi.number().allow(null),
		diameterMinorMeasurementUnitId: this._measurementId.allow(null),
		diameterMinorMeasurementUnitsId: this._measurementId.allow(null),
		index: Joi.number().allow(null),
		length: Joi.number().allow(null),
		lengthMeasurementUnitId: this._measurementId.allow(null),
		lengthMeasurementUnitsId: this._measurementId.allow(null),
		manufacturerId: this.manufacturersId.allow(null).allow(''),
		manufacturerStockId: this.partId.allow(null).allow(''),
		motorDiameter: this.motorDiameter.allow(null).allow(''),
		motors: Joi.array().items(this.rocketStageMotor).allow(null),
		notes: this._description.allow(null).allow(''),
		parachutes: Joi.array().items(this.rocketPart).allow(null),
		primary: Joi.boolean().allow(null),
		recovery: Joi.array().items(this.rocketPart).allow(null),
		streamers: Joi.array().items(this.rocketPart).allow(null),
		trackers: Joi.array().items(this.rocketPart).allow(null),
		weight: Joi.number().allow(null),
		weightMeasurementUnitId: this._measurementId.allow(null),
		weightMeasurementUnitsId: this._measurementId.allow(null)
	});
	
	rocket = Joi.object({
		id: this.rocketId,
		createdTimestamp: Joi.number(),
		createdUserId: this._id.allow(null),
		typeId: this._type,
		deleted: Joi.boolean().allow(null),
		deletedTimestamp: Joi.number().allow(null),
		deletedUserId: this._id.allow(null),
		albums: Joi.array().items(this.albumOrVideoUrl).allow(null),
		buildLogUrl: this._url.allow(null),
		coverUrl: this._url.allow(null),
		description: this._description.allow(null).allow(''),
		manufacturerId: this.manufacturersId.required(),
		manufacturerStockId: this.partId.allow(null).allow(''),
		name: this._extendedName,
		notes: this._description.allow(null).allow(''),
		ownerId: this.ownerId.allow(null),
		public: Joi.boolean().allow(null),
		rocketTypes: Joi.array().items(this.rocketType).allow(null),
		searchName: this._extendedNameBase.allow(null).allow(''),
		stages: Joi.array().items(this.rocketStage).allow(null),
		syncTimestamp: Joi.number().allow(null),
		videos: Joi.array().items(this.albumOrVideoUrl).allow(null),
		updatedTimestamp: Joi.number(),
		updatedUserId: this._id.allow(null)
	});
	
	rocketsCopyParams = Joi.object({
		id: this.checklistId,
		name: this._extendedName
	});
	
	rocketsParams = Joi.object({
		diameter: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		diameterMax: Joi.number().allow(null),
		diameterMaxMeasurementUnitId: this._measurementId.allow(null),
		diameterMaxMeasurementUnitsId: this._measurementId.allow(null),
		diameterMin: Joi.number().allow(null),
		diameterMinMeasurementUnitId: this._measurementId.allow(null),
		diameterMinMeasurementUnitsId: this._measurementId.allow(null),
		manufacturers: Joi.array().items(this.manufacturersId).allow(null),
		manufacturerStockId: this.partId.allow(null).allow(''),
		length: Joi.number().allow(null),
		name: this._extendedName.allow('').allow(null),
		rocketId: this.rocketId.allow('').allow(null),
		rocketTypes: Joi.array().items(this.rocketType).allow(null),
		weight: Joi.number().allow(null),
		weightMeasurementUnitId: this._measurementId.allow(null),
		weightMeasurementUnitsId: this._measurementId.allow(null)
	});

	rocketSetupStageMotor = Joi.object({
		index: this.motorIndex.required(),
		motorCaseId: this.partId.allow(null),
		motorDelay: Joi.number().allow(null),
		motorId: this.partId.allow(null)
	});

	rocketSetupStage = Joi.object({
		id: this.rocketSetupId,
		rocketStageId: this.rocketStageId,
		rocketSetupId: this.rocketSetupId,
		altimeters: Joi.array().items(this.rocketPart).allow(null),
		chuteProtectors: Joi.array().items(this.rocketPart).allow(null),
		chuteReleases: Joi.array().items(this.rocketPart).allow(null),
		deploymentBags: Joi.array().items(this.rocketPart).allow(null),
		cg: Joi.number().allow(null),
		cgFrom: this.partId.allow(null),
		cgMeasurementUnitId: this._measurementId.allow(null),
		cgMeasurementUnitsId: this._measurementId.allow(null),
		// cp: Joi.number().allow(null),
		// cpFrom: this.partId.allow(null),
		// cpMeasurementUnitId: this._measurementId.allow(null),
		// cpMeasurementUnitsId: this._measurementId.allow(null),
		enabled: Joi.boolean().allow(null),
		index: Joi.number().allow(null),
		motors: Joi.array().items(this.rocketSetupStageMotor).allow(null),
		notes: this._description.allow(null).allow(''),
		parachutes: Joi.array().items(this.rocketPart).allow(null),
		recovery: Joi.array().items(this.rocketPart).allow(null),
		streamers: Joi.array().items(this.rocketPart).allow(null),
		trackers: Joi.array().items(this.rocketPart).allow(null),
		weight: Joi.number().allow(null),
		weightMeasurementUnitId: this._measurementId.allow(null),
		weightMeasurementUnitsId: this._measurementId.allow(null),
		weightNose: Joi.number().allow(null),
		weightNoseMeasurementUnitId: this._measurementId.allow(null),
		weightNoseMeasurementUnitsId: this._measurementId.allow(null)
	});
	
	rocketSetup = Joi.object({
		id: this.rocketSetupId,
		createdTimestamp: Joi.number(),
		createdUserId: this._id.allow(null),
		deleted: Joi.boolean().allow(null),
		deletedTimestamp: Joi.number().allow(null),
		deletedUserId: this._id.allow(null),
		description: this._description.allow(null).allow(''),
		name: this._extendedName.allow(null).allow(''),
		notes: this._description.allow(null).allow(''),
		ownerId: this.ownerId.allow(null),
		public: Joi.boolean().allow(null),
		rocketId: this.rocketId,
		searchName: this._extendedNameBase.allow(null).allow(''),
		stages: Joi.array().items(this.rocketSetupStage).allow(null),
		syncTimestamp: Joi.number().allow(null),
		typeId: this.rocketType,
		updatedTimestamp: Joi.number(),
		updatedUserId: this._id.allow(null)
	});
	
	rocketSetupsCopyParams = Joi.object({
		id: this.rocketSetupId,
		name: this._extendedName
	});
	
	rocketSetupsParams = Joi.object({
		diameter: Joi.number().allow(null),
		diameterMeasurementUnitId: this._measurementId.allow(null),
		diameterMeasurementUnitsId: this._measurementId.allow(null),
		manufacturers: Joi.array().items(this.manufacturersId).allow(null),
		manufacturerStockId: this.partId.allow(null).allow(''),
		length: Joi.number().allow(null),
		name: this._extendedName.allow('').allow(null),
		rocketId: this.rocketId.allow('').allow(null),
		rocketSetupId: this.rocketSetupId.allow('').allow(null),
		rocketTypes: Joi.array().items(this.rocketType).allow(null)
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
		altitude: this._measurementId.allow(null).allow(''),
		distance: this._measurementId.allow(null).allow(''),
		length: this._measurementId.allow(null).allow(''),
		temperature: this._measurementId.allow(null).allow(''),
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
