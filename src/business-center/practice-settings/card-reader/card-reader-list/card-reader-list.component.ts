import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { OrderByPipe } from 'src/@shared/pipes';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { CardReader } from '../card-reader';
import { CardReaderComponent } from '../card-reader/card-reader.component';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { filter, take } from 'rxjs/operators';
import { SaveStates } from 'src/@shared/models/transaction-enum';
@Component({
  selector: 'card-reader-list',
  templateUrl: './card-reader-list.component.html',
  styleUrls: ['./card-reader-list.component.scss'],
})
export class CardReaderListComponent implements OnInit {
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private confirmationModalService: ConfirmationModalService
  ) {}

  @Input() containerRef: ViewContainerRef;
  @Input() cardReaderList: CardReader[];
  @Input() editMode: boolean;
  @Output() cardReadersFuncChange = new EventEmitter<any>();
  filterCardReaderList: CardReader[];
  defaultOrderKey = 'DeviceFriendlyName';
  isDescending: boolean;
  sortColumnName: string;
  sortDirection: number;
  dialog: DialogRef;
  dialogSubscription: Subscription;
  subscriptions: Subscription[] = [];
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;

  ngOnInit(): void {}

  filter()
  {
    return this.cardReaderList?.filter(x=>x?.ObjectState !== 'Delete');
  }

  deleteCardReader = rowIndex => {
    const content = this.translate.instant(
      'Are you sure you want to delete this card reader?'
    );
    const data = {
      header: this.translate.instant('Delete Card Reader?'),
      message: this.translate.instant(content),
      confirm: this.translate.instant('Save'),
      cancel: this.translate.instant('Cancel'),
      height: 190,
      width: 350,
    };
    this.confirmationRef = this.confirmationModalService.open({
      data,
    });

    this.confirmationModalSubscription = this.confirmationRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type === 'confirm' || event.type === 'close';
        }),
        take(1)
      )
      .subscribe(events => {
        switch (events.type) {
          case 'close':
            this.confirmationRef.close();
            break;
          case 'confirm':
            const filterData =  this.cardReaderList.filter(x=>x?.ObjectState !== 'Delete');
            const result = Object.assign({},filterData[rowIndex],{ObjectState:SaveStates.Delete,rowIndex:rowIndex, PaymentIntegrationDeviceId:filterData[rowIndex]?.PaymentIntegrationDeviceId})
            this.cardReadersFuncChange.emit(result);
            this.confirmationRef.close();        
            break;
        }
      });
  };
  
  applyOrderByPipe = (): CardReader[] => {
    const orderPipe = new OrderByPipe();
    return orderPipe.transform(this.cardReaderList, {
      sortColumnName: this.defaultOrderKey,
      sortDirection: 1,
    }) as CardReader[];
  };
  sortCardReaderList = (propName: string) => {
    this.isDescending = !this.isDescending;
    this.sortColumnName = propName;
    this.sortDirection = this.isDescending ? 1 : -1;
  };

  editCardReader = (cardReader: CardReader) => {
    this.dialog = this.dialogService.open({
      appendTo: this.containerRef,
      content: CardReaderComponent,
    });
    this.dialog.content.instance.cardReaderList = [...this.cardReaderList];
    this.dialog.content.instance.cardReader = {...cardReader};
    this.dialog.result.pipe(take(1)).subscribe((result: any) => {
      if(result){
        this.cardReadersFuncChange.emit(result); 
      }    
   });
  };
}
