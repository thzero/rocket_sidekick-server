import Constants from '../constants.js';
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

		this._repositoryMotors = this._injector.getService(Constants.InjectorKeys.REPOSITORY_MOTORS);
		this._repositoryParts = this._injector.getService(Constants.InjectorKeys.REPOSITORY_PARTS);
		this._serviceExternalMotorSearch = this._injector.getService(Constants.InjectorKeys.SERVICE_EXTERNAL_MOTOR_SEARCH);
		this._servicManufacturers = this._injector.getService(Constants.InjectorKeys.SERVICE_MANUFACTURERS);
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

			let responseM = await this._repositoryMotors.listing(correlationId);
			if (this._hasFailed(responseM))
				return responseM;

			const manufacturers = responseMa.results.data;

			let motors = responseM.results.data;

			// Get list of external motors...

			const motorsExternal = [];
			const impulseClasses = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'J', 'K', 'L', 'M', 'O', 'P'];
			let response;
			let response2;
			let motor;
			let motor2;
			let results;
			for (const impulseClass of impulseClasses) {
				console.log(`...${impulseClass}....`);
				response = await this._serviceExternalMotorSearch.motors(correlationId, {
					impulseClass: impulseClass
				});
				if (this._hasFailed(response)) {
					console.log(`...${impulseClass} error:`);
					console.dir('response', response);
					continue;
				}
				if (!response.results) {
					console.log(`...${impulseClass} no results...`);
					continue;
				}
				results = response.results.results;

				for (motor of results) {
					motor.id = motor.motorId;

					if (motor.dataFiles === 0)
						continue;

					response2 = await this._serviceExternalMotorSearch.motor(correlationId, motor.motorId);
					if (this._hasFailed(response2)) {
						console.log(`...${impulseClass} - ${motor.motorId} error:`);
						console.dir('response', response2);
						continue;
					}

					if (!response2.results)
						continue;

					motor2 = await results.find(l => l.motorId === motor.id);
					if (!motor2)
						continue;

					motor.simfileId = motor2.simfileId;
					motor.format = motor2.format;
					motor.source = motor2.source;
					motor.license = motor2.license;
					motor.data = motor2.data;
					motor.samples = motor2.samples;
					motor.infoUrl = motor2.infoUrl;
					motor.dataUrl = motor2.dataUrl;
				}

				motorsExternal.push(...results);
			}

			let temp;
			let deleted = [];

			// Remove any existing motors that are not in the external motors list...
			// for (const motor of motors) {
			// 	temp = motorsExternal.find(l => l.motorId === motor.id);
			// 	if (!(temp === null || temp === undefined))
			// 		continue;
				
			// 	// only if external...
			// 	if (!motor.external)
			// 		continue;
			// 	deleted.push(motor.motorId);
			// }
			
			for (const motor of motorsExternal) {
				temp = manufacturers.find(l => l.tcId === motor.manufacturerAbbrev);
				if (temp != null)
					motor.manufacturerId = temp.id;
				motor.id = motor.motorId;
				motor.name = motor.commonName.trim();
				motor.external = true;
				motor.public = true;
				motor.typeId = AppSharedConstants.Rocketry.PartTypes.motor;
			}

			const responseU = await this._repositoryMotors.sync(correlationId, motorsExternal, deleted);
			if (this._hasFailed(responseU))
				return responseU;

			// Get motors to look for cases...
			responseM = await this._repositoryMotors.listing(correlationId);
			if (this._hasFailed(responseM))
				return responseM;

			motors = responseM.results.data;
			
			// Get motor cases loaded already....
			const responseMc = await this._repositoryMotors.listingCases(correlationId);
			if (this._hasFailed(responseMc))
				return responseMc;

			const motorCases = responseMc.results.data;

			// Remove any existing motor casess that are not in the external motor list...
			deleted = [];

			let motorCase;
			let temp2;
			for (const motor of motors) {
				if (String.isNullOrEmpty(motor.caseInfo))
					continue;
					
				temp = manufacturers.find(l => l.tcId === motor.manufacturerAbbrev);
				if (temp === null || temp === undefined)
					continue;

				temp2 = motorCases.find(l => l.name.toLowerCase().trim() === motor.caseInfo.toLowerCase().trim());
				if (temp2 !== null && temp2 !== undefined)
					continue;

				motorCase = {
					id: LibraryCommonUtility.generateId(),
					typeId: AppSharedConstants.Rocketry.PartTypes.motorCase,
					external: true,
					manufacturerId: temp.id,
					name: motor.caseInfo.trim(),
					public: true
				}

				motorCases.push(motorCase);
			}

			const responseUc = await this._repositoryMotors.syncCases(correlationId, motorCases, deleted);
			if (this._hasFailed(responseUc))
				return responseUc;

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('ManufacturersService', 'listing', null, err, null, null, correlationId);
		}
	}
}

export default MotorsService;
