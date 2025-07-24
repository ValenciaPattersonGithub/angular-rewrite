import { Component, OnInit, Input } from '@angular/core';
import { CustomFormTemplate, FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';

@Component({
    selector: 'comment-essay',
    templateUrl: './comment-essay.component.html',
    styleUrls: ['./comment-essay.component.scss']
})
export class CommentEssayComponent implements OnInit {
    
    @Input() inputIsDisabled: boolean;
    sectionItem: FormSectionItem[] = [];
    customForm: CustomFormTemplate;

    constructor() {
        
    }

    ngOnInit(): void {

    }
}
