import { Component, OnInit, Input } from '@angular/core';
import { FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';

@Component({
    selector: 'signature-box',
    templateUrl: './signature-box.component.html',
    styleUrls: ['./signature-box.component.scss']
})
export class SignatureBoxComponent implements OnInit {

    @Input() inputIsDisabled: boolean;
    constructor() { }

    ngOnInit(): void {
    }

}