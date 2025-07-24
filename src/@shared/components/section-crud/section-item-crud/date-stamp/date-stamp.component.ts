import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CustomFormTemplate, FormSection, FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';

@Component({
    selector: 'date-stamp',
    templateUrl: './date-stamp.component.html',
    styleUrls: ['./date-stamp.component.scss']
})
export class DateStampComponent implements OnInit {

    @Input() inputIsDisabled: boolean;
    @Input() formType: string;
    @Input() section: FormSection;
    @Input() sectionIndex: number;
    @Input() sectionItemIndex: number;
    customForm: CustomFormTemplate;

    constructor() {
        
    }

    ngOnInit(): void {
       
    }

}