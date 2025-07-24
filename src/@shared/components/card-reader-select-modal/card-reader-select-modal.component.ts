import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'card-reader-select-modal',
  templateUrl: './card-reader-select-modal.component.html',
  styleUrls: ['./card-reader-select-modal.component.scss']
})
export class CardReaderSelectModalComponent {

  @Input() location: any;
  @Input() preLoadedCardReaders: any[] = [];
  @Output() onCardReaderSelectionComplete = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<any>();
  private selectedCardReader: string;
  hasSelectedCardReader: boolean = false;

  /**
   * When the card reader selection changes, we are just going 
   * to stash it here until the user clicks 'Next'
   * @param event selected card reader
   */
  cardReaderSelected(event: string): void {
    this.selectedCardReader = event;
    this.hasSelectedCardReader = event != '0';
  }

  next(): void {
    this.onCardReaderSelectionComplete.emit(this.selectedCardReader);
  }

  cancel(): void {
    this.onCancel.emit();
  }

}
