import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';
import { EventEmitter } from '@angular/core';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should set selectedBadgeIndex in ngOnInit', () => {
      component.activeFltrTab = 1;
      component.ngOnInit();
      expect(component.selectedBadgeIndex).toBe(1);
    });
  });

  describe('activateFltrTab ->', () => {
    it('should set selectedBadgeIndex in activateFltrTab', () => {
      component.activateFltrTab(2);
      expect(component.selectedBadgeIndex).toBe(2);
    });
  });

  describe('registerOnChange -->', () => {
    it('should set onchange event', () => {
      const event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnChange(event);
      expect(component.onChange).not.toBeNull();
    });
  });

  describe('registerOnTouched -->', () => {
    it('should set onTouched event', () => {
      const event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnTouched(event);
      expect(component.onTouched).not.toBeNull();
    });
  });

});
