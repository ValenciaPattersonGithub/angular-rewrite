import { Component, OnInit, Input } from '@angular/core';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';
import { CustomFormTemplate, FormSection } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { Subscription } from 'rxjs';

@Component({
    selector: 'section-footer',
    templateUrl: './section-footer.component.html',
    styleUrls: ['./section-footer.component.scss']
})
export class SectionFooterComponent implements OnInit {

    @Input() formType: string;
    @Input() sectionIndex: string;
    @Input() section: FormSection;
    @Input() showFooterPage: boolean;

    customForm: CustomFormTemplate;
    subscription: Subscription;
    constructor(private noteTemplatesHelperService: NoteTemplatesHelperService) {

    }

    ngOnInit(): void {
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
        })
    }

    toggleIsVisible = (sectionObj: FormSection) => {
        sectionObj.IsVisible = !sectionObj.IsVisible;
        this.customForm.FormSections[this.sectionIndex] = sectionObj;
        this.noteTemplatesHelperService.setData(this.customForm);
    }

    toggleShowTitle = (sectionObj) => {
        sectionObj.ShowTitle = !sectionObj.ShowTitle;
        this.customForm.FormSections[this.sectionIndex] = sectionObj;
        this.noteTemplatesHelperService.setData(this.customForm);
    }

    toggleShowBorder = (sectionObj) => {
        sectionObj.ShowBorder = !sectionObj.ShowBorder;
        this.customForm.FormSections[this.sectionIndex] = sectionObj;
        this.noteTemplatesHelperService.setData(this.customForm);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
