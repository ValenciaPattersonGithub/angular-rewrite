import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormSectionItem } from 'src/business-center/practice-settings/chart/note-templates/note-templates';

@Component({
    selector: 'skip-prompt',
    templateUrl: './skip-prompt.component.html',
    styleUrls: ['./skip-prompt.component.scss']
})
export class SkipPromptComponent {
    @Input() inputIsDisabled: boolean;
    @Input() sectionItemPreviewIndex: string;
    @Input() sectionItem: FormSectionItem;
    @Output() onSkip = new EventEmitter<boolean>();
    constructor() { }
    changeSkipMode = (skip: boolean) => {
        this.sectionItem.Skip = !skip;
        this.onSkip.emit(this.sectionItem?.Skip)
    }

}