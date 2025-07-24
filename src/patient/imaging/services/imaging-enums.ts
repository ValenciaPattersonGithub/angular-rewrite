declare let angular: any;

export enum ImagingProvider {
    Apteryx = 'apteryx',
    Apteryx2 = 'apteryx2',
    Sidexis = 'sidexis',
    Blue = 'blue'
}

export enum ImagingProviderStatus {
    None = 'none',
    Initializing = 'initializing',
    Ready = 'ready',
    NotAvailable = 'notAvailable',
    Error = 'error'
}

// expose enums to AngularJS
angular.module('Soar.Main')
    .factory('ImagingProviders', () => {
        let providers = {};
        for (var name in ImagingProvider) {
            providers[name] = ImagingProvider[name];
        }
        return providers;
    })
    .factory('ImagingProviderStatus', () => {
        let statuses = {};
        for (var name in ImagingProviderStatus) {
            statuses[name] = ImagingProviderStatus[name];
        }
        return statuses;
    });