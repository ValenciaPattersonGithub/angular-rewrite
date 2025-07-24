import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
declare var _: any;
declare var Dynamsoft: any;

@Injectable()
export class DocScanControlService {

    private scanSuccessSource = new Subject();
    private scanFailureSource = new Subject();
    private dwtLoaded = false;
    private dWObject: any;
    private kendoWindow: any;

    // Observable string streams
    scanSuccess$ = this.scanSuccessSource.asObservable();
    scanFailure$ = this.scanFailureSource.asObservable();

    constructor() {
        Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => this.scanOnReady());
    }

    startScan() {
        this.reset();
        if (this.dwtLoaded === false) {
            setTimeout(() => {
                Dynamsoft.DWT.Load();
            });
        } else {
            this.scanOnReady();
        }
    }

    reset() {
        Dynamsoft.DWT.Unload();
        this.dwtLoaded = false;
    }

    retrieveFile() {
        var numPages = this.dWObject.HowManyImagesInBuffer;
        var indices = [];
        for (var i = 0; i < numPages; i++) {
            indices.push(i);
        }

        return new Promise((resolve, reject) => {
            this.dWObject.ConvertToBlob(indices, Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF, function (result) {
                resolve(result);
            }, function () {
                reject();
            });
        });
    }

    scrollFix() {
        // fix for expansion of parent kendo window outside viewable area
        this.kendoWindow = $('#dwtcontrolContainer').closest('.k-widget.k-window').get(0);
        if (!_.isNil(this.kendoWindow) && (this.kendoWindow.getBoundingClientRect().bottom + window.scrollY > window.innerHeight)) {
            this.kendoWindow.scrollIntoView();
        }
    }

    addPage() {
        this.dWObject.SelectSource(() => this.scanSelectSourceSuccess(), (_errorCode: number, error: string) => this.onScanFailure(error));

        // fix for select source dialog not visible
        if (this.kendoWindow) {
            let sourceModal = $('.dynamsoft-dialog-selectsource').get(0);
            if (!_.isNil(sourceModal)) {
                let windowPos = this.kendoWindow.getBoundingClientRect().top + window.scrollY;
                sourceModal.style.top = `${windowPos + 10}px`;
            }
        }
    }

    private scanOnReady() {
        this.dwtLoaded = true;
        this.dWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');

        this.scrollFix();

        this.addPage();
    }

    private scanSelectSourceSuccess() {
        console.log('scanSelectSourceSuccess: Starting source selection process');
        try {
            try {
                const closedSuccess: boolean = this.dWObject.CloseSource();
                if (!closedSuccess) {
                    console.error('scanSelectSourceSuccess: Failed to close source');
                }
                else console.log('scanSelectSourceSuccess: Source closed successfully');
            } catch (error) {
                console.error('scanSelectSourceSuccess: An error occurred while closing source', error);
                // continue anyway
            }
            
            const openSourceSuccess: boolean = this.dWObject.OpenSource();
            if (!openSourceSuccess) {
                console.error('scanSelectSourceSuccess: Failed to open source');
            }
             else console.log('scanSelectSourceSuccess: Source opened successfully');
            
            this.dWObject.IfDisableSourceAfterAcquire = true;
            console.log('scanSelectSourceSuccess: IfDisableSourceAfterAcquire set to true');
            
            this.dWObject.AcquireImage(
                () => {
                    console.log('scanSelectSourceSuccess: Image acquired successfully');
                    this.scanAcquireImageSuccess();
                },
                (_errorCode: number, error: string) => {
                    console.error('scanSelectSourceSuccess: Failed to acquire image', error);
                    this.onScanFailure();
                }
            );
            console.log('scanSelectSourceSuccess: Image acquisition started');
        } catch (error) {
            console.error('scanSelectSourceSuccess: An error occurred during source selection', error);
            this.onScanFailure();
        }
    }

    private scanAcquireImageSuccess() {
        this.dWObject.ShowImageEditor('dwtEditorContainer');
        this.onScanSuccess();
    }

    private onScanSuccess() {
        this.scanSuccessSource.next();
    }

    private onScanFailure(error: string = '') {
        console.error('onScanFailure: An error occurred during scanning', error);
        this.scanFailureSource.next();
    }
}
