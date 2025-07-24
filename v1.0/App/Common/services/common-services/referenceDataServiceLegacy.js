// Reference data that could be timestamped, in priority order is below.
//     We also need to log PBIs to make sure existing timestamped entities are used throughout the app instead of getting live data.
//
//     Route	Service(s)	Notes
// /preventiveServices/overview	PreventiveServiceOverviewService
// /PreventiveServiceTypes	PreventiveServiceTypeService
// /conditions	PracticeConditionService
// /clinicalnotes/categoriesWithTemplates	ClinicalNoteTemplateService, ClinicalNoteCategoryService
// /patientalerts	MasterPatientAlertsService
// /medicalhistoryalerts	MedicalHistoryAlertService
// /adjustmenttypes	AdjustmentTypeService
// /paymenttypes	PaymentTypeService
// /discounttypes	MasterDiscountTypesService
// /appointmentTypes	AppointmentTypeService	timestamped version exists but not used in client
// /patientgroups	MasterPatientGroupsService
// /documentgroups	DocumentGroupsService
// /masterpatientidentifiers	MasterPatientIdentifierService
// /masteruseridentifiers	MasterUserIdentifierService
// /masterlocationidentifiers	MasterLocationIdentifierService
// /referralsources	ReferralSourcesService
// /practice/BankAccounts	BankAccountService
// /accounts/accountstatementmessage	AccountStatementMessageService
//
// Below are some Application-level items that are current managed with local storage that never expire unless the version changes.
// The are low priority for adding to the Reference Data Service.
//
//     Route	Service(s)
// /applicationsettings/affectedareas	AffectedAreaService
// /applicationsettings/alerticons	AlertIconService
// /applicationsettings/currencytypes	CurrencyTypeService
// /applicationsettings/servicetransactionstatus	ServiceTransactionStatusService
// /applicationsettings/states	StateService
// /applicationsettings/taxableservicetypes	TaxableServiceTypeService
// /applicationsettings/taxonomycodes	TaxonomyCodesService
// /applicationsettings/PhoneTypes	PhoneTypeService
// /applicationsettings/transactiontypes	TransactionTypeService
// /applicationsettings/teethdefinitions	ApplicationSettingsService
// /applicationsettings/cdtcodegroups	ApplicationSettingsService

(function () {
    'use strict';

    angular
        .module('Soar.Common')
        .factory('referenceDataService', referenceDataService);

    referenceDataService.$inject = [
        '$filter',
        '$q',
        'patAuthenticationService',
        'SoarConfig',
        'applicationService',
        'instanceIdentifier',
        'uniqueIdentifier',
        'practiceService',
        'locationService',
        'platformSessionService',
        '$rootScope',
        'IdmConfig',
        '$http',
        '$injector',
        '$timeout',
        'configSettingsService'
    ];

    function referenceDataService(
        $filter,
        $q,
        patAuthenticationService,
        SoarConfig,
        applicationService,
        instanceIdentifier,
        uniqueIdentifier,
        practiceService,
        locationService,
        platformSessionService,
        $rootScope,
        idmConfig,
        $http,
        $injector,
        $timeout,
        configSettingsService
    ) {
        // Private data

        // START SHARED CODE
        // THESE ENUMS MUST HAVE IDENTICAL COPIES IN THE service and workerFunc
        var entityNames = {
            serviceCodes: 'serviceCodes',
            feeLists: 'feeLists',
            locations: 'locations',
            appointmentTypes: 'appointmentTypes',
            users: 'users',
            conditions: 'conditions',
            preventiveServiceTypes: 'preventiveServiceTypes',
            preventiveServicesOverview: 'preventiveServicesOverview'
        };

        var msgNames = {
            configureWorker: 'configureWorker',
            apiRequest: 'apiRequest',
            apiResponse: 'apiResponse',
            apiError: 'apiError',
        };

        function Message() {
            return {
                msgId: null,
                msgName: null,
                entityName: null,
                data: null,
                httpStatus: null,
                workerId: null,
            };
        }

        // END SHARED CODE

        // Reference Data Service configurations
        var referenceDataServiceConfig = new ReferenceDataServiceConfig();

        function ReferenceDataServiceConfig() {
            return {
                maxWorkers: Object.keys(entityNames).length,
                log: false,
            };
        }

        // END Reference Data Service configurations

        function log(msg, force) {
            if (referenceDataServiceConfig.log !== true && force !== true) {
                return;
            }
            var style = 'font-size: 12pt;';
            console.log('%cReference Data Service (UI thread): ' + msg, style); // eslint-disable-line no-console
        }

        var storagePolicies = {
            memory: 'memory',
            local: 'local',
            session: 'session',
        };

        var entityScopes = {
            application: 'application',
            practice: 'practice',
            location: 'location',
        };

        // Frequency (in milliseconds)
        var frequency = {
            often: 600000, //10 minute (600000 ms)
            occasional: 3600000, //1 hour (3600000 ms)
            seldom: 10800000, //3 hours (10800000 ms)
        };

        var locationChangeResponse = {
            none: 'none',
            postProcess: 'postProcess',
            refetch: 'refetch',
        };

        var requestData = {
            serviceCodes: {
                url: '_practicesapi_/api/v1/timestamp/servicecodes/',
                frequency: frequency.often,
                locationChangeResponse: locationChangeResponse.postProcess,
            },
            feeLists: {
                url: '_practicesapi_/api/v1/timestamp/feelists/',
                frequency: frequency.often,
                locationChangeResponse: locationChangeResponse.none,
            },
            locations: {
                url: '_practicesapi_/api/v1/timestamp/locations/',
                frequency: frequency.often,
                locationChangeResponse: locationChangeResponse.none,
            },
            appointmentTypes: {
                url: '_practicesapi_/api/v1/timestamp/appointmenttypes/',
                frequency: frequency.often,
                locationChangeResponse: locationChangeResponse.none,
            },
            users: {
                url: '_practicesapi_/api/v1/timestamp/users/',
                frequency: frequency.often,
                locationChangeResponse: locationChangeResponse.none,
            },
            conditions: {
                url: '_practicesapi_/api/v1/timestamp/conditions/',
                frequency: frequency.occasional,
                locationChangeResponse: locationChangeResponse.none,
            },
            preventiveServiceTypes: {
                url: '_practicesapi_/api/v1/timestamp/preventiveservicetypes/',
                frequency: frequency.occasional,
                locationChangeResponse: locationChangeResponse.none,
            },
            preventiveServicesOverview: {
                url: '_practicesapi_/api/v1/timestamp/preventiveServices/overview/',
                frequency: frequency.occasional,
                locationChangeResponse: locationChangeResponse.none,
            },
        };

        var cacheKeys = {
            serviceCodes: 'cachedServiceCodes',
            feeLists: 'cachedFeeLists',
            locations: 'cachedLocations',
            appointmentTypes: 'cachedAppointmentTypes',
            users: 'cachedUsers_v2',
            conditions: 'cachedConditions',
            preventiveServiceTypes: 'cachedPreventiveServiceTypes',
            preventiveServicesOverview: 'cachedPreventiveServicesOverview'
        };

        var entities = {};
        var implementationSpecificEntityManagers = [];
        implementationSpecificEntityManagers[
            entityNames.serviceCodes
        ] = serviceCodesManager();
        implementationSpecificEntityManagers[
            entityNames.feeLists
        ] = feeListsManager();

        // entities is the in-memory entity configuration and data storage object. This will
        // build the entities list from entity names. Any entities requiring alternate implementation
        // should be registered to implementationSpecificEntityManagers. Implementations for these
        // are below.

        // eslint-disable-next-line no-unused-vars
        _.forOwn(entityNames, function (value, key) {
            entities[key] = _.has(implementationSpecificEntityManagers, key)
                ? implementationSpecificEntityManagers[key]
                : baseEntityManager(key);
        });

        var locationSpecificRegistrations = [];
        function registerForLocationSpecificDataChanged(func) {
            if (_.isFunction(func)) {
                var id = uniqueIdentifier.getId();
                locationSpecificRegistrations[id] = func;
            }
            return id;
        }

        function unregisterForLocationSpecificDataChanged(id) {
            if (_.isString(id) && locationSpecificRegistrations.hasOwnProperty(id)) {
                delete locationSpecificRegistrations[id];
            }
        }

        var requestsInProgress = [];

        function keysBy(array, iteratee) {
            var result = [];
            if (!_.isFunction(iteratee) && !_.isObject(iteratee)) {
                return result;
            } else if (!_.isFunction(iteratee)) {
                iteratee = _.iteratee(iteratee);
            }

            _.forEach(array, function (value, key) {
                if (iteratee(value, key)) {
                    result.push(key);
                }
            });

            return result;
        }

        function locationChangeHandler() {
            var entitiesToRefetch = keysBy(requestData, function (r) {
                return r.locationChangeResponse === locationChangeResponse.refetch;
            });
            var entitiesToReprocess = keysBy(requestData, function (r) {
                return r.locationChangeResponse === locationChangeResponse.postProcess;
            });

            _.forEach(entitiesToRefetch, function (key) {
                requestsInProgress.push({ key: key, promise: $q.defer() });
                forceEntityExecution(key);
            });

            _.forEach(entitiesToReprocess, function (key) {
                if (_.isFunction(entities[key].postprocessorFunc)) {
                    entities[key].postprocessorFunc();
                }
            });

            $q.all(_.map(requestsInProgress, _.property('promise'))).then(
                function () {
                    requestsInProgress = [];
                    _.forEach(locationSpecificRegistrations, function (func) {
                        if (_.isFunction(func)) {
                            func();
                        }
                    });
                }
            );
        }
        $rootScope.$on('patCore:initlocation', locationChangeHandler);
        $rootScope.$on('patCore:load-location-display', locationChangeHandler);

        ///////////////////////////////////////////////////////////////////////////////////////////////////
        // Public interface definition (service object)
        var refDataService = {
            entityNames: getEntityNames(),
            get: get,
            getClone: getClone,
            getData: getData,
            kickOff: kickOff,
            stop: stop,
            stopAll: stopAll,
            invalidate: invalidate,
            invalidateAll: invalidateAll,
            refresh: refresh,
            forceEntityExecution: forceEntityExecution,
            registerForLocationSpecificDataChanged: registerForLocationSpecificDataChanged,
            unregisterForLocationSpecificDataChanged: unregisterForLocationSpecificDataChanged,
            setFeesByLocation: setFeesByLocation,
            setFeesForLocations: setFeesForLocations,
            updateEntity: updateEntity,
        };

        // Public interface implementation
        function getEntityNames() {
            return JSON.parse(JSON.stringify(entityNames));
        }

        function get(entityName) {
            return JSON.parse(JSON.stringify(entities[entityName].data.CachedObj));
        }

        function getClone(entityName) {
            return _.cloneDeep(entities[entityName].data.CachedObj);
        }

        function getData(entityName) {
            if (entities[entityName].data.CachedObj === null) {
                var deferred = $q.defer();
                var timeStamp = _.now();
                if (configSettingsService.settingsLoaded != true) {
                    configSettingsService.loadSettings().then(function () {

                        $http
                            .get(resolveUrl(requestData[entityName].url) + timeStamp)
                            .then(function (data) {
                                entities[entityName].data = data.data;
                                forceEntityExecution(entityName);
                                if (_.isFunction(entities[entityName].postprocessorFunc)) {
                                    entities[entityName].postprocessorFunc();
                                }
                                deferred.resolve(data.data.CachedObj);
                            });
                    });
                } else {
                    $http
                        .get(resolveUrl(requestData[entityName].url) + timeStamp)
                        .then(function (data) {
                            entities[entityName].data = data.data;
                            forceEntityExecution(entityName);
                            if (_.isFunction(entities[entityName].postprocessorFunc)) {
                                entities[entityName].postprocessorFunc();
                            }
                            deferred.resolve(data.data.CachedObj);
                        });
                }
                return deferred.promise;
            }
            return $q.resolve(
                JSON.parse(JSON.stringify(entities[entityName].data.CachedObj))
            );
        }

        function stop(entityName) {
            intervalStopFunc(entityName);
        }

        function stopAll() {
            _.forOwn(entities, function (entityObj, entityKey) {
                stop(entityKey);
            });
        }

        function invalidate(entityName) {
            // Remove key from storage, if applicable
            removeStorage(entities[entityName]);
            // Initialize entity.data object
            entities[entityName].data = {
                Timestamp: 0,
                CachedObj: null,
                PracticeId: null,
                httpStatus: null,
            };
        }

        function updateEntity(entityName, newValue) {
            let entity = entities[entityName];
            entity.data.CachedObj = newValue;
            setStorage(entity);
        }

        function invalidateAll() {
            _.forOwn(entities, function (entityObj, entityKey) {
                invalidate(entityKey);
            });
        }

        function refresh() {
            stopAll();
            invalidateAll();
            kickOff();
        }

        var forceEntityName = '';

        function forceEntityExecution(entityName) {
            forceEntityName = entityName;
            intervalFunc(entityName);
        }

        // END public interface and implementation
        ///////////////////////////////////////////////////////////////////////////////////////////////////

        //////////////////////////////////////////////////////////////////////
        // WorkerManager code
        var workerManager = new WorkerManager({
            maxWorkers: referenceDataServiceConfig.maxWorkers,
        });

        function WorkerConfig() {
            // Worker configuration object.
            // If you need Workers to know and use more properties, add them here
            return {
                workerId: 1,
                log: false,
            };
        }

        function WorkerManager(workerManagerConfig) {
            // Private data
            var config = workerManagerConfig;
            var curIndex = 0;

            // Public interface
            return {
                getWorker: getWorker,
            };

            // Public methods implementation
            function getWorker() {
                var workerConfig = new WorkerConfig();
                curIndex++;
                if (curIndex >= config.maxWorkers) {
                    curIndex = 0;
                }
                // Makes workerId 1-based
                workerConfig.workerId = curIndex + 1;
                // Create the Worker
                var worker = createWorker(workerConfig);

                // Mark the Worker object with workerId property
                worker.workerId = workerConfig.workerId;
                return worker;
            }
        }

        // END WorkerManager code
        //////////////////////////////////////////////////////////////////////

        function createWorker(workerConfig) {
            var workerFuncStr = _.toString(workerFunc);
            var openingCurlyBracketIndex = _.indexOf(workerFuncStr, '{');
            var closingCurlyBracketIndex = workerFuncStr.lastIndexOf('}');
            var workerFuncCode = workerFuncStr.substring(
                openingCurlyBracketIndex + 1,
                closingCurlyBracketIndex
            );

            // JavaScript code that will be passed to the Web Worker wrapped in an IIFE
            var workerJs = '(function() {' + workerFuncCode + '}());';

            // Create a Blob with JavaScript code
            var workerBlob = new Blob([workerJs], { type: 'application/javascript' });
            // Create Url object from the worker javascript
            var objUrl = URL.createObjectURL(workerBlob);
            // Create a Web Worker with the blob object (this avoid having to use a .js file)
            var worker = new Worker(objUrl);

            worker.onmessage = workerMessageProcessor;

            // Messages exchanged between UI Thread and Workers must be pre-processed through JSON.stringify and JSON.parse
            workerConfig = JSON.parse(JSON.stringify(workerConfig));
            var msg = new Message();
            msg.msgName = msgNames.configureWorker;
            msg.entityName = null;
            msg.data = workerConfig;
            worker.postMessage(msg);

            return worker;
        }

        ///////////////////////////////////////////////////////////////////////
        // UI Thread message processor.
        // This is executed when WebWorker calls postMessage
        function workerMessageProcessor(e) {
            var msg = e.data;

            // If any new messages need to be processed, add a case for that message name here
            switch (msg.msgName) {
                case msgNames.apiResponse:
                    var entityName = msg.entityName;
                    var entity = entities[entityName];
                    var response = JSON.parse(msg.data);
                    entity.data.httpStatus = msg.httpStatus;
                    if (!_.isEmpty(response.Value)) {
                        entity.data.Timestamp = response.Value.Timestamp;
                        entity.data.CachedObj = response.Value.CachedObj;

                        // Perform any post processing prior to storing to local/session storage
                        if (_.isFunction(entity.postprocessorFunc)) {
                            entity.postprocessorFunc();
                        }
                    } else if (!_.isEmpty(response.CachedObj)) {
                        entity.data.Timestamp = response.Timestamp;
                        entity.data.CachedObj = response.CachedObj;

                        // Perform any post processing prior to storing to local/session storage
                        if (_.isFunction(entity.postprocessorFunc)) {
                            entity.postprocessorFunc();
                        }
                    }
                    setStorage(entity);

                    if (!_.isEmpty(requestsInProgress)) {
                        var pendingRequest = _.find(requestsInProgress, {
                            key: entityName,
                        });
                        if (!_.isNil(pendingRequest)) {
                            pendingRequest.resolve();
                        }
                    }

                    if (forceEntityName === entityName) {
                        forceEntityName = '';
                        $rootScope.$emit('soar:rds:force-entity-execution');
                    }

                    break;
            }
        }

        // END UI Thread message processor.
        ///////////////////////////////////////////////////////////////////////
        var inMemory = false;
        function baseEntityManager(entityName) {
            if (inMemory === false) {
                var entity = {
                    entityName: entityName,
                    entityScope: entityScopes.practice,
                    data: {
                        Timestamp: 0,
                        CachedObj: null,
                        PracticeId: null,
                        httpStatus: null,
                    },
                    intervalLength:
                        requestData[entityName] && requestData[entityName].frequency
                            ? requestData[entityName].frequency
                            : frequency.often,
                    intervalKickoffFunc: intervalKickoffFunc,
                    intervalHandle: null,
                    storage: storagePolicies.local,
                    storageKey: cacheKeys[entityName],
                    postprocessorFunc: null,
                    request: {
                        entityName: entityName,
                        baseUrl: requestData[entityName]
                            ? requestData[entityName].url
                            : null,
                        url: null,
                        headers: null,
                        params: null,
                        practiceId: null,
                        locationId: null,
                        error: null,
                        appInsights: {
                            id: null,
                            key: null,
                        },
                    },
                };
                // Hydrate the entity from storage, if possibles
                getStorage(entity);

                return entity;
            } else {
                var entity = {
                    entityName: entityName,
                    entityScope: entityScopes.practice,
                    data: {
                        Timestamp: 0,
                        CachedObj: null,
                        PracticeId: null,
                        httpStatus: null,
                    },
                    intervalLength:
                        requestData[entityName] && requestData[entityName].frequency
                            ? requestData[entityName].frequency
                            : frequency.often,
                    intervalKickoffFunc: intervalKickoffFunc,
                    intervalHandle: null,
                    storage: storagePolicies.memory,
                    storageKey: cacheKeys[entityName],
                    postprocessorFunc: null,
                    request: {
                        entityName: entityName,
                        baseUrl: requestData[entityName]
                            ? requestData[entityName].url
                            : null,
                        url: null,
                        headers: null,
                        params: null,
                        practiceId: null,
                        locationId: null,
                        error: null,
                        appInsights: {
                            id: null,
                            key: null,
                        },
                    },
                };

                return entity;
            }
        }

        ///////////////////////////////////////////////////////////////////////
        // Configures the management object for Service Codes
        function serviceCodesManager() {
            inMemory = true;
            var entity = baseEntityManager(entityNames.serviceCodes);
            entities['serviceCodes'] = entity;

            // If you need to customize the manager, override the defaults here
            entity.postprocessorFunc = serviceCodesFeeListsPostprocessor;
            inMemory = false;
            return entity;
        }

        ///////////////////////////////////////////////////////////////////////

        ///////////////////////////////////////////////////////////////////////
        // Configures the management object for Fee Lists
        function feeListsManager() {
            inMemory = true;
            var entity = baseEntityManager(entityNames.feeLists);
            entities['feeLists'] = entity;

            // If you need to customize the manager, override the defaults here
            entity.postprocessorFunc = serviceCodesFeeListsPostprocessor;
            inMemory = false;
            return entity;
        }

        function serviceCodesFeeListsPostprocessor() {
            // Merge fee list for current location into service codes if both service codes and fee lists have been loaded.
            var serviceCodes = entities[entityNames.serviceCodes].data.CachedObj;
            var feeLists = entities[entityNames.feeLists].data.CachedObj;
            //if (_.isEmpty(serviceCodes) || _.isEmpty(feeLists)) {
            //    feeListsManager();
            //    //log('Fee Lists postprocessor did not process, one of the required entities are not populated');

            //}
            var locationId = getLocationId();

            entities[entityNames.serviceCodes].data.CachedObj = setFeesByLocation(
                serviceCodes,
                locationId
            );
            log('Fee Lists postprocessor processed');
        }

        ///////////////////////////////////////////////////////////////////////

        // Start the interval functions for all entities
        async function kickOff() {
            _.forOwn(entities, function (entityObj, entityKey) {
                log('Starting retrieval for ' + entityKey);
                entityObj.intervalKickoffFunc(entityKey);
            });
        }

        function intervalKickoffFunc(entityName) {
            // Execute once immediately at bootstrap time
            intervalFunc(entityName);

            var entityObj = entities[entityName];
            entityObj.intervalHandle = setInterval(function () {
                intervalFunc(entityName);
            }, entityObj.intervalLength);
        }

        function intervalFunc(entityName) {
            var entityObj = entities[entityName];

            var worker = workerManager.getWorker();

            // Prepare entity for request
            var practiceId = getPracticeId();
            entityObj.request.baseUrl = resolveUrl(entityObj.request.baseUrl);
            entityObj.data.practiceId = practiceId;
            entityObj.request.headers = getHeaders();
            entityObj.request.practiceId = practiceId;
            entityObj.request.locationId = getLocationId();
            entityObj.request.url =
                entityObj.request.baseUrl + entityObj.data.Timestamp;
            var reqData = JSON.parse(JSON.stringify(entityObj.request));

            var msg = new Message();
            msg.msgName = msgNames.apiRequest;
            msg.entityName = entityName;
            msg.data = reqData;

            log(
                'Send Worker ' +
                worker.workerId +
                ' request for ' +
                entityObj.request.entityName
            );
            worker.postMessage(msg);
        }

        function intervalStopFunc(entityName) {
            clearInterval(entities[entityName].intervalHandle);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Web Worker code
        // This runs on a separate thread, in a JavaScript blob
        function workerFunc() {
            // START SHARED CODE
            // THESE ENUMS MUST HAVE IDENTICAL COPIES IN THE service and workerFunc
            var msgNames = {
                configureWorker: 'configureWorker',
                apiRequest: 'apiRequest',
                apiResponse: 'apiResponse',
                apiError: 'apiError',
            };

            function Message() {
                return {
                    msgId: null,
                    msgName: null,
                    entityName: null,
                    data: null,
                    httpStatus: null,
                    workerId: null,
                };
            }

            var config = null;
            var messageData = null;

            // Worker message processor.
            // This is executed when the main thread (UI) calls worker.postMessage
            onmessage = function (e) {
                var msg = e.data;
                switch (msg.msgName) {
                    case msgNames.configureWorker:
                        configureWorker(msg.data);
                        break;
                    case msgNames.apiRequest:
                        messageData = msg.data;
                        apiCall(msg.data);
                        break;
                }
            };

            function apiCall(request) {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener('load', successFunc);
                xhr.addEventListener('error', errorFunc);
                xhr.open('GET', request.url, true);

                request.headers.forEach(function (header) {
                    xhr.setRequestHeader(header.headerName, header.headerValue);
                });

                log('Worker ' + config.workerId + '. Request ' + request.url);

                xhr.send();
            }

            function successFunc(e) {
                var apiResponse = JSON.parse(JSON.stringify(this.response));

                var msg = new Message();
                msg.msgName = msgNames.apiResponse;
                msg.entityName = messageData.entityName;
                msg.data = apiResponse;
                msg.httpStatus = this.status;
                msg.workerId = config.workerId;
                postMessage(msg);

                log(
                    'Worker ' +
                    config.workerId +
                    '. Response ' +
                    this.responseURL +
                    ' with status ' +
                    this.status
                );

                cleanup();
            }

            function errorFunc(e) {
                var msg = new Message();
                msg.msgName = msgNames.apiError;
                msg.entityName = messageData !== null ? messageData.entityName : null;
                msg.data = JSON.parse(JSON.stringify(e));
                msg.workerId = config.workerId;
                postMessage(msg);

                cleanup();
            }

            function cleanup() {
                log('Worker ' + config.workerId + ' terminating.');
                self.close();
            }

            function configureWorker(configObj) {
                config = configObj;
            }

            function log(msg, forceLog) {
                if (config.log !== true && forceLog !== true) {
                    return;
                }
                var colors = [
                    'rgb(0,139,139)', // darkcyan
                    'rgb(0,0,139)', // darkblue
                    'rgb(139,0,139)', // darkmagenta
                    'rgb(255,0,255)', // fuchsia
                    'rgb(210,105,30)', // chocolate
                ];
                var color =
                    config.workerId - 1 >= colors.length
                        ? colors[0]
                        : colors[config.workerId - 1];
                var style = 'color: ' + color + ';';
                console.log('%c' + msg, style); // eslint-disable-line no-console
            }
        }

        // END Web Worker code
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Private methods for facilitating API requests
        // Returns an array of header objects with headerName and headerValue properties populated with current data
        function getHeaders() {
            var token = patAuthenticationService.getCachedToken();
            var instanceId = instanceIdentifier.getIdentifier();
            var appId = applicationService.getApplicationId();
            var requestId = uniqueIdentifier.getId();
            var practiceId = getPracticeId();
            var locationId = getLocationId();
            var locationTimezone = getLocationTimezone();
            var utcOffset = moment().utcOffset() / 60; // e.g. -5
            return [
                { headerName: 'Authorization', headerValue: 'Bearer ' + token },
                { headerName: 'PAT-Application-Instance-ID', headerValue: instanceId }, // used for AppInsights logging
                { headerName: 'PAT-Request-ID', headerValue: requestId }, // used for AppInsights logging
                { headerName: 'PAT-Application-ID', headerValue: appId },
                { headerName: 'PAT-Practice-ID', headerValue: practiceId },
                { headerName: 'PAT-Location-ID', headerValue: locationId },
                { headerName: 'PtcSoarUtcOffset', headerValue: utcOffset },
                { headerName: 'Location-TimeZone', headerValue: locationTimezone },
                { headerName: 'Ocp-Apim-Subscription-Key', headerValue: configSettingsService.apimSubscriptionKey },
                {
                    headerName: 'Accept',
                    headerValue: 'application/json, text/plain, */*',
                },
            ];
        }

        function getPracticeId() {
            return practiceService.getCurrentPractice().id;
        }

        function getLocationId() {
            return locationService.getCurrentLocation().id;
        }

        function getLocationTimezone() {
            return locationService.getCurrentLocation().timezone;
        }

        // Replace the variable part
        function resolveUrl(url) {
            if (url.indexOf('_soarapi_') >= 0) {
                url = url.replace('_soarapi_', SoarConfig.domainUrl);
            }

            if (url.indexOf('_practicesapi_') >= 0) {
                url = url.replace('_practicesapi_', idmConfig.practicesApimUrl);
            }

            if (url.indexOf('{practiceId}') >= 0) {
                url = url.replace('{practiceId}', getPracticeId());
            }

            if (url.indexOf('{locationId}') >= 0) {
                url = url.replace('{locationId}', getLocationId());
            }

            return url;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        // Storage management methods
        function getStorage(entity) {
            var storedValue = null;
            switch (entity.storage) {
                case storagePolicies.memory:
                    return entity;
                case storagePolicies.session:
                    storedValue = platformSessionService.getSessionStorage(
                        entity.storageKey
                    );
                    break;
                case storagePolicies.local:
                    storedValue = platformSessionService.getLocalStorage(
                        entity.storageKey
                    );
                    break;
            }

            if (!_.isNull(storedValue)) {
                _.assign(entity.data, storedValue);
            }
            return entity;
        }

        function setStorage(entity) {
            switch (entity.storage) {
                case storagePolicies.memory:
                    return;
                case storagePolicies.session:
                    platformSessionService.setSessionStorage(
                        entity.storageKey,
                        entity.data
                    );
                    break;
                case storagePolicies.local:
                    platformSessionService.setLocalStorage(
                        entity.storageKey,
                        entity.data
                    );
                    break;
            }
        }

        function removeStorage(entity) {
            switch (entity.storage) {
                case storagePolicies.memory:
                    return;
                case storagePolicies.session:
                    sessionStorage.removeItem(entity.storageKey);
                    break;
                case storagePolicies.local:
                    localStorage.removeItem(entity.storageKey);
                    break;
            }
        }

        // END Storage management methods
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        ///////////////////////////////////////////////////////////////////////////////
        // Postprocessor private methods
        function getServiceFeeListByLocation(locationId) {
            var feeLists = entities[entityNames.feeLists].data.CachedObj;
            var feeList = _.find(feeLists, function (locationFeeList) {
                return _.includes(locationFeeList.LocationIds, locationId);
            });
            return !_.isUndefined(feeList) ? feeList.LocationServiceFeeList : null;
        }

        function setFeesForLocations(serviceCode, locationIds) {
            if (
                _.isNil(locationIds) ||
                !_.isArray(locationIds) ||
                _.isNil(serviceCode)
            ) {
                return serviceCode;
            }

            _.forEach(locationIds, function (locationId) {
                setFeesByLocation([serviceCode], locationId);
            });

            return serviceCode;
        }

        function setFeesByLocation(serviceCodes, locationId) {
            if (_.isNil(serviceCodes)) {
                return serviceCodes;
            }

            if (_.isNil(locationId)) {
                locationId = getLocationId();
            }

            var locationServiceFeeList = getServiceFeeListByLocation(locationId);

            // If a single service code is passed in, convert to an array easy processing, but then return a single opbject
            var isArray = _.isArray(serviceCodes);
            if (!isArray) {
                serviceCodes = _.castArray(serviceCodes);
            }

            _.forEach(serviceCodes, function (serviceCode) {
                // add separate behavior for a swiftcode which is a container for serviceCodes
                // set the swift code display properties based on the service totals
                if (serviceCode.IsSwiftPickCode === true) {
                    setFeesByLocation(serviceCode.SwiftPickServiceCodes);
                    serviceCode.$$locationFee = _.sumBy(
                        serviceCode.SwiftPickServiceCodes,
                        '$$locationFee'
                    );
                    serviceCode.$$FeeString = !_.isNil(serviceCode.$$locationFee)
                        ? $filter('currency')(serviceCode.$$locationFee.toString(), '')
                        : '0';
                } else {
                    serviceCode.$$locationFee = serviceCode.Fee;
                    serviceCode.$$locationTaxableServiceTypeId =
                        serviceCode.TaxableServiceTypeId;
                    if (locationServiceFeeList) {
                        var locationInfo = _.find(locationServiceFeeList, {
                            ServiceCodeId: serviceCode.ServiceCodeId,
                        });
                        if (locationInfo && locationInfo != null) {
                            serviceCode.$$locationFee = locationInfo.Fee;
                            serviceCode.$$locationTaxableServiceTypeId =
                                locationInfo.TaxableServiceTypeId;
                            if (!serviceCode.LocationSpecificInfo) {
                                serviceCode.LocationSpecificInfo = [];
                                serviceCode.LocationSpecificInfo.push({
                                    Fee: locationInfo.Fee,
                                    ServiceCodeId: locationInfo.ServiceCodeId,
                                    LocationId: locationId,
                                    TaxableServiceTypeId: locationInfo.TaxableServiceTypeId,
                                });
                            } else {
                                if (
                                    !_.find(serviceCode.LocationSpecificInfo, {
                                        LocationId: locationId,
                                    })
                                ) {
                                    serviceCode.LocationSpecificInfo.push({
                                        Fee: locationInfo.Fee,
                                        ServiceCodeId: locationInfo.ServiceCodeId,
                                        LocationId: locationId,
                                        TaxableServiceTypeId: locationInfo.TaxableServiceTypeId,
                                    });
                                }
                            }
                        }
                    }

                    serviceCode.$$serviceTransactionFee = serviceCode.$$locationFee;
                    if (serviceCode.$$locationFee) {
                        serviceCode.$$FeeString = $filter('currency')(
                            serviceCode.$$locationFee.toString(),
                            ''
                        );
                    } else {
                        serviceCode.$$FeeString = $filter('currency')('0', '');
                    }
                }
            });

            // If an array was passed in, return an array; otherwise, return the first element
            return isArray === true ? serviceCodes : serviceCodes[0];
        }
        // END Postprocessor private methods
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        return refDataService;
    }
})();
