import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { AddEvent, DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { process, SortDescriptor, State } from "@progress/kendo-data-query";
import { take } from 'rxjs/operators';

@Component({
	selector: 'app-kendo-grid',
	templateUrl: './app-kendo-grid.component.html',
	styleUrls: ['./app-kendo-grid.component.scss']
})

export class AppKendoGridComponent implements OnChanges {
	//Output Emitters
	@Output() deleteItem = new EventEmitter<any>();
	@Output() editItem = new EventEmitter<any>();
	@Output() saveItem = new EventEmitter<any>();
	@Output() addNewItem = new EventEmitter<any>();
	
	//Input Bindings
	@Input() data: any = []; //data type will vary according to the component it is binded with
	@Input() gridHeight: string;
	@Input() state: State;
	@Input() isSortable: boolean = false;
	@Input() isDialogOpen: boolean = false;
	@Input() popUptemplate: TemplateRef<NgTemplateOutlet> ;
	@Input() isFilterable: boolean = false;
	@Input() sort: SortDescriptor[];
	@Input() filterDelay: number = 100;
	@Input() showOperators: boolean = false;
	@Input() hasCreateAccess: boolean = false;
	@Input() createButton: {class: string, id: string, text: string};
	@Input() columns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[] = []; //number of columns and their details
	@Input() editSection: { width: string, showActionIcons: boolean } = { width: '100', showActionIcons: true }; //Action icons
	@Input() hasCreateButton: boolean = false;
	@Input() formGroup: FormGroup = new FormGroup({});
	@Input() hasKendoAddEdit: boolean = true; //check if component adds/edits list using kendo grid
	@Input() noRecordsMessage: string = 'No records available';	 
	@Input() closeDialog: boolean = false;
	@Input() loading: boolean = false;
	@Input() dialogSettings: { width: string,maxHeight:string,height: string }
	@ViewChild("container", { read: ViewContainerRef })
    public containerRef: ViewContainerRef;
	dialog: DialogRef;
	//component variables
	gridData: GridDataResult;
	isEditing: boolean = false;
	kendoRowData: any;
	editedRowIndex: number;
	noRecordsMessageVal: string = '';	 

	constructor(private dialogService: DialogService) { }

	ngOnChanges(changes: SimpleChanges) {
		if (changes.data) {
			this.updateGridData();
		}
		if (changes.loading) {
			this.noRecordsMessageVal = this.loading == true ? "" : this.noRecordsMessage
		}
		
		if (changes.closeDialog) {
			if (this.closeDialog) {
				this.dialog.close();
				this.closeDialog = false;
			}
		}
		if (this.hasKendoAddEdit && this.kendoRowData &&changes.formGroup && !this.isDialogOpen) {
			if (this.isEditing) {
				//edit specific row
				this.editKendoRow();
			} else {
				//add new kendo row
				this.addNewRow();
			}
		}
	}

	closeEditor = (grid, rowIndex = this.editedRowIndex) => {
		grid.closeRow(rowIndex);

		this.editedRowIndex = undefined;
		this.formGroup = undefined;
	}

	editKendoRow() {
		this.kendoRowData.sender.editRow(this.kendoRowData.rowIndex, this.formGroup);
	}

	editHandler = (event) => {
		this.isEditing = true;
		//close opened rows
		this.closeEditor(event.sender);

		this.kendoRowData = event;
		this.editedRowIndex = event.rowIndex;
		if(this.isDialogOpen)
		this.openDialog()
		this.editItem.emit(event);
	}

	cancelHandler = ({ sender, rowIndex }) => {
		this.isEditing = false;
		this.closeEditor(sender, rowIndex);
	}

	saveHandler = (event) => {
		const { sender, rowIndex, isNew } = event;

		(!isNew) ?
			this.saveItem.emit({ event: event, isNew: false }) :
			this.saveItem.emit({ event: event, isNew: true });

		this.isEditing = false;
		sender.closeRow(rowIndex);
  }

	removeHandler = (event) => {
		this.deleteItem.emit(event);
	}

	addNewRow = () => {
		this.kendoRowData.sender.addRow(this.formGroup);
	}

	addHandler = (event: AddEvent) => {
		const { sender } = event;

		this.isEditing = false;
		this.closeEditor(sender);
		this.kendoRowData = event;
		if(this.isDialogOpen)
		this.openDialog()
		this.addNewItem.emit();
	}

	dataStateChange = (filterState: DataStateChangeEvent) => {
		this.state = filterState;
		this.updateGridData();
	}

	updateGridData() {
		this.gridData = process(this.data, this.state);
	}
	openDialog = () => {
		this.closeDialog=false;
		if (this.dialogService) {
		  this.dialog = this.dialogService.open({
			  content: this.popUptemplate,
			  appendTo: this.containerRef,
			  width: this.dialogSettings?.width,
			  maxHeight: this.dialogSettings?.maxHeight,
			  height: this.dialogSettings?.height
		  });
		}
	
		if (this.dialog.result) {
		  this.dialog.result
		  .pipe(take(1))
		  .subscribe((result: any) => {
			if (!result?.primary) {
			  this.dialog.close();
			}
		  });
		}
	  }

}