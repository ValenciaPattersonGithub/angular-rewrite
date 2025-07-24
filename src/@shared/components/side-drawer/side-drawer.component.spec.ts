import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideDrawerComponent, SideDrawerAnchor } from './side-drawer.component';

describe('SideDrawerComponent', () => {
    let component: SideDrawerComponent;
    let fixture: ComponentFixture<SideDrawerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SideDrawerComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SideDrawerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
 
    describe('input parameters ->', function () {
        it('should set heightStyle to 100% when height is not a positive number', function () {
            component.height = 0;
            expect(component.heightStyle).toEqual('100%');

            component.height = -1;
            expect(component.heightStyle).toEqual('100%');
        });

        it('should set heightStyle to the parameter value when height is a positive number', function () {
            component.height = 1;
            expect(component.heightStyle).toEqual('1px');

            component.height = 100;
            expect(component.heightStyle).toEqual('100px');
        });


        it('should set widthStyle to 100% when width is not a positive number', function () {
            component.width = 0;
            expect(component.widthStyle).toEqual('100%');

            component.width = -1;
            expect(component.widthStyle).toEqual('100%');
        });

        it('should set widthStyle to the parameter value when width is a positive number', function () {
            component.width = 1;
            expect(component.widthStyle).toEqual('1px');

            component.width = 100;
            expect(component.widthStyle).toEqual('100px');
        });


        it('should set partialAxis to true when height is a positive number and anchor is left or right', function () {
            component.anchor = SideDrawerAnchor.left;
            component.height = 1;
            expect(component.isPartialAxis).toBe(true);

            component.anchor = SideDrawerAnchor.right;
            component.height = 100;
            expect(component.isPartialAxis).toBe(true);
        });

        it('should set partialAxis to false when height is not a positive number or anchor is not left or right', function () {
            component.anchor = SideDrawerAnchor.left;
            component.height = 0;
            expect(component.isPartialAxis).toBe(false);

            component.anchor = SideDrawerAnchor.right;
            component.height = -5;
            expect(component.isPartialAxis).toBe(false);

            component.anchor = SideDrawerAnchor.top;
            component.height = 5;
            expect(component.isPartialAxis).toBe(false);

            component.anchor = SideDrawerAnchor.bottom;
            component.height = 1;
            expect(component.isPartialAxis).toBe(false);
        });


        it('should set marginStyle to 0 when height is not a positive number or anchor is not left or right', function () {
            component.anchor = SideDrawerAnchor.left;
            component.height = 0;
            expect(component.marginStyle).toBe('0');

            component.anchor = SideDrawerAnchor.left;
            component.height = -1;
            expect(component.marginStyle).toBe('0');

            component.anchor = SideDrawerAnchor.right;
            component.height = -5;
            expect(component.marginStyle).toBe('0');

            component.anchor = SideDrawerAnchor.top;
            component.height = 1;
            expect(component.marginStyle).toBe('0');

            component.anchor = SideDrawerAnchor.bottom;
            component.height = 1;
            expect(component.marginStyle).toBe('0');
        });

        it('should set marginStyle to negetive half height for top when height is a positive number and anchor is left or right', function () {
            component.anchor = SideDrawerAnchor.left;
            component.height = 10;
            expect(component.marginStyle).toBe('-5px 0 0 0');

            component.anchor = SideDrawerAnchor.left;
            component.height = 100;
            expect(component.marginStyle).toBe('-50px 0 0 0');

            component.anchor = SideDrawerAnchor.right;
            component.height = 20;
            expect(component.marginStyle).toBe('-10px 0 0 0');

            component.anchor = SideDrawerAnchor.right;
            component.height = 36;
            expect(component.marginStyle).toBe('-18px 0 0 0');
        });


        it('should set marginStyle to 0 when width is not a positive number or anchor is not top or bottom', function () {
            component.anchor = SideDrawerAnchor.bottom;
            component.width = 0;
            expect(component.marginStyle).toBe('0');

            component.anchor = SideDrawerAnchor.bottom;
            component.width = -1;
            expect(component.marginStyle).toBe('0');

            component.anchor = SideDrawerAnchor.top;
            component.width = -5;
            expect(component.marginStyle).toBe('0');

            component.anchor = SideDrawerAnchor.left;
            component.width = 1;
            expect(component.marginStyle).toBe('0');

            component.anchor = SideDrawerAnchor.right;
            component.width = 1;
            expect(component.marginStyle).toBe('0');
        });

        it('should set marginStyle to negetive half width for right when width is a positive number and anchor is top or bottom', function () {
            component.anchor = SideDrawerAnchor.top;
            component.width = 10;
            expect(component.marginStyle).toBe('0 0 0 -5px');

            component.anchor = SideDrawerAnchor.top;
            component.width = 100;
            expect(component.marginStyle).toBe('0 0 0 -50px');

            component.anchor = SideDrawerAnchor.bottom;
            component.width = 20;
            expect(component.marginStyle).toBe('0 0 0 -10px');

            component.anchor = SideDrawerAnchor.bottom;
            component.width = 36;
            expect(component.marginStyle).toBe('0 0 0 -18px');
        });
    });
});