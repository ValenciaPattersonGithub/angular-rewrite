import { EventEmitter, Inject, Input, Output } from '@angular/core';
import { Component, OnChanges, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { OrderByPipe } from 'src/@shared/pipes';
import { FeeListLocationDTO, FeeListsService } from 'src/@shared/providers/fee-lists.service';
import { SoarResponse } from '../../../@core/models/core/soar-response';


@Component({
    selector: 'fee-list-location',
    templateUrl: './fee-list-location.component.html',
    styleUrls: ['./fee-list-location.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: FeeListLocationComponent
        }]
})
export class FeeListLocationComponent implements OnInit, OnChanges, ControlValueAccessor {
    @Input() editMode: boolean;
    @Output() locationFeeListChange = new EventEmitter<string>();
    @Input() locationFeeList: string;
    @Input() location: Location;
    @Input() sbTab?: number;
    loadingFeeList: boolean;

    locationFeeListName: string;
    showFeeListWarning: boolean;

    feeListList: Array<{ Name: string, FeeListId: number, DraftDate: string, Locations: Array<{ Key: number, Value: string }>; }> = [];
    selectedItem = null;

    // Support ControlValueAccessor in Reactive Form
    onChange = (value) => { };
    onTouched = () => { };
    touched = false;

    constructor(
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize,
        private feeListsService: FeeListsService) { }

    ngOnInit(): void {
        if (this.locationFeeList)
            this.loadFeeListSelection();
        else {
            this.getSelectedFeeListName();
            this.setShowFeeListWarning();
        }
    }

    ngOnChanges(changes) {
        if (changes?.locationFeeList || changes?.location) {
            this.loadFeeListSelection();
        }
    }

    loadFeeListSelection = () => {
        if (this.feeListList?.length === 0) {
            let loadFeeList: Observable<SoarResponse<FeeListLocationDTO[]>> = null;
            loadFeeList = this.feeListsService.get();
            loadFeeList
                ?.pipe(finalize(() => this.loadingFeeList = false))
                .subscribe({
                    next: (loadFeeListResponse: SoarResponse<FeeListLocationDTO[]>) => this.handleLoadFeeListSuccess(loadFeeListResponse),
                    error: () => this.handleLoadFeeListError()
                });
        }
        else {
            this.getSelectedFeeListName();
            this.setShowFeeListWarning();
        }
    }

    handleLoadFeeListSuccess = (loadFeeListResponse: SoarResponse<FeeListLocationDTO[]>) => {
        if (loadFeeListResponse?.Value?.length > 0) {
            const orderPipe = new OrderByPipe();
            this.feeListList = orderPipe.transform(loadFeeListResponse?.Value, { sortColumnName: 'Name', sortDirection: 1 });
        }
        this.getSelectedFeeListName();
        this.setShowFeeListWarning();
    }

    handleLoadFeeListError = () => {
        this.toastrFactory.error(
            this.localize.getLocalizedString('Server Error'));
    }

    // show warning when None is selected (not an error)
    setShowFeeListWarning = () => {
        this.showFeeListWarning = (this.locationFeeListName === 'None') ? true : false;
    };

    // get fee list name
    getSelectedFeeListName = () => {
        this.locationFeeListName = 'None';
        this.feeListList?.forEach(feeList => {
            if (feeList?.FeeListId?.toString() == this.locationFeeList) {
                this.locationFeeListName = feeList?.Name;
                this.selectedItem = feeList;
            }
        });
    };

    onFeeListChanged = (e) => {
        if (this.selectedItem) {
            this.markAsTouched();
            this.locationFeeListChange?.emit(this.selectedItem?.FeeListId);
            this.onChange(this.selectedItem?.Name);
        }
    }

    writeValue(value) {
        this.locationFeeList = value;
        this.loadFeeListSelection();
    }

    registerOnChange(onChange) {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched) {
        this.onTouched = onTouched;
    }

    markAsTouched() {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }
}
