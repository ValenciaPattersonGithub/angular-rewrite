import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MergeDuplicatePatientsDialogComponent } from './merge-duplicate-patients-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';
import { configureTestSuite } from 'src/configure-test-suite';

describe('MergeDuplicatePatientsDialogComponent', () => {
    let component: MergeDuplicatePatientsDialogComponent;
    let fixture: ComponentFixture<MergeDuplicatePatientsDialogComponent>;

    const patSecurityServiceMock = {
        generateMessage: jasmine.createSpy().and.returnValue(''),
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
    };

    const mockPatientServices = {
        Account: {

        }
    };
    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    const accountMembersMock = [
        // tslint:disable-next-line: max-line-length
        { PatientId: '1234', DuplicatePatients: [], FirstName: 'Bob', LastName: 'Johnson', City: 'Findlay', State: 'IL', ZipeCode: '62401', IsActive: true, IsPatient: true, DateOfBirth: '2001-11-05', PrimaryDuplicatePatientId: null, IsPrimaryDuplicate: false },
        // tslint:disable-next-line: max-line-length
        { PatientId: '1235', DuplicatePatients: [], FirstName: 'Larry', LastName: 'Johnson', City: 'Findlay', State: 'IL', ZipeCode: '62401', IsActive: true, IsPatient: true, DateOfBirth: '2001-11-05', PrimaryDuplicatePatientId: null, IsPrimaryDuplicate: false },
        // tslint:disable-next-line: max-line-length
        { PatientId: '1236', DuplicatePatients: [], FirstName: 'Sid', LastName: 'Johnson', City: 'Findlay', State: 'IL', ZipeCode: '62401', IsActive: true, IsPatient: true, DateOfBirth: '2001-11-05', PrimaryDuplicatePatientId: null, IsPrimaryDuplicate: false },
        // tslint:disable-next-line: max-line-length
        { PatientId: '1237', DuplicatePatients: [], FirstName: 'Pat', LastName: 'Johnson', City: 'Findlay', State: 'IL', ZipeCode: '62401', IsActive: true, IsPatient: true, DateOfBirth: '2001-11-05', PrimaryDuplicatePatientId: null, IsPrimaryDuplicate: false },
    ];


    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [MergeDuplicatePatientsDialogComponent, TruncateTextPipe],
            imports: [
                TranslateModule.forRoot()  // Required import for componenets that use ngx-translate in the view or componenet code
            ],
            providers: [
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: patSecurityServiceMock },
                {
                    provide: DialogRef, useValue: {
                        close: (dialogResult: any) => { },
                        open: (dialogResult: any) => { },
                        content: {
                            instance: {
                                title: '',
                                paymentTypes: accountMembersMock
                            }
                        }
                    }
                }
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MergeDuplicatePatientsDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('toggleSelected method', () => {
        let accountMember: any;
        beforeEach(() => {
            component.accountMembers = accountMembersMock;
            accountMember = accountMembersMock[0];
        });

        it('should set the passed in accountMember.PrimaryDuplicatePatientId to empty string', () => {
            component.toggleSelected(accountMember);
            expect(accountMembersMock[0].PrimaryDuplicatePatientId).toBe('');
            expect(accountMembersMock[0].IsPrimaryDuplicate).toBe(true);
        });

        it('should set the other accountMembers.PrimaryDuplicatePatientId to accountMember.PatientId', () => {
            component.toggleSelected(accountMember);
            expect(accountMembersMock[1].PrimaryDuplicatePatientId).toBe(accountMember.PatientId);
            expect(accountMembersMock[2].PrimaryDuplicatePatientId).toBe(accountMember.PatientId);
            expect(accountMembersMock[3].PrimaryDuplicatePatientId).toBe(accountMember.PatientId);
            expect(accountMembersMock[1].IsPrimaryDuplicate).toBe(false);
            expect(accountMembersMock[2].IsPrimaryDuplicate).toBe(false);
            expect(accountMembersMock[3].IsPrimaryDuplicate).toBe(false);
        });
    });


    describe('validateDuplicates method', () => {
        beforeEach(() => {
        });

        it('should return false if a patient is selected as duplicate but is already a Primary Account', () => {
            component.accountMembers = [];
            component.accountMembers.push({ PatientId: '1234', Name: 'Larry Smith', DuplicatePatients: [] });
            // set component.accountMembers[1] as a Primary Account
            component.accountMembers.push({
                PatientId: '1235', Name: 'Bob Smith',
                DuplicatePatients: [{ IsPrimaryDuplicate: '1234' }, { IsPrimaryDuplicate: '2222' }]
            });

            // set component.accountMembers[0] as Primary Duplicate selection
            component.accountMembers[0].IsPrimaryDuplicate = true;
            expect(component.validateDuplicates()).toEqual(false);
        });

        it('should return false if the selected primary is a duplicate for another patient', () => {
            component.accountMembers = [];
            component.accountMembers.push({ PatientId: '1234', Name: 'Larry Smith', DuplicatePatients: [] });
            // set component.accountMembers[1] as a Primary Account
            component.accountMembers.push({
                PatientId: '1235', Name: 'Bob Smith',
                DuplicatePatients: [{ IsPrimaryDuplicate: '1233' }, { IsPrimaryDuplicate: '2222' }]
            });

            // set component.accountMembers[0] as Primary Duplicate selection
            component.accountMembers[0].IsPrimaryDuplicate = true;
            expect(component.validateDuplicates()).toEqual(false);
        });

        // tslint:disable-next-line: max-line-length
        it('should return false if one of the accountMembers is the Responsible Party and is selected as a duplicate for another patient ', () => {
            component.accountMembers = [];
            // set component.accountMembers[0] as a IsResponsiblePerson
            component.accountMembers.push({ PatientId: '1234', Name: 'Larry Smith', IsResponsiblePerson: true, DuplicatePatients: [] });
            // set component.accountMembers[1] as a Primary Account
            component.accountMembers.push({
                PatientId: '1235', Name: 'Bob Smith',
                DuplicatePatients: [{ IsPrimaryDuplicate: '1233' }, { IsPrimaryDuplicate: '2222' }]
            });

            // set component.accountMembers[0] as Primary Duplicate selection
            component.accountMembers[0].IsPrimaryDuplicate = true;
            expect(component.validateDuplicates()).toEqual(false);
        });


        it('should return true if the selected primary is a not a duplicate for another patient ' +
            'and patient is selected as duplicate but is already a Primary Account', () => {
                // set component.accountMembers[0] as a Primary Account
                component.accountMembers = [];
                component.accountMembers = accountMembersMock;
                component.accountMembers[0].DuplicatePatients = [];
                component.accountMembers[1].DuplicatePatients = [];
                component.accountMembers[2].DuplicatePatients = [];
                // set component.accountMembers[3] as Primary Duplicate selection
                component.accountMembers[3].IsPrimaryDuplicate = true;
                expect(component.validateDuplicates()).toEqual(true);
            });

    });


});
