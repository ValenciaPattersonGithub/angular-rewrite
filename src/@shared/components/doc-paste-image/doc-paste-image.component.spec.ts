import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';
import { DocPasteImageComponent } from './doc-paste-image.component';
declare var window: any;

describe('DocPasteImageComponent ->', () => {
    let component: DocPasteImageComponent;
    let fixture: ComponentFixture<DocPasteImageComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [DocPasteImageComponent]
        });
    });

    beforeEach(() => {
        window.PattersonWindow = {};
        fixture = TestBed.createComponent(DocPasteImageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('pasteActive set function ->', () => {

        beforeEach(() => {
            component.reset = jasmine.createSpy();
        });

        it('should call reset if value is false', () => {
            component.pasteActive = false;

            expect(component.reset).toHaveBeenCalled();
        });

        it('should not call reset if value is true', () => {
            component.pasteActive = true;

            expect(component.reset).not.toHaveBeenCalled();
        });

    });

    describe('ngOnInit function ->', () => {

        it('should set isIE to window.PattersonWindow.isIE', () => {
            window.PattersonWindow.isIE = 'isIE';

            component.ngOnInit();

            expect(component.isIE).toBe(window.PattersonWindow.isIE);
        })

    })

    describe('onPaste function ->', () => {

        let event, readerMock;
        beforeEach(() => {
            event = { preventDefault: jasmine.createSpy() };

            readerMock = { readAsDataURL: jasmine.createSpy() };
            spyOn(window, 'FileReader').and.returnValue(readerMock);
        });

        it('should call event.preventDefault', () => {
            component.onPaste(event);

            expect(event.preventDefault).toHaveBeenCalled();
        });

        describe('when files property exists ->', () => {

            beforeEach(() => {
                event.clipboardData = {};
            });

            it('should use file if type starts with image', () => {
                let file = { type: 'image/png' };
                event.clipboardData.files = [file];

                component.onPaste(event);

                expect(readerMock.readAsDataURL).toHaveBeenCalledWith(file);
            });

            it('should not use file if type does not start with image', () => {
                let file = { type: 'text/html' };
                event.clipboardData.files = [file];

                component.onPaste(event);

                expect(readerMock.readAsDataURL).not.toHaveBeenCalled();
            });

            it('should not use file if files property contains no items', () => {
                event.clipboardData.files = [];

                component.onPaste(event);

                expect(readerMock.readAsDataURL).not.toHaveBeenCalled();
            });

        });

        describe('when files property does not exists and items property exists', () => {

            beforeEach(() => {
                event.clipboardData = {};
            });

            it('should use item if type starts with image', () => {
                let file = 'file';
                let item = { type: 'image/png', getAsFile: () => file };
                event.clipboardData.items = [item];

                component.onPaste(event);

                expect(readerMock.readAsDataURL).toHaveBeenCalledWith(file);
            });

            it('should not use item if type does not start with image', () => {
                let file = 'file';
                let item = { type: 'text/html', getAsFile: () => file };
                event.clipboardData.items = [item];

                component.onPaste(event);

                expect(readerMock.readAsDataURL).not.toHaveBeenCalled();
            });

            it('should not use item if items property contains no items', () => {
                event.clipboardData.items = [];

                component.onPaste(event);

                expect(readerMock.readAsDataURL).not.toHaveBeenCalled();
            });

        });

        it('should call pasteSuccess.emit if file is loaded', () => {
            component.pasteSuccess.emit = jasmine.createSpy();
            let file = { type: 'image/png' };
            event.clipboardData = { files: [file] };

            component.onPaste(event);

            expect(component.pasteSuccess.emit).toHaveBeenCalledWith(file);
        });

        it('should set dataUrl when image is loaded', () => {
            let e = { target: { result: 'e.target.result' } };
            readerMock.readAsDataURL = () => readerMock.onload(e);
            let file = { type: 'image/png' };
            event.clipboardData = { files: [file] };

            component.onPaste(event);

            expect(component.dataUrl).toBe(e.target.result);
        });

    });

    describe('onLoad function ->', () => {

        it('should set processingImage to false', () => {
            component.processingImage = true;

            component.onLoad();

            expect(component.processingImage).toBe(false);
        });

    });

    describe('onKeyDown function ->', () => {

        let event;
        beforeEach(() => {
            event = { preventDefault: jasmine.createSpy() };
        });

        it('should call event.preventDefault if isIE and not ctrl', () => {
            component.isIE = true;
            event.ctrlKey = false;
            event.keyCode = 86;

            component.onKeyDown(event);

            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should call event.preventDefault if isIE and not v', () => {
            component.isIE = true;
            event.ctrlKey = true;
            event.keyCode = 85;

            component.onKeyDown(event);

            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should not call event.preventDefault if isIE and ctrl+v', () => {
            component.isIE = true;
            event.ctrlKey = true;
            event.keyCode = 86;

            component.onKeyDown(event);

            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('should not call event.preventDefault if not isIE and not ctrl', () => {
            component.isIE = false;
            event.ctrlKey = false;
            event.keyCode = 86;

            component.onKeyDown(event);

            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('should not call event.preventDefault if not isIE and not v', () => {
            component.isIE = false;
            event.ctrlKey = true;
            event.keyCode = 85;

            component.onKeyDown(event);

            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('should not call event.preventDefault if not isIE and ctrl+v', () => {
            component.isIE = false;
            event.ctrlKey = true;
            event.keyCode = 86;

            component.onKeyDown(event);

            expect(event.preventDefault).not.toHaveBeenCalled();
        });

    });

    describe('reset function ->', () => {

        it('should set dataUrl to null', () => {
            component.dataUrl = 'url';

            component.reset();

            expect(component.dataUrl).toBeNull();
        });

    });

});
