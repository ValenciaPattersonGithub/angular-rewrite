import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { BillingMessagesService } from '../billing-messages.service';
import { Message } from '../message';
import { AccountStatementBillingMessageCrudComponent } from './account-statement-billing-message-crud/account-statement-billing-message-crud.component';
import { AccountStatementMessagesService } from './account-statement-messages.service';

@Component({
  selector: 'account-statement-billing-message',
  templateUrl: './account-statement-billing-message.component.html',
  styleUrls: ['./account-statement-billing-message.component.scss'],
})
export class AccountStatementBillingMessageComponent implements OnInit {
  @ViewChild(AccountStatementBillingMessageCrudComponent)
  public accountStatementBillingMessageCrud: AccountStatementBillingMessageCrudComponent;
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('ModalFactory') private modalFactory,
    @Inject('localize') private localize,
    private accountStatementMessagesService: AccountStatementMessagesService,
    private billingMessagesService: BillingMessagesService
  ) {}
  messages: Message[] = [];
  isLoaded = false;
  messageData: Message = {
    Message: null,
    Name: null,
    DataTag: null,
    AccountStatementMessageId: null,
  };
  ngOnInit(): void {
    this.loadMessages();
  }
  loadMessages = () => {
    this.accountStatementMessagesService.all().then(
      res => {
        this.setMessage(res);
      },
      error => {
        this.toastrFactory.error(
          this.localize.getLocalizedString(
            'Failed to retrieve the {0}. Refresh the page to try again.'
          ),
          this.localize.getLocalizedString(
            'Server Error' + error?.data?.Message
          )
        );
      }
    );
  };
  setMessage = res => {
    this.messages = res?.Value;
  };
  addNewMessage = () => {
    this.isLoaded = true;
    this.messageData = {
      Message: null,
      Name: null,
      DataTag: null,
      AccountStatementMessageId: null,
    };
    this.accountStatementBillingMessageCrud.openPreviewDialog();
    this.accountStatementBillingMessageCrud.ngOnInit();
  };

  editMessage = (message: Message) => {
    this.messageData = message;
    this.isLoaded = true;
    this.accountStatementBillingMessageCrud.openPreviewDialog();
    this.accountStatementBillingMessageCrud.ngOnInit();
  };
  deleteMessage = (defaultMessage: Message) => {
    var message = this.localize.getLocalizedString(
      'Are you sure you want to Delete this Message?'
    );
    var title = this.localize.getLocalizedString('Delete');
    var buttonYes = this.localize.getLocalizedString('Yes');
    var buttonNo = this.localize.getLocalizedString('No');
    this.modalFactory
      .ConfirmModal(title, message, buttonYes, buttonNo)
      .then(() => {
        this.confirmDelete(defaultMessage);
      });
  };

  confirmDelete = (message: Message) => {
    this.billingMessagesService
      .deleteMessage({
        accountStatementMessageId: message?.AccountStatementMessageId,
      })
      .then(
        res => {
          this.toastrFactory.success(
            this.localize.getLocalizedString(
              'Successfully deleted the account statement message.'
            ),
            this.localize.getLocalizedString('Success')
          );
          this.getAccountStatementMessagesDeleteStatusSuccess(res);
        },
        error => {
          this.toastrFactory.error(
            this.localize.getLocalizedString(
              'Failed to delete the account statement message. Try again.'
            ),
            this.localize.getLocalizedString(
              'Server Error' + error?.data?.Message
            )
          );
        }
      );
  };
  getAccountStatementMessagesDeleteStatusSuccess = res => {
    this.loadMessages();
  };

  closeMessagePopup = (message: Message) => {
    if (message) {
      this.loadMessages();
    }
  };
}
