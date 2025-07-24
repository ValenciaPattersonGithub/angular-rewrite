'use strict'

angular.module('Soar.BusinessCenter').controller('PrmSettingsController', [
    '$scope',
    'SoarConfig',
    'locationService',
    function (
        $scope,
        soarConfig,
        locationService
    ) {
        var locationId = locationService.getCurrentLocation().id;
        var practiceId = locationService.getCurrentLocation().practiceid;

        var titleText = 'Fuse Connect';
        var linkText = 'Online Scheduling'; // template passed text through i18n so no need to localize here

        $scope.header = titleText;
        $scope.idPrefix = 'prm-settings-';
        $scope.iconClass = 'fa-calendar-plus';
        $scope.target = '_blank';
        
        $scope.list.push({
            Section: linkText,
            Link: `${soarConfig.prmUrl}?locationId=${locationId}&practiceId=${practiceId}`
        });

        $scope.openModal = function (template, modifierClass, amfa) {}
        $scope.getModifierClass = function (item) {
            return '';
        }
        $scope.displayAdditionalContent = function (item) {
            return '';
        }
        $scope.displayName = function (item) {
            return item.Section;
        }

        $scope.listIsLoading = false;
    }
]);