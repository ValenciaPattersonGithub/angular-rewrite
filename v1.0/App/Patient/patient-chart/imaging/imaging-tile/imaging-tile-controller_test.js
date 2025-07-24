describe('PatientImagingTileController ->', function () {
  var scope, modalFactory, ctrl, imagingProviders;

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.Patient'));

  // create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      modalFactory = {
        Modal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.callFake(function () {}),
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      imagingProviders = { Blue: 'blue' };
      $provide.value('ImagingProviders', imagingProviders);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('PatientImagingTileController', {
      $scope: scope,
    });
    spyOn(scope, '$emit');
  }));

  describe('$onInit function ->', function () {
    beforeEach(function () {
      scope.imageExam = {
        ImageCount: 0,
        date: '2020-04-08',
        Description: 'testDescription',
      };
      spyOn(ctrl, 'calculateImageCount').and.returnValue(3);
      spyOn(scope, 'showExamPreview');
      scope.previewExam = null;
      scope.imageDescription = null;
    });

    it('should call ctrl.calculateImageCount to set scope.imageExam.ImageCount', function () {
      ctrl.$onInit();
      expect(ctrl.calculateImageCount).toHaveBeenCalled();
      expect(scope.imageExam.ImageCount).toEqual(3);
    });

    it('should call scope.showExamPreview if scope.previewExam and scope.previewExam.date equals this imageExam.date', function () {
      scope.previewExam = { date: '2020-04-08' };
      ctrl.$onInit();
      expect(scope.showExamPreview).toHaveBeenCalledWith(scope.imageExam);
    });

    it('should not call scope.showExamPreview if not scope.previewExam or  scope.previewExam.date does not equal this imageExam.date', function () {
      scope.previewExam = { date: '2020-03-08' };
      ctrl.$onInit();
      expect(scope.showExamPreview).not.toHaveBeenCalled();
    });

    it('should not set imageDescription to BlueExam if exam provider is Blue', function () {
      scope.imageExam.Provider = imagingProviders.Blue;

      ctrl.$onInit();

      expect(scope.imageDescription).toBe(scope.imageExam.Description);
    });

    it('should set imageDescription to Description if exam provider is not Blue', function () {
      scope.imageExam.Provider = imagingProviders.Apteryx2;

      ctrl.$onInit();

      expect(scope.imageDescription).toBe(scope.imageExam.Description);
    });
  });

  describe('ctrl.validateExam ->', function () {
    var exam = {};
    beforeEach(function () {
      exam = {
        Description: 'Sidexis Exam',
        Series: [
          {
            Images: [
              {
                ImageId: 'f11ac445-1b63-45b4',
                ThirdPartyImagingRecordId: 458821,
                FileAllocationId: 1234,
              },
              {
                ImageId: 'f11ac445-1b63-46b5',
                ThirdPartyImagingRecordId: 458822,
                FileAllocationId: 1234,
              },
            ],
          },
        ],
        date: '2020-04-08',
        ImageCount: 2,
      };
    });

    it('should return false if the exam is not Sidexis exam', function () {
      exam.Description = 'Other';
      let returnValue = ctrl.validateExam(exam);
      expect(returnValue).toBe(true);
    });

    it('should return true if the exam.Description is Sidexis Exam and image has a FileAllocationId', function () {
      let returnValue = ctrl.validateExam(exam);
      expect(returnValue).toBe(true);
    });

    it('should return false if the exam.Description is Sidexis Exam and image does not have a FileAllocationId', function () {
      exam.Description = 'Sidexis Exam';
      exam.Series[0].Images[0].FileAllocationId = 0;
      let returnValue = ctrl.validateExam(exam);
      expect(returnValue).toBe(false);
    });

    it('should emit soar:update-external-images with exam if false', function () {
      exam.Description = 'Sidexis Exam';
      exam.Series[0].Images[0].FileAllocationId = 0;
      ctrl.validateExam(exam);
      expect(scope.$emit).toHaveBeenCalledWith(
        'soar:update-external-images',
        exam
      );
    });
  });

  describe('scope.showExamIfValid ->', function () {
    var exam = {};
    beforeEach(function () {
      exam = {
        Description: 'Sidexis Exam',
        Series: [
          {
            Images: [
              {
                ImageId: 'f11ac445-1b63-45b4',
                ThirdPartyImagingRecordId: 458821,
                FileAllocationId: 1234,
              },
              {
                ImageId: 'f11ac445-1b63-46b5',
                ThirdPartyImagingRecordId: 458822,
                FileAllocationId: 1234,
              },
            ],
          },
        ],
        date: '2020-04-08',
        ImageCount: 2,
      };
      spyOn(scope, 'showExamPreview');
    });

    it('should call scope.showExamPreview with exam if ctrl.validateExam returns true', function () {
      spyOn(ctrl, 'validateExam').and.returnValue(true);
      scope.showExamIfValid(exam);
      expect(scope.showExamPreview).toHaveBeenCalledWith(exam);
    });

    it('should not call scope.showExamPreview with exam if ctrl.validateExam returns false', function () {
      spyOn(ctrl, 'validateExam').and.returnValue(false);
      scope.showExamIfValid(exam);
      expect(scope.showExamPreview).not.toHaveBeenCalledWith(exam);
    });
  });
});
