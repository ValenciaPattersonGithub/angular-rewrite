'use strict';

angular.module('Soar.Patient').factory('ExternalImagingWorkerFactory', [
  'patAuthenticationService',
  'applicationService',
  'instanceIdentifier',
  'uniqueIdentifier',
  'practiceService',
  'locationService',
  'SoarConfig',
  'ImagingMasterService',
  'ImagingProviders',
  function (
    patAuthenticationService,
    applicationService,
    instanceIdentifier,
    uniqueIdentifier,
    practiceService,
    locationService,
    SoarConfig,
    imagingMasterService,
    imagingProviders
  ) {
    // TODO delete this logic?
    //One thing to note is that the items that get sent to the background worker will be of two different flavors:
    //“new” items – those that are received from Sidexis, but don’t have a corresponding 3rdParty record
    // “old” items – 3rd party records that don’t have a file allocation id yet

    // get image from sidexis by image id
    // get allocation id
    // upload image
    // if upload succeeds
    //if we have a ThirdPartyImagingRecordId but no Allocation id
    // update ThirdPartyImagingRecord with AllocationId
    //if we dont have a ThirdPartyImagingRecordId
    // add ThirdPartyImagingRecord with AllocationId
    // if upload fails
    // delete the allocation id

    // entry point for uploading images from external source
    let saveImages = function (
      externalPatientId,
      externalImages,
      patientDirectoryAllocationId,
      success,
      failure
    ) {
      let sidexis = imagingProviders.Sidexis;
      _.forEach(externalImages, function (imageRecord) {
        // if ThirdPartyImagingRecordId = null
        if (
          imageRecord.ThirdPartyImagingRecordId === null ||
          imageRecord.FileAllocationId === 0 ||
          imageRecord.FileAllocationId === null
        ) {
          // get image from sidexis by image id
          imagingMasterService
            .getUrlForPatientByImageId(
              imageRecord.ImageId,
              sidexis,
              externalPatientId,
              'jpeg'
            )
            .then(res => {
              getImage(
                res.result,
                imageRecord,
                patientDirectoryAllocationId,
                success,
                failure
              );
            });
        }
      });
    };

    let syncImages = function (
      existingExternalImages,
      externalImageStudies,
      success,
      failure
    ) {
      // get a list of fuse images that are no longer in the sidexis data
      // list of ImageIds in fuse data
      let sidexisImageNumbers = [];
      // for the ones that haven't, create dto data
      _.forEach(externalImageStudies, function (exam) {
        _.forEach(exam.series, function (ser) {
          if (ser.images.length > 0) {
            _.forEach(ser.images, function (image) {
              sidexisImageNumbers.push(image.imageNumber);
            });
          }
        });
      });

      existingExternalImages.forEach(existingExternalImage => {
        if (
          !sidexisImageNumbers.includes(parseInt(existingExternalImage.ImageId))
        ) {
          deleteImageRecord(success, failure, existingExternalImage);
        }
      });
    };

    ////#region delete an image record

    // handles response for deleteImageRecord
    function deleteImageRecordMessageHandler(success, failure, imageRecord) {
      return message => {
        if (
          !_.isNil(message) &&
          !_.isNil(message.data) &&
          message.data.success === true &&
          message.data.statusCode === 200
        ) {
          // save or update the image
          deleteImage(success, failure, imageRecord);
        } else {
          failure(JSON.parse(message.data.response));
        }
      };
    }

    // this method either deletes a ThirdPartyImagingRecord
    // response handled by deleteImageRecordMessageHandler
    let deleteImageRecord = function (success, failure, imageRecord) {
      let worker = getWorker(deleteRequestWorker);

      // Prepare entity for request
      let request = {};
      request.url =
        `${SoarConfig.domainUrl}/patients/thirdpartyimagingrecord/` +
        imageRecord.ThirdPartyImagingRecordId;
      request.headers = getHeaders();
      let reqData = JSON.parse(JSON.stringify(request));
      worker.onmessage = deleteImageRecordMessageHandler(
        success,
        failure,
        imageRecord
      );
      worker.postMessage(reqData);
      return worker;
    };

    ////#endregion

    ////#region delete image

    // this method calls a worker to delete a single image to storage
    // the response for this call is handled by the deleteImageMessageHandler
    let deleteImage = function (success, failure, imageRecord) {
      let workerStr = _.toString(deleteImageWorker);
      let openingBracket = _.indexOf(workerStr, '{');
      let closingBracket = workerStr.lastIndexOf('}');
      let workerCode = workerStr.substring(openingBracket + 1, closingBracket);

      let workerJs = `(function() {${workerCode}})();`;
      let workerBlob = new Blob([workerJs], { type: 'application/javascript' });
      let objUrl = URL.createObjectURL(workerBlob);

      let worker = new Worker(objUrl);

      // Prepare entity for request
      let request = {};
      request.url =
        `${SoarConfig.fileApiUrl}/api/files/` + imageRecord.FileAllocationId;
      request.headers = getHeaders();
      request.content = {};

      worker.onmessage = deleteImageMessageHandler(
        success,
        failure,
        imageRecord
      );

      worker.postMessage(request);
      return worker;
    };

    // the deleteImageMessageHandler
    // this method handles the response from the image delete
    // on success
    // on failure
    function deleteImageMessageHandler(success, failure, imageRecord) {
      return message => {
        if (
          !_.isNil(message) &&
          !_.isNil(message.data) &&
          message.data.success === true &&
          message.data.statusCode === 200
        ) {
          // deleteFileAllocationId(success, failure, imageRecord);
        } else {
          // TODO delete file allocation id? No because this is a soft delete, the status has changed
          failure(JSON.parse(message.data.response));
        }
      };
    }

    // worker for uploading an image to FileApi
    function deleteImageWorker() {
      // Worker message processor for deleting an image.
      // This is executed when the main thread (UI) calls worker.postMessage
      onmessage = function (e) {
        let request = e.data;
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('load', successFunc);
        xhr.addEventListener('error', errorFunc);
        xhr.open('DELETE', request.url, true);

        request.headers.forEach(function (header) {
          xhr.setRequestHeader(header.headerName, header.headerValue);
        });
        xhr.send();
      };

      function successFunc() {
        let apiResponse = JSON.parse(JSON.stringify(this.response));

        let message = {
          success: true,
          statusCode: this.status,
          response: apiResponse,
        };

        postMessage(message);
        close();
      }

      function errorFunc(e) {
        let response = JSON.parse(JSON.stringify(e));
        let message = {
          success: false,
          response: response,
        };

        postMessage(message);
        close();
      }
    }

    ////#endregion

    //# region uploadImage call, worker, and response

    // this method calls a worker to upload a single image to storage
    // the response for this call is handled by the uploadImageMessageHandler
    let uploadImage = function (success, failure, image, imageRecord) {
      let workerStr = _.toString(uploadImageWorker);
      let openingBracket = _.indexOf(workerStr, '{');
      let closingBracket = workerStr.lastIndexOf('}');
      let workerCode = workerStr.substring(openingBracket + 1, closingBracket);

      let workerJs = `(function() {${workerCode}})();`;
      let workerBlob = new Blob([workerJs], { type: 'application/javascript' });
      let objUrl = URL.createObjectURL(workerBlob);

      let worker = new Worker(objUrl);

      // Prepare entity for request
      let request = {};
      request.url =
        `${SoarConfig.fileApiUrl}/api/files/` + imageRecord.FileAllocationId;
      request.headers = getHeaders();
      request.content = image;

      worker.onmessage = uploadImageMessageHandler(
        success,
        failure,
        imageRecord
      );

      worker.postMessage(request);
      return worker;
    };

    // the uploadImageMessageHandler
    // this method handles the response from the image upload
    // on success it calls the saveImageRecord
    // on failure it deletes the FileAllocation record
    function uploadImageMessageHandler(success, failure, imageRecord) {
      return message => {
        if (
          !_.isNil(message) &&
          !_.isNil(message.data) &&
          message.data.success === true &&
          message.data.statusCode === 200
        ) {
          // save or update the record
          saveImageRecord(success, failure, imageRecord);
        } else {
          // delete the allocation id
          deleteFileAllocationId(success, failure, imageRecord);
          // save or update the record without the allocationId
          imageRecord.FileAllocationId = null;
          if (imageRecord.ThirdPartyImagingRecordId === null) {
            saveImageRecord(success, failure, imageRecord);
          }
        }
      };
    }

    // worker for uploading an image to FileApi
    function uploadImageWorker() {
      // Worker message processor for uploading an image.
      // This is executed when the main thread (UI) calls worker.postMessage
      onmessage = function (e) {
        let request = e.data;
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('load', successFunc);
        xhr.addEventListener('error', errorFunc);
        xhr.open('POST', request.url, true);

        request.headers.forEach(function (header) {
          xhr.setRequestHeader(header.headerName, header.headerValue);
        });

        let formData = new FormData();
        formData.append('file', e.data.content);
        xhr.send(formData);
      };

      function successFunc() {
        let apiResponse = JSON.parse(JSON.stringify(this.response));

        let message = {
          success: true,
          statusCode: this.status,
          response: apiResponse,
        };

        postMessage(message);
        close();
      }

      function errorFunc(e) {
        let response = JSON.parse(JSON.stringify(e));
        let message = {
          success: false,
          response: response,
        };

        postMessage(message);
        close();
      }
    }

    //#endregion

    //#region delete allocation if upload fails

    // handles response for deleteFileAllocationId
    function deleteFileAllocationIdMessageHandler(success, failure) {
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

    // in case an image upload fails this method is called to handle the delete of the FileAllocation record
    // deleteFileAllocationIdMessageHandler handles the success or failure of this call
    let deleteFileAllocationId = function (success, failure, imageRecord) {
      // determine whether worker will add or update a record
      let worker = getWorker(deleteRequestWorker);

      // Prepare entity for request
      let request = {};
      request.url =
        `${SoarConfig.fileApiUrl}/api/files/` + imageRecord.FileAllocationId;
      request.headers = getHeaders();
      let reqData = JSON.parse(JSON.stringify(request));
      worker.onmessage = deleteFileAllocationIdMessageHandler(success, failure);
      worker.postMessage(reqData);
      return worker;
    };

    //#endregion

    //# region getFileAllocationId call, worker, and response

    // this method gets a FileAllocationId for the image upload
    // response handled by getFileAllocationIdMessageHandler
    let getFileAllocationId = function (
      success,
      failure,
      image,
      imageRecord,
      patientDirectoryAllocationId
    ) {
      let worker = getWorker(postRequestWorker);

      // Prepare entity for request
      let request = {};

      let fileModel = {
        FileAllocationId: null,
        DirectoryAllocationId: patientDirectoryAllocationId,
        FileState: 2,
        Version: 1,
        Filename: imageRecord.OriginalImageFilename + '.png',
        MimeType: 'image/jpg',
      };

      request.url = `${SoarConfig.fileApiUrl}/api/files`;
      request.headers = getHeaders();
      request.content = JSON.stringify(fileModel);
      let reqData = JSON.parse(JSON.stringify(request));
      worker.onmessage = getFileAllocationIdMessageHandler(
        success,
        failure,
        image,
        imageRecord
      );

      worker.postMessage(reqData);

      return worker;
    };

    // handles response for getFileAllocationId
    // if successful this sets the imageRecord.FileAllocationId and calls uploadImage
    function getFileAllocationIdMessageHandler(
      success,
      failure,
      image,
      imageRecord
    ) {
      return message => {
        if (
          !_.isNil(message) &&
          !_.isNil(message.data) &&
          message.data.success === true &&
          (message.data.statusCode === 200 || message.data.statusCode === 201)
        ) {
          if (message.data && message.data.response && message.data.response) {
            let response = JSON.parse(message.data.response);
            imageRecord.FileAllocationId = response.Result.FileAllocationId;
            // upload the image
            uploadImage(success, failure, image, imageRecord);
          }
        } else {
          failure(JSON.parse(message.data.response));
        }
      };
    }

    //#endregion

    // getImage call, worker, and response

    // entry method to get an image from external image source
    // response handled by getImageMessageHandler
    let getImage = function (
      getImageUrl,
      imageRecord,
      patientDirectoryAllocationId,
      success,
      failure
    ) {
      let worker = getWorker(getRequestWorker);
      // Prepare entity for request
      let request = {};
      request.url = getImageUrl;
      request.headers = getHeaders();
      let reqData = JSON.parse(JSON.stringify(request));

      worker.onmessage = getImageMessageHandler(
        success,
        failure,
        imageRecord,
        patientDirectoryAllocationId
      );

      worker.postMessage(reqData);

      return worker;
    };

    // handles the response from getImage
    // if success calls getFileAllocationId
    function getImageMessageHandler(
      success,
      failure,
      imageRecord,
      patientDirectoryAllocationId
    ) {
      return message => {
        if (
          !_.isNil(message) &&
          !_.isNil(message.data) &&
          message.data.success === true &&
          message.data.statusCode === 200
        ) {
          let image = message.data.response;
          getFileAllocationId(
            success,
            failure,
            image,
            imageRecord,
            patientDirectoryAllocationId
          );
        } else {
          failure(JSON.parse(message.data.response));
        }
      };
    }

    //#endregion

    //#region save image record

    function saveImageRecordMessageHandler(success, failure) {
      return message => {
        if (
          !_.isNil(message) &&
          !_.isNil(message.data) &&
          message.data.success === true &&
          message.data.statusCode === 200
        ) {
        } else {
          failure(JSON.parse(message.data.response));
        }
      };
    }

    // this method either adds or updates a ThirdPartyImagingRecord
    // response handled by saveImageRecordMessageHandler
    let saveImageRecord = function (success, failure, imageRecord) {
      // post accepts list
      let imageData = JSON.stringify([imageRecord]);
      // determine whether worker will add or update a record
      let worker = getWorker(postRequestWorker);
      if (imageRecord.ThirdPartyImagingRecordId !== null) {
        // put requires single dto
        imageData = JSON.stringify(imageRecord);
        worker = getWorker(putRequestWorker);
      }
      // Prepare entity for request
      let request = {};
      request.url = `${SoarConfig.clinicalApiUrl}/patients/thirdpartyimagingrecords`;
      if (imageRecord.ThirdPartyImagingRecordId !== null) {
        request.url = `${SoarConfig.clinicalApiUrl}/patients/thirdpartyimagingrecord`;
      }
      request.headers = getHeaders();
      request.content = imageData;
      let reqData = JSON.parse(JSON.stringify(request));

      worker.onmessage = saveImageRecordMessageHandler(success, failure);

      worker.postMessage(reqData);

      return worker;
    };

    // worker for get request
    function getRequestWorker() {
      // Worker message processor.
      // This is executed when the main thread (UI) calls worker.postMessage
      onmessage = function (e) {
        let request = e.data;
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('load', successFunc);
        xhr.addEventListener('error', errorFunc);
        xhr.open('GET', request.url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.responseType = 'blob';
        request.headers.forEach(function (header) {
          xhr.setRequestHeader(header.headerName, header.headerValue);
        });
        xhr.send();
      };

      function successFunc() {
        let apiResponse = this.response; //JSON.parse(JSON.stringify(this.response));
        let message = {
          success: true,
          statusCode: this.status,
          response: apiResponse,
        };
        postMessage(message);
        close();
      }

      function errorFunc(e) {
        let response = JSON.parse(JSON.stringify(e));
        let message = {
          success: false,
          response: response,
        };
        postMessage(message);
        close();
      }
    }

    // worker for delete request
    function deleteRequestWorker() {
      // Worker message processor.
      // This is executed when the main thread (UI) calls worker.postMessage
      onmessage = function (e) {
        let request = e.data;
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('load', successFunc);
        xhr.addEventListener('error', errorFunc);
        xhr.open('Delete', request.url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        request.headers.forEach(function (header) {
          xhr.setRequestHeader(header.headerName, header.headerValue);
        });
        xhr.send();
      };

      function successFunc() {
        let apiResponse = JSON.parse(JSON.stringify(this.response));
        let message = {
          success: true,
          statusCode: this.status,
          response: apiResponse,
        };
        postMessage(message);
        close();
      }

      function errorFunc(e) {
        let response = JSON.parse(JSON.stringify(e));
        let message = {
          success: false,
          response: response,
        };
        postMessage(message);
        close();
      }
    }

    // worker for post request
    function postRequestWorker() {
      // Worker message processor for making a Post request.
      // This is executed when the main thread (UI) calls worker.postMessage
      onmessage = function (e) {
        let request = e.data;
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('load', successFunc);
        xhr.addEventListener('error', errorFunc);
        xhr.open('POST', request.url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        request.headers.forEach(function (header) {
          xhr.setRequestHeader(header.headerName, header.headerValue);
        });
        xhr.send(e.data.content);
      };

      function successFunc() {
        let apiResponse = JSON.parse(JSON.stringify(this.response));

        let message = {
          success: true,
          statusCode: this.status,
          response: apiResponse,
        };

        postMessage(message);
        close();
      }

      function errorFunc(e) {
        let response = JSON.parse(JSON.stringify(e));
        let message = {
          success: false,
          response: response,
        };

        postMessage(message);
        close();
      }
    }

    // worker for put request
    function putRequestWorker() {
      // Worker message processor for making a put request.
      // This is executed when the main thread (UI) calls worker.postMessage
      onmessage = function (e) {
        let request = e.data;
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('load', successFunc);
        xhr.addEventListener('error', errorFunc);
        xhr.open('PUT', request.url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        request.headers.forEach(function (header) {
          xhr.setRequestHeader(header.headerName, header.headerValue);
        });
        xhr.send(e.data.content);
      };

      function successFunc() {
        let apiResponse = JSON.parse(JSON.stringify(this.response));

        let message = {
          success: true,
          statusCode: this.status,
          response: apiResponse,
        };

        postMessage(message);
        close();
      }

      function errorFunc(e) {
        let response = JSON.parse(JSON.stringify(e));
        let message = {
          success: false,
          response: response,
        };

        postMessage(message);
        close();
      }
    }

    // loads the worker
    function getWorker(workerMethod) {
      let workerStr = _.toString(workerMethod);
      let openingBracket = _.indexOf(workerStr, '{');
      let closingBracket = workerStr.lastIndexOf('}');
      let workerCode = workerStr.substring(openingBracket + 1, closingBracket);

      let workerJs = `(function() {${workerCode}})();`;
      let workerBlob = new Blob([workerJs], { type: 'application/javascript' });
      let objUrl = URL.createObjectURL(workerBlob);

      return new Worker(objUrl);
    }

    // creates headers for the worker request
    function getHeaders() {
      let token = patAuthenticationService.getCachedToken();
      let instanceId = instanceIdentifier.getIdentifier();
      let appId = applicationService.getApplicationId();
      let requestId = uniqueIdentifier.getId();
      let practiceId = practiceService.getCurrentPractice().id;
      let locationId = locationService.getCurrentLocation().id;
      let locationTimezone = locationService.getCurrentLocation().timezone;
      let utcOffset = moment().utcOffset() / 60; // e.g. -5
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

    //#region

    return {
      saveImages: saveImages,
      syncImages: syncImages,
      // test methods
      testGetImageWorker: function () {
        return getRequestWorker;
      },
    };
  },
]);
