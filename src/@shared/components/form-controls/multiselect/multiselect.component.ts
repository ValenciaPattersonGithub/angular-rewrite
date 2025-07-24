import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { groupBy } from '@progress/kendo-data-query';
import { Subscription, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-multiselect',
    templateUrl: 'multiselect.component.html',
    styleUrls: ['./multiselect.component.scss']
})
export class AppMultiselectComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() id?: string;
    @Input() listItems: Array<{ text: string, value: number, IsDisabled?: boolean, subcategory?: string }>;
    @Input() placeholder: string;
    @Input() label?: string;
    @Input() disabled: boolean = false;
    @Input() labelDirection?: string;
    @Input() model: any[] = [];
    @Input() showSelectAll: boolean;
    @Input() customClass?: string;
    @Input() groupData?: boolean = false;
    @Input() animatepopup: boolean = true;
    @Input() showSpecificList: boolean = false;
    @Output() modelChange = new EventEmitter<any>();
    public value: any = [];
    public isChecked = false;
    public groups: any[];
    @ViewChild('list') list: MultiSelectComponent;
    subscription: Subscription;
    multiSelectClick: boolean = false;

    public isItemSelected(itemText: string): boolean {
        return this.model.some(item => item.text === itemText);
    }

    ngOnInit(): void {
        if (this.groupData) {
            this.groups = groupBy(this.listItems, [{ field: 'subcategory' }]);
        }
    }

    ngAfterViewInit() {
        // This code executes when showSpecificList is true
        if (this.showSpecificList) {
            let source = this.groupData ? this.groups : this.listItems;
            const contains = (value) => (s) =>
                s?.text?.toLowerCase()?.indexOf(value?.toLowerCase()) !== -1;
            this.subscription = this.list?.filterChange
                .asObservable()
                .pipe(
                    switchMap((value) =>
                        from([source]).pipe(
                            map((data) => data?.filter(contains(value)))
                        )
                    )
                )
                .subscribe((x) => {
                    this.groupData ? this.groups = x : this.listItems = x;
                });
        }
    }

    onChange(): void {
        if (this.groupData) {
            let groupLength = 0;
            for (let index = 0; index < this.groups?.length; index++) {
                groupLength += this.groups[index]?.items?.length;
            }
            this.isChecked = groupLength === this.model?.length;
        } else {
            this.isChecked = this.listItems?.length === this.model?.length;
        }
        this.modelChange.emit(this.model);
    }

    public get toggleAllText() {
        return this.isChecked ? 'Deselect All' : 'Select All';
    }

    onSelectAll = () => {
        this.isChecked = !this.isChecked;
        this.value = this.isChecked ? this.listItems?.slice() : this.listItems?.filter(x => x.IsDisabled).slice();
        this.modelChange.emit(this.value);
    }
    public onValueChange() {
        this.isChecked = this.value?.length === this.listItems?.length;
    }
    public itemDisabled(itemArgs: { dataItem: any; index: number }): boolean {
        return itemArgs?.dataItem?.IsDisabled;
    }

    //Event will call if we click anywhere in multiselect control
    onMultiSelectClick = () => {
        this.multiSelectClick = true; //Set true if we click anywhere in multiselect control
    }

    clickedOutside = (multiselect : MultiSelectComponent) => {
        if ((multiselect as MultiSelectComponent)?.isOpen) {
          (multiselect as MultiSelectComponent)?.toggle(false);
        }
      }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
