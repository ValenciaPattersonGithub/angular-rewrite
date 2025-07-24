import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { configureTestSuite } from '../../../configure-test-suite';
import { TranslateModule } from '@ngx-translate/core';
import { FeeListLocationComponent } from './fee-list-location.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FeeListLocationDTO, FeeListsService } from 'src/@shared/providers/fee-lists.service';
import { SimpleChanges, EventEmitter } from '@angular/core';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

let feeLists = [{
  Name: 'Denise-Location',
  FeeListId: 'Denise-Location'
},
{
  Name: 'PracticeDefault',
  FeeListId: 'PracticeDefault'
},
{
  Name: 'QA Fee List',
  FeeListId: 'QA Fee List',
}];


describe('FeeListLocationComponent', () => {
  let component: FeeListLocationComponent;
  let fixture: ComponentFixture<FeeListLocationComponent>;
  let feeListsInputMock = [];
  for (let i = 1; i < 4; i++) {
    feeListsInputMock.push({
      Name: "Fee List " + i,
      FeeListId: i,
      Locations: []
    });
  }

  let res = {
    Value: feeListsInputMock
  };

  let mocktoastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
  };

  let mockFeeListService = {
    FeeLists: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy().and.returnValue(res) }),
    get: jasmine.createSpy().and.returnValue({
      pipe: jasmine.createSpy().and.returnValue({
        type: "confirm",
        subscribe: () => { },
        filter: (f) => { return f }
      }),
    }),
  };
  let mocklocalize = {
    getLocalizedString: () => 'translated text'
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(), DropDownsModule, BrowserModule, ReactiveFormsModule
      ],
      providers: [
        { provide: FeeListsService, useValue: mockFeeListService },
        { provide: "toastrFactory", useValue: mocktoastrFactory },
        { provide: 'localize', useValue: mocklocalize },
        { provide: 'SoarConfig', useValue: mockSoarConfig },

      ],
      declarations: [FeeListLocationComponent]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(FeeListLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit -->', () => {
    it('should call the initialize method and set show fee list warning', () => {
      component.setShowFeeListWarning = jasmine.createSpy();
      component.ngOnInit();
      expect(component.setShowFeeListWarning).toHaveBeenCalled();
    });
    it('should call the initialize method and get Selected FeeList Name', () => {
      component.getSelectedFeeListName = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getSelectedFeeListName).toHaveBeenCalled();
    });
    it('should call the loadFeeListSelection method if it has locationFeeList', () => {
      component.locationFeeList = "1";
      component.loadFeeListSelection = jasmine.createSpy();
      component.ngOnInit();
      expect(component.loadFeeListSelection).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges -->', () => {
    it('should not call the location Fee List change method when no change made to the initial selection input variable', () => {
      let changes = {};
      spyOn(component, 'loadFeeListSelection');
      component.ngOnChanges(changes);
      expect(component.loadFeeListSelection).not.toHaveBeenCalled();
    });
    it('should call the loadFeeListSelection method when changes in locationFeeList', () => {
      let changes: SimpleChanges = {
        locationFeeList: {
          currentValue: 2,
          previousValue: 1,
          firstChange: false,
          isFirstChange: () => { return false }
        }
      }
      spyOn(component, 'loadFeeListSelection');
      component.ngOnChanges(changes);
      expect(component.loadFeeListSelection).toHaveBeenCalled();
    });
    it('should call the loadFeeListSelection method when changes in locationFeeList', () => {
      let changes: SimpleChanges = {
        location: {
          currentValue: { href: "feesLocation" },
          previousValue: { href: "" },
          firstChange: false,
          isFirstChange: () => { return false }
        }
      }
      spyOn(component, 'loadFeeListSelection');
      component.ngOnChanges(changes);
      expect(component.loadFeeListSelection).toHaveBeenCalled();
    });
  });

  describe('loadFeeListSelection -->', () => {
    it('should call feeListsService to get fee list data and execute success method', fakeAsync(() => {
      component.feeListList = [];
      component.handleLoadFeeListSuccess = jasmine.createSpy();
      mockFeeListService.get.and.returnValue(of(res));
      component.loadingFeeList = true;
      component.loadFeeListSelection();
      tick();
      expect(component.loadingFeeList).toBe(false);
      expect(mockFeeListService.get).toHaveBeenCalled();
      expect(component.handleLoadFeeListSuccess).toHaveBeenCalled();
    }));
    it('should call feeListsService to get fee list data and execute error method', fakeAsync(() => {
      component.feeListList = [];
      let errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
      });
      component.handleLoadFeeListError = jasmine.createSpy();
      mockFeeListService.get.and.returnValue(throwError(errorResponse));
      component.loadFeeListSelection();
      tick();
      expect(mockFeeListService.get).toHaveBeenCalled();
      expect(component.handleLoadFeeListError).toHaveBeenCalled();
    }));
    it('should not set the initial Fee List variable if currentValue is null', () => {
      component.getSelectedFeeListName = jasmine.createSpy();
      component.setShowFeeListWarning = jasmine.createSpy();
      component.feeListList = [{ Name: "Test", FeeListId: 1, DraftDate: "", Locations: [] }];
      component.loadFeeListSelection();
      expect(component.getSelectedFeeListName).toHaveBeenCalled();
      expect(component.setShowFeeListWarning).toHaveBeenCalled();
    });
  });

  describe('handleLoadFeeListSuccess', () => {
    it('should set feeList to data variable if res has data', () => {
      let feeListData: FeeListLocationDTO[] = [{ Name: "Name1", DraftDate: "", FeeListId: 1, Locations: [] }]
      let res: SoarResponse<FeeListLocationDTO[]> = { Value: feeListData };
     // let tempData = { feeListList: [], getSelectedFeeListName: () => { }, setShowFeeListWarning: () => { } }
      component.handleLoadFeeListSuccess(res);
      expect(component.feeListList?.length).toBeGreaterThan(0);
    })

    it('should not set feeList to data variable if res does not has data', () => {
      let res: SoarResponse<FeeListLocationDTO[]> = { Value: [] };
     // let tempData = { feeListList: [], getSelectedFeeListName: () => { }, setShowFeeListWarning: () => { } }
      component.handleLoadFeeListSuccess(res);
      expect(component.feeListList?.length).toEqual(0);
    })
  })

  describe('handleLoadFeeListError', () => {
    it('should call mocktoastrFactory error when handleLoadFeeListError called', () => {
      component.handleLoadFeeListError();
      expect(mocktoastrFactory.error).toHaveBeenCalled();
    })
  })

  describe('setShowFeeListWarning -->', () => {
    it('should set showFeeListWarning is true when locationFeeListName is none', () => {
      component.locationFeeListName = 'None';
      component.setShowFeeListWarning();
      expect(component.showFeeListWarning).toBe(true);
    });
    it('should set showFeeListWarning is false when locationFeeListName is other than none', () => {
      component.locationFeeListName = 'Test';
      component.setShowFeeListWarning();
      expect(component.showFeeListWarning).toBe(false);
    });
  })

  describe('getSelectedFeeListName -->', () => {
    it('should set locationFeeListName when locationFeeList match with fee List', () => {
      component.feeListList = [{ Name: "Test", FeeListId: 1, DraftDate: "", Locations: [] }];
      component.locationFeeList = "1";
      component.getSelectedFeeListName();
      expect(component.locationFeeListName).toEqual("Test");
    })
    it('should return "None" as locationFeeListName when locationFeeList match with fee List', () => {
      component.feeListList = [{ Name: "Test", FeeListId: 1, DraftDate: "", Locations: [] }];
      component.getSelectedFeeListName();
      expect(component.locationFeeListName).toEqual("None");
    })
  })

  describe('onFeeListChanged -->', () => {
    it('should not call markAsTouched when selectedItem not found', () => {
      let event = null;
      component.markAsTouched = jasmine.createSpy();
      component.onFeeListChanged(event);
      expect(component.markAsTouched).not.toHaveBeenCalled();
    })
    it('should call markAsTouched when selectedItem has data and emit data', () => {
      let event = null;
      component.selectedItem = { FeeListId: 1, Name: "Test" };
      component.markAsTouched = jasmine.createSpy();
      component.onFeeListChanged(event);
      expect(component.markAsTouched).toHaveBeenCalled();
    })
  })

  describe('writeValue -->', () => {
    it('should call loadFeeListSelection when writeValue called and set value for locationFeeList', () => {
      component.loadFeeListSelection = jasmine.createSpy();
      component.writeValue("1");
      expect(component.locationFeeList).toEqual("1");
      expect(component.loadFeeListSelection).toHaveBeenCalled();
    })
  })

  describe('markAsTouched -->', () => {
    it('should call onTouched if touched is false', () => {
      component.touched = false;
      component.onTouched = jasmine.createSpy();
      component.markAsTouched();
      expect(component.onTouched).toHaveBeenCalled();
    })
    it('should call onTouched if touched is true', () => {
      component.touched = true;
      component.onTouched = jasmine.createSpy();
      component.markAsTouched();
      expect(component.onTouched).not.toHaveBeenCalled();
    })
  })

  describe('registerOnChange -->', () => {
    it('should set onchange event', () => {
      let event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnChange(event);
      expect(component.onChange).not.toBeNull();
    })
  })

  describe('registerOnTouched -->', () => {
    it('should set onTouched event', () => {
      let event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnTouched(event);
      expect(component.onTouched).not.toBeNull();
    })
  })
});
