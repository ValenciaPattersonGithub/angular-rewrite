import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomFormTemplate } from 'src/business-center/practice-settings/chart/note-templates/note-templates';
import { NoteTemplatesHelperService } from 'src/business-center/practice-settings/chart/note-templates/note-templates-helper.service';

@Component({
    selector: 'accordion',
    templateUrl: './accordion.component.html',
    styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit {

    @Input() parentForm: FormGroup;
    @Input() inputIsDisabled: boolean;
    @Input() showFooterPage: boolean;
    @Input() formType: string;
    @Input() canEditForm: boolean;

    customForm: CustomFormTemplate;
    isshowSectionCrud = false;//TODO: Remove while migration

    subscription: Subscription;

    constructor(private noteTemplatesHelperService: NoteTemplatesHelperService) {

    }

    ngOnInit(): void {
        this.getCustomFormTemplateData();
    }

    getCustomFormTemplateData() {
        this.subscription = this.noteTemplatesHelperService.getData().subscribe((res) => {
            this.customForm = res;
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}