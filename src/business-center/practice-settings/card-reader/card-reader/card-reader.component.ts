import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DialogContentBase } from '@progress/kendo-angular-dialog';
import { CardReader } from '../card-reader';
import { SaveStates } from 'src/@shared/models/transaction-enum';
@Component({
  selector: 'card-reader',
  templateUrl: './card-reader.component.html',
  styleUrls: ['./card-reader.component.scss'],
})
export class CardReaderComponent extends DialogContentBase implements OnInit {
  constructor(
    public dialog: DialogRef,
    private fb: FormBuilder
  ) {
    super(dialog);
  }

  title = 'Add Credit Card Reader';
  isCardReaderNameExists = false;
  isCardReaderIdExists = false;
  editMode = false;
  frmCardReader: FormGroup;
  cardReaderList: CardReader[] = [];
  cardReader: CardReader;
  index: number = -1;

  ngOnInit(): void {
    this.createFormControls();
    if (this.cardReader) {
      this.index = this.cardReaderList.findIndex(
        x => x.PartnerDeviceId === this.cardReader.PartnerDeviceId
      );
      this.editMode = true;
      this.title = this.editMode
        ? 'Edit Credit Card Reader'
        : 'Add Credit Card Reader';
    }
  }

  CancelCardReaderDialog = () => {
    this.frmCardReader.reset();
    this.dialog.close();
    this.title = this.editMode
      ? 'Edit Credit Card Reader'
      : 'Add Credit Card Reader';
  };

  isCardReaderNameAlreadyExists = e => {
    const filter = this.cardReaderList?.filter(
      (f: CardReader, index: number) => {
        if (this.cardReader) {
          return (
            f?.DeviceFriendlyName.toLowerCase() ===
              e?.target?.value?.toLowerCase() && this.index !== index && f.ObjectState != "Delete"
          );
        } else {
          return (
            f?.DeviceFriendlyName?.toLowerCase() ===
            e?.target?.value?.toLowerCase() && f.ObjectState != "Delete"
          );
        }
      }
    );
    this.isCardReaderNameExists = filter?.length > 0;
  };

  isCardReaderIdAlreadyExists = e => {
    const filter = this.cardReaderList?.filter(
      (f: CardReader, index: number) => {
        if (this.cardReader?.PartnerDeviceId) {
          return (
            f?.PartnerDeviceId.toLowerCase() === e?.target?.value?.toLowerCase() &&
            this.index !== index && f.ObjectState != "Delete"
          );
        } else {
          return (
            f?.PartnerDeviceId?.toLowerCase() === e?.target?.value?.toLowerCase() && f.ObjectState != "Delete"
          );
        }
      }
    );

    this.isCardReaderIdExists = filter?.length > 0;
  };

  createFormControls = () => {
    this.frmCardReader = this.fb.group({
      PartnerDeviceId : [
        this.cardReader?.PartnerDeviceId,
        [Validators.required, Validators.maxLength(50)],
      ],
      DeviceFriendlyName: [
        this.cardReader?.DeviceFriendlyName,
        [Validators.required, Validators.maxLength(50)],
      ],
    });
  };

  saveCardReader() {
    if (this.cardReader){
       if(this.cardReader.DeviceFriendlyName.toLowerCase() === this.frmCardReader.value?.DeviceFriendlyName.toLowerCase() && this.cardReader.PartnerDeviceId.toLowerCase() === this.frmCardReader.value?.PartnerDeviceId.toLowerCase() ){
        this.dialog.close(null);
        return;
       }
      const result = Object.assign({},this.cardReader,this.frmCardReader.value,{ObjectState:SaveStates.Update,rowIndex:this.index, PaymentIntegrationDeviceId:this.cardReader?.PaymentIntegrationDeviceId})
      this.dialog.close(result)
    } else {
      const result = Object.assign({},this.frmCardReader.value,{ObjectState:SaveStates.Add})
      this.dialog.close(result)
    }
    this.frmCardReader.reset();
   
  }
}
