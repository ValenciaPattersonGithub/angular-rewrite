import { Component, OnInit, Input } from '@angular/core';
import { FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';

@Component({
    selector: 'demographic',
    templateUrl: './demographic.component.html',
    styleUrls: ['./demographic.component.scss']
})
export class DemographicComponent implements OnInit {

    @Input() inputIsDisabled: boolean;

    constructor() { }

    ngOnInit(): void {
    }

}
