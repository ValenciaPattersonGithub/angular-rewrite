'use strict';

angular.module('common.factories').factory('localize', [
  '$http',
  '$rootScope',
  '$window',
  function ($http, $rootScope, $window) {
    var localize;

    localize = {
      language: '',
      url: void 0,
      resourceFileLoaded: false,
      successCallback: function (data) {
        localize.dictionary = data;
        localize.resourceFileLoaded = true;
        return $rootScope.$broadcast('localizeResourcesUpdated');
      },
      setLanguage: function (value) {
        localize.language = value.toLowerCase().split('-')[0];
        return localize.initLocalizedResources();
      },
      setUrl: function (value) {
        localize.url = value;
        return localize.initLocalizedResources();
      },
      buildUrl: function () {
        if (!localize.language) {
          localize.language = (
            $window.navigator.userLanguage || $window.navigator.language
          ).toLowerCase();
          localize.language = localize.language.split('-')[0];
        }
        return 'i18n/resources-locale_' + localize.language + '.js';
      },
      initLocalizedResources: function () {
        var url;
        url = localize.url || localize.buildUrl();
        return $http({
          method: 'GET',
          url: url,
          cache: false,
        })
          .then(res => localize.successCallback(res.data))
          .catch(function () {
            return $rootScope.$broadcast('localizeResourcesUpdated');
          });
      },
      // gets the localized value or returns passed in value if none exists
      getLocalizedString: function (value, params) {
        var formatted = getLocalizedValue(value);
        if (params && params.length > 0) {
          for (var i = 0; i < params.length; i++) {
            var item = params[i];
            if (typeof item !== 'undefined' && item !== null) {
              formatted = formatted.replace(
                RegExp('\\{' + i + '\\}', 'g'),
                item.skip != null && item.skip != undefined
                  ? item.skip
                  : getLocalizedValue(item)
              );
            } else {
              formatted = formatted.replace(RegExp('\\{' + i + '\\}', 'g'), '');
            }
          }
        }
        return formatted;
      },
    };

    function getLocalizedValue(value) {
      if (localize.dictionary && value) {
        if (!localize.dictionary.hasOwnProperty(value)) {
          return value;
        } else {
          return localize.dictionary[value];
        }
      } else {
        return value;
      }
    }

    return localize;
  },
]);
