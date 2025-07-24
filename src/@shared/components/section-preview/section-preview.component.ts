import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormSection, FormSectionItem, FormTypes } from 'src/business-center/practice-settings/chart/note-templates/note-templates';

@Component({
    selector: 'section-preview',
    templateUrl: './section-preview.component.html',
    styleUrls: ['./section-preview.component.scss']
})
export class SectionPreviewComponent implements OnInit {

    @Input() parentForm: FormGroup;
    @Input() inputIsDisabled: boolean;
    @Input() editItem: boolean;
    @Input() sectionItem: FormSectionItem;
    @Input() sectionIndex: number;
    @Input() sectionItemIndex: number;    
    formsName = FormTypes;

    constructor() { }
    ngOnInit(): void {
    } 

}

