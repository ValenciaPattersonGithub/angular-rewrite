import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  DialogService,
  DialogRef,
  DialogAction,
} from '@progress/kendo-angular-dialog';
import { Message } from '../../message';
import isEqual from 'lodash/isequal';
import cloneDeep from 'lodash/cloneDeep';
import { take } from 'rxjs/operators';
import { AccountStatementMessagesService } from '../account-statement-messages.service';

@Component({
  selector: 'account-statement-billing-message-crud',
  templateUrl: './account-statement-billing-message-crud.component.html',
  styleUrls: ['./account-statement-billing-message-crud.component.scss'],
})
export class AccountStatementBillingMessageCrudComponent implements OnInit {
  @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
  dialog: DialogRef;
  disabled = true;
  isDuplicate = false;
  isEdit: boolean;
  originalMessage: Message = null;
  @Input() messageData: Message;
  @Output() closeModal: EventEmitter<Message> = new EventEmitter<Message>();
  showErrors: boolean;

  constructor(
    @Inject('ModalFactory') private modalFactory,
    @Inject('localize') private localize,
    @Inject('toastrFactory') private toastrFactory,
    private accountStatementMessagesService: AccountStatementMessagesService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    if (this.messageData?.AccountStatementMessageId) {
      this.isEdit = true;
    } else {
      this.messageData.Name = null;
      this.messageData.Message = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.messageData?.AccountStatementMessageId) this.isEdit = true;
    else this.isEdit = false;
    if (changes.messageData.currentValue !== changes.messageData.previousValue)
      this.originalMessage = cloneDeep(this.messageData);
  }

  openPreviewDialog = () => {
    if (this.dialogService) {
      this.dialog = this.dialogService.open({
        width: '45%',
        content: this.templateElement,
      });
    }
    if (this.dialog.result) {
      this.dialog.result.pipe(take(1)).subscribe((result: DialogAction) => {
        if (!result?.primary) {
          this.dialog.close();
        }
      });
    }
  };

  close = () => {
    if (!isEqual(this.messageData, this.originalMessage))
      //handle to check if initial data has been change then it will ask for confirmation
      this.modalFactory.CancelModal().then(this.cancelChanges);
    else this.cancelChanges();
  };

  closeDialog = () => {
    this.showErrors = false;
    this.isDuplicate = false;
    this.dialog?.close();
  };
  // cancel changes made to message and close modal
  cancelChanges = () => {
    // close this screen
    this.closeModal.emit(this.messageData);
    this.closeDialog();
  };

  save = () => {
    if (this.validate()) {
      var call = this.isEdit
        ? this.accountStatementMessagesService.update
        : this.accountStatementMessagesService.save;
      let dataToSave = cloneDeep(this.messageData);
      if (!dataToSave.AccountStatementMessageId)
        delete dataToSave.AccountStatementMessageId;

      call(dataToSave).then(
        (res: Message) => {
          this.getAccountStatementMessagesStatusSuccess(res);
        },
        error => {
          this.getAccountStatementMessagesStatusFailure(error);
        }
      );
    }
  };

  getAccountStatementMessagesStatusSuccess = res => {
    this.toastrFactory.success(
      this.localize.getLocalizedString('Sucessfully {0} message', [
        this.isEdit ? 'updated' : 'added',
      ])
    );
    this.closeModal.emit(this.messageData);
    this.closeDialog();
  };

  getAccountStatementMessagesStatusFailure = error => {
    this.toastrFactory.error(
      this.localize.getLocalizedString('Failed to {0} message', [
        this.isEdit ? 'update' : 'add',
      ]),
      this.localize.getLocalizedString('Server Error' + error?.data?.Message)
    );
  };
  checkDups = () => {
    if (this.messageData?.Name) {
      this.disabled = true;
      this.isDuplicate = false;
      this.accountStatementMessagesService
        .getDuplicate({ name: this.messageData?.Name })
        .then(
          res => {
            this.setDupsRecord(res);
          },
          error => {
            this.toastrFactory.error(
              this.localize.getLocalizedString('Failed to check duplicates'),
              this.localize.getLocalizedString(
                'Server Error' + error?.data?.Message
              )
            );
          }
        );
    }
  };
  setDupsRecord = res => {
    if (res?.Value && res?.Value?.length > 0) {
      if (this.isEdit) {
        if (
          res?.Value[0]?.AccountStatementMessageId !==
          this.messageData?.AccountStatementMessageId
        ) {
          this.isDuplicate = true;
        }
      } else {
        this.isDuplicate = true;
      }
    }
    this.disabled = false;
  };
  //validation
  validate = () => {
    if (
      !this.messageData ||
      !this.messageData?.Name ||
      !this.messageData?.Message ||
      this.isDuplicate
    ) {
      this.showErrors = true;
      return false;
    }
    return true;
  };
}
