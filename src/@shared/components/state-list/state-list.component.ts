import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'state-list',
  templateUrl: './state-list.component.html',
  styleUrls: ['./state-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: StateListComponent
    }]
})
export class StateListComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input() source: any;
  @Output() sourceChange = new EventEmitter<any>();
  @Input() stateListId: string;
  @Input() tabindex: number;
  @Input() disableInput?: boolean = false;

  // fill state lists
  loadingStates = true
  // stateList = []
  stateList: Array<{ text: string, value: any }> = [];
  stateSource = null

  // Support ControlValueAccessor in Reactive Form
  onChange = (value) => {};
  onTouched = () => {};  
  touched = false;

  constructor(
    @Inject('StaticData') private staticData,
    @Inject('ListHelper') private listHelper,
    @Inject('localize') private localize
  ) {
  }

  ngOnInit(): void {
    this.initialize()
  }

  ngOnChanges = (changes: any) => {
    if (changes.source) {
      this.stateSelectionChange();
    }
  }

  initialize = () => {
    this.staticData.States().then(this.StatesOnSuccess);
  }

  StatesOnSuccess = (res: any) => {
    this.loadingStates = false;
    this.stateList = res.Value;
    this.initSelection();
  }

  initSelection = () => {
    if (this.source && this.source.length > 0) {
      this.stateSource = this.listHelper.findItemByFieldValue(this.stateList, 'Abbreviation', this.source.toUpperCase());
    } 
  }

  stateSelectionChange() {
    this.stateSource = this.listHelper.findItemByFieldValue(this.stateList, 'Abbreviation', this.source);
  }

  onStateChanged = (e) => {
    if(!this.disableInput) {
      this.markAsTouched();     
      this.sourceChange.emit(this.stateSource.Abbreviation);
      this.onChange(this.stateSource.Abbreviation);
    }
  }

  // Support ControlValueAccessor in Reactive Form
  writeValue(value: any) {
    this.source = value;
    this.stateSelectionChange();
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disableInput = disabled;
  }    
}
