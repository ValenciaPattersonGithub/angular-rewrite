import { Component, Inject, OnInit } from '@angular/core';

@Component({
    selector: 'communication-print-preview',
    templateUrl: './communication-print-preview.component.html',
    styleUrls: ['./communication-print-preview.component.scss']
})

export class CommunicationPrintPreviewComponent implements OnInit {
    previewData: any;
    constructor(@Inject('$routeParams') private route) { }

    patientInformation: any;
    patientCommunications: any[];

    ngOnInit() {
        const storageId = `communications_${this.route.patientId}`;
        this.previewData = JSON.parse(localStorage.getItem(storageId));
        if (this.previewData && this.previewData.Communications.length) {
            setTimeout(window.print, 0);
            window.onafterprint = () => {
                window.close();
                localStorage.removeItem(storageId);
            };
        }
    }
}
