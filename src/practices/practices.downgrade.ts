import { downgradeInjectable } from '@angular/upgrade/static';
import { LocationTimeService, LocationsDisplayService } from './common/providers';
import { LocationHttpService, UserSettingHttpService } from './http-providers';
import { LocationsService, RoomsService } from './providers';

declare var angular: angular.IAngularStatic;

export function PracticesDowngrade() {
  angular
    .module('Soar.Main')
    .factory('LocationTimeService', downgradeInjectable(LocationTimeService))
    .factory('LocationsDisplayService', downgradeInjectable(LocationsDisplayService))
    .factory('LocationHttpService', downgradeInjectable(LocationHttpService))
    .factory('UserSettingHttpService', downgradeInjectable(UserSettingHttpService))
    .factory('NewLocationsService', downgradeInjectable(LocationsService))
    .factory('NewRoomsService', downgradeInjectable(RoomsService));
}
