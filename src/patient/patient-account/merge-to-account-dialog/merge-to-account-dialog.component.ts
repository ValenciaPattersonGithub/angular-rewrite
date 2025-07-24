import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';

@Component({
    selector: 'merge-to-account-dialog',
    templateUrl: './merge-to-account-dialog.component.html',
    styleUrls: ['./merge-to-account-dialog.component.scss']
})
export class MergeToAccountDialogComponent extends DialogContentBase {

    title: string;
    message: string;
    okAndCancel: boolean;

    constructor(public dialog: DialogRef) {
       super(dialog);
    }

    cancelClicked() {
        this.dialog.close();
    }

    okClicked() {
        this.dialog.close(true);
    }

}
