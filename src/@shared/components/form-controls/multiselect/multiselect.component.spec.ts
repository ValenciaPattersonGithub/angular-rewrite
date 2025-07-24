import { Component, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppMultiselectComponent } from "./multiselect.component";

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'kendo-multiselect',
    template: ''
})
export class MultiSelectComponent {    
    @Input() label?: string;
}

describe('AppMultiselectComponent', () => {
    let component: AppMultiselectComponent;

    let mockListItems = [
        {text:'Item1', value: 1, IsDisabled: false, subcategory:'Active' },
        {text:'Item2', value: 2, IsDisabled: false, subcategory:'Active' },
        {text:'Item3', value: 3, IsDisabled: false, subcategory:'Inactive' },
        {text:'Item4', value: 4, IsDisabled: false, subcategory:'Active' },
    ]

    let fixture: ComponentFixture<AppMultiselectComponent>;
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [                
               
            ],
            declarations: [AppMultiselectComponent],
        })
        .compileComponents();
    });



    beforeEach(() => {
        fixture = TestBed.createComponent(AppMultiselectComponent);
        component = fixture.componentInstance;
        // set component inputs
        component.groupData = false;
        component.listItems = mockListItems;        
        component.showSelectAll = false;
        fixture.detectChanges();
    });

    it('should create', () => {        
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should create groups if groupData is true', () => {
            component.groupData = true;
            component.ngOnInit();       
            expect(component.groups.length).toEqual(2)
            expect(component.groups[0].items.length).toEqual(3)
            expect(component.groups[1].items.length).toEqual(1)
        });
        it('should create Active group with 3 records if groupData is true', () => {
            component.groupData = true;
            component.ngOnInit();
            expect(component.groups[0].items.length).toEqual(3)
            expect(component.groups[0].items[0].subcategory).toEqual('Active')
        });
        it('should create Inactive group with 1 record if groupData is true', () => {
            component.groupData = true;
            component.ngOnInit();
            expect(component.groups[1].items[0].subcategory).toEqual('Inactive')
            expect(component.groups[1].items.length).toEqual(1)
        });

        it('should not create groups if groupData is false', () => {
            component.groupData = false;
            component.ngOnInit();
            expect(component.groups).toBeUndefined()
        });
    });

    describe('onChange', () => {
        it('should trigger modelChange.emit if groupData is true', () => {
            component.modelChange.emit = jasmine.createSpy();
            component.groupData = true; 
            component.ngOnInit();
            component.onChange();                     
            expect(component.modelChange.emit).toHaveBeenCalledWith(component.model)
        });

        it('should trigger modelChange.emit if groupData is false', () => {
            component.modelChange.emit = jasmine.createSpy();
            component.groupData = false; 
            component.ngOnInit();
            component.onChange();                     
            expect(component.modelChange.emit).toHaveBeenCalledWith(component.model)
        });

        it('should set IsChecked based on group.items if groupData is true', () => {
            component.modelChange.emit = jasmine.createSpy();
            component.groupData = true;            
            component.ngOnInit();
            // all items have been added to model
            component.model = [1,2,3,4];
            component.onChange();
            expect(component.isChecked).toBe(true)
        });

        it('should set IsChecked based on itemList if groupData is false', () => {
            component.modelChange.emit = jasmine.createSpy();
            component.groupData = false;            
            component.ngOnInit();
            // all items have been added to model
            component.model = [1,2,3,4];
            component.onChange();
            expect(component.isChecked).toBe(true)
        });

        it('should set IsChecked to false if model length not equal itemList length if groupData is false', () => {
            component.modelChange.emit = jasmine.createSpy();
            component.groupData = false;            
            component.ngOnInit();
            // 3 of 4 items have been added to model
            component.model = [1,2,3];
            component.onChange();
            expect(component.isChecked).toBe(false)
        });

        it('should set IsChecked to false if model length not equal items length if groupData is false', () => {
            component.modelChange.emit = jasmine.createSpy();
            component.groupData = true;            
            component.ngOnInit();
            // 3 of 4 items have been added to model
            component.model = [1,2,3];
            component.onChange();
            expect(component.isChecked).toBe(false)
        });
    });

    describe('onSelectAll', () => {
        
        it('should trigger modelChange.emit with component.value', () => {
            component.modelChange.emit = jasmine.createSpy();
            component.groupData = true; 
            component.ngOnInit();
            component.onSelectAll();                     
            expect(component.modelChange.emit).toHaveBeenCalledWith(mockListItems)
        });
    });

    describe('isItemSelected', () => {
        
        it('should set item with matching text to true', () => {
            component.groupData = false;
            component.model=[{text:'Item1'},]; 
            let isSelected = component.isItemSelected('Item1');                               
            expect(isSelected).toBe(true);
        });
    });

    describe('onItemSelect', () => {
        it('should set item with matching text to true', () => {
            component.multiSelectClick = false;
            component.onMultiSelectClick();
            expect(component.multiSelectClick).toBe(true);
        });
    });
});
