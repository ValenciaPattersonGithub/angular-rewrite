'use strict';

angular.module('Soar.Patient').factory('OdontogramSnapshotWorkerFactory', [
  'patAuthenticationService',
  'applicationService',
  'instanceIdentifier',
  'uniqueIdentifier',
  'practiceService',
  'locationService',
  'SoarConfig',
  function (
    patAuthenticationService,
    applicationService,
    instanceIdentifier,
    uniqueIdentifier,
    practiceService,
    locationService,
    SoarConfig
  ) {
    var getSnapshot = function (patientId, success, failure) {
      var workerStr = _.toString(snapshotWorker);
      var openingBracket = _.indexOf(workerStr, '{');
      var closingBracket = workerStr.lastIndexOf('}');
      var workerCode = workerStr.substring(openingBracket + 1, closingBracket);

      var workerJs = `(function() {${workerCode}})();`;
      var workerBlob = new Blob([workerJs], { type: 'application/javascript' });
      var objUrl = URL.createObjectURL(workerBlob);

      var worker = new Worker(objUrl);

      // Prepare entity for request
      var request = {};
      request.url = `${SoarConfig.domainUrl}/patients/${patientId}/odontogram/generatesnapshot`;
      request.headers = getHeaders();
      var reqData = JSON.parse(JSON.stringify(request));

      worker.onmessage = messageHandler(success, failure);

      worker.postMessage(reqData);

      return worker;
    };

    function messageHandler(success, failure) {
      return message => {
        if (
          !_.isNil(message) &&
          !_.isNil(message.data) &&
          message.data.success === true &&
          message.data.statusCode === 200
        ) {
          success(JSON.parse(message.data.response));
        } else {
          failure(JSON.parse(message.data.response));
        }
      };
    }

    function getHeaders() {
      var token = patAuthenticationService.getCachedToken();
      var instanceId = instanceIdentifier.getIdentifier();
      var appId = applicationService.getApplicationId();
      var requestId = uniqueIdentifier.getId();
      var practiceId = practiceService.getCurrentPractice().id;
      var locationId = locationService.getCurrentLocation().id;
      var locationTimezone = locationService.getCurrentLocation().timezone;
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
        {
          headerName: 'Accept',
          headerValue: 'application/json, text/plain, */*',
        },
      ];
    }

    return {
      getSnapshot: getSnapshot,
      getSnapshotWorkerCodeForTest: function () {
        return snapshotWorker;
      },
    };

    function snapshotWorker() {
      // Worker message processor.
      // This is executed when the main thread (UI) calls worker.postMessage
      onmessage = function (e) {
        var request = e.data;
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', successFunc);
        xhr.addEventListener('error', errorFunc);
        xhr.open('GET', request.url, true);

        request.headers.forEach(function (header) {
          xhr.setRequestHeader(header.headerName, header.headerValue);
        });

        xhr.send();
      };

      function successFunc() {
        var apiResponse = JSON.parse(JSON.stringify(this.response));

        var message = {
          success: true,
          statusCode: this.status,
          response: apiResponse,
        };

        postMessage(message);
        close();
      }

      function errorFunc(e) {
        var response = JSON.parse(JSON.stringify(e));
        var message = {
          success: false,
          response: response,
        };
        postMessage(message);
        close();
      }
    }
  },
]);
