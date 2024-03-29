import AppConstants from '../constants.js';
import AppSharedConstants from 'rocket_sidekick_common/constants.js';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import Service from '@thzero/library_server/service/index.js';

class MotorsService extends Service {
	constructor() {
		super();

		this._repositoryMotors = null;
		this._repositoryParts = null;
		this._serviceExternalMotorSearch = null;
		this._servicManufacturers = null;
	}

	async init(injector) {
		await super.init(injector);

		this._repositoryMotors = this._injector.getService(AppConstants.InjectorKeys.REPOSITORY_MOTORS);
		this._repositoryParts = this._injector.getService(AppConstants.InjectorKeys.REPOSITORY_PARTS);
		this._serviceExternalMotorSearch = this._injector.getService(AppConstants.InjectorKeys.SERVICE_EXTERNAL_MOTOR_SEARCH);
		this._servicManufacturers = this._injector.getService(AppConstants.InjectorKeys.SERVICE_MANUFACTURERS);
	}
	
	async retrieve(correlationId, user, id) {
		try {
			const validationResponse = this._serviceValidation.check(correlationId, this._serviceValidation.manufacturersId, id);
			if (this._hasFailed(validationResponse))
				return validationResponse;
	
			return await this._repositoryMotors.retrieve(correlationId, id);
		}
		catch (err) {
			return this._error('ManufacturersService', 'retrieve', null, err, null, null, correlationId);
		}
	}

	async sync(correlationId) {
		try {
			const responseMa = await this._servicManufacturers.listing(correlationId);
			if (this._hasFailed(responseMa))
				return responseMa;

			const manufacturers = responseMa.results.data;

			let responseM = await this._repositoryMotors.listing(correlationId);
			if (this._hasFailed(responseM))
				return responseM;

			let motors = responseM.results.data;
			let manufacturer;

			// // Get list of external motors...

			// const motorsExternal = [];
			// const impulseClasses = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P' ];
			// // const impulseClasses = [ 'H' ];
			// let response;
			// let response2;
			// let motor;
			// let motorData;
			// let results;
			// for (const impulseClass of impulseClasses) {
			// 	console.log(`...${impulseClass}....`);
			// 	response = await this._serviceExternalMotorSearch.motors(correlationId, {
			// 		impulseClass: impulseClass
			// 	});
			// 	if (this._hasFailed(response)) {
			// 		console.log(`...${impulseClass} error:`);
			// 		console.dir('response', response);
			// 		continue;
			// 	}
			// 	if (!response.results) {
			// 		console.log(`...${impulseClass} no results...`);
			// 		continue;
			// 	}
			// 	results = response.results.results;

			// 	for (motor of results) {
			// 		motor.id = motor.motorId;
			// 		motor.typeId = AppSharedConstants.Rocketry.PartTypes.motor;
			// 		motor.name = motor.commonName;
			// 		motor.public = true;
					
			// 		manufacturer = manufacturers.find(l => l.tcId === motor.manufacturerAbbrev);
			// 		if (LibraryCommonUtility.isNull(manufacturer)) {
			// 			console.log(`...${motor.manufacturerAbbrev} not found for ${motor.motorId} not found...`);
			// 			continue;
			// 		}
			// 		motor.manufacturerId = manufacturer.id;

			// 		if (!(motor.dataFiles > 0))
			// 			continue;

			// 		response2 = await this._serviceExternalMotorSearch.motor(correlationId, motor.motorId);
			// 		if (this._hasFailed(response2)) {
			// 			console.log(`...${impulseClass} - ${motor.motorId} error:`);
			// 			console.dir('response', response2);
			// 			continue;
			// 		}

			// 		if (!response2.results) {
			// 			console.log(`...${impulseClass} - ${motor.motorId} error:`);
			// 			console.dir('response', response2);
			// 			continue;
			// 		}

			// 		motorData = response2.results;
			// 		// if (Array.isArray(response2.results)) {
			// 		// 	motorData = await response2.results.find(l => l.motorId === motor.id);
			// 		// 	if (!motorData)
			// 		// 		continue;
			// 		// }

			// 		motor.data = motorData;

			// 		// motor.simfileId = motor2.simfileId;
			// 		// motor.format = motor2.format;
			// 		// motor.source = motor2.source;
			// 		// motor.license = motor2.license;
			// 		// motor.data = motor2.data;
			// 		// motor.samples = motor2.samples;
			// 		// motor.infoUrl = motor2.infoUrl;
			// 		// motor.dataUrl = motor2.dataUrl;
			// 	}

			// 	motorsExternal.push(...results);
			// }

			// const deletedMotors = [];

			// const responseU = await this._repositoryMotors.sync(correlationId, motorsExternal, deletedMotors);
			// if (this._hasFailed(responseU))
			// 	return responseU;

			// // Get motors to look for cases...
			// responseM = await this._repositoryMotors.listing(correlationId);
			// if (this._hasFailed(responseM))
			// 	return responseM;

			// motors = responseM.results.data;
			
			// Get motor cases loaded already....
			let responseMc = await this._repositoryMotors.listingCases(correlationId);
			if (this._hasFailed(responseMc))
				return responseMc;

			const motorCases = responseMc.results.data;
			const motorCasesUpdated = [];

			// Remove any existing motor casess that are not in the external motor list...
			const deletedMotorCases = [];

			let motorCase;
			let temp2;
			for (const motor of motors) {
				if (String.isNullOrEmpty(motor.caseInfo))
					continue;
					
				manufacturer = manufacturers.find(l => l.tcId === motor.manufacturerAbbrev);
				if (LibraryCommonUtility.isNull(manufacturer)) {
					console.log(`...${motor.manufacturerAbbrev} not found for ${motor.motorId} not found...`);
					continue;
				}

				temp2 = motorCases.find(l => l.name.toLowerCase().trim() === motor.caseInfo.toLowerCase().trim());
				if (LibraryCommonUtility.isNull(temp2)) {
					motorCase = {
						id: LibraryCommonUtility.generateId(),
						typeId: AppSharedConstants.Rocketry.PartTypes.motorCase,
						diameter: motor.diameter,
						external: true,
						manufacturerId: manufacturer.id,
						manufacturer: manufacturer.name,
						name: motor.caseInfo.trim(),
						public: true
					};

					if (!motor.diameter)
						console.log(`motor.new: ${motor.id}`);
				}
				else {
					motorCase = {
						id: temp2.id,
						typeId: AppSharedConstants.Rocketry.PartTypes.motorCase,
						diameter: motor.diameter,
						external: true,
						manufacturerId: manufacturer.id,
						manufacturer: manufacturer.name,
						name: motor.caseInfo.trim(),
						public: true
					};

					if (!motor.diameter)
						console.log(`motor.updated: ${motor.id}`);
				}

				temp2 = motorCasesUpdated.find(l => l.name.toLowerCase().trim() === motor.caseInfo.toLowerCase().trim());
				if (LibraryCommonUtility.isNull(temp2))
					motorCasesUpdated.push(motorCase);
			}

			const responseUc = await this._repositoryMotors.syncCases(correlationId, motorCasesUpdated, deletedMotorCases);
			if (this._hasFailed(responseUc))
				return responseUc;

			// Get motors to update case id...
			responseM = await this._repositoryMotors.listing(correlationId);
			if (this._hasFailed(responseM))
				return responseM;

			responseMc = await this._repositoryMotors.listingCases(correlationId);
			if (this._hasFailed(responseMc))
				return responseMc;

			const responseUc2 = await this._repositoryMotors.syncCasesToMotors(correlationId, responseMc.results.data, responseM.results.data);
			if (this._hasFailed(responseUc2))
				return responseUc2;

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('ManufacturersService', 'listing', null, err, null, null, correlationId);
		}
	}
}

export default MotorsService;
