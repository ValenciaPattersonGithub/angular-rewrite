import { TestBed } from '@angular/core/testing';

import { DocScanControlService } from './doc-scan-control.service';
declare var Dynamsoft: any;
declare var window: any;
declare var EnumDWT_ImageType: any;

describe('DocScanControlService ->', () => {

    let service: DocScanControlService;
    let registerEventCallback: Function;

    beforeEach(() => {        
        window.Dynamsoft = {
            DWT: {
                RegisterEvent: jasmine.createSpy().and.callFake((_event, cb) => registerEventCallback = cb),
                EnumDWT_ImageType: {
                    IT_PDF: 'IT_PDF'
                }
            }
        };

        window.EnumDWT_ImageType = {
            IT_PDF: 'IT_PDF'
        };

        TestBed.configureTestingModule({
            providers: [DocScanControlService]
        });
        service = TestBed.get(DocScanControlService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('contructor ->', () => {

        it('should call Dynamsoft.DWT.RegisterEvent', () => {
            expect(Dynamsoft.DWT.RegisterEvent).toHaveBeenCalledWith('OnWebTwainReady', jasmine.any(Function));
        });

        it('should register a callback', () => {
            expect(registerEventCallback).toBeTruthy();
        })

        describe('RegisterEvent callback ->', () => {

            it('should call scanOnReady', () => {
                service['scanOnReady'] = jasmine.createSpy();

                registerEventCallback();

                expect(service['scanOnReady']).toHaveBeenCalled();
            });
        });

    });

    describe('startScan function ->', () => {

        beforeEach(() => {
            service.reset = jasmine.createSpy();
            Dynamsoft.DWT.Load = jasmine.createSpy();
            service['scanOnReady'] = jasmine.createSpy();
        });

        it('should call reset', () => {
            service.startScan();

            expect(service.reset).toHaveBeenCalled();
        });
        
        it('should call Dynamsoft.DWT.Load when dwtLoaded is false', () => {
            service['dwtLoaded'] = false;
            jasmine.clock().install();
            service.startScan();
            jasmine.clock().tick(1);
            expect(Dynamsoft.DWT.Load).toHaveBeenCalled();
            expect(service['scanOnReady']).not.toHaveBeenCalled();
            jasmine.clock().uninstall();
        });
        
        it('should call scanOnReady when dwtLoaded is true', () => {
            service['dwtLoaded'] = true;

            service.startScan();

            expect(Dynamsoft.DWT.Load).not.toHaveBeenCalled();
            expect(service['scanOnReady']).toHaveBeenCalled();
        });

    });

    describe('reset function ->', () => {

        beforeEach(() => {
            Dynamsoft.DWT.Unload = jasmine.createSpy();
            service['dwtLoaded'] = true;
        });

        it('should call Dynamsoft.DWT.Unload and set dwtLoaded to false', () => {
            service.reset();
            
            expect(Dynamsoft.DWT.Unload).toHaveBeenCalled();
            expect(service['dwtLoaded']).toBe(false);
        });

    });

    describe('retrieveFile function ->', () => {

        let imagesInBuffer = 3;
        let returnedPromise = 'promise';
        beforeEach(() => {
            service['dWObject'] = {
                HowManyImagesInBuffer: imagesInBuffer,
                ConvertToBlob: jasmine.createSpy()
            };
        });

        it('should call ctrl.dWObject.ConvertToBlob with correct parameters', () => {
            var expectedIndices = [];
            for (var i = 0; i < imagesInBuffer; i++) {
                expectedIndices.push(i);
            }

            service.retrieveFile();

            // eslint-disable-next-line no-undef 
            expect(service['dWObject'].ConvertToBlob).toHaveBeenCalledWith(expectedIndices, EnumDWT_ImageType.IT_PDF, jasmine.any(Function), jasmine.any(Function));
        });

        it('should return promise', () => {
            let promise = service.retrieveFile();

            expect(promise).toBeTruthy();
        });

        describe('ConvertToBlob success function ->', () => {

            let result = 'result';
            beforeEach(() => {
                service['dWObject'].ConvertToBlob = (_a, _b, success) => {                    
                    success(result);
                };

            });

            it('should call deferred.resolve with result', (done) => {
                let promise = service.retrieveFile();
                promise.then((res) => {
                    expect(res).toBe(result);
                    done();
                }, () => { expect(true).toBe(false); done(); });
            });

        });
        
        describe('ConvertToBlob failure function ->', () => {

            beforeEach(() => {
                service['dWObject'].ConvertToBlob = (_a, _b, _success, failure) => {
                    failure();
                };
            });

            it('should call deferred.reject', (done) => {
                let promise = service.retrieveFile();
                promise.then(() => { expect(true).toBe(false); done(); },
                    () => {
                        done();
                    }
                );
            });

        });

    });

    describe('addPage function ->', () => {

        let successFn: Function;
        let failureFn: Function;
        beforeEach(() => {
            service['dWObject'] = {
                SelectSource: jasmine.createSpy().and.callFake((s, f) => {
                    successFn = s;
                    failureFn = f;
                })
            };
        });

        it('should call ctrl.dWObject.SelectSource', () => {
            service.addPage();

            expect(service['dWObject'].SelectSource).toHaveBeenCalledWith(successFn, failureFn);
        });

        describe('SelectSource success function ->', () => {

            beforeEach(() => {
                service['scanSelectSourceSuccess'] = jasmine.createSpy();
                service.addPage();
            });

            it('should call scanSelectSourceSuccess', () => {
                successFn();

                expect(service['scanSelectSourceSuccess']).toHaveBeenCalled();
            })
        });

        describe('SelectSource failure function ->', () => {

            beforeEach(() => {
                service['onScanFailure'] = jasmine.createSpy();
                service.addPage();
            });

            it('should call onScanFailure', () => {
                failureFn();

                expect(service['onScanFailure']).toHaveBeenCalled();
            })
        });

    });

    describe('scanOnReady function ->', () => {

        let dWObject = 'dWObject';
        beforeEach(() => {
            service['dwtLoaded'] = false;
            service['dWObject'] = null;
            Dynamsoft.DWT.GetWebTwain = jasmine.createSpy().and.returnValue(dWObject);
            service.addPage = jasmine.createSpy();
            service.scrollFix = jasmine.createSpy();
        });

        it('should set values and call correct functions', () => {
            service['scanOnReady']();

            expect(service['dwtLoaded']).toBe(true);
            expect(Dynamsoft.DWT.GetWebTwain).toHaveBeenCalledWith('dwtcontrolContainer');
            expect(service['dWObject']).toBe(dWObject);
            expect(service.addPage).toHaveBeenCalled();
            expect(service.scrollFix).toHaveBeenCalled();
        });

    });

    describe('scanSelectSourceSuccess function ->', () => {

        let successFn: Function;
        let failureFn: Function;
        beforeEach(() => {
            service['dWObject'] = {
                CloseSource: jasmine.createSpy(),
                OpenSource: jasmine.createSpy(),
                IfDisableSourceAfterAcquire: false,
                AcquireImage: jasmine.createSpy().and.callFake((s, f) => {
                    successFn = s;
                    failureFn = f;
                })
            };
        });

        it('should call functions and set values', () => {
            service['scanSelectSourceSuccess']();

            expect(service['dWObject'].CloseSource).toHaveBeenCalled();
            expect(service['dWObject'].OpenSource).toHaveBeenCalled();
            expect(service['dWObject'].IfDisableSourceAfterAcquire).toBe(true);
            expect(service['dWObject'].AcquireImage).toHaveBeenCalledWith(successFn, failureFn);
        });

        describe('AcquireImage success function ->', () => {

            beforeEach(() => {
                service['scanAcquireImageSuccess'] = jasmine.createSpy();
                service['scanSelectSourceSuccess']();
            });

            it('should call scanAcquireImageSuccess', () => {
                successFn();

                expect(service['scanAcquireImageSuccess']).toHaveBeenCalled();
            })
        });

        describe('AcquireImage failure function ->', () => {

            beforeEach(() => {
                service['onScanFailure'] = jasmine.createSpy();
                service['scanSelectSourceSuccess']();
            });

            it('should call onScanFailure', () => {
                failureFn();

                expect(service['onScanFailure']).toHaveBeenCalled();
            })
        });

    });

    describe('scanAcquireImageSuccess function ->', () => {

        beforeEach(() => {
            service['dWObject'] = {
                ShowImageEditor: jasmine.createSpy()
            };
            service['onScanSuccess'] = jasmine.createSpy();
        });

        it('should call functions', () => {
            service['scanAcquireImageSuccess']();

            expect(service['dWObject'].ShowImageEditor).toHaveBeenCalledWith('dwtEditorContainer');
            expect(service['onScanSuccess']).toHaveBeenCalled();
        });

    });

    describe('onScanSuccess function ->', () => {

        beforeEach(() => {
            service['scanSuccessSource'].next = jasmine.createSpy();
        });

        it('should call scanSuccessSource.next', () => {
            service['onScanSuccess']();

            expect(service['scanSuccessSource'].next).toHaveBeenCalled();
        });

    });

    describe('onScanFailure function ->', () => {

        beforeEach(() => {
            service['scanFailureSource'].next = jasmine.createSpy();
        });

        it('should call scanFailureSource.next', () => {
            service['onScanFailure']();

            expect(service['scanFailureSource'].next).toHaveBeenCalled();
        });

    });

});