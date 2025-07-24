describe('ImagingUtilities ->', function () {
  var imagingMasterService, imagingProviders, utilities, http;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      imagingMasterService = {};
      $provide.value('ImagingMasterService', imagingMasterService);

      imagingProviders = {};
      $provide.value('ImagingProviders', imagingProviders);
    })
  );

  beforeEach(inject(function ($injector, $httpBackend) {
    http = $httpBackend;

    utilities = $injector.get('ImagingUtilities');
  }));

  it('should exist', function () {
    expect(utilities).not.toBeNull();
  });

  describe('retrieveImagesForExam function ->', function () {
    var exam,
      imageCount,
      fakeUrl = 'fakeUrl',
      mockResponse = { data: 'junk' };

    beforeEach(function () {
      exam = {
        Provider: 'apteryx2',
        Series: [
          {
            Images: [{ Id: 1 }, { Id: 2 }],
          },
          {
            Images: [{ Id: 3 }, { Id: 4 }],
          },
        ],
      };
      imageCount = 4;

      imagingMasterService.getImageThumbnailByImageId = jasmine
        .createSpy()
        .and.callFake(id => {
          return {
            then: function (cb) {
              cb({ success: true, result: fakeUrl + id });
            },
          };
        });
      for (var i = 1; i <= imageCount; i++) {
        http.expectGET(fakeUrl + i).respond(200, mockResponse);
      }

      utilities.retrieveImagesForExam(exam);
    });

    afterEach(function () {
      http.verifyNoOutstandingExpectation();
    });

    it('should call imagingService.getImageThumbnailByImageId for each image', function () {
      expect(
        imagingMasterService.getImageThumbnailByImageId
      ).toHaveBeenCalledTimes(imageCount);
      http.flush();
    });
  });
});
