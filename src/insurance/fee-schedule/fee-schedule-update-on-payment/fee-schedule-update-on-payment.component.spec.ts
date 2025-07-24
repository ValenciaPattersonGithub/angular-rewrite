import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeScheduleUpdateOnPaymentComponent } from './fee-schedule-update-on-payment.component';
import { FEE_SCHEDULE_UPDATE_MODAL_DATA, FeeScheduleUpdateModalRef } from './fee-schedule-update-modal.service';
import { of } from 'rxjs';
import { FeeScheduleHttpService } from 'src/@core/http-services/fee-schedule-http.service';
import { TranslateModule} from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeeScheduleDto, FeeScheduleGroupDto } from '../fee-schedule-dtos';
import * as cloneDeep from 'lodash/cloneDeep';

describe('FeeScheduleUpdateOnPaymentComponent', () => {
  let component: FeeScheduleUpdateOnPaymentComponent;
  let fixture: ComponentFixture<FeeScheduleUpdateOnPaymentComponent>;
  let mockDialogRef = { events: { next: jasmine.createSpy() } };
  let mockModalData;
  let mockPatSecurityService;
  let mockToastrFactory;
  let mockReferenceDataService;
  let mockFeeScheduleHttpService;
  let mockFeeScheduleList: FeeScheduleDto[] = [
    {
      FeeScheduleId: '123', FeeScheduleGroupDtos: [
        {
          FeeScheduleGroupId: '122',
          FeeScheduleGroupDetails: [
            {
              AllowedAmount: 100,
              DataTag: '',
              DateModified: '',
              FailedMessage: '',
              FeeScheduleGroupDetailId: '123',
              FeeScheduleGroupId: '123',
              ObjectState: '',
              ServiceCodeId: '123',
              UserModified: '',
            },
          ],
          DataTag: '',
          DateModified: '',
          FailedMessage: '',
          FeeScheduleId: '',
          LocationIds: [],
          ObjectState: '',
          SortOrder: 0,
          UserModified: ''
        },
      ], FeeScheduleDetailDtos: [],
      DataTag: '',
      DateModified: '',
      FeeScheduleName: '',
      UserModified: ''
    },
    {
      FeeScheduleId: '345', FeeScheduleGroupDtos: [], FeeScheduleDetailDtos: [],
      DataTag: '',
      DateModified: '',
      FeeScheduleName: '',
      UserModified: ''
    },
  ];
    
  beforeEach(async () => {
    mockModalData = {
      updatedAllowedAmounts: [
        {
          FeeScheduleGroupDetailId: '123',
          UpdatedAmount: 200,
          ServiceCodeId: '123',
          ClaimLocationId: 0,
          FeeScheduleId: '',
          FeeScheduleGroupId: '122',
          CurrentAmount: 0
        },
      ],
      feeScheduleDtos: mockFeeScheduleList,
    };
    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage').and.returnValue('Not Authorized')
    };

    mockToastrFactory = { error: jasmine.createSpy(), success: jasmine.createSpy() };
    mockReferenceDataService = {
      getData: function () {
        return Promise.resolve([{ LocationId: 12 }]);
      },
      entityNames: {
        locations: [],
      },
    };

    mockFeeScheduleHttpService = {
      requestFeeScheduleById: jasmine.createSpy().and.returnValue(of({ Value: mockFeeScheduleList })),
      updateFeeSchedule: jasmine.createSpy().and.returnValue(of({ Value: mockFeeScheduleList[0]})),
 
    };
    
    await TestBed.configureTestingModule({
      imports: [
                      HttpClientTestingModule,
                      TranslateModule.forRoot()
                  ],
      declarations: [ FeeScheduleUpdateOnPaymentComponent ],
      providers: [
        { provide: FeeScheduleUpdateModalRef, useValue: mockDialogRef },
        { provide: FEE_SCHEDULE_UPDATE_MODAL_DATA, useValue: mockModalData },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: FeeScheduleHttpService, useValue: mockFeeScheduleHttpService },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeScheduleUpdateOnPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture = TestBed.createComponent(FeeScheduleUpdateOnPaymentComponent);
    component = fixture.componentInstance;
    component.data = { updatedAllowedAmounts: [] };
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {    
    beforeEach(() => {   
      spyOn(component, 'loadGridData');   
      spyOn(component, 'getFeeSchedules').and.returnValue(of(mockFeeScheduleList));
    });

    it('should call getFeeSchedules', () => { 
      component.ngOnInit();
      expect(component.getFeeSchedules).toHaveBeenCalled();
    });

    it('should set feeScheduleGroupDtos and feeScheduleDetailDtos', () => {      
      component.ngOnInit();
      expect(component.feeScheduleDtos).toEqual(mockFeeScheduleList);      
    });

    it('should call loadGridData', () => {
      component.ngOnInit();
      expect(component.loadGridData).toHaveBeenCalled(); 
    });

    it('should call toastrFactory.error and closeModal if not authorized on init', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation.and.returnValue(false);
      spyOn(component, 'closeModal');
      component.ngOnInit();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(component.closeModal).toHaveBeenCalled();
    });
  });

  describe('loadGridData', () => {
    it('should set feeScheduleGroupDetailUpdateDtos', async() => {
      component.feeScheduleDtos = cloneDeep(mockFeeScheduleList);
      component.updatedAllowedAmountData = [
        {
          FeeScheduleGroupDetailId: '123',
          UpdatedAmount: 200,
          ServiceCodeId: '123',
          ClaimLocationId: 0,
          FeeScheduleId: '',
          FeeScheduleGroupId: '122',
          CurrentAmount: 0
        },
      ]
      const feeScheduleGroupDetailUpdateDtos = await component.loadGridData();
      console.log(feeScheduleGroupDetailUpdateDtos);
    });
  });

  describe('validateSave', () => {    
    it('should disable save button if nothing is selected', () => {
      component.feeScheduleGroupDetailUpdateDtos = [
        { IsSelected: false } as any,
        { IsSelected: false } as any
      ];
      component.validateSave();
      expect(component.disableSaveButton).toBe(true);
    });

    it('should enable save button if at least one is selected', () => {
      component.feeScheduleGroupDetailUpdateDtos = [
        { IsSelected: false } as any,
        { IsSelected: true } as any
      ];
      component.validateSave();
      expect(component.disableSaveButton).toBe(false);
    });
  });

  describe('toggleSelectAll', () => {
    it('should select all when toggleSelectAll(true) is called', () => {
      component.feeScheduleGroupDetailUpdateDtos = [
        { IsSelected: false } as any,
        { IsSelected: false } as any
      ];
      component.toggleSelectAll(true);
      expect(component.feeScheduleGroupDetailUpdateDtos.every(i => i.IsSelected)).toBe(true);
    });
  });

  it('should call updateFeeSchedule for each updated fee schedule', (done) => {
    component.feeScheduleDtos = [
      {
        FeeScheduleId: '1',
        FeeScheduleGroupDtos: [
          {
            FeeScheduleGroupDetails: [
              { ObjectState: 'Update' }
            ]
          }
        ]
      } as any
    ];
    spyOn(component, 'filterForUpdatedFeeSchedules').and.returnValue(component.feeScheduleDtos);
    component.updateFeeSchedules().subscribe(() => {
      expect(mockFeeScheduleHttpService.updateFeeSchedule).toHaveBeenCalled();
      done();
    });
  });

  describe('closeModal', () => {
    it('should emit closeModal event', () => {
      component.closeModal({});
      expect(mockDialogRef.events.next).toHaveBeenCalledWith({ type: 'close', data: null });
    });
  });

  describe('confirmModal', () => {
    it('should emit confirmModal event', () => {
      component.confirmModal({});
      expect(mockDialogRef.events.next).toHaveBeenCalledWith({ type: 'confirm'});
    });
  }); 
  
  describe('getLocationNames', () => {
     it('getLocationNames should join location names with newline', () => {
      const locations = [{ LocationName: 'ALocation' }, { LocationName: 'BLocation' }];
      expect(component.getLocationNames(locations)).toBe('ALocation\nBLocation');
    });
  });

  describe('filterForUpdatedFeeSchedules', () => {
    beforeEach(() => {
      component.feeScheduleDtos = [
        {
          FeeScheduleId: '1',
          FeeScheduleGroupDtos: [
            {
              FeeScheduleGroupId: 'g1',
              FeeScheduleGroupDetails: [
                { FeeScheduleGroupDetailId: 'gd1', AllowedAmount: 100 }
              ],
              ObjectState: undefined
            }
          ],
          FeeScheduleDetailDtos: [],
          
        } as any,
        {
          FeeScheduleId: '2',
          FeeScheduleGroupDtos: [
            {
              FeeScheduleGroupId: 'g2',
              FeeScheduleGroupDetails: [
                { FeeScheduleGroupDetailId: 'gd2', AllowedAmount: 300 }
              ],
              ObjectState: undefined
            }
          ],
          FeeScheduleDetailDtos: [],
          
        } as any
      ];
      component.feeScheduleGroupDetailUpdateDtos = [
        {
          IsSelected: true,
          FeeScheduleId: '1',
          FeeScheduleGroupId: 'g1',
          FeeScheduleGroupDetailId: 'gd1',
          UpdatedAmount: 200,
          ServiceCodeId: 'svc1'
        } as any,
        {
          IsSelected: false,
          FeeScheduleId: '2',
          FeeScheduleGroupId: 'g2',
          FeeScheduleGroupDetailId: 'gd2',
          UpdatedAmount: 325,
          ServiceCodeId: 'svc2'
        } as any
      ];
    });

    it('should update group details and return only FeeScheduleGroupDetails that are selected', () => {
      component.feeScheduleGroupDetailUpdateDtos[0].IsSelected = true;
      component.feeScheduleGroupDetailUpdateDtos[1].IsSelected = false;

      const result = component.filterForUpdatedFeeSchedules();
      
      expect(result.length).toBe(1);
      const updatedGroupDetail = component.feeScheduleDtos[0].FeeScheduleGroupDtos[0].FeeScheduleGroupDetails[0];
      expect(updatedGroupDetail.AllowedAmount).toBe(200);
      expect(updatedGroupDetail.ObjectState).toBe('Update');
      expect(component.feeScheduleDtos[0].FeeScheduleGroupDtos[0].ObjectState).toBe('Update');
    });

    it('should set object State to Add for selected FeeScheduleDetails and set object State to Update for FeeScheduleGroup based on existing group detail ', () => {
      component.feeScheduleGroupDetailUpdateDtos[0].IsSelected = true;
      component.feeScheduleGroupDetailUpdateDtos[1].IsSelected = false;
      component.feeScheduleGroupDetailUpdateDtos[0].FeeScheduleGroupDetailId = '';
      const result = component.filterForUpdatedFeeSchedules();
      
      expect(result.length).toBe(1);
      // new FeeScheduleGroupDetails added to group
      expect(result[0].FeeScheduleGroupDtos[0].FeeScheduleGroupDetails[1].AllowedAmount).toBe(200);
      expect(result[0].FeeScheduleGroupDtos[0].FeeScheduleGroupDetails[1].ObjectState).toBe('Add');
      // new FeeScheduleDetailDtos added to FeeSchedule
      const addedDetail = component.feeScheduleDtos[0].FeeScheduleDetailDtos[0];
      expect(addedDetail.ObjectState).toBe('Add');
      // fee schedule group should be marked as updated
      expect(component.feeScheduleDtos[0].FeeScheduleGroupDtos[0].ObjectState).toBe('Update');
    });
  });

 
});
