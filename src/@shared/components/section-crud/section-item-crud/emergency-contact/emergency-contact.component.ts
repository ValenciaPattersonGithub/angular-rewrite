import { Component, OnInit, Input } from '@angular/core';
import { FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';

@Component({
    selector: 'emergency-contact',
    templateUrl: './emergency-contact.component.html',
    styleUrls: ['./emergency-contact.component.scss']
})
export class EmergencyContactComponent implements OnInit {

    @Input() inputIsDisabled: boolean;

    constructor() { }

    ngOnInit(): void {
    }

}