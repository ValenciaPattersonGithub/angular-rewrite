import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PatientAccountToothFilterComponent } from './patient-account-tooth-filter.component';
import { ToothDefinitionsPipe } from '../../pipes/toothDefinitions/tooth-definitions.pipe';

class MockStaticData {
	toothObject: any = {
		Value: {
			Teeth: [{
				ArchPosition: 'Upper',
				ToothStructure: 'Permanent',
				USNumber: '1'
			},
			{
				ArchPosition: 'Upper',
				ToothStructure: 'Permanent',
				USNumber: '2'
			},
			{
				ArchPosition: 'Lower',
				ToothStructure: 'Primary',
				USNumber: '20'
			}]
		}
	};

	TeethDefinitions: any = jasmine.createSpy().and.callFake(function () {
		return {
			then: function (callback) {
				callback(this.toothObject);
			}
		};
	})
}

describe('PatientAccountToothFilterComponent', () => {
	let component: PatientAccountToothFilterComponent;
	let fixture: ComponentFixture<PatientAccountToothFilterComponent>;
	let staticData: MockStaticData;
	let toothObject: any[];

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [PatientAccountToothFilterComponent, ToothDefinitionsPipe],
			providers: [{ provide: 'StaticData', useValue: staticData = new MockStaticData }],
			schemas: []
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PatientAccountToothFilterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		const selectedTeeth: any[] = [];
		component.selectedTeeth = selectedTeeth;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call the StaticData service and retrun all teeth', () => {
		spyOn(component, 'getTeethDefinitions');
		component.ngOnInit();

		expect(component.getTeethDefinitions).toHaveBeenCalled();
	});

	it('should set the allTeeth array to the teeth definitions value', () => {
		component.getTeethDefinitions();

		expect(staticData.TeethDefinitions).toHaveBeenCalled();
	});

	// selectTooth() -> function()
	it('should set the $$selected property of the tooth object passed in', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }]
		let tooth = { USNumber: '2', ArchPosition: 'Upper', $$selected: false};
		component.selectTooth(tooth, false);

		expect(tooth.$$selected).toEqual(true);
	});

	it('should add the selected tooth to the selectedTeeth array if not already included', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }]
		let tooth = { USNumber: '2', ArchPosition: 'Upper', $$selected: false };
		component.selectTooth(tooth, false);

		expect(component.selectedTeeth.length).toEqual(2);
		expect(tooth.$$selected).toEqual(true);
	});

	it('should NOT add the selected tooth to the selectedTeeth array if it IS already included', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }]
		let tooth = { USNumber: '1', ArchPosition: 'Upper', $$selected: false };
		component.selectTooth(tooth, false);

		expect(component.selectedTeeth.length).toEqual(1);
	});

	it('should remove the unselected tooth from the selected array', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }]
		let tooth = { USNumber: '1', ArchPosition: 'Upper', $$selected: true };
		component.selectTooth(tooth, true);

		expect(component.selectedTeeth.length).toEqual(0);
	});

	it('should remove the unselected tooth from the selected array', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '2', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '3', ArchPosition: 'Upper', $$selected: true }]
		let tooth = { USNumber: '3', ArchPosition: 'Upper', $$selected: true };
		component.selectTooth(tooth, true);

		expect(component.selectedTeeth.length).toEqual(2);
	});

	it('should call the emit function with the current selected teeth', () => {
		spyOn(component.selectedTeethChange, 'emit');
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true },
		{ USNumber: '2', ArchPosition: 'Upper', $$selected: true },
		{ USNumber: '3', ArchPosition: 'Upper', $$selected: true }]
		let tooth = { USNumber: '4', ArchPosition: 'Upper', $$selected: false };
		component.selectTooth(tooth, true);

		expect(component.selectedTeethChange.emit).toHaveBeenCalledWith(component.selectedTeeth);
		expect(component.selectedTeeth.length).toBe(4);
	});

	// clearTeeth() -> function()
	it('should clear user input values', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }];
		component.permToggle = false;
		component.allTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }, { USNumber: '2', ArchPosition: 'Upper', $$selected: true }, { USNumber: '3', ArchPosition: 'Upper', $$selected: true }];
		component.clearTeeth();

		expect(component.selectedTeeth.length).toEqual(0);
		expect(component.permToggle).toEqual(true);
		expect(component.allTeeth[1].$$selected).toEqual(false);
	});

	it('should call the emit function with the current selected teeth', () => {
		spyOn(component.selectedTeethChange, 'emit');
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true },
		{ USNumber: '2', ArchPosition: 'Upper', $$selected: true },
		{ USNumber: '3', ArchPosition: 'Upper', $$selected: true }]
		component.clearTeeth();

		expect(component.selectedTeethChange.emit).toHaveBeenCalledWith(component.selectedTeeth);
		expect(component.selectedTeeth.length).toBe(0);
	});

	// selectQuadrant() -> function()
	it('should set selected quadrant teeth to active', () => {
		spyOn(component, 'changeButtonState');
		component.permToggle = true;
		component.allTeeth = [
			{ USNumber: '1', ArchPosition: 'Lower', QuadrantName: 'Lower Right', ToothStructure: 'Primary', $$selected: false },
			{ USNumber: '2', ArchPosition: 'Upper', QuadrantName: 'Upper Right', ToothStructure: 'Permanent', $$selected: false },
			{ USNumber: '3', ArchPosition: 'Upper', QuadrantName: 'Upper Right', ToothStructure: 'Permanent', $$selected: false }
		];
		component.selectQuadrant('Upper Right', 'UR');

		expect(component.changeButtonState).toHaveBeenCalled();
		expect(component.selectedTeeth.length).toEqual(2);
	});

	it('should set selected quadrant teeth to active', () => {
		spyOn(component, 'changeButtonState');
		component.permToggle = false;
		component.allTeeth = [
			{ USNumber: '1', ArchPosition: 'Lower', QuadrantName: 'Lower Right', ToothStructure: 'Primary', $$selected: false },
			{ USNumber: '2', ArchPosition: 'Upper', QuadrantName: 'Upper Left', ToothStructure: 'Permanent', $$selected: false },
			{ USNumber: '3', ArchPosition: 'Upper', QuadrantName: 'Upper Left', ToothStructure: 'Permanent', $$selected: false },
			{ USNumber: '4', ArchPosition: 'Lower', QuadrantName: 'Lower Left', ToothStructure: 'Primary', $$selected: false },
		];
		component.selectQuadrant('Lower Left', 'LL');

		expect(component.changeButtonState).toHaveBeenCalled();
		expect(component.selectedTeeth.length).toEqual(1);
	});

	// selectArch() -> function()
	it('should set selected arch teeth to active', () => {
		spyOn(component, 'changeButtonState');
		component.permToggle = true;
		component.allTeeth = [
			{ USNumber: '1', ArchPosition: 'Lower', QuadrantName: 'Lower Right', ToothStructure: 'Primary', $$selected: false },
			{ USNumber: '2', ArchPosition: 'Upper', QuadrantName: 'Upper Left', ToothStructure: 'Permanent', $$selected: false },
			{ USNumber: '3', ArchPosition: 'Upper', QuadrantName: 'Upper Left', ToothStructure: 'Permanent', $$selected: false }
		];
		component.selectArch('Upper', 'UA');

		expect(component.changeButtonState).toHaveBeenCalled();
		expect(component.selectedTeeth.length).toEqual(2);
	});

	it('should set selected arch teeth to active', () => {
		spyOn(component, 'changeButtonState');
		component.permToggle = false;
		component.allTeeth = [
			{ USNumber: '1', ArchPosition: 'Lower', QuadrantName: 'Lower Right', ToothStructure: 'Primary', $$selected: false },
			{ USNumber: '2', ArchPosition: 'Upper', QuadrantName: 'Upper Left', ToothStructure: 'Permanent', $$selected: false },
			{ USNumber: '3', ArchPosition: 'Upper', QuadrantName: 'Upper Left', ToothStructure: 'Permanent', $$selected: false }
		];
		component.selectArch('Lower', 'LA');

		expect(component.changeButtonState).toHaveBeenCalled();
		expect(component.selectedTeeth.length).toEqual(1);
		expect(component.allTeeth[0].$$selected).toEqual(true);
		expect(component.allTeeth[1].$$selected).toEqual(false);
		expect(component.allTeeth[2].$$selected).toEqual(false);
	});

	//changeButtonState() -> function()
	it('should set selected button to active (UA)', () => {
		component.changeButtonState('UA');

		expect(component.buttons.UA).toEqual(true);
		expect(component.buttons.LA).toEqual(false);
		expect(component.buttons.LL).toEqual(false);
		expect(component.buttons.LR).toEqual(false);
		expect(component.buttons.UL).toEqual(false);
		expect(component.buttons.UR).toEqual(false);
	});

	it('should set selected button to active (UL)', () => {
		component.changeButtonState('UL');

		expect(component.buttons.UA).toEqual(false);
		expect(component.buttons.LA).toEqual(false);
		expect(component.buttons.LL).toEqual(false);
		expect(component.buttons.LR).toEqual(false);
		expect(component.buttons.UL).toEqual(true);
		expect(component.buttons.UR).toEqual(false);
	});

	it('should set selected button to active (LR)', () => {
		component.changeButtonState('LR');

		expect(component.buttons.UA).toEqual(false);
		expect(component.buttons.LA).toEqual(false);
		expect(component.buttons.LL).toEqual(false);
		expect(component.buttons.LR).toEqual(true);
		expect(component.buttons.UL).toEqual(false);
		expect(component.buttons.UR).toEqual(false);
	});

	//getSelectedCount() -> function
	it('should retrun the current number of selected teeth (1)', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }]
		let result = component.getSelectedCount();

		expect(result).toEqual(1);
	});

	it('should retrun the current number of selected teeth (0)', () => {
		component.selectedTeeth = []
		let result = component.getSelectedCount();

		expect(result).toEqual('0');
	});

	it('should retrun the current number of selected teeth (3)', () => {
		component.selectedTeeth = [
			{ USNumber: '1', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '2', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '3', ArchPosition: 'Upper', $$selected: true }
		]
		let result = component.getSelectedCount();

		expect(result).toEqual(3);
	});

	it('should retrun the current number of selected teeth (6)', () => {
		component.selectedTeeth = [
			{ USNumber: '1', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '2', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '3', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '4', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '5', ArchPosition: 'Upper', $$selected: true },
			{ USNumber: '6', ArchPosition: 'Upper', $$selected: true }
		]
		let result = component.getSelectedCount();

		expect(result).toEqual(6);
	});

	it('should set the label to "Tooth" when the count is 1', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }]
		let result = component.getSelectedCount();

		expect(component.label).toEqual("Tooth");
	});

	it('should set the label to "Teeth" when the count is greater than 1', () => {
		component.selectedTeeth = [{ USNumber: '1', ArchPosition: 'Upper', $$selected: true }, { USNumber: '2', ArchPosition: 'Upper', $$selected: true }]
		let result = component.getSelectedCount();

		expect(component.label).toEqual("Teeth");
	});

	it('should set the label to "Teeth" when the count is 0', () => {
		component.selectedTeeth = []
		let result = component.getSelectedCount();

		expect(component.label).toEqual("Teeth");
	});

	// closeFilter() -> function
	it('should set chartPopoverActive to false', () => {
		component.chartPopoverActive = true
		component.closeFilter();

		expect(component.chartPopoverActive).toEqual(false);
    });

    describe('ngOnChanges ->', () => {
        it('should call the clear teeth method when toggled input variable is changed to true', () => {
            var changes = { toggled: { currentValue: true } };
            component.selectedTeeth = [];
            component.chartPopoverActive = true;
            spyOn(component, 'clearTeeth');
            component.ngOnChanges(changes);

            expect(component.clearTeeth).toHaveBeenCalled();
            expect(component.chartPopoverActive).toBe(false);
        });
        it('should not call the clear teeth method when toggled input variable is changed to true and there are selected teeth', () => {
            var changes = { toggled: { currentValue: true } };
            component.selectedTeeth = [{Teeth: 1}];
            component.chartPopoverActive = true;
            spyOn(component, 'clearTeeth');
            component.ngOnChanges(changes);

            expect(component.clearTeeth).not.toHaveBeenCalled();
            expect(component.chartPopoverActive).toBe(false);
        });
        it('should not call the clear teeth method when toggled input variable is changed to false', () => {
            var changes = { toggled: { currentValue: false } };
            component.selectedTeeth = [];
            component.chartPopoverActive = true;
            spyOn(component, 'clearTeeth');
            component.ngOnChanges(changes);

            expect(component.clearTeeth).not.toHaveBeenCalled();
            expect(component.chartPopoverActive).toBe(true);
        });
        it('should not call the clear teeth method when toggled input variable is not changed', () => {
            var changes = { disabled: { currentValue: true } };
            component.chartPopoverActive = true;
            component.selectedTeeth = [];
            spyOn(component, 'clearTeeth');
            component.ngOnChanges(changes);

            expect(component.clearTeeth).not.toHaveBeenCalled();
            expect(component.chartPopoverActive).toBe(true);
        });
    });
});
