if (window.TurnOffSingleSpa == 'true') {
    window.singleSpaAngularHybrid = null; // To make the QA Framework to use body as the root                        
    let template = `
        <app-service-bootstrap></app-service-bootstrap>
        <app-svg-definitions-js></app-svg-definitions-js>

        <div ng-cloak class="no-print">
            <section ng-include=" 'App/Common/header/header.html' " id="header" class="top-header container-fluid"></section>
        </div>

        <div ng-cloak class="no-print">
            <section ng-include=" 'App/Common/header/ult-message.html' " id="ultMessageContainer" class="ult-message-container"></section>
        </div>

        <div class="view-container">
            <section id="content" class="page" ng-view autoscroll="false"></section>
        </div>
        <div class="feedback-container"></div>
        `;

    let container = document.createElement('div');
    container.innerHTML = template;
    document.body.appendChild(container);
    window.startHybridApp(null, 'Soar.Main'); // Recover old logic
} else {
    var oldApp = window.singleSpaAngularHybrid({
        angular: window.angular,
        mainAngularModule: 'Soar.Main',
        ngRoute: true,
        preserveGlobal: true,
        startApp: (container, mainModule) => window.startHybridApp(container, mainModule),
        template: `
      <div>
          <app-service-bootstrap></app-service-bootstrap>
          <app-svg-definitions-js></app-svg-definitions-js>
 
          <div ng-cloak class="no-print">
              <section ng-include=" 'App/Common/header/header.html' " id="header" class="top-header container-fluid"></section>
          </div>
 
          <div ng-cloak class="no-print">
              <section ng-include=" 'App/Common/header/ult-message.html' " id="ultMessageContainer" class="ult-message-container"></section>
          </div>
     
          <div class="view-container">
              <section id="content" class="page" ng-view autoscroll="false"></section>
          </div>
          <div class="feedback-container"></div>
       </div>
      `
    })

    System.import("single-spa").then(function (singleSpa) {
        window.singleSpa = singleSpa;
       
        window.singleSpa.registerApplication(
            'angularJS',
            oldApp,
            function activityFunction() { return true; }
        )       

        let activeWhenCheck = function (location) {
            return location.hash.startsWith('#/patientv2') || (location.hash.startsWith('#/Help'));
        };       

        let cachedInjector = null;

        const getInjector = function(){
            if (cachedInjector !== null)
                return cachedInjector;

            const locationSelectorElements = document.getElementsByTagName('global-location-selector');
            if (locationSelectorElements.length === 0)
                throw "Global location selector not found";

            const injector = angular.element(locationSelectorElements[0]).injector();
            if (!injector)
                throw "Injector not found";

            cachedInjector = injector;

            return injector;
        }

        let cachedLocationService = null;

        const getLocationService = function() {
            if (cachedLocationService !== null)
                return cachedLocationService;

            const injector = getInjector();
            const locationService = injector.get('locationService');
            if (!locationService)
                throw "Location service not found";

            cachedLocationService = locationService;

            return locationService;
        }

        let cachedLocationChangeService = null;

        const getLocationChangeService = function() {
            if (cachedLocationChangeService !== null)
                return cachedLocationChangeService;

            const injector = getInjector();
            const locationChangeService = injector.get('LocationChangeService');
            if (!locationChangeService)
                throw "Location change service not found";

            cachedLocationChangeService = locationChangeService;

            return locationChangeService;
        }

        const transformLocation = function(location){
            // output should match UserLocation type in MFE
            return {
                LocationId: location.id,
                Name: location.name,
                PracticeId: location.practiceid,
                MerchantId: location.merchantid,
                Description: location.description,
                Timezone: location.timezone,
                DeactivationTimeUtc: location.deactivationTimeUtc,
                EnterpriseId: location.enterpriseid,
            }
        }

        const getUserLocation = function() {
            const locationService = getLocationService();
            const location = locationService.getCurrentLocation();
            const transformedLocation = transformLocation(location);
            return transformedLocation;
        }

        const setUserLocation = function(locationId) {
            const locationService = getLocationService();
            let activeLocations = locationService.getActiveLocations();
            let targetLocation = activeLocations.find(l => l.id === locationId);
            locationService.selectLocation(targetLocation);
        }

        const subscribeToUserLocation = function(callback){
            const locationChangeService = getLocationChangeService();
            locationChangeService.subscribe(() => {
                const location = getUserLocation();
                callback(location);
            });
        }

        const appImportPathDetail = {
            'patientOverviewApp': '@fuse/patient',
            'scheduleApp': '@fuse/schedule',
            'scheduleAltApp': '@fuse/schedule-alt',
            'insuraceApp': '@fuse/insurance',
            'clinicalApp': '@fuse/clinical',
            'practiceSettingsApp': '@fuse/practice-settings',
            'contractApp': '@fuse/contracts'
        };

        window.singleSpa.registerApplication({
            name: "patientOverviewApp",
            app: () => System.import(appImportPathDetail['patientOverviewApp']),            
            activeWhen: location => activeWhenCheck(location),
            customProps() {
                return {
                    getUserLocation: getUserLocation,
                    setUserLocation: setUserLocation,
                    subscribeToUserLocation: subscribeToUserLocation
                };
            }
        });
        
        window.singleSpa.registerApplication({
            name: "scheduleApp",
            app: () => System.import(appImportPathDetail['scheduleApp']),
            activeWhen: location => location.hash.startsWith('#/schedule/v2'),
            customProps() {
                return {
                    getUserLocation: getUserLocation,
                    setUserLocation: setUserLocation,
                    subscribeToUserLocation: subscribeToUserLocation,
                    baseUrl: '/schedule/v2'
                };
            }
        }); 
        
        window.singleSpa.registerApplication({
            name: "scheduleAltApp",
            app: () => System.import(appImportPathDetail['scheduleAltApp']),
            activeWhen: location => location.hash.startsWith('#/schedule/alt-v2'),
            customProps() {
                return {
                    getUserLocation: getUserLocation,
                    setUserLocation: setUserLocation,
                    subscribeToUserLocation: subscribeToUserLocation,
                    baseUrl: '/schedule/alt-v2'
                };
            }
        }); 

        window.singleSpa.registerApplication({
            name: "insuraceApp",
            app: () => System.import(appImportPathDetail['insuraceApp']),
            activeWhen: location => location.hash.startsWith('#/BusinessCenter/Insurance/v2'),
            customProps() {
                return {
                    getUserLocation: getUserLocation,
                    setUserLocation: setUserLocation,
                    subscribeToUserLocation: subscribeToUserLocation
                };
            }
        }); 

        window.singleSpa.registerApplication({
            name: "clinicalApp",
            app: () => System.import(appImportPathDetail['clinicalApp']),
            activeWhen: location => location.hash.includes('/Clinical/v2'),
            customProps() {
                return {
                    getUserLocation: getUserLocation,
                    setUserLocation: setUserLocation,
                    subscribeToUserLocation: subscribeToUserLocation
                };
            }
        }); 

        window.singleSpa.registerApplication({
            name: "practiceSettingsApp",
            app: () => System.import(appImportPathDetail['practiceSettingsApp']),
            activeWhen: location => location.hash.startsWith('#/practiceSettings'),
            customProps() {
                return {
                    getUserLocation: getUserLocation,
                    setUserLocation: setUserLocation,
                    subscribeToUserLocation: subscribeToUserLocation
                };
            }
        }); 
        
        window.singleSpa.registerApplication({
            name: "contractApp",
            app: () => System.import(appImportPathDetail['contractApp']),
            activeWhen: location => {
                const hash = location.hash || '';
                const urlParams = new URLSearchParams(hash.split('?')[1] || '');
                return hash.startsWith('#/Patient') && urlParams.get('tab') === 'Contract';
             },
            customProps() {
                return {
                    getUserLocation: getUserLocation,
                    setUserLocation: setUserLocation,
                    subscribeToUserLocation: subscribeToUserLocation
                };
            }
        });         

        const load = async function (scope) {
        const { baseAppName, containerId } = scope;

        try {
            const importPath = appImportPathDetail[baseAppName];
            if (!importPath) {
                console.error(`Import path not found for "${baseAppName}"`);
                return;
            }

            const appModule = await System.import(importPath);

            const rootContainer = document.getElementById(containerId);
            if (!rootContainer) {
                console.error(`Root container with ID "${containerId}" not found`);
                return;
            }

            const rootParcelInstance = window.singleSpa.mountRootParcel(appModule.default, {
                domElement: rootContainer,
                containerId: containerId,
                getUserLocation: getUserLocation,
                setUserLocation: setUserLocation,
                subscribeToUserLocation: subscribeToUserLocation
            });

            await rootParcelInstance.mountPromise;
            console.log(`Root Parcel "${baseAppName}" mounted successfully!`);

            await mountDynamicParcel(appModule, scope);

        } catch (error) {
            console.error(`Error loading or mounting app "${baseAppName}":`, error);
        }
    };

    async function mountDynamicParcel(appModule, scope) {
        const { parcelKey, containerId, inputProps, routeProps, onDataEmittedFromMfe } = scope;

        if (!appModule.fuseMfeSectionId) {
            console.error(`Missing "fuseMfeSectionId" in app module for parcelKey "${parcelKey}"`);
            return;
        }

        if (!appModule.angularParcelData) {
            console.error(`Missing "angularParcelData" in app module for parcelKey "${parcelKey}"`);
            return;
        }

        const dynamicContainer = document.getElementById(appModule.fuseMfeSectionId);
        if (!dynamicContainer) {
            console.error(`Dynamic container with ID "${appModule.fuseMfeSectionId}" not found`);
            return;
        }

        try {
            const dynamicParcelInstance = window.singleSpa.mountRootParcel(appModule.angularParcelData, {
                domElement: dynamicContainer,
                name: parcelKey,
                containerId: containerId,
                fuseMfeSectionId: appModule.fuseMfeSectionId,
                parcelKey: parcelKey,
                inputProps: inputProps,
                routeProps: routeProps,
                onDataEmittedFromMfe: onDataEmittedFromMfe
            });

            await dynamicParcelInstance.mountPromise;
            console.log(`Dynamic Parcel "${parcelKey}" mounted successfully!`);

        } catch (error) {
            console.error(`Error mounting dynamic parcel "${parcelKey}":`, error);
        }
    }

        window.singleSpa.loadApp = load;

        window.singleSpa.start();
    });
}