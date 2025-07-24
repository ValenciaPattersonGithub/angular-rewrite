describe('DocumentUploaderController', function () {
  var scope,
    timeout,
    patSecurityService,
    patientDocumentsFactory,
    localize,
    docUploader;
  var ctrl, q;

  beforeEach(module('Soar.Common'));
  beforeEach(
    module('common.controllers', function ($provide) {
      patientDocumentsFactory = {};
      $provide.value('PatientDocumentsFactory', patientDocumentsFactory);

      docUploader = {
        content: jasmine.createSpy().and.returnValue(''),
        setOptions: jasmine.createSpy().and.returnValue(''),
        open: jasmine.createSpy().and.returnValue(''),
        close: jasmine.createSpy().and.returnValue(''),
      };

      //mock for patSecurityService
      patSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
      };

      //#endregion
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    scope = $rootScope.$new();

    //mock for localize
    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (value) {
          return value;
        }),
    };
    scope.docCtrls = docUploader;
    //creating controller
    ctrl = $controller('DocumentUploaderController', {
      $scope: scope,
      $timeout: timeout,
      patSecurityService: patSecurityService,
      PatientDocumentsFactory: patientDocumentsFactory,
      localize: localize,
    });
  }));

  describe('watch openUploader', function () {
    beforeEach(inject(function () {
      scope.documentFilter = 'Filter';
      spyOn(scope, 'openDocUploader');
      scope.openUploader = false;
      scope.$apply();
    }));

    it('should do nothing if newvalue is false', function () {
      scope.openUploader = false;
      scope.$apply();
      expect(scope.openDocUploader).not.toHaveBeenCalled();
    });

    it('should set patientDocumentsFactory.selectedFilter if newvalue is true', function () {
      scope.openUploader = true;
      scope.$apply();
      expect(patientDocumentsFactory.selectedFilter).toEqual('Filter');
    });

    it('should call openDocUploader if newvalue is true', function () {
      scope.openUploader = true;
      scope.$apply();
      expect(scope.openDocUploader).toHaveBeenCalled();
    });

    it('should set openUploader to false if newvalue is true', function () {
      scope.openUploader = true;
      scope.$apply();
      expect(scope.openUploader).toEqual(false);
    });
  });

  describe('scope.onUpLoadCancel method', function () {
    it('should call docCtrls.close()', function () {
      scope.onUpLoadCancel();
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });
  });

  describe('scope.onUpLoadSuccess method', function () {
    it('should call docCtrls.close()', function () {
      scope.onUpLoadSuccess();
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });
  });

  describe('openDocUploader function -> ', function () {
    it('should load content', function () {
      scope.openDocUploader();
      expect(scope.docCtrls.content).toHaveBeenCalledWith(
        '<doc-uploader [patient-id]="personId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
      );
    });

    it('should set options', function () {
      scope.openDocUploader();
      expect(scope.docCtrls.setOptions).toHaveBeenCalled();
    });

    it('should call docCtrls.open', function () {
      scope.openDocUploader();
      expect(scope.docCtrls.open).toHaveBeenCalled();
    });
  });
});
