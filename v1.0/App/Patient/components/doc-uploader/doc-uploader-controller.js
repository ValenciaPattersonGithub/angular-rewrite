// angular.module('Soar.Patient').controller('docUploadController', ['$scope', '$routeParams', '$filter', '$q', '$timeout', 'DocumentGroupsService', 'PatientServices', 'RecentDocumentsService', 'toastrFactory', 'localize', 'PatientDocumentsFactory', 'ListHelper', 'StaticData', 'FileRestrictionsFactory', 'FileUploadFactory', 'PatientValidationFactory', 'DocScanControlService',
//     DocUploadController
// ]);

// function DocUploadController ($scope, $routeParams, $filter, $q, $timeout, documentGroupsService, patientServices, recentDocumentsService, toastrFactory, localize, patientDocumentsFactory, listHelper, staticData, fileRestrictionsFactory, fileUploadFactory, patientValidationFactory, scanControlService) {
//     var vm = this;

//     DocUploadController.prototype.$scope = $scope;

//     $scope.activeTeeth = [];
//     $scope.patTeeth = null;
//     vm.fileAuthAbbrev = 'plapi-files-fsys-write';

//     // k-change on kendo-multi-select uses this to keep activeTeeth updated
//     $scope.activeTeethUpdated = function (e) {
//         $scope.activeTeeth = this.value();
//         console.log($scope.activeTeeth);
//         $scope.$apply();
//     };

//     // set select options for kendo-multi-select
//     $scope.teethSelectOptions = {
//         placeholder: "Select teeth...",
//         dataSource: $scope.patTeeth,
//         dataTextField: "USNumber",
//         dataValueField: "USNumber",
//         valuePrimitive: true,
//         autoBind: false
//     };

//     // get teeth definitions from local storage
//     vm.getTeethDefinitions = function () {
//         staticData.TeethDefinitions().then(function (res) {
//             if (res && res.Value && res.Value.Teeth) {
//                 $scope.patTeeth = new kendo.data.DataSource({ data: res.Value.Teeth });
//             }
//         });
//     };
//     vm.getTeethDefinitions();

//     function setup() {
//         vm.showLoading = true;

//         var promises = {};
//         promises.groups = documentGroupsService.get().$promise;

//         vm.patientData = {};
//         var patientData = patientValidationFactory.GetPatientData();
//         var isCorrectPatient = patientData && patientData.PatientId == $routeParams.patientId;

//         if (isCorrectPatient) {
//             vm.patientData = patientData;
//         }

//         if (isCorrectPatient && patientData.PatientLocations && patientData.PatientLocations.length > 0) {
//             vm.patientLocations = patientData.PatientLocations;
//         } else {
//             promises.patientLocations = patientServices.PatientLocations.get({ Id: $routeParams.patientId }).$promise;
//         }

//         $q.all(promises).then(function (results) {
//               //  filtering the document groups in alpahbetical order
//             var res = $filter('orderBy')(results.groups.Value, ['Description'], false);
//              // hiding 'Treatment Plans' and 'Medical History' because those cannot be created directly
//             $scope.documentgroups = $filter('filter')(res, function (item) { return item.Description !== 'Treatment Plans' && item.Description !== 'Medical History' });
//             $scope.selectedFavorite = vm.setDocGroup();

//             if (results.patientLocations) {
//                 vm.patientLocations = results.patientLocations.Value;
//             }

//             endLoading();
//         });

//         // Load the other kendo elements first on pages with multiple Kendo objects
//         $timeout(function () {
//             $scope.loadKendoWidgets = true;
//         });

//         resetValidity();
//         vm.clearImage();
//     }

//     vm.setDocGroup = function () {
//         var selectedFilter = listHelper.findItemByFieldValue($scope.documentgroups, 'Description', patientDocumentsFactory.selectedFilter);
//         if (selectedFilter) {
//             return selectedFilter.DocumentGroupId;
//         }
//         else {
//             return '';
//         }
//     }

//     function resetValidity() {
//         vm.isValid = true;
//         vm.message = '';
//     }

//     vm.clearImage = function () {
//         vm.message = '';
//         vm.showImage = false;
//     };

//     vm.validateUpload = function () {
//         if (!$scope.selectedFavorite) {
//             $scope.selectedFavorite = vm.setDocGroup();
//         };
//         $scope.enableSave =
//             ($scope.selectedFavorite && $scope.selectedFile &&
//             (vm.scanMode !== true || $scope.selectedFile.scanComplete === true) &&
//             (vm.pasteMode !== true || vm.pasteComplete === true)) ? true : false;
//     }

//     $scope.$watch('selectedFavorite', function (nv, ov) {
//         vm.validateUpload();
//     })

//     $scope.$watch('selectedFile', function (nv, ov) {
//         vm.validateUpload();
//     })

//     vm.uploadDocument = function () {
//         if (!$scope.currentDirectory && $scope.selectedFile && vm.patientLocations && vm.patientLocations.length > 0) {
//             var patientLocationIds = vm.patientLocations.map(function (pl) { return pl.LocationId; })

//             fileUploadFactory.CreatePatientDirectory({ PatientId: $routeParams.patientId, DirectoryAllocationId: vm.patientData.DirectoryAllocationId }, patientLocationIds, vm.fileAuthAbbrev)
//                 .then(function (res) {
//                     if (res) {
//                         var directoryId = res;
//                         vm.uploadImage(directoryId);
//                     } else {
//                         setMessage(2);
//                     }
//                 }, function () { setMessage(2); });
//         }
//         else {
//             setMessage(0);
//         }
//     }

//     vm.uploadImage = function (directoryId) {
//         resetValidity();

//         // start load
//         startLoading();
//         fileUploadFactory.AllocateFile(directoryId, $scope.selectedFile.name, $scope.selectedFile.type, vm.fileAuthAbbrev, false)
//             .then(function (res) {
//                 if (res && res.data && res.data.Result) {
//                     var fileAllocationId = res.data.Result.FileAllocationId;
//                     var deferred = $q.defer();
//                     if (vm.scanMode === true && $scope.selectedFile.scanComplete === true) {
//                         if (_.isEmpty($scope.selectedFile.name)) {
//                             $scope.selectedFile.name = "scan.pdf";
//                         }
//                         scanControlService.retrieveFile().then(function (result) {
//                             deferred.resolve(new File([result], $scope.selectedFile.name));
//                         }, function () {
//                             deferred.reject();
//                         });
//                     } else if ($scope.selectedFile.pasteFile) {
//                         deferred.resolve($scope.selectedFile.pasteFile);
//                     } else {
//                         deferred.resolve($scope.selectedFile);
//                     }

//                     deferred.promise.then(function (result) {
//                         var file = result;

//                         var reader = new FileReader();

//                         reader.onloadend = function () {
//                             var formData = new FormData();
//                             formData.append('file', file);

//                             fileUploadFactory.UploadFile(fileAllocationId, formData, vm.fileAuthAbbrev, false, null, null, null, true)
//                                 .then(function (res) {
//                                     if (res && res.data && res.data.Result) {
//                                         vm.clearImage();
//                                         //setMessage(3);
//                                         var documentUploaded = createDocumentObject(res.data.Result, file)
//                                         if (documentUploaded) {
//                                             patientServices.Documents.Add(documentUploaded).$promise.then(function (res) {
//                                                 $scope.documentRecords = res.Value;

//                                                 toastrFactory.success(localize.getLocalizedString('File uploaded successfully.'), localize.getLocalizedString('Success'));
//                                                 recentDocumentsService.update({ returnList: false }, [res.Value.DocumentId], function () { });
//                                                 $scope.$emit('soar:patient-documents-changed');
//                                                 $scope.$emit('close-doc-uploader');
//                                                 endLoading();
//                                             });
//                                         }
//                                     } else {
//                                         setMessage(4);
//                                         endLoading();
//                                     }
//                                 });
//                         };
//                         reader.readAsArrayBuffer(file);
//                     }, function () {
//                         setMessage(2);
//                     });
//                 } else {
//                     setMessage(2);
//                 }
//             }, function (data, status) {
//                 if (status === 409) {
//                     setMessage(1);
//                 }
//                 else {
//                     setMessage(2);
//                 }
//                 endLoading();

//             });
//     };

//     function startLoading() {
//         vm.showLoading = true;
//     }

//     function endLoading() {
//         vm.showLoading = false;
//     }

//     function setMessage(code) {
//         vm.isValid = false;
//         var message = '';
//         switch (code) {
//             case 0:
//                 message = localize.getLocalizedString("Please select a file to upload.");
//                 break;
//             case 1:
//                 message = localize.getLocalizedString("A conflict occurred while allocating the file, please contact your system administrator or rename the file and attempt to upload it again.");
//                 break;
//             case 2:
//                 message = localize.getLocalizedString("An error occurred while trying to upload your file please try again.");
//                 break;
//             case 3:
//                 message = localize.getLocalizedString("File uploaded successfully.");
//                 vm.isValid = true;
//                 break;
//             case 4:
//                 message = localize.getLocalizedString("An issue occurred while uploading the file after allocation, please rename your file and try again.");
//                 break;
//             case 5:
//                 message = localize.getLocalizedString("Please select a document group.");
//                 break;
//             case 6:
//                 message = localize.getLocalizedString("File size exceeded. Limit 100 MB.");
//                 break;
//             case 7:
//                 message = localize.getLocalizedString("File name length exceeded. Limited to 128 characters.");
//                 break;
//             case 8:
//                 message = localize.getLocalizedString("File name contains invalid non-alphanumeric characters.");
//                 break;
//             case 9:
//                 message = localize.getLocalizedString("File is empty.");
//                 break;
//             case 10:
//                 message = localize.getLocalizedString("File type is restricted. Please choose a different file.");
//                 break;
//             default:
//                 message = localize.getLocalizedString("An error occurred while trying to upload your file please try again."); // duplicate fall back value
//         }

//         vm.message = message;
//     }

//     function createDocumentObject(fileAllocated, fileSelected) {
//         if ($scope.selectedFavorite == "" && patientDocumentsFactory.selectedFilter != "") {
//             $scope.selectedFavorite = vm.setDocGroup();
//         }

//         if ($scope.selectedFavorite != "") {
//             var document = {
//                 FileAllocationId: fileAllocated.FileAllocationId,
//                 DocumentGroupId: $scope.selectedFavorite,
//                 MimeType: fileAllocated.MimeType,
//                 Name: fileAllocated.Filename,
//                 NumberOfBytes: fileSelected.size,
//                 ParentId: $routeParams.patientId,
//                 ParentType: "Patient",
//                 ToothNumbers: $scope.activeTeeth
//             }

//             return document;
//         }
//         else {
//             setMessage(5);
//             endLoading();
//         }
//     }

//     $scope.remove = function () {
//         $scope.selectedFile = null;
//         vm.message = '';
//         vm.scanMode = false;
//         scanControlService.reset();
//         vm.pasteMode = false;
//     };

//     $scope.close = function () {
//         $scope.$parent.$parent.docCtrls.close();
//     };

//     $scope.onSelect = function (files) {
//         $scope.selectedFile = files[0];
//         var fileExt = "";
//         var nameWithNoExt = "";

//         if ($scope.selectedFile.name) {
//             nameWithNoExt = $scope.selectedFile.name.substr(0, $scope.selectedFile.name.lastIndexOf('.'));
//             if ($scope.selectedFile.name.indexOf(".") == -1) {
//                 fileExt = "";
//             }
//             else if ($scope.selectedFile.name.split('.').length == 2) {
//                 fileExt = $scope.selectedFile.name.split('.')[$scope.selectedFile.name.split('.').length - 1];
//             }
//             else {
//                 fileExt = $scope.selectedFile.type;
//             }
//         }

//         // Calls the file restrictions factory and checks to see if the file type is allowed, returns bool
//         if (fileRestrictionsFactory.CheckRestrictions(fileExt) || fileExt == "") {
//             setMessage(10);
//             $scope.selectedFile = null;
//             vm.isError = true;
//         }
//         // Allows files greater than 0 bytes
//         else if (!$scope.selectedFile.size || $scope.selectedFile.size <= 0) {
//             setMessage(9);
//             vm.isError = true;
//         }
//         // Allows files less than 100MB
//         else if ($scope.selectedFile.size > 104857600) {
//             setMessage(6);
//             vm.isError = true;
//         }
//         // Allows file with names 128 characters or less
//         else if (nameWithNoExt.length > 128) {
//             setMessage(7);
//             vm.isError = true;
//         }
//         // Allows file with name that only contains best practice standard restrictions
//         // Using &#39; because the app converts the single quote into unicode
//         else if (!/^[a-zA-Z0-9- '.`~!#@$%^&()_-{}']|&#39;*$/.test($scope.selectedFile.name)) {
//             setMessage(8);
//             vm.isError = true;
//         }
//         else {
//             vm.message = '';
//             vm.isError = false;
//         }
//         $scope.$apply();
//     }

//     setup();

//     vm.toggleScanMode = function () {
//         vm.scanMode = true;
//         scanControlService.startScan();
//         vm.pasteMode = false;
//     };

//     vm.scanSuccess = function() {
//         $scope.selectedFile = { name: "scan.pdf", scanComplete: true };
//         $scope.$digest();
//         scanControlService.scrollFix();
//     };

//     vm.scanFailure = function () {
//         if (_.isNil($scope.selectedFile) || $scope.selectedFile.scanComplete !== true) {
//             vm.scanMode = false;
//             $scope.$digest();
//         }
//     };

//     vm.togglePasteMode = function () {
//         vm.pasteMode = true;
//         vm.pasteComplete = false;
//         vm.scanMode = false;
//         $scope.selectedFile = null;
//     };

//     vm.onPasteSuccess = function (file) {
//         vm.pasteComplete = true;
//         $scope.selectedFile = { name: file.name, pasteFile: file };
//         if (!$scope.selectedFile.name || $scope.selectedFile.name === '')
//             $scope.selectedFile.name = 'image.png';
//         $scope.$digest();
//     };
// };

// DocUploadController.prototype.onSelect = function (files) {
//     this.$scope.onSelect(files);
// };
