import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';

import { BarSolidAreaComponent } from './bar-solid-area.component';

describe('BarSolidAreaComponent', () => {
    let component: BarSolidAreaComponent;
    let fixture: ComponentFixture<BarSolidAreaComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [BarSolidAreaComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BarSolidAreaComponent);
        component = fixture.componentInstance;
        component.widgetData = {
            ActionId: 2715,
            BatchLoadId: 0,
            IsHidden: false,
            ItemId: 26,
            ItemType: "widget",
            Locations: [1],
            Position: null,
            Size: { Width: 2, Height: 2 },
            Template: "Unsubmitted-claims.component.html",
            Title: "Unsubmitted Claims",
        };
        component.barAreaList = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('setBarAreaList method ->', () => {
        it('setBarAreaList should be called with unsubmittedClaims', () => {
            component.setBarAreaList();
            expect(component.barAreaList.length).toEqual(2);
        });
        it('setBarAreaList should be called with pendingClaims', () => {
            component.widgetData.ItemId = 14;
            component.setBarAreaList();
            expect(component.barAreaList.length).toEqual(4);
        });
        it('setBarAreaList should be called with predermnation', () => {
            component.widgetData.ItemId = 27;
            component.setBarAreaList();
            expect(component.barAreaList.length).toEqual(3);
        });
        it('setBarAreaList should be called with statement widget', () => {
            component.widgetData.ItemId = 29;
            component.setBarAreaList();
            expect(component.barAreaList.length).toEqual(3);
        });
        it('setBarAreaList should be called with statement widget value', () => {
            component.widgetData.ItemId = 29;
            component.setBarAreaList();
            expect(component.barAreaList[0].value).toEqual('Processed');
        });
    });
});
