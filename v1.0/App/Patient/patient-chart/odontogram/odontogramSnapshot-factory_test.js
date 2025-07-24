/* global Worker:true, XMLHttpRequest:true, postMessage:true, close:true */

describe('OdontogramSnapshotWorkerFactory ->', function () {
  var factory, realWorker;
  var patAuthenticationService,
    applicationService,
    instanceIdentifier,
    uniqueIdentifier;

  var mockCachedToken, mockInstanceId, mockApplicationId, mockUniqueId;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      mockCachedToken = 'cachedToken';
      patAuthenticationService = {
        getCachedToken: jasmine.createSpy().and.returnValue(mockCachedToken),
      };
      $provide.value('patAuthenticationService', patAuthenticationService);

      mockApplicationId = 'applicationId';
      applicationService = {
        getApplicationId: jasmine
          .createSpy()
          .and.returnValue(mockApplicationId),
      };
      $provide.value('applicationService', applicationService);

      mockInstanceId = 'instanceIdentifier';
      instanceIdentifier = {
        getIdentifier: jasmine.createSpy().and.returnValue(mockInstanceId),
      };
      $provide.value('instanceIdentifier', instanceIdentifier);

      mockUniqueId = 'uniqueIdentifier';
      uniqueIdentifier = {
        getId: jasmine.createSpy().and.returnValue(mockUniqueId),
      };
      $provide.value('uniqueIdentifier', uniqueIdentifier);
    })
  );

  beforeEach(inject(function ($injector) {
    factory = $injector.get('OdontogramSnapshotWorkerFactory');
  }));

  it('should exist', function () {
    expect(factory).toBeTruthy();
  });

  describe('getSnapshot function ->', function () {
    var request;

    beforeEach(function () {
      moment.tz.setDefault('America/Chicago');
      realWorker = Worker;
      Worker = jasmine.createSpy().and.returnValue({
        postMessage: jasmine.createSpy().and.callFake(function (r) {
          request = r;
        }),
      });
    });

    it('should return worker with onmessage', function () {
      var worker = factory.getSnapshot();
      expect(worker).toBeDefined();
      expect(worker.onmessage).toEqual(jasmine.any(Function));
    });

    it('should call service functions to get data for header', function () {
      factory.getSnapshot();
      expect(patAuthenticationService.getCachedToken).toHaveBeenCalled();
      expect(instanceIdentifier.getIdentifier).toHaveBeenCalled();
      expect(applicationService.getApplicationId).toHaveBeenCalled();
      expect(uniqueIdentifier.getId).toHaveBeenCalled();
      expect(_practiceService_.getCurrentPractice).toHaveBeenCalled();
      expect(_locationService_.getCurrentLocation).toHaveBeenCalled();
    });

    it('should call worker.postMessage with correct data', function () {
      var patientId = 'patientId';
      var worker = factory.getSnapshot(patientId);
      expect(worker.postMessage).toHaveBeenCalled();
      expect(request).toBeDefined();
      expect(request.url).toBe(
        `${_soarConfig_.domainUrl}/patients/${patientId}/odontogram/generatesnapshot`
      );
      expect(request.headers).toEqual([
        {
          headerName: 'Authorization',
          headerValue: 'Bearer ' + mockCachedToken,
        },
        {
          headerName: 'PAT-Application-Instance-ID',
          headerValue: mockInstanceId,
        }, // used for AppInsights logging
        { headerName: 'PAT-Request-ID', headerValue: mockUniqueId }, // used for AppInsights logging
        { headerName: 'PAT-Application-ID', headerValue: mockApplicationId },
        {
          headerName: 'PAT-Practice-ID',
          headerValue: _practiceService_.getCurrentPractice().id,
        },
        {
          headerName: 'PAT-Location-ID',
          headerValue: _locationService_.getCurrentLocation().id,
        },
        {
          headerName: 'PtcSoarUtcOffset',
          headerValue: moment().utcOffset() / 60,
        },
        { headerName: 'Location-TimeZone' },
        {
          headerName: 'Accept',
          headerValue: 'application/json, text/plain, */*',
        },
      ]);
    });

    afterEach(function () {
      Worker = realWorker;
      moment.tz.setDefault();
    });
  });

  describe('messageHandler function ->', function () {
    var messageHandler, successSpy, failureSpy;

    beforeEach(function () {
      realWorker = Worker;
      Worker = jasmine.createSpy().and.returnValue({
        postMessage: jasmine.createSpy(),
      });

      successSpy = jasmine.createSpy();
      failureSpy = jasmine.createSpy();

      var worker = factory.getSnapshot('patientId', successSpy, failureSpy);
      messageHandler = worker.onmessage;
    });

    it('should return a function', function () {
      expect(messageHandler).toEqual(jasmine.any(Function));
    });

    describe('when message.data.success is false ->', function () {
      var response = { property: 'value' };
      var message = {
        data: {
          success: false,
          statusCode: 200,
          response: JSON.stringify(response),
        },
      };
      it('should call failure with ??????????', function () {
        messageHandler(message);
        expect(failureSpy).toHaveBeenCalledWith(response);
      });
    });

    describe('when message.data.statusCode is not 200 ->', function () {
      var response = { property: 'value' };
      var message = {
        data: {
          success: true,
          statusCode: 201,
          response: JSON.stringify(response),
        },
      };
      it('should call failure with ??????????', function () {
        messageHandler(message);
        expect(failureSpy).toHaveBeenCalledWith(response);
      });
    });

    describe('when message indicates success ->', function () {
      var response = { property: 'value' };
      var message = {
        data: {
          success: true,
          statusCode: 200,
          response: JSON.stringify(response),
        },
      };
      it('should call success with ??????????', function () {
        messageHandler(message);
        expect(successSpy).toHaveBeenCalledWith(response);
      });
    });

    afterEach(function () {
      Worker = realWorker;
    });
  });

  describe('snapshotWorker function ->', function () {
    var realOnMessage;
    beforeEach(function () {
      realOnMessage = onmessage;
      factory.getSnapshotWorkerCodeForTest()();
    });

    it('should set onmessage', function () {
      expect(onmessage).not.toBe(realOnMessage);
    });

    describe('onmessage function ->', function () {
      var realXhr, xhr;
      beforeEach(function () {
        realXhr = XMLHttpRequest;
        xhr = {
          addEventListener: jasmine.createSpy(),
          open: jasmine.createSpy(),
          setRequestHeader: jasmine.createSpy(),
          send: jasmine.createSpy(),
        };
        XMLHttpRequest = jasmine.createSpy().and.callFake(function () {
          return xhr;
        });
      });

      it('should call methods on xhr', function () {
        var url = 'url';
        var headers = [
          { headerName: 'name1', headerValue: 'value1' },
          { headerName: 'name2', headerValue: 'value2' },
        ];
        onmessage({ data: { url: url, headers: headers } });

        expect(xhr.addEventListener).toHaveBeenCalledTimes(2);
        expect(xhr.addEventListener).toHaveBeenCalledWith(
          'load',
          jasmine.any(Function)
        );
        expect(xhr.addEventListener).toHaveBeenCalledWith(
          'error',
          jasmine.any(Function)
        );
        expect(xhr.open).toHaveBeenCalledWith('GET', url, true);
        expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
        expect(xhr.setRequestHeader).toHaveBeenCalledWith(
          headers[0].headerName,
          headers[0].headerValue
        );
        expect(xhr.setRequestHeader).toHaveBeenCalledWith(
          headers[1].headerName,
          headers[1].headerValue
        );
        expect(xhr.send).toHaveBeenCalled();
      });

      afterEach(function () {
        XMLHttpRequest = realXhr;
      });
    });

    describe('successFunc function ->', function () {
      var realXhr, realPostMessage, realClose, successFunc;
      beforeEach(function () {
        realXhr = XMLHttpRequest;
        var xhr = {
          addEventListener: jasmine.createSpy().and.callFake(function (e, cb) {
            if (e === 'load') successFunc = cb;
          }),
          open: jasmine.createSpy(),
          setRequestHeader: jasmine.createSpy(),
          send: jasmine.createSpy(),
        };
        XMLHttpRequest = jasmine.createSpy().and.callFake(function () {
          return xhr;
        });

        realPostMessage = postMessage;
        postMessage = jasmine.createSpy();

        realClose = close;
        close = jasmine.createSpy();

        onmessage({ data: { headers: [] } });
      });

      it('should call postMessage and close', function () {
        var response = { property: 'value' };
        var status = 'status';
        successFunc.call({ response: response, status: status });
        expect(postMessage).toHaveBeenCalledWith(
          jasmine.objectContaining({
            success: true,
            statusCode: status,
            response: response,
          })
        );
        expect(close).toHaveBeenCalled();
      });

      afterEach(function () {
        XMLHttpRequest = realXhr;
        postMessage = realPostMessage;
        close = realClose;
      });
    });

    describe('errorFunc function ->', function () {
      var realXhr, realPostMessage, realClose, errorFunc;
      beforeEach(function () {
        realXhr = XMLHttpRequest;
        var xhr = {
          addEventListener: jasmine.createSpy().and.callFake(function (e, cb) {
            if (e === 'error') errorFunc = cb;
          }),
          open: jasmine.createSpy(),
          setRequestHeader: jasmine.createSpy(),
          send: jasmine.createSpy(),
        };
        XMLHttpRequest = jasmine.createSpy().and.callFake(function () {
          return xhr;
        });

        realPostMessage = postMessage;
        postMessage = jasmine.createSpy();

        realClose = close;
        close = jasmine.createSpy();

        onmessage({ data: { headers: [] } });
      });

      it('should call postMessage and close', function () {
        var response = { property: 'value' };
        errorFunc(response);
        expect(postMessage).toHaveBeenCalledWith(
          jasmine.objectContaining({
            success: false,
            response: response,
          })
        );
        expect(close).toHaveBeenCalled();
      });

      afterEach(function () {
        XMLHttpRequest = realXhr;
        postMessage = realPostMessage;
        close = realClose;
      });
    });

    afterEach(function () {
      onmessage = realOnMessage;
    });
  });
});
