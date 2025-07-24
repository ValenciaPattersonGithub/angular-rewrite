import { Component, OnInit, Inject } from '@angular/core';
import { PatientCommunicationCenterService } from '../../common/http-providers/patient-communication-center.service';
import { CommunicationEvent, CommunicationType } from '../../common/models/enums';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import { PatientCommunication } from 'src/patient/common/models/patient-communication.model';
import { TranslateService } from '@ngx-translate/core';
import { OrderByPipe } from 'src/@shared/pipes';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'communication-todo-collapsible-section',
  templateUrl: './communication-todo-collapsible-section.component.html',
  styleUrls: ['./communication-todo-collapsible-section.component.scss']
})
export class CommunicationTodoCollapsibleSectionComponent implements OnInit {
  defaultOrderKey = 'DueDate';
  toDoCommunications: any[];
  showMore: any = 'more';
  completeShowMore: any = 'more';
  completedToDoCommunications: any[];
  private unsubscribe$: Subject<any> = new Subject<any>();
  CommunicationType = CommunicationType;
  inCompleteToDoCount: number;
  sortDirectionAsce: any = 1;
  sortDirectionDesc: any = -1;
  noDueDateCommunications: any[];
  soarAuthCommDeleteKey = 'soar-per-pcomm-delete';
  hasDeleteAccess: any;
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  expandedItem = 'ToDoPending';
  isModified: any;
  editedBy: any;

  constructor(
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    @Inject('$routeParams') private route,
    private translate: TranslateService,
    @Inject('toastrFactory') private toastrFactory,
    public communicationConstants: CommunicationConstants,
    @Inject('patSecurityService') private patSecurityService,
    private confirmationModalService: ConfirmationModalService,
    private datepipe: DatePipe) { }

  ngOnInit() {
    this.initializeArrays();
    this.patientCommunicationCenterService.getCommunicationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(
      (event: CommunicationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case CommunicationEvent.NewToDoCommunication:
              if (event.data) {
                this.handleNewToDoCommunicationEvent(event.data);
              }
              break;
            case CommunicationEvent.UpdateToDoCommunication:
              if (event.data) {
                this.getToDoCommunications();
              }
              break;
            case CommunicationEvent.GetToDoCommunications:
              this.getToDoCommunications();
              break;
          }
        }
      });
    this.authAccess();
    this.getToDoCommunications();
  }
  initializeArrays = () => {
    this.toDoCommunications = [];
    this.completedToDoCommunications = [];
    this.noDueDateCommunications = [];
  }
  getToDoCommunications = () => {
    this.patientCommunicationCenterService.getPatientCommunicationToDoByPatientId(this.route.patientId)
      .subscribe((communications: any) => {
        if (communications) {
          this.getInCompleteToDoCommunications(communications);
          this.getCompletedToDoCommunications(communications);
          if (this.toDoCommunications) {
            this.inCompleteToDoCount = this.toDoCommunications.length;
            this.patientCommunicationCenterService.inCompleteToDoCounts = this.inCompleteToDoCount;
          }
        }
      },
        (err: any) => { });
  }
  handleNewToDoCommunicationEvent = (communication: PatientCommunication) => {
    if (communication) {
      this.toDoCommunications.push(communication);
      this.getInCompleteToDoCommunications(this.toDoCommunications);
      if (this.toDoCommunications) {
        this.inCompleteToDoCount = this.toDoCommunications.length;
        this.patientCommunicationCenterService.inCompleteToDoCounts = this.inCompleteToDoCount;
      }
    }
  }
  labelShowMore = (event: any) => {
    if (event.target.innerText === 'more') {
      this.showMore = this.translate.instant('less');
    } else {
      this.showMore = this.translate.instant('more');
    }
  }
  applyOrderByPipe = (communications: any, sortOrder: any) => {
    const orderPipe = new OrderByPipe();
    return orderPipe.transform(communications, { sortColumnName: this.defaultOrderKey, sortDirection: sortOrder });
  }
  isIncompleteToDoChecked = (event: any, communication: PatientCommunication) => {
    if (event.currentTarget.checked) {
      communication.IsComplete = true;
      this.patientCommunicationCenterService
        .updateToDoPatientCommunication(communication.PatientCommunicationId, communication)
        .subscribe((data: any) => this.updateToDoCommunicationSuccess(data), error => this.updateToDoCommunicationFailure());
    }
  }
  updateToDoCommunicationSuccess = (res: any) => {
    if (res) {
      this.getToDoCommunications();
    }
    this.toastrFactory.success(
      this.translate.instant('The record of this communication has been updated.'),
      this.translate.instant('Success'));
  }
  updateToDoCommunicationFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('There was an error and this communication was not updated.'),
      this.translate.instant('Server Error'));
  }
  getUserName = (communications: any) => {
    communications.forEach((item: any, index: any) => {
      item.AddedBy = this.patientCommunicationCenterService.getUserdetail(item.CreatedBy ?
        item.CreatedBy : item.UserModified, true);
      item.IsDisabled = false;
    });
  }
  isCompletedToDoChecked = (event: any, communication: PatientCommunication) => {
    if (!event.currentTarget.checked) {
      communication.IsComplete = false;
      this.patientCommunicationCenterService
        .updateToDoPatientCommunication(communication.PatientCommunicationId, communication)
        .subscribe((data: any) => this.updateToDoCommunicationSuccess(data), error => this.updateToDoCommunicationFailure());
      this.showMore = 'more';
    }
  }
  getInCompleteToDoCommunications = (communications: any) => {
    if (communications) {
      this.toDoCommunications = communications.filter(
        (x: any) => x.IsComplete === false);
      if (this.toDoCommunications.length) {
        this.getUserName(this.toDoCommunications);
        this.toDoCommunications = [... this.applyOrderByPipe(this.toDoCommunications, this.sortDirectionAsce)];
        this.toDoCommunications.forEach((item: any, index: any) => {
          item.EditedBy = this.editInCompleteCommunicationUserDetails(item);
        });
        this.completeShowMore = 'more';
      }
    }
  }
  getCompletedToDoCommunications = (communications: any) => {
    if (communications) {
      this.completedToDoCommunications = communications.filter(
        (x: any) => x.IsComplete === true && x.DueDate !== null);
      this.noDueDateCommunications = communications.filter(
        (x: any) => x.IsComplete === true && x.DueDate === null);
      if (this.completedToDoCommunications.length) {
        this.getUserName(this.completedToDoCommunications);
        this.completedToDoCommunications = [... this.applyOrderByPipe(this.completedToDoCommunications, this.sortDirectionDesc)];
        if (this.completedToDoCommunications.length) {
          this.noDueDateCommunications.forEach((item: any, index: any) => {
            this.completedToDoCommunications.push(item);
          });
        }
        this.completedToDoCommunications.forEach((item: any, index: any) => {
          item.EditedBy = this.editInCompleteCommunicationUserDetails(item);
        });
      } else if (this.noDueDateCommunications.length) {
        this.getUserName(this.noDueDateCommunications);
        this.completedToDoCommunications = [... this.applyOrderByPipe(this.noDueDateCommunications, this.sortDirectionDesc)];
        this.completedToDoCommunications.forEach((item: any, index: any) => {
          item.EditedBy = this.editInCompleteCommunicationUserDetails(item);
        });
      }
    }
  }
  labelCompleteShowMore = (event: any) => {
    if (event.target.innerText === 'more') {
      this.completeShowMore = this.translate.instant('less');
    } else {
      this.completeShowMore = this.translate.instant('more');
    }
  }
  deleteToDoCommunication = (communication: PatientCommunication) => {
    if (this.hasDeleteAccess) {
      this.openConfirmationModal(this.communicationConstants.deleteToDoConfirmationModalData, communication);
    }
  }
  deleteToDoCommunicationSuccess = () => {
    this.getToDoCommunications();
    this.toastrFactory.success(
      this.translate.instant('Successfully deleted the communication.'),
      this.translate.instant('Success'));
  }
  deleteToDoCommunicationFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('Failed to delete the communication. Try again.'),
      this.translate.instant('Server Error'));
  }
  authAccess = () => {
    this.hasDeleteAccess = this.authAccessByType(this.soarAuthCommDeleteKey);
  }
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  }
  openConfirmationModal = (data, communication) => {
    this.confirmationRef = this.confirmationModalService.open({
      data
    });
    this.confirmationModalSubscription = this.confirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    ).subscribe((events) => {
      switch (events.type) {
        case 'confirm':
          this.patientCommunicationCenterService
            .deletePatientCommunicationById(communication.PatientCommunicationId,
              communication.PersonAccountNoteId ? communication.PersonAccountNoteId : 0)
            .subscribe(() => this.deleteToDoCommunicationSuccess(), error => this.deleteToDoCommunicationFailure());
          this.confirmationRef.close();
          break;
        case 'close':
          this.confirmationRef.close();
          break;
      }
    });
  }
  editInCompleteCommunication = (communication: any, isEdit: any) => {
    communication.IsDisabled = isEdit;
    this.patientCommunicationCenterService
      .setCommunicationEvent({
        eventtype: CommunicationEvent.EditInCompleteCommunication,
        data: { Communication: communication, IsEdit: true }
      });
  }
  editInCompleteCommunicationUserDetails = (communication: any) => {
    const dateModified = this.datepipe.transform(communication.DateModified, 'MM/dd/yyyy:HH:mm:ss');
    const commDate = this.datepipe.transform(communication.CommunicationDate, 'MM/dd/yyyy:HH:mm:ss');
    communication.IsModified = (dateModified > commDate);
    if (communication.IsModified) {
      communication.EditedBy = this.patientCommunicationCenterService.
        getUserdetail(communication.UserModified, false);
      const formattedModifiedDate = this.datepipe.transform(communication.DateModified, 'MM/dd/yyyy');
      communication.EditedBy = `${communication.EditedBy ? communication.EditedBy : ''} ${' on '} ${formattedModifiedDate ? formattedModifiedDate : ''} `;
      return communication.EditedBy;
    }
  }
}
