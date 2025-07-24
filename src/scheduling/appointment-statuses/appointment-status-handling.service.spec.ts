import { TestBed, async } from '@angular/core/testing';
import { AppointmentStatusHoverComponent } from 'src/scheduling/appointment-statuses/appointment-status-hover/appointment-status-hover.component';
import { MicroServiceApiService } from 'src/security/providers';
import { AppointmentStatusDataService } from 'src/scheduling/appointment-statuses/appointment-status-data.service';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { AppointmentStatusHandlingService } from './appointment-status-handling.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('AppointmentStatusHandlingService', () => {

    const mockLocalizeService: any = {
        getLocalizedString: () => 'translated text'
    };

    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    let mockPatientHttpService: PatientHttpService;
    let mockAppointmentStatusHandlingService: AppointmentStatusHandlingService;
    let mockAppointmentStatusDataService: AppointmentStatusDataService;
    const mockSoarConfigService = {};
    const mockMicroServiceApiUrlConfig = {};
    const mockMicroServiceApiService = {
        enterpriseApiUrl: 'mockEntApiUrl'
    };

    let datePipe = new DatePipe('en');

    let appointment: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            declarations: [AppointmentStatusHoverComponent],
            providers: [AppointmentStatusHandlingService,
                AppointmentStatusDataService,
                PatientHttpService,
                DatePipe,
                { provide: 'SoarConfig', useValue: mockSoarConfigService },
                { provide: 'MicroServiceApiUrlConfig', useValue: mockMicroServiceApiUrlConfig },
                { provide: MicroServiceApiService, useValue: mockMicroServiceApiService },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory }
            ]
        });

        mockPatientHttpService = TestBed.inject(PatientHttpService);
        mockAppointmentStatusHandlingService = TestBed.inject(AppointmentStatusHandlingService);
        mockAppointmentStatusDataService = TestBed.inject(AppointmentStatusDataService);
        
        appointment = {
            Data: {
                AppointmentId: 1,
                Status: 6,
                StartTime: '2021-06-11 17:30:00.0000000',
                Patient: {
                    HasRunningAppointment: false
                }
            }
        };
    }));

    describe('setSelectedValueAndIconOnLoadOfAppointment', () => {

        it('statusIsSetToInReceptionForPreviousDate', function () {
            //Arrange
            //set date to past date
            var currentDate = new Date();
            var previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 6;
            appointment.Data.StartTime = datePipe.transform(previousDate, "yyyy-MM-dd") + ' ' + '17:30:00.0000000';

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('In Reception');
            expect(selectedIcon).toEqual('far fa-watch');
        });

        it('statusIsSetToCompletedForPreviousDate', function () {
            //Arrange
            //set date to past date
            var currentDate = new Date();
            var previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = datePipe.transform(previousDate, "yyyy-MM-dd") + ' ' + '17:30:00.0000000';

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Completed');
            expect(selectedIcon).toEqual('far fa-calendar-check');
        });

        it('statusIsSetToInTreatmentForPreviousDate', function () {
            //Arrange
            //set date to past date
            var currentDate = new Date();
            var previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 4;
            appointment.Data.StartTime = datePipe.transform(previousDate, "yyyy-MM-dd") + ' ' + '17:30:00.0000000';

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('In Treatment');
            expect(selectedIcon).toEqual('fas fa-user-md');
        });

        it('statusIsSetToReadyForCheckoutForPreviousDate', function () {
            //Arrange
            //set date to past date
            var currentDate = new Date();
            var previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 5;
            appointment.Data.StartTime = datePipe.transform(previousDate, "yyyy-MM-dd") + ' ' + '17:30:00.0000000';

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Ready for Check out');
            expect(selectedIcon).toEqual('far fa-shopping-cart');
        });

        it('statusIsSetToUnconfirmedForPreviousDate', function () {
            //Arrange
            //set date to past date
            var currentDate = new Date();
            var previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 0;
            appointment.Data.StartTime = datePipe.transform(previousDate, "yyyy-MM-dd") + ' ' + '17:30:00.0000000';

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Late');
            expect(selectedIcon).toEqual('fas fa-exclamation');
        });

        it('statusIsSetToReminderSentForPreviousDate', function () {
            //Arrange
            //set date to past date
            var currentDate = new Date();
            var previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 1;
            appointment.Data.StartTime = datePipe.transform(previousDate, "yyyy-MM-dd") + ' ' + '17:30:00.0000000';

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Late');
            expect(selectedIcon).toEqual('fas fa-exclamation');
        });


        it('statusIsSetToConfirmedForPreviousDate', function () {
            //Arrange
            //set date to past date
            var currentDate = new Date();
            var previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 2;
            appointment.Data.StartTime = datePipe.transform(previousDate, "yyyy-MM-dd") + ' ' + '17:30:00.0000000';

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Late');
            expect(selectedIcon).toEqual('fas fa-exclamation');
        });

        it('statusIsSetToInReceptionForTodayOnLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 6;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('In Reception');
            expect(selectedIcon).toEqual('far fa-watch');
        });

        it('statusIsSetToCompletedForTodayOnLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Completed');
            expect(selectedIcon).toEqual('far fa-calendar-check');
        });

        it('statusIsSetToInTreatmentForTodayOnLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 4;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('In Treatment');
            expect(selectedIcon).toEqual('fas fa-user-md');
        });

        it('statusIsSetToReadyForCheckoutForTodayOnLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 5;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Ready for Check out');
            expect(selectedIcon).toEqual('far fa-shopping-cart');
        });

        it('statusIsSetToUnconfirmedForTodayOnLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 0;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Late');
            expect(selectedIcon).toEqual('fas fa-exclamation');
        });

        it('statusIsSetToReminderSentForTodayOnLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 1;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Late');
            expect(selectedIcon).toEqual('fas fa-exclamation');
        });


        it('statusIsSetToConfirmedForTodayOnLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 2;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Late');
            expect(selectedIcon).toEqual('fas fa-exclamation');
        });

        it('statusIsSetToInReceptionForTodayForNotLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 6;
            appointment.Data.StartTime = currentDate;


            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('In Reception');
            expect(selectedIcon).toEqual('far fa-watch');
        });

        it('statusIsSetToCompletedForTodayForNotLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = currentDate;


            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Completed');
            expect(selectedIcon).toEqual('far fa-calendar-check');
        });

        it('statusIsSetToInTreatmentForTodayForNotLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 4;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('In Treatment');
            expect(selectedIcon).toEqual('fas fa-user-md');
        });

        it('statusIsSetToReadyForCheckoutForTodayForNotLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 5;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Ready for Check out');
            expect(selectedIcon).toEqual('far fa-shopping-cart');
        });

        it('statusIsSetToUnconfirmedForTodayForNotLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 0;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Unconfirmed');
            expect(selectedIcon).toEqual('fas fa-question');
        });

        it('statusIsSetToReminderSentForTodayForNotLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 1;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Reminder Sent');
            expect(selectedIcon).toEqual('far fa-bell');
        });


        it('statusIsSetToConfirmedForTodayForNotLateAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 2;
            appointment.Data.StartTime = currentDate;

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Confirmed');
            expect(selectedIcon).toEqual('far fa-check');
        });

        it('statusIsSetToUnconfirmedWhenNoAppointmentId', function () {
            //set appointment Data
            let appointment: any = {
                Data: {
                    Status: null,
                    StartTime: null
                }
            }

            //Act
            mockAppointmentStatusHandlingService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(appointment);
            //get the selected value and selected icon
            let selectedValue = mockAppointmentStatusHandlingService.getDisplaySelectedValue();
            let selectedIcon = mockAppointmentStatusHandlingService.getDisplaySelectedIcon();

            //Assert
            expect(selectedValue).toEqual('Unconfirmed');
            expect(selectedIcon).toEqual('fas fa-question');
        });
    });

    describe('populateAppointmentStatusDropdownList', () => {

        it('notLateAppointmentForTodayWithUnconfirmedStatus', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 0;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithReminderSentStatus', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 1;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithConfirmedStatus', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 2;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithInReceptionStatus', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 6;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithCompletedStatusWithNoEncounterId', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = currentDate;
            appointment.Data.PlannedServices = [];

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[8].description).toEqual('Unschedule');
            expect(mockAppointmentStatusHandlingService.validateIfToDisableStatusDropdown('Completed', appointment)).toEqual(false);
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithCompletedStatusWithEncounterId', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = currentDate;
            appointment.Data.PlannedServices = [{ EncounterId: '123456' }];

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Start Appointment');
            expect(statusList[7].description).toEqual('Unschedule');
            expect(mockAppointmentStatusHandlingService.validateIfToDisableStatusDropdown('Completed', appointment)).toEqual(true);
            expect(statusList.length).toEqual(8);
        });

        it('notLateAppointmentForTodayWithInTreatmentStatusWithNoRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 4;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithUnconfirmedStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 0;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithReminderSentStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 1;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithConfirmedStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 2;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithInReceptionStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 6;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithCompletedStatusWithRunningAppointmentWithNoEncounterId', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = currentDate;
            appointment.Data.PlannedServices = [];
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithInTreatmentStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 4;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('notLateAppointmentForTodayWithReadyForCheckoutStatus', function () {
            //Arrange
            var currentDate = new Date();
            //add an hour from the current time
            currentDate.setHours(currentDate.getHours() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 5;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Ready for Check out');
            expect(statusList[1].description).toEqual('Check out');
            expect(statusList.length).toEqual(2);
        });

        it('lateAppointmentForTodayWithUnconfirmedStatus', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 0;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithReminderSentStatus', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 1;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithConfirmedStatus', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 2;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithInReceptionStatus', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 6;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithCompletedStatusWithNoEncounterId', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = currentDate;
            appointment.Data.PlannedServices = [];

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithCompletedStatusWithEncounterId', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = currentDate;
            appointment.Data.PlannedServices = [{ EncounterId: '123456' }];

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(9);
        });

        it('lateAppointmentForTodayWithInTreatmentStatusWithNoRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 4;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithUnconfirmedStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 0;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);


            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithReminderSentStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 1;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithConfirmedStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 2;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithInReceptionStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 6;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithCompletedStatusWithRunningAppointmentWithNoEncounterId', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 3;
            appointment.Data.StartTime = currentDate;
            appointment.Data.PlannedServices = [];
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithInTreatmentStatusWithRunningAppointment', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 4;
            appointment.Data.StartTime = currentDate;
            appointment.Data.Patient.HasRunningAppointment = true;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
            expect(statusList[6].description).toEqual('Late');
            expect(statusList[7].description).toEqual('Check out');
            expect(statusList[8].description).toEqual('Start Appointment');
            expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[9].description).toEqual('Unschedule');
            expect(statusList.length).toEqual(10);
        });

        it('lateAppointmentForTodayWithReadyForCheckoutStatus', function () {
            //Arrange
            var currentDate = new Date();
            //subtract an hour from the current time
            currentDate.setHours(currentDate.getHours() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 5;
            appointment.Data.StartTime = currentDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Ready for Check out');
            expect(statusList[1].description).toEqual('Check out');
            expect(statusList.length).toEqual(2);
        });

        // it('appointmentForPreviousDayWithUnconfirmedStatus', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 0;
        //     appointment.Data.StartTime = previousDate;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithReminderSentStatus', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 1;
        //     appointment.Data.StartTime = previousDate;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithConfirmedStatus', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 2;
        //     appointment.Data.StartTime = previousDate;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithInReceptionStatus', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 6;
        //     appointment.Data.StartTime = previousDate;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithCompletedStatusWithNoEncounterId', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 3;
        //     appointment.Data.StartTime = previousDate;
        //     appointment.Data.PlannedServices = [];

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithCompletedStatusWithEncounterId', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 3;
        //     appointment.Data.StartTime = previousDate;
        //     appointment.Data.PlannedServices = [{ EncounterId: '123456' }];

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Start Appointment');
        //     expect(statusList[8].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(9);
        // });

        // it('appointmentForPreviousDayWithInTreatmentStatusWithNoRunningAppointment', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 4;
        //     appointment.Data.StartTime = previousDate;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithUnconfirmedStatusWithRunningAppointment', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 0;
        //     appointment.Data.StartTime = previousDate;
        //     appointment.Data.Patient.HasRunningAppointment = true;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);


        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithReminderSentStatusWithRunningAppointment', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 1;
        //     appointment.Data.StartTime = previousDate;
        //     appointment.Data.Patient.HasRunningAppointment = true;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithConfirmedStatusWithRunningAppointment', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 2;
        //     appointment.Data.StartTime = previousDate;
        //     appointment.Data.Patient.HasRunningAppointment = true;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithInReceptionStatusWithRunningAppointment', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 6;
        //     appointment.Data.StartTime = previousDate;
        //     appointment.Data.Patient.HasRunningAppointment = true;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithCompletedStatusWithRunningAppointmentWithNoEncounterId', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 3;
        //     appointment.Data.StartTime = previousDate;
        //     appointment.Data.PlannedServices = [];
        //     appointment.Data.Patient.HasRunningAppointment = true;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        // it('appointmentForPreviousDayWithInTreatmentStatusWithRunningAppointment', function () {
        //     //Arrange
        //     //set date to past date
        //     var currentDate = new Date();
        //     var previousDate = new Date(currentDate);
        //     previousDate.setDate(previousDate.getDate() - 1);
        //     //set appointment Data
        //     appointment.Data.AppointmentId = 1;
        //     appointment.Data.Status = 4;
        //     appointment.Data.StartTime = previousDate;
        //     appointment.Data.Patient.HasRunningAppointment = true;

        //     //Act
        //     let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

        //     //Assert
        //     expect(statusList[0].description).toEqual('Unconfirmed');
        //     expect(statusList[1].description).toEqual('Reminder Sent');
        //     expect(statusList[2].description).toEqual('Confirmed');
        //     expect(statusList[3].description).toEqual('In Reception');
        //     expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
        //     expect(statusList[4].description).toEqual('Completed');
        //     expect(statusList[5].description).toEqual('In Treatment');
        //     expect(statusList[6].disabled).toEqual(true);//'Late' should be disabled
        //     expect(statusList[6].description).toEqual('Late');
        //     expect(statusList[7].description).toEqual('Check out');
        //     expect(statusList[8].description).toEqual('Start Appointment');
        //     expect(statusList[8].disabled).toEqual(true);//'Start Appointment' should be disabled
        //     expect(statusList[9].description).toEqual('Unschedule');
        //     expect(statusList.length).toEqual(10);
        // });

        it('appointmentForPreviousDayWithReadyForCheckoutStatus', function () {
            //Arrange
            //set date to past date
            var currentDate = new Date();
            var previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 5;
            appointment.Data.StartTime = previousDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Ready for Check out');
            expect(statusList[1].description).toEqual('Check out');
            expect(statusList.length).toEqual(2);
        });

        it('appointmentForFutureWithConfirmedStatus', function () {
            //Arrange
            //set date to future date
            var currentDate = new Date();
            var futureDate = new Date(currentDate);
            futureDate.setDate(futureDate.getDate() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 0;
            appointment.Data.StartTime = futureDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[4].disabled).toEqual(true);//'Completed' should be disabled
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[5].disabled).toEqual(true);//'In Treatment' should be disabled
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[6].disabled).toEqual(true);//'Check out' should be disabled
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList[9].description).toEqual('Add to Clipboard');
            expect(statusList.length).toEqual(10);
        });

        it('appointmentForFutureWithReminderSentStatus', function () {
            //Arrange
            ///set date to future date
            var currentDate = new Date();
            var futureDate = new Date(currentDate);
            futureDate.setDate(futureDate.getDate() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 1;
            appointment.Data.StartTime = futureDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[4].disabled).toEqual(true);//'Completed' should be disabled
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[5].disabled).toEqual(true);//'In Treatment' should be disabled
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[6].disabled).toEqual(true);//'Check out' should be disabled
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList[9].description).toEqual('Add to Clipboard');
            expect(statusList.length).toEqual(10);
        });

        it('appointmentForFutureWithConfirmedStatus', function () {
            //Arrange
            //set date to future date
            var currentDate = new Date();
            var futureDate = new Date(currentDate);
            futureDate.setDate(futureDate.getDate() + 1);
            //set appointment Data
            appointment.Data.AppointmentId = 1;
            appointment.Data.Status = 2;
            appointment.Data.StartTime = futureDate;

            //Act
            let statusList: any = mockAppointmentStatusHandlingService.populateAppointmentStatusDropdownList(appointment);

            //Assert
            expect(statusList[0].description).toEqual('Unconfirmed');
            expect(statusList[1].description).toEqual('Reminder Sent');
            expect(statusList[2].description).toEqual('Confirmed');
            expect(statusList[3].description).toEqual('In Reception');
            expect(statusList[3].disabled).toEqual(true);//'In Reception' should be disabled
            expect(statusList[4].description).toEqual('Completed');
            expect(statusList[4].disabled).toEqual(true);//'Completed' should be disabled
            expect(statusList[5].description).toEqual('In Treatment');
            expect(statusList[5].disabled).toEqual(true);//'In Treatment' should be disabled
            expect(statusList[6].description).toEqual('Check out');
            expect(statusList[6].disabled).toEqual(true);//'Check out' should be disabled
            expect(statusList[7].description).toEqual('Start Appointment');
            expect(statusList[7].disabled).toEqual(true);//'Start Appointment' should be disabled
            expect(statusList[8].description).toEqual('Unschedule');
            expect(statusList[9].description).toEqual('Add to Clipboard');
            expect(statusList.length).toEqual(10);
        });
    });

});
