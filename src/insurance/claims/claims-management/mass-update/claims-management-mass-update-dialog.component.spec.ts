import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClaimsManagementMassUpdateDialogComponent } from './claims-management-mass-update-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';

describe('ClaimsManagementMassUpdateDialogComponent', () => {
    let component: ClaimsManagementMassUpdateDialogComponent;
    let fixture: ComponentFixture<ClaimsManagementMassUpdateDialogComponent>;

    const mockSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
    };
    const returnedPromise = Promise.resolve({ result: 'success' });
    const mockCommonServices = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),        
        Insurance : {
            Claim: {
                changeSubmissionMethod: jasmine.createSpy().and.callFake(() => {
                    return {
                        then(callback) {
                            callback(returnedPromise);
                        }
                    };
                })
            }
        }
                            
    };

    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    let mockDialog = {
        close: (dialogResult: any) => { },
        open: (dialogResult: any) => { },
        content: {
            instance: {
                title: 'test title',
                claims: [{ SubmittalMethod: 1 }, { SubmittalMethod: 2 }]
            }
        }
    };


    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [ClaimsManagementMassUpdateDialogComponent],
            imports: [
                TranslateModule.forRoot(), FormsModule
            ],
            providers: [
                { provide: 'CommonServices', useValue: mockCommonServices },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: mockSecurityService },
                { provide: DialogRef, useValue: mockDialog }
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClaimsManagementMassUpdateDialogComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call security service with correct amfa',
            () => {
                component.ngOnInit();
                expect(mockSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-ins-iclaim-edit');
            });
        it('should set isValid to false',
            () => {
                component.ngOnInit();
                expect(component.isValid).toBe(false);
            });
        it('should set title to dialog content instance title',
            () => {
                component.ngOnInit();
                expect(component.title).toEqual('test title');
            });
        it('should set claims to dialog content instance claims',
            () => {
                component.ngOnInit();
                expect(component.claims.length).toEqual(2);
                expect(component.claims[0].SubmittalMethod).toEqual(1);
                expect(component.claims[1].SubmittalMethod).toEqual(2);
            });
        it('should set submission method names',
            () => {
                component.ngOnInit();
                expect(component.submissionMethodNames.length).toEqual(4);
                expect(component.submissionMethodNames[0]).toEqual('');
                expect(component.submissionMethodNames[1]).toEqual('eClaims - Dental');
                expect(component.submissionMethodNames[2]).toEqual('ADA 2019 - Paper');
                expect(component.submissionMethodNames[3]).toEqual('CMS 1500 - Paper');
            });
        it('should set submission method options',
            () => {
                component.ngOnInit();
                expect(component.submissionMethodOptions.length).toEqual(3);
                expect(component.submissionMethodOptions[0].name).toEqual('eClaims - Dental');
                expect(component.submissionMethodOptions[1].name).toEqual('ADA 2019 - Paper');
                expect(component.submissionMethodOptions[2].name).toEqual('CMS 1500 - Paper');
                expect(component.submissionMethodOptions[0].value).toEqual(1);
                expect(component.submissionMethodOptions[1].value).toEqual(2);
                expect(component.submissionMethodOptions[2].value).toEqual(3);
            });
        it('should set selectedSubmissionMethod to default',
            () => {
                component.ngOnInit();
                expect(component.selectedSubmissionMethod).toEqual(0);
            });
        it('should set inProcess to false',
            () => {
                component.ngOnInit();
                expect(component.inProcess).toBe(false);
            });
        it('should set updateFailed to false',
            () => {
                component.ngOnInit();
                expect(component.updateFailed).toBe(false);
            });
    });

    describe('setSubmissionMethodOptions',
        () => {
            it('should limit options when claim list contains a predetermination',
                () => {
                    component.claims = [{ Type: 1 }, { Type: 2 }];
                    component.setSubmissionMethodOptions();
                    expect(component.submissionMethodOptions.length).toEqual(2);
                    expect(component.submissionMethodOptions[0].name).toEqual('eClaims - Dental');
                    expect(component.submissionMethodOptions[1].name).toEqual('ADA 2019 - Paper');
                    expect(component.submissionMethodOptions[0].value).toEqual(1);
                    expect(component.submissionMethodOptions[1].value).toEqual(2);
                });
            it('should not limit options when claim list does not contain a predetermination',
                () => {
                    component.claims = [{ Type: 1 }, { Type: 1 }];
                    component.setSubmissionMethodOptions();
                    expect(component.submissionMethodOptions.length).toEqual(3);
                    expect(component.submissionMethodOptions[0].name).toEqual('eClaims - Dental');
                    expect(component.submissionMethodOptions[1].name).toEqual('ADA 2019 - Paper');
                    expect(component.submissionMethodOptions[2].name).toEqual('CMS 1500 - Paper');
                    expect(component.submissionMethodOptions[0].value).toEqual(1);
                    expect(component.submissionMethodOptions[1].value).toEqual(2);
                    expect(component.submissionMethodOptions[2].value).toEqual(3);
                });
        });

    describe('getColor',
        () => {
            it('should return red when claim has MassUpdateFailureMessage',
                () => {
                    const claim = { Type: 1, MassUpdateFailureMessage: '[SubmittalMethod: Invalid parameter value]' };
                    const color = component.getColor(claim);
                    expect(color).toEqual('red');
                });
            it('should return red when predetermination has MassUpdateFailureMessage',
                () => {
                    const claim = { Type: 2, MassUpdateFailureMessage: '[SubmittalMethod: Invalid parameter value]' };
                    const color = component.getColor(claim);
                    expect(color).toEqual('red');
                });
            it('should return green when predetermination does not have MassUpdateFailureMessage',
                () => {
                    const claim = { Type: 2 };
                    const color = component.getColor(claim);
                    expect(color).toEqual('green');
                });
            it('should return black when claim does not have MassUpdateFailureMessage',
                () => {
                    const claim = { Type: 1 };
                    const color = component.getColor(claim);
                    expect(color).toEqual('black');
                });
        });

    describe('validate',
        () => {
            it('should set isValid to true when selectedSubmissionMethod is not default',
                () => {
                    component.selectedSubmissionMethod = 1;
                    component.validate();
                    expect(component.isValid).toBe(true);
                });
            it('should set isValid to false when selectedSubmissionMethod is default',
                () => {
                    component.selectedSubmissionMethod = 0;
                    component.validate();
                    expect(component.isValid).toBe(false);
                });
        });

    describe('updateClaim', () => {
        it('should pass the claim.DataTag as property on ClaimSubmittalMethodDto', () => {
            component.selectedSubmissionMethod = 1;
            var claim = {ClaimId: '1234' ,DataTag: 'AAAAAABB', SubmittalMethod: 2, MassUpdateFailureMessage: '', Status: 1};            
            component.updateClaim(claim);
            expect(mockCommonServices.Insurance.Claim.changeSubmissionMethod).toHaveBeenCalledWith({ claimId: '1234' }, { ClaimId: '1234', SubmittalMethod: 1, DataTag: 'AAAAAABB' });
        })
    })

   
});