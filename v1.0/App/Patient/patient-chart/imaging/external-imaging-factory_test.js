describe('ExternalImagingWorkerFactory ->', function () {
  var mockCachedToken, mockInstanceId, mockApplicationId, mockUniqueId;
  var factory;
  var patAuthenticationService,
    applicationService,
    instanceIdentifier,
    uniqueIdentifier,
    imagingMasterService,
    imagingProviders;

  let returnValue = {};
  returnValue.then = jasmine.createSpy().and.callFake(function () {});
  let successSpy = jasmine.createSpy();
  let failureSpy = jasmine.createSpy();
  let externalPatientIdMock = '123456';
  let patientDirectoryAllocationIdMock = '456789';
  let externalImagesMock = [
    { ThirdPartyImagingRecordId: 1234, FileAllocationId: 111, ImageId: 2222 },
    { ThirdPartyImagingRecordId: 1235, FileAllocationId: 0, ImageId: 3333 },
    { ThirdPartyImagingRecordId: null, FileAllocationId: 0, ImageId: 4444 },
  ];

  beforeEach(
    module('Soar.Patient', function ($provide) {
      spyOn(XMLHttpRequest.prototype, 'open').and.callThrough();

      imagingProviders = {
        Apteryx: 'apteryx',
        Apteryx2: 'apteryx2',
        Sidexis: 'sidexis',
      };
      $provide.value('ImagingProviders', imagingProviders);

      imagingMasterService = {
        getUrlForPatientByImageId: jasmine
          .createSpy()
          .and.returnValue(returnValue),
      };
      $provide.value('ImagingMasterService', imagingMasterService);

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
    factory = $injector.get('ExternalImagingWorkerFactory');
  }));

  it('should exist', function () {
    expect(factory).toBeTruthy();
  });

  describe('saveImages function ->', function () {
    let externalImages = [];

    beforeEach(function () {
      externalImages = _.cloneDeep(externalImagesMock);
      factory.testGetImageWorker()();
    });

    it('should call imagingMasterService for each externalImage that has a null ThirdPartyImagingRecordId or FileAllocationId that is null or 0 ', function () {
      factory.saveImages(
        externalPatientIdMock,
        externalImages,
        patientDirectoryAllocationIdMock,
        successSpy,
        failureSpy
      );
      _.forEach(externalImages, function (imageRecord) {
        if (imageRecord.ThirdPartyImagingRecordId === null) {
          expect(
            imagingMasterService.getUrlForPatientByImageId
          ).toHaveBeenCalled();
        }
        if (imageRecord.FileAllocationId === 0) {
          expect(
            imagingMasterService.getUrlForPatientByImageId
          ).toHaveBeenCalled();
        }
      });
    });

    it('should not call imagingMasterService for externalImage that has a ThirdPartyImagingRecordId and FileAllocationId that is not null or 0 ', function () {
      externalImages = _.cloneDeep(externalImagesMock[0]);
      factory.saveImages(
        externalPatientIdMock,
        externalImages,
        patientDirectoryAllocationIdMock,
        successSpy,
        failureSpy
      );
      _.forEach(externalImages, function (imageRecord) {
        if (
          imageRecord.ThirdPartyImagingRecordId === 1234 &&
          imageRecord.FileAllocationId === 111
        ) {
          expect(
            imagingMasterService.getUrlForImageByImageId
          ).not.toHaveBeenCalled();
        }
      });
    });
  });

  // describe('syncImages function ->', function () {
  //     let existingExternalImages = [];
  //     let externalImageStudies=[];

  //     beforeEach(function () {
  //         externalImageStudies  = [
  //             {   studyId: null,
  //                 date: '2020-03-10T00:00:00',
  //                 description: null,
  //                 series: [
  //                     {   seriesId: null,
  //                         date: '2020-03-10T00:00:00',
  //                         description: null,
  //                         images:[
  //                             {imageId: '1234', date: '2020-03-10T15:30:53.207', toothNumbers: '11,12', description: 'Imported File', imageNumber: 1234},
  //                             {imageId: '1235', date: '2020-03-10T15:30:53.207', toothNumbers: '12,13', description: 'Imported File', imageNumber: 1235},
  //                         ]
  //                     }
  //                 ],
  //             },
  //         ];
  //         existingExternalImages =  [{ImageId:'1234'},{ImageId:'1235'},{ImageId:'1236'},{ImageId:'1237'}];
  //         factory.testGetImageWorker()();

  //     });

  //     // Actually can't test this unless i add some code to be used for testing only, i'll look into that
  //     it('should call deleteImageRecord for any image in fuse record that is not in sidexis list', function () {
  //        factory.syncImages(existingExternalImages, externalImageStudies, successSpy, failureSpy);
  //        //expect(factory.deleteImageRecord).toHaveBeenCalledWith(existingExternalImages[3]);
  //        //expect(factory.deleteImageRecord).toHaveBeenCalledWith(existingExternalImages[4])
  //     });
  //});
});
