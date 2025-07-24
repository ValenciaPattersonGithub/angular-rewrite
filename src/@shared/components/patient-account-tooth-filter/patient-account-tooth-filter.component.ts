import { Component, OnInit, Input, Output, Inject, OnChanges, EventEmitter } from '@angular/core';

@Component({
	selector: 'patient-account-tooth-filter',
	templateUrl: './patient-account-tooth-filter.component.html',
	styleUrls: ['./patient-account-tooth-filter.component.scss']
})

export class PatientAccountToothFilterComponent implements OnInit, OnChanges {
	allTeeth: any[] = [];
	@Input() selectedTeeth: any[];
	@Input() disabled: boolean;
	@Input() toggled: boolean;
	@Output() selectedTeethChange = new EventEmitter<any[]>();
	chartPopoverActive = false;
	permToggle = true;
	label: string;

	// Object to control active button states
	buttons = {
		'UA': false,
		'LA': false,
		'UR': false,
		'UL': false,
		'LR': false,
		'LL': false
	}

	constructor(@Inject('StaticData') private staticData) { }

	// Get the teeth definitions from StaticData
	getTeethDefinitions() {
		this.staticData.TeethDefinitions().then((res) => {
			if (res && res.Value && res.Value.Teeth) {
				this.allTeeth = res.Value.Teeth;
			}
		});
	}

	// Set he selected property and push to the array for filtering
	selectTooth(tooth, single) {
		tooth.$$selected = !tooth.$$selected;
		tooth.$$selected && !this.selectedTeeth.some(x => x.USNumber === tooth.USNumber) ? this.selectedTeeth.push(tooth.USNumber) : !tooth.$$selected ? this.selectedTeeth.splice(this.selectedTeeth.findIndex(x => x === tooth.USNumber), 1) : null;
		if (single) {
			this.selectedTeethChange.emit(this.selectedTeeth);
		}
		this.changeButtonState('');
	}

	// clear the selected teeth array
	clearTeeth() {
		this.selectedTeeth.length = 0;
		this.permToggle = true;
		this.changeButtonState('');
		this.allTeeth.forEach(function(tooth) {
			tooth.$$selected = false;
		});
		this.selectedTeethChange.emit(this.selectedTeeth);
	}

	// Change selection to a quadrant
	selectQuadrant(quadrantName, buttonName) {
		this.selectedTeeth.length = 0;
		this.allTeeth.forEach((tooth) => {
			tooth.$$selected = false;
			let selected = this.permToggle ? tooth.QuadrantName === quadrantName && tooth.ToothStructure === 'Permanent' : tooth.QuadrantName === quadrantName && tooth.ToothStructure === 'Primary';
			if (selected) {
				this.selectTooth(tooth, false);
			}
		});
		this.selectedTeethChange.emit(this.selectedTeeth);
		this.changeButtonState(buttonName);
	}

	// Change selection to an arch
	selectArch(archName, buttonName) {
		this.selectedTeeth.length = 0;
		this.allTeeth.forEach((tooth) => {
			tooth.$$selected = false;
			let selected = this.permToggle ? tooth.ArchPosition === archName && tooth.ToothStructure === 'Permanent' : tooth.ArchPosition === archName && tooth.ToothStructure === 'Primary';
			if (selected) {
				this.selectTooth(tooth, false);
			}
		});
		this.selectedTeethChange.emit(this.selectedTeeth);
		this.changeButtonState(buttonName);
	}

	// Set buttons to the proper selected states
	changeButtonState(btn) {
		Object.keys(this.buttons).forEach(k => k !== btn ? this.buttons[k] = false : this.buttons[k] = true);
	}

	// Set the selected tooth count display
	getSelectedCount() {
		if (this.selectedTeeth && this.selectedTeeth.length === 1) {
			this.label = 'Tooth';
			return this.selectedTeeth.length;
		} else if (this.selectedTeeth && this.selectedTeeth.length > 1) {
			this.label = 'Teeth';
			return this.selectedTeeth.length;
		} else {
			this.label = 'Teeth';
			return '0';
		}
	}

	// Close the filter on blur
	closeFilter() {
		this.chartPopoverActive = false;
	}

	ngOnInit() {
		this.getTeethDefinitions();
	}

	// Detect changes from bound variables
	ngOnChanges(changes: any) {
        if (changes.toggled && changes.toggled.currentValue) {
			if (this.selectedTeeth.length === 0) {
				this.clearTeeth();
			}

			this.chartPopoverActive = false;
		}
	}
}
