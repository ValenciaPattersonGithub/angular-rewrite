import { Component, Input, OnInit, Output, EventEmitter, Inject, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'card-reader-select',
  templateUrl: './card-reader-select.component.html',
  styleUrls: ['./card-reader-select.component.scss']
})
export class CardReaderSelectComponent implements OnInit,OnChanges,OnDestroy{

  @Output() onCardReaderChange = new EventEmitter();
  @Output() isCardReaderExist = new EventEmitter<boolean>()
  @Input() location: any;
  @Input() preLoadedCardReaders: any[] = [];
  @Input() showLabel: boolean = false;
  isCardReadersExist=false;

  // Style Inputs
  @Input() height: string = '30px';

  cardReaders: any[] = [];
  selectedCardReader: string;

  constructor(@Inject('LocationServices') private locationServices) { }

  ngOnInit(): void {
    if (this.location) {
      this.loadCardReaders();
    } else if (this.preLoadedCardReaders.length) {
      this.handleLoadedCardReaders(this.preLoadedCardReaders);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['location'] && changes['location'].previousValue != undefined){
      if(changes['location'].previousValue !== changes['location'].currentValue){
          this.loadCardReaders();
      }
    }
  }

  loadCardReaders(): void {
    this.locationServices.getPaymentDevicesByLocationAsync({ locationId: this.location?.LocationId }).$promise.then((result)=>{
      this.handleLoadedCardReaders(result.Value);
    }).catch(error => {
      console.error('Error: ', error);
      this.isCardReaderExist.emit(false); 
    });
  }

  handleLoadedCardReaders(value: any[]): void {
    this.cardReaders = value
    if(this.cardReaders.length){
      this.isCardReaderExist.emit(true);
      this.isCardReadersExist = true;
      if (this.cardReaders.length == 1) {
        this.change(this.cardReaders[0].PartnerDeviceId);
      }
    }else{
      this.isCardReaderExist.emit(false);     
    }
 
  }

  change(value: any): void {
    this.selectedCardReader = value;
    this.onCardReaderChange.emit(value);
  }

  ngOnDestroy(): void {
    this.change('0') ;
  }

}
