import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimAlertHistoryModalComponent } from './claim-alert-history-modal.component';
import { CLAIM_ALERT_HISTORY_MODAL_DATA, ClaimAlertHistoryModalRef, EClaimEventDTO } from '../claim-alert-history.models';
import { ClaimAlertHistoryHttpService } from '../claim-alert-history-http.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import cloneDeep from 'lodash/cloneDeep';
import { LocationTimeService } from 'src/practices/common/providers';
import { Timezone } from 'src/practices/common/models/timezone';

describe('ClaimAlertHistoryModalComponent', () => {
  let component: ClaimAlertHistoryModalComponent;
  let fixture: ComponentFixture<ClaimAlertHistoryModalComponent>;
  let claimAlertHistories: EClaimEventDTO[];
  let claimAlertHistoryResolve;
  let mockClaimAlertHistoryHttpService;
  let mockClaimAlertHistoryModalData;
  let mockLocationTimeService;
  let mockRef;
  let mockToastrFactory;
  let locationTimeZone:Timezone

  beforeEach(()=> {

    locationTimeZone = new Timezone('Mountain Standard Time', 'Mountain Time Zone (Denver)', -7, 'MST', 'MDT', 'America/Denver');

    mockLocationTimeService = {
      findTimezoneByValue: jasmine.createSpy().and.returnValue(locationTimeZone),
    }
    claimAlertHistories = [
      {EClaimEventId: '136', Message:'something happened', EventTimeUtc: new Date('2023-03-07 14:21:31.553z')},
      {EClaimEventId: '135', Message:'Exception during eClaim submission', EventTimeUtc: '2023-03-06 14:21:31.553z'},
      {EClaimEventId: '134', Message:'Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.', EventTimeUtc: '2023-03-04 14:21:31.553z'},
      {EClaimEventId: '133', Message:'Exception during eClaim submission: OopFactory.X12.Parsing.Model.ElementValidationException and then Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.  And then another Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.', EventTimeUtc: '2023-03-08 14:21:31.553z'},
    
      {EClaimEventId: '130', Message:'something else  happened', EventTimeUtc: '2023-03-07 14:21:31.553z'},
      {EClaimEventId: '129', Message:'or Exception during eClaim submission', EventTimeUtc: '2023-03-06 14:21:31.553z'},
      {EClaimEventId: '128', Message:'or Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.', EventTimeUtc: '2023-03-04 14:21:31.553z'},
      {EClaimEventId: '127', Message:'or Exception during eClaim submission: OopFactory.X12.Parsing.Model.ElementValidationException and then Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.  And then another Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.', EventTimeUtc: '2023-03-08 14:21:31.553z'},
    
      {EClaimEventId: '126', Message:'and then else something happened', EventTimeUtc: '2023-03-07 14:21:31.553z'},
      {EClaimEventId: '125', Message:'maybe an Exception during eClaim submission', EventTimeUtc: '2023-03-06 14:21:31.553z'},
      {EClaimEventId: '124', Message:'maybe a Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.', EventTimeUtc: '2023-03-04 14:21:31.553z'},
      {EClaimEventId: '123', Message:'or maybe Exception during eClaim submission: OopFactory.X12.Parsing.Model.ElementValidationException and then Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.  And then another Claim ID c63f1105-1fd3-4482-ba13-f60fc50ffccc has been queued for submission.', EventTimeUtc: '2023-03-08 14:21:31.553z'},
    ]
    claimAlertHistoryResolve= {Value: claimAlertHistories};

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockClaimAlertHistoryModalData = {
      cancel: 'Cancel',
      claimTimezone: 'Pacific Standard Time' ,
      claimId: '123456'
    }
    //Pacific Standard Time

    mockClaimAlertHistoryHttpService = {
      requestEClaimEvents:jasmine.createSpy('ClaimAlertHistoryHttpService.requestEClaimEvents').and.returnValue(
          of({
              Value: claimAlertHistories
          })),  
        }

    mockRef = {}
     
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],      
      declarations: [ ClaimAlertHistoryModalComponent ],
      providers:[
        { provide: 'toastrFactory', useValue: mockToastrFactory },        
        { provide: ClaimAlertHistoryModalRef, useValue: mockRef },       
        { provide: LocationTimeService, useValue: mockLocationTimeService },
        { provide: CLAIM_ALERT_HISTORY_MODAL_DATA, useValue: mockClaimAlertHistoryModalData },
        { provide: 'SoarConfig', useValue: {} },
        { provide: ClaimAlertHistoryHttpService, useValue: mockClaimAlertHistoryHttpService },   
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimAlertHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
             
    beforeEach(() => {
        spyOn(component, 'getClaimAlertHistory');
    });

    it('should load properties with data passed by ClaimAlertHistoryModalData', () => {
        component.ngOnInit();
        expect(component.claimId).toEqual(component.data.claimId)  
        expect(component.claimTimezone).toEqual(component.data.claimTimezone)    
    }); 

    it('should call getClaimAlertHistory with component.claimId', () => {
      component.ngOnInit();
      expect(component.getClaimAlertHistory).toHaveBeenCalledWith(component.claimId)     
    });        
  }); 

     
  describe('component.getClaimAlertHistory', () => {
    const claimIdParam = '123456'         
    beforeEach(() => {
      component.claimAlertHistory = cloneDeep(claimAlertHistories)
      spyOn(component, 'setFormattedEventTime');
    });

    it('should call ClaimAlertHistoryHttpService.requestEClaimEvents', () => {      
      component.getClaimAlertHistory(claimIdParam); 
      expect(mockClaimAlertHistoryHttpService.requestEClaimEvents).toHaveBeenCalledWith({claimId: claimIdParam})    
    }); 

    it('should call setFormattedEventTime for claimAlertHistory', () => {
      component.getClaimAlertHistory(claimIdParam);
      expect(component.setFormattedEventTime).toHaveBeenCalled(); 
    });
  }); 

  
  describe('component.setFormattedEventTime', () => {
    
    it('should set FormattedEventTime on each claim alert history', () => {
      let claimHistories: EClaimEventDTO[] = [
        {EClaimEventId: '136', Message:'something happened', EventTimeUtc: moment('2023-03-07 14:21:31.553z' )}
      ];
      expect(claimHistories[0].FormattedEventTime).toEqual(undefined)    
      component.setFormattedEventTime(claimHistories);
      expect(claimHistories[0].FormattedEventTime).toEqual('2023-03-07T07:21:31-07:00'); 
      
    });
  }); 
}); 
