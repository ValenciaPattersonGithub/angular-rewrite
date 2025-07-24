// describe('docUploadController ->', function () {

//     var ctrl, scope;
//     var fileUploadFactory, docScanControlService;

//     beforeEach(module('Soar.Patient'));
//     beforeEach(inject(function ($rootScope, $controller) {

//         scope = $rootScope.$new();

//         fileUploadFactory = {};
//         docScanControlService = {};

//         ctrl = $controller('docUploadController', {
//             $scope: scope,
//             FileUploadFactory: fileUploadFactory,
//             DocScanControlService: docScanControlService
//         });

//     }));

//     //controller
//     it('should exist', function () {
//         expect(ctrl).not.toBeNull();
//     });

//     describe('vm.toggleScanMode function ->', function () {

//         beforeEach(function () {
//             ctrl.scanMode = false;
//             docScanControlService.startScan = jasmine.createSpy();
//             ctrl.pasteMode = true;
//         });

//         it('should set values and call functions', function () {
//             ctrl.toggleScanMode();

//             expect(ctrl.scanMode).toBe(true);
//             expect(ctrl.pasteMode).toBe(false);
//             expect(docScanControlService.startScan).toHaveBeenCalled();
//         });

//     });

//     describe('vm.scanSuccess function ->', function () {

//         beforeEach(function () {
//             scope.selectedFile = null;
//             docScanControlService.scrollFix = jasmine.createSpy();
//         });

//         it('should set values and call functions', function () {
//             ctrl.scanSuccess();

//             expect(scope.selectedFile).toEqual({ name: 'scan.pdf', scanComplete: true });
//             expect(docScanControlService.scrollFix).toHaveBeenCalled();
//         });

//     });

//     describe('vm.scanFailure function ->', function () {

//         beforeEach(function () {
//             ctrl.scanMode = true;
//         });

//         it('should take action if scope.selectedFile is null', function () {
//             scope.selectedFile = null;

//             ctrl.scanFailure();

//             expect(ctrl.scanMode).toBe(false);
//         });

//         it('should take action if scope.selectedFile.scanComplete is not true', function () {
//             scope.selectedFile = { scanComplete: false };

//             ctrl.scanFailure();

//             expect(ctrl.scanMode).toBe(false);
//         });

//         it('should not take action if scope.selectedFile.scanComplete is not true', function () {
//             scope.selectedFile = { scanComplete: true };

//             ctrl.scanFailure();

//             expect(ctrl.scanMode).toBe(true);
//         });

//     });

//     describe('vm.togglePasteMode function ->', function () {

//         beforeEach(function () {
//             ctrl.pasteMode = false;
//             ctrl.pasteComplete = true;
//             ctrl.scanMode = true;
//             scope.selectedFile = 'selectedFile';
//         });

//         it('should set values', function () {
//             ctrl.togglePasteMode();

//             expect(ctrl.pasteMode).toBe(true);
//             expect(ctrl.pasteComplete).toBe(false);
//             expect(ctrl.scanMode).toBe(false);
//             expect(scope.selectedFile).toBeNull();
//         });

//     });

//     describe('vm.onPasteSuccess function ->', function () {

//         beforeEach(function () {
//             ctrl.pasteComplete = false;
//             scope.selectedFile = null;
//         });

//         it('should set pasteComplete to true', function () {
//             var file = {};

//             ctrl.onPasteSuccess(file);

//             expect(ctrl.pasteComplete).toBe(true);
//         });

//         it('should set selected file to image.png if not supplied', function () {
//             var file = {};

//             ctrl.onPasteSuccess(file);

//             expect(scope.selectedFile).toEqual({ name: 'image.png', pasteFile: file });
//         });

//         it('should not set selected file to image.png if supplied', function () {
//             var file = { name: 'filename' };

//             ctrl.onPasteSuccess(file);

//             expect(scope.selectedFile).toEqual({ name: 'filename', pasteFile: file });
//         });

//     });

// });
