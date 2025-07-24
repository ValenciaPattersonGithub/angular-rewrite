import {
    Component,
    Input,
    AfterViewInit
} from '@angular/core';

declare const window: any;

@Component({
    selector: 'angular-parcel',
    template: '<div id="{{containerId}}"></div>',
})
export class AngularParcelComponent implements AfterViewInit {
    @Input() parcelKey!: string; //Unique key to identify this parcel (useful for managing multiple parcels). 
    @Input() routeProps!: string; //JSON string which contains key-value pair to replace route params in the MFE.
    @Input() inputProps!: string; //JSON string which contains key-value pair to replace input params in the MFE.
    @Input() containerId!: string; //The ID of the DOM element where the MFE should be mounted.
    @Input() baseAppName!: string; //The base app name used to register the app with single-spa and get app import path.
    @Input() onDataEmittedFromMfe!: (data: string) => void; //A callback function passed from the host to receive data from the MFE in JSON string.
    
    ngAfterViewInit() {
        this.mountParcel();
    }

    mountParcel() {
        if (window.singleSpa?.loadApp) {
            window.singleSpa.loadApp({
                baseAppName: this.baseAppName,
                containerId: this.containerId,
                parcelKey: this.parcelKey,
                inputProps: this.inputProps,
                routeProps: this.routeProps,
                onDataEmittedFromMfe: this.handleMfeCallback.bind(this)
            });
        } else {
            console.error('singleSpa.loadApp is not available.');
        }
    }

    //When the MFE emits data (via the callback passed to it), this function captures it and passes
    //it to the host’s onDataFromMfe() input.
    handleMfeCallback(data: string) {
        if (this.onDataEmittedFromMfe) {
            this.onDataEmittedFromMfe(data);
        }
    }
}
