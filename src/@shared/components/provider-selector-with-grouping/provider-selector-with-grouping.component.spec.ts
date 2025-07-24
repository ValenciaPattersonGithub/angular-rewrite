import { ProviderSelectorWithGroupingComponent } from './provider-selector-with-grouping.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { SchedulingModule } from 'src/scheduling/scheduling.module';
import { GroupResult, groupBy } from '@progress/kendo-data-query';
declare var angular: any;

describe('ProviderSelectorWithGroupingComponent', () => {
  let component: ProviderSelectorWithGroupingComponent;
  let fixture: ComponentFixture<ProviderSelectorWithGroupingComponent>;
  var mockPreferredProvidersList = [
    {
      ProviderId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      UserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      Name: 'Bob Jones',
      IsPreferred: false,
      UserLocationSetup: { LocationId: 2, ProviderTypeId: 1 },
    },
    {
      ProviderId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      UserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      Name: 'Sid Jones',
      IsPreferred: false,
      UserLocationSetup: { LocationId: 2, ProviderTypeId: 1 },
    },
    {
      ProviderId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      UserId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      Name: 'Larry Jones',
      IsPreferred: false,
      UserLocationSetup: { LocationId: 2, ProviderTypeId: 3 },
    },
    {
      ProviderId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      UserId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      Name: 'Pat Jones',
      IsPreferred: false,
      UserLocationSetup: { LocationId: 2, ProviderTypeId: 1 },
    },
    {
      ProviderId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      UserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      Name: 'Sylvia Jones',
      IsPreferred: false,
      UserLocationSetup: { LocationId: 2, ProviderTypeId: 2 },
    },
  ];

  var mockProviderList = [
    {
      UserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      FirstName: 'RK Assist',
      MiddleName: null,
      LastName: 'Assitant',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'raks@pattcom.onmicrosoft.com',
      UserCode: 'ASSRK1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'rkas@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 3,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: 'RK Assist Pat Soar C',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T11:50:18.2199196+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A50%3A18.2199196Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T11:50:16.9153383Z',
    },
    {
      UserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      FirstName: 'Terra',
      MiddleName: 'D',
      LastName: 'Data',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'terradata123@pattcom.onmicrosoft.com',
      UserCode: 'DATTE1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'terra@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: 1,
      JobTitle: 'Dental surgeon',
      ProviderTypeId: 1,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T14:26:13.9041626+00:00","RowVersion":"W/\\"datetime\'2015-09-30T14%3A26%3A13.9041626Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T14:26:12.1070625Z',
    },
    {
      UserId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      FirstName: 'SHA',
      MiddleName: null,
      LastName: 'GOE',
      PreferredName: 'Shalini',
      DateOfBirth: null,
      UserName: 'shhh@pattcom.onmicrosoft.com',
      UserCode: 'GOESH1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'sss@test.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 4,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Den',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-28T15:55:14.6622633+00:00","RowVersion":"W/\\"datetime\'2015-09-28T15%3A55%3A14.6622633Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-28T15:55:12.9146859Z',
    },
    {
      UserId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      FirstName: 'Inc Assist',
      MiddleName: '',
      LastName: 'Inactive',
      PreferredName: 'Inca',
      DateOfBirth: null,
      UserName: 'inca@pattcom.onmicrosoft.com',
      UserCode: 'INAIN1',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'inca@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 3,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Assistant of the Pat',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T09:26:01.353604+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A01.353604Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T09:26:00.0431939Z',
    },
    {
      UserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      FirstName: 'Inc Dentist',
      MiddleName: '',
      LastName: 'Inactive',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'incden@pattcom.onmicrosoft.com',
      UserCode: 'INAIN2',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'incden@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 1,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Dentist of the Pat C',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T09:26:22.6941851+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A22.6941851Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T09:26:21.6120902Z',
    },
    {
      UserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
      FirstName: 'Inc Hygienist',
      MiddleName: '',
      LastName: 'Inactive',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'inchyg@pattcom.onmicrosoft.com',
      UserCode: 'INAIN3',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'inchyg@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 2,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Hygienist of PAT Com',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T09:26:38.2970666+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A38.2970666Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T09:26:37.2170122Z',
    },
    {
      UserId: '444842d4-1e9e-4183-b290-a27a8a5f9351',
      FirstName: 'Inc Other',
      MiddleName: '',
      LastName: 'Inactive',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'incoth@pattcom.onmicrosoft.com',
      UserCode: 'INAIN4',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'incoth@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 5,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Inactive Other of PA',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T09:26:57.6304013+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A57.6304013Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T09:26:56.2933199Z',
    },
    {
      UserId: '451b2356-6833-4e42-9681-e1bf042a9e5b',
      FirstName: 'RK Blank',
      MiddleName: null,
      LastName: 'RKbla',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'RKbla@pattcom.onmicrosoft.com',
      UserCode: 'RKBRK1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'RKbla@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: null,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-29T08:43:12.3159591+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A43%3A12.3159591Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T08:43:11.5361316Z',
    },
    {
      UserId: '0fa21181-8d2e-454d-9dcd-ffb33f95bfa5',
      FirstName: 'RK Dentist',
      MiddleName: '',
      LastName: 'RKDen',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'RKDEN@pattcom.onmicrosoft.com',
      UserCode: 'RKDRK1',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'rkden@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 1,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: '',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T11:43:57.6941016+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A43%3A57.6941016Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T11:43:56.5618443Z',
    },
    {
      UserId: '227cf131-5210-4944-98cf-788c9f4f51f8',
      FirstName: 'RK Hygienist',
      MiddleName: '',
      LastName: 'Rkhyg',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'rkhyg@pattcom.onmicrosoft.com',
      UserCode: 'RKHRK1',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'rkhyg@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 2,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: '',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T11:32:21.7375333+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A32%3A21.7375333Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T11:32:20.5137411Z',
    },
    {
      UserId: '29691744-6de7-4679-bb55-824a51d4df58',
      FirstName: 'RK NotP',
      MiddleName: null,
      LastName: 'Rknotp',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'Rknotp@pattcom.onmicrosoft.com',
      UserCode: 'RKNRK1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'Rknotp@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 4,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-29T08:41:35.9948486+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A41%3A35.9948486Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T08:41:34.9463004Z',
    },
    {
      UserId: '3398f3b4-b261-4c9b-aa13-59bf0127f488',
      FirstName: 'RK Other',
      MiddleName: '',
      LastName: 'RKOther',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'RKOther@pattcom.onmicrosoft.com',
      UserCode: 'RKORK1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'RKOther@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 5,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-29T08:39:45.049056+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A39%3A45.049056Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T08:39:44.0458392Z',
    },
    {
      UserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
      FirstName: 'Mary Beth',
      MiddleName: '',
      LastName: 'Swift',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'marybeth.swift@pattcom.onmicrosoft.com',
      UserCode: 'SWIMA1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'User@TenantInfo.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: 1,
      JobTitle: null,
      ProviderTypeId: 1,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-25T05:35:52.9058232+00:00","RowVersion":"W/\\"datetime\'2015-09-25T05%3A35%3A52.9058232Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-25T05:35:51.577119Z',
    },
    {
      UserId: 'ffbf6738-06a9-4438-b6b0-ceac9ad78fd1',
      FirstName: 'Hour',
      MiddleName: null,
      LastName: 'Test',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'hourtest123@pattcom.onmicrosoft.com',
      UserCode: 'TESHO1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'hourtest@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 4,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T06:43:15.7153229+00:00","RowVersion":"W/\\"datetime\'2015-09-30T06%3A43%3A15.7153229Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T06:43:14.3781493Z',
    },
    {
      UserId: '81f90124-b912-49f8-b5f2-092156cf7800',
      FirstName: 'Aaron',
      MiddleName: 'T',
      LastName: 'Tester',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'AaronTester@pattcom.onmicrosoft.com',
      UserCode: 'TESAA1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'sadgasd@asdfg.dsaf',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 4,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-29T16:56:07.5504077+00:00","RowVersion":"W/\\"datetime\'2015-09-29T16%3A56%3A07.5504077Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T16:56:05.8548252Z',
    },
    {
      UserId: '3a9e0fb7-74f2-4ab3-859b-afbe3d19ffb8',
      FirstName: 'Harry',
      MiddleName: null,
      LastName: 'User',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'HarryUser@pattcom.onmicrosoft.com',
      UserCode: 'USEHA1',
      Color: '#00a2e8',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'Harry@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: 1,
      JobTitle: 'Dentist',
      ProviderTypeId: 1,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T12:44:35.9872305+00:00","RowVersion":"W/\\"datetime\'2015-09-30T12%3A44%3A35.9872305Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T12:44:34.0898085Z',
    },
  ];

  var providersWithLocation2 = [];
  var providersWithLocation3 = [];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProviderSelectorWithGroupingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    for (let index = 0; index < mockProviderList.length; index++) {
      mockProviderList[index].Locations = [];
      // add location 1 to all
      var userLocationSetup = {
        UserId: mockProviderList[index].UserId,
        IsActive: true,
        LocationId: 1,
        ProviderTypeId: 1,
        ProviderOnClaimsRelationship: 1,
        ProviderOnClaimsId: null,
        Color: '#7f7f7f',
        ProviderQualifierType: 2,
      };
      mockProviderList[index].Locations.push(userLocationSetup);
      if (index in [1, 2, 3, 4, 9, 10]) {
        // add location 2
        userLocationSetup = {
          UserId: mockProviderList[index].UserId,
          IsActive: true,
          LocationId: 2,
          ProviderTypeId: 2,
          ProviderOnClaimsRelationship: 1,
          ProviderOnClaimsId: null,
          Color: '#7f7f7f',
          ProviderQualifierType: 1,
        };
        mockProviderList[index].Locations.push(userLocationSetup);
        providersWithLocation2.push(mockProviderList[index]);
      }
      if (index in [5, 6, 7, 8]) {
        // add location 3
        userLocationSetup = {
          UserId: mockProviderList[index].UserId,
          IsActive: true,
          LocationId: 3,
          ProviderTypeId: 2,
          ProviderOnClaimsRelationship: 1,
          ProviderOnClaimsId: null,
          Color: '#7f7f7f',
          ProviderQualifierType: 1,
        };
        mockProviderList[index].Locations.push(userLocationSetup);
        providersWithLocation3.push(mockProviderList[index]);
      }
    }

    fixture = TestBed.createComponent(ProviderSelectorWithGroupingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  var currentLocation = { id: 2 };
  let mockLocationService: any = {
    getCurrentLocation: jasmine
      .createSpy('LocationService.getCurrentLocation')
      .and.returnValue({ id: 3, status: 'Inactive' }),
  };
  let mockPatientLandingfactory = {
    setPreferredProvider: jasmine.createSpy(),
  };
  let scheduleFactoryPromise: Promise<any> = new Promise<any>(
    (resolve, reject) => {}
  );
  let mockShowOnScheduleFactory: any = {
    getAll: jasmine.createSpy().and.returnValue(scheduleFactoryPromise),
  };
  let mockReferenceDataService: any = {
    get: jasmine
      .createSpy('referenceDataService.get(users)')
      .and.returnValue(mockProviderList),
    entityNames: {
      users: 'users',
    },
  };
  let mockLocalizeService: any = {
    getLocalizedString: jasmine.createSpy().and.returnValue('localized string'),
  };
  let mockListHelper: any = {
    findItemByFieldValue: jasmine.createSpy().and.returnValue({}),
    get: jasmine.createSpy().and.returnValue({}),
  };

  let appointmentServiceProcessingRulesService: any = {
    filterProvidersForServicesWithAppointments: jasmine
      .createSpy()
      .and.returnValue({}),
    get: jasmine.createSpy().and.returnValue({}),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderSelectorWithGroupingComponent],
      imports: [
        FormsModule,
        DropDownsModule,
        TranslateModule.forRoot(),
        SchedulingModule,
      ],
      providers: [
        { provide: 'locationService', useValue: mockLocationService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        {
          provide: 'PatientLandingFactory',
          useValue: mockPatientLandingfactory,
        },
        {
          provide: 'ProviderShowOnScheduleFactory',
          useValue: mockShowOnScheduleFactory,
        },
        { provide: 'ListHelper', useValue: mockListHelper },
        {
          provide: 'AppointmentServiceProcessingRulesService',
          useValue: appointmentServiceProcessingRulesService,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('addDynamicColumnsToProviders function ->', function () {
    var allProviderList = [
      {
        Name: '',
        FullName: '',
        ProviderId: '',
        FirstName: '',
        LastName: '',
        UserId: '',
      },
    ];

    it('should add FullName, Name, and ProviderId to list if not there', function () {
      allProviderList[0].Name = '';
      allProviderList[0].FullName = '';
      allProviderList[0].ProviderId = '';
      allProviderList[0].FirstName = 'Bob';
      allProviderList[0].LastName = 'Smith';
      allProviderList[0].UserId = '1234';
      component.addDynamicColumnsToProviders(allProviderList);
      allProviderList[0].Name = 'Bob Smith';
      allProviderList[0].FullName = 'Bob Smith';
      allProviderList[0].ProviderId = '1234';
    });

    it('should not add FullName, Name, and ProviderId to list if already there', function () {
      allProviderList[0].Name = 'Larry David';
      allProviderList[0].FullName = 'Larry David';
      allProviderList[0].ProviderId = '12345';
      allProviderList[0].FirstName = 'Bob';
      allProviderList[0].LastName = 'Smith';
      allProviderList[0].UserId = '1234';
      component.addDynamicColumnsToProviders(allProviderList);
      allProviderList[0].Name = 'Larry David';
      allProviderList[0].FullName = 'Larry David';
      allProviderList[0].ProviderId = '12345';
    });
  });

  describe('ngOnInit function ->', function () {
    beforeEach(function () {
      component.loadProvidersByLocation = jasmine.createSpy();
    });

    it('should load providerList if not passed to directive', function () {
      component.ngOnInit();
      expect(component.loadProvidersByLocation).toHaveBeenCalled();
    });

    it('should set defaultItem.Name if not passed to directive', function () {
      component.ngOnInit();
      expect(component.defaultItem.Name).toEqual('- Select Provider -');
      expect(component.defaultItem.ProviderId).toBe(null);
    });

    it('should set defaultItem.Name to defaultItemText if passed to directive', function () {
      component.defaultItemText = 'Leave as Unassigned';
      component.ngOnInit();
      expect(component.defaultItem.Name).toEqual('Leave as Unassigned');
      expect(component.defaultItem.ProviderId).toBe(null);
    });

    it('should set initialized to true', function () {
      component.initialized = false;
      component.ngOnInit();
      expect(component.initialized).toBe(true);
    });
  });

  describe('loadProvidersByLocation function ->', function () {
    beforeEach(function () {
      component.filterProviders = jasmine.createSpy();
      component.addDynamicColumnsToProviders = jasmine.createSpy();
      component.allProvidersList = [];
      component.filterByLocationId = null;
      mockShowOnScheduleFactory.getAll = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });
    });

    it('should call locationService.getCurrentLocation', function () {
      component.loadProvidersByLocation();
      expect(mockLocationService.getCurrentLocation).toHaveBeenCalled();
    });

    it('should call referenceDataService.get and set allProvidersList', function () {
      component.allProvidersList = null;
      mockReferenceDataService.get.calls.reset();

      component.loadProvidersByLocation();

      expect(mockReferenceDataService.get).toHaveBeenCalledWith('users');
      expect(component.allProvidersList).toBe(mockProviderList);
    });

    it('should call addDynamicColumnsToProvider', function () {
      component.loadProvidersByLocation();
      expect(component.addDynamicColumnsToProviders).toHaveBeenCalledWith(
        mockProviderList
      );
    });

    describe('when filterShowOnSchedule is true ->', function () {
      beforeEach(function () {
        component.filterShowOnSchedule = true;
        component.showOnSchedulePromise = null;
      });
    });

    describe('when scope.filterShowOnSchedule is not true ->', function () {
      beforeEach(function () {
        component.filterShowOnSchedule = false;
        component.showOnSchedulePromise = null;
      });

      it('should not call showOnScheduleFactory or set ctrl.showOnSchedulePromise', function () {
        component.loadProvidersByLocation();

        expect(mockShowOnScheduleFactory.getAll).not.toHaveBeenCalled();
        expect(component.showOnSchedulePromise).toBeNull();
      });
    });

    describe('when scope.filterShowOnSchedule is true and ctrl.showOnSchedulePromise is defined ->', function () {
      var promise = { then: jasmine.createSpy() };
      beforeEach(function () {
        component.filterShowOnSchedule = true;
        mockShowOnScheduleFactory.getAll = function () {
          return {
            then: function () {
              return promise;
            },
          };
        };
        component.providers = null;
        component.allProvidersList = ['allProvidersList'];
      });
    });

    it('should call filterProviders when filterShowOnSchedule is not true', function () {
      component.filterShowOnSchedule = false;

      component.loadProvidersByLocation();

      expect(component.filterProviders).toHaveBeenCalled();
    });

    it('should call ctrl.filterProviders when ctrl.showOnSchedulePromise is null', function () {
      component.filterShowOnSchedule = true;

      component.loadProvidersByLocation();

      expect(component.filterProviders).toHaveBeenCalled();
    });
  });

  describe('filterProviders function ->', function () {
    var provList: any = [
      {
        ProviderId: '1234',
        UserId: '1234',
        FirstName: 'Bob',
        LastName: 'Jones',
        Name: 'Bob Jones',
        IsPreferred: false,
        IsActive: false,
      },
      {
        ProviderId: '1235',
        UserId: '1235',
        FirstName: 'Sid',
        LastName: 'Jones',
        Name: 'Sid Jones',
        IsPreferred: false,
        IsActive: true,
      },
      {
        ProviderId: '1236',
        UserId: '1236',
        FirstName: 'Larry',
        LastName: 'Jones',
        Name: 'Larry Jones',
        IsPreferred: false,
        IsActive: true,
      },
      {
        ProviderId: '1237',
        UserId: '1237',
        FirstName: 'Pat',
        LastName: 'Jones',
        Name: 'Pat Jones',
        IsPreferred: false,
        IsActive: true,
      },
      {
        ProviderId: '1238',
        UserId: '1238',
        FirstName: 'Sylvia',
        LastName: 'Jones',
        Name: 'Sylvia Jones',
        IsPreferred: false,
        IsActive: true,
      },
    ];
    beforeEach(function () {
      component.filterProviderList = jasmine
        .createSpy()
        .and.returnValue(provList);
      // component.setSelectedProvider = jasmine.createSpy();
    });

    it('should set filterByLocationId to currentLocation.id if filterByLocationId is null', function () {
      component.filterByLocationId = null;
      var filterByLocationId = currentLocation.id;
      component.currentLocation = { id: filterByLocationId };
      component.filterProviders();
      expect(component.filterProviderList).toHaveBeenCalledWith(
        component.allProvidersList,
        filterByLocationId
      );
    });

    it('should set filterByLocationId to  filterByLocationId if filterByLocationId is not null', function () {
      component.filterByLocationId = 'notnull';
      var filterByLocationId = component.filterByLocationId;
      component.filterProviders();
      expect(component.filterProviderList).toHaveBeenCalledWith(
        component.allProvidersList,
        filterByLocationId
      );
    });

    it('should call filterProviderList', function () {
      component.filterProviders();
      expect(component.filterProviderList).toHaveBeenCalled();
    });
    let providersGrouped: GroupResult[];
    it('should set providers and providersLoaded', function () {
      component.providers = null;
      // order the provList
      let providersTemp = provList.sort((providerA: any, providerB: any) => {
        if (providerA.IsActive !== providerB.IsActive) {
          return providerA.IsActive === true ? -1 : 1;
        }
        return providerA.LastName.localeCompare(providerB.LastName);
      });
      for (const prvdr of providersTemp) {
        prvdr['StatusText'] = prvdr.IsActive
          ? 'Active Providers'
          : 'Inactive Providers';
      }
      let providers = groupBy(providersTemp, [{ field: 'StatusText' }]);
      component.filterProviders();
      expect(component.providers[0].items[0]['Name']).toEqual(
        providers[0]['items'][0]['Name']
      );
      expect(component.providers[0].items[0]['IsActive']).toEqual(
        providers[0]['items'][0]['IsActive']
      );

      expect(component.providers[0].items[1]['Name']).toEqual(
        providers[0]['items'][1]['Name']
      );
      expect(component.providers[0].items[1]['IsActive']).toEqual(
        providers[0]['items'][1]['IsActive']
      );

      expect(component.providers[0].items[2]['Name']).toEqual(
        providers[0]['items'][2]['Name']
      );
      expect(component.providers[0].items[2]['IsActive']).toEqual(
        providers[0]['items'][2]['IsActive']
      );

      expect(component.providers[0].items[3]['Name']).toEqual(
        providers[0]['items'][3]['Name']
      );
      expect(component.providers[0].items[3]['IsActive']).toEqual(
        providers[0]['items'][3]['IsActive']
      );

      expect(component.providers[1].items[0]['Name']).toEqual(
        providers[1]['items'][0]['Name']
      );
      expect(component.providers[1].items[0]['IsActive']).toEqual(
        providers[1]['items'][0]['IsActive']
      );
    });

    it('should load only active providers', function () {
      component.providers = null;
      component.unfilteredProviders = [];
      let providersTemp = provList.sort((providerA: any, providerB: any) => {
        if (providerA.IsActive !== providerB.IsActive) {
          return providerA.IsActive === true ? -1 : 1;
        }
        return providerA.LastName.localeCompare(providerB.LastName);
      });
      for (const prvdr of providersTemp) {
        prvdr['StatusText'] = prvdr.IsActive
          ? 'Active Providers'
          : 'Inactive Providers';
        component.unfilteredProviders.push(angular.copy(prvdr));
      }
      component.filterProviders();
      component.open();
      expect(component.providers.length).toBe(1);
      expect(component.providers[0].items.length).toBe(4);
    });

    it('should not wait on showOnSchedulePromise if it exists and filterShowOnSchedule is false', function () {
      component.filterByLocationId = 1;
      component.filterShowOnSchedule = false;
      component.showOnSchedulePromise = { then: jasmine.createSpy() };
      component.filterProviders();
      expect(component.showOnSchedulePromise.then).not.toHaveBeenCalledWith(
        component.providers
      );
    });

    it('should wait on showOnSchedulePromise if it exists and filterShowOnSchedule is true', function () {
      component.filterByLocationId = 1;
      component.filterShowOnSchedule = true;
      component.showOnSchedulePromise = { then: jasmine.createSpy() };
      component.filterProviders();
      expect(component.showOnSchedulePromise.then).toHaveBeenCalledWith(
        component.providers
      );
    });

    it('should order providers by IsActive then Name', function () {
      component.filterByLocationId = 1;
      component.filterShowOnSchedule = true;
      component.showOnSchedulePromise = { then: jasmine.createSpy() };
      component.filterProviders();

      expect(component.providers[0].items[0]['Name']).toEqual('Sid Jones');
      expect(component.providers[0].items[0]['IsActive']).toEqual(true);

      expect(component.providers[0].items[1]['Name']).toEqual('Larry Jones');
      expect(component.providers[0].items[1]['IsActive']).toEqual(true);

      expect(component.providers[0].items[2]['Name']).toEqual('Pat Jones');
      expect(component.providers[0].items[2]['IsActive']).toEqual(true);

      expect(component.providers[0].items[3]['Name']).toEqual('Sylvia Jones');
      expect(component.providers[0].items[3]['IsActive']).toEqual(true);

      expect(component.providers[1].items[0]['Name']).toEqual('Bob Jones');
      expect(component.providers[1].items[0]['IsActive']).toEqual(false);
    });
  });

  describe('ctrl.filterProvidersByUserLocations function ->', function () {
    var allProvidersList = [];
    beforeEach(function () {
      allProvidersList = cloneDeep(mockProviderList);
    });

    it('should filter the providerList to only providers with userLocationSetup records in the filterByLocationId location', function () {
      component.filterByLocationId = 3;
      var filteredProviderList = component.filterProvidersByUserLocations(
        allProvidersList,
        component.filterByLocationId
      );
      for (let index = 0; index < filteredProviderList.length; index++) {
        expect(filteredProviderList[index]).toEqual(
          providersWithLocation2[index]
        );
      }
    });

    it('should filter the providerList to only providers with userLocationSetup records in the filterByLocationId location', function () {
      component.currentLocation = { id: 3 };
      var filteredProviderList = component.filterProvidersByUserLocations(
        allProvidersList,
        component.filterByLocationId
      );
      for (let index = 0; index < filteredProviderList.length; index++) {
        expect(filteredProviderList[index]).toEqual(
          providersWithLocation2[index]
        );
      }
    });

    it('should set provider.IsActive based on Locations.IsActive', function () {
      component.currentLocation = { id: 3 };
      component.filterByLocationId = 3;
      // set the userLocationSetup.IsActive = false on all location 3 userLocationSetups
      allProvidersList.forEach(provider => {
        provider.Locations.forEach(userLocationSetup => {
          if (userLocationSetup.LocationId === 3) {
            userLocationSetup.IsActive = false;
          } else {
            userLocationSetup.IsActive = true;
          }
        });
      });
      // filter for location 2
      var filteredProviderList = component.filterProvidersByUserLocations(
        allProvidersList,
        2
      );
      filteredProviderList.forEach(provider => {
        expect(provider.IsActive).toEqual(true);
      });
      // filter for location 3
      filteredProviderList = component.filterProvidersByUserLocations(
        allProvidersList,
        3
      );
      filteredProviderList.forEach(provider => {
        expect(provider.IsActive).toEqual(false);
      });
    });
  });

  describe('addExceptionProvider function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      component.allProvidersList = cloneDeep(mockProviderList);
      component.currentLocation = { id: 2 };
      filteredProviderList = component.filterProvidersByUserLocations(
        component.allProvidersList,
        3
      );
    });

    it(
      'should not add provider passed as exceptionProviderId to the list even if not in the filteredProviderList ' +
        'and if it is not in the allProvidersList',
      function () {
        // exceptionProviderId is not in either list
        component.exceptionProviderId = '3398f3b4-b261-4c9b-aa13-59bf0127f4888';
        // filtered list to only providers that were in location 2
        for (let index = 0; index < filteredProviderList.length; index++) {
          expect(filteredProviderList[index]).toEqual(
            providersWithLocation2[index]
          );
        }
        // provider is in allProvidersList list
        var providerInAllProvidersList = component.allProvidersList.find(
          provider => {
            return provider.UserId === component.exceptionProviderId;
          }
        );
        expect(providerInAllProvidersList).toEqual(undefined);

        // provider is not in filtered list
        var providerInFilteredProviderList = filteredProviderList.find(
          provider => {
            return provider.UserId === component.exceptionProviderId;
          }
        );
        expect(providerInFilteredProviderList).toBe(undefined);

        // provider should be in filteredList
        component.addExceptionProvider(filteredProviderList);

        // provider is not in filtered list
        providerInFilteredProviderList = filteredProviderList.find(provider => {
          return provider.UserId === component.exceptionProviderId;
        });
        expect(providerInFilteredProviderList).toBe(undefined);
      }
    );

    it(
      'should add provider passed as exceptionProviderId to the list even if not in the filteredProviderList ' +
        'if it is in the allProvidersList',
      function () {
        // exceptionProviderId is provider with userLocationSetup in locations 1 and 3
        component.exceptionProviderId = '3398f3b4-b261-4c9b-aa13-59bf0127f488';
        // filter list to only providers that were in location 2
        component.currentLocation = { id: 2 };
        var filteredProviderList = component.filterProvidersByUserLocations(
          component.allProvidersList,
          3
        );
        for (let index = 0; index < filteredProviderList.length; index++) {
          expect(filteredProviderList[index]).toEqual(
            providersWithLocation2[index]
          );
        }
        // provider is not in filtered list
        var providerInFilteredProviderList = filteredProviderList.find(
          provider => {
            return provider.UserId === component.exceptionProviderId;
          }
        );
        expect(providerInFilteredProviderList).toBe(undefined);

        //
        component.addExceptionProvider(filteredProviderList);

        // provider should now be in the filtered list
        providerInFilteredProviderList = filteredProviderList.find(provider => {
          return provider.UserId === component.exceptionProviderId;
        });
        expect(providerInFilteredProviderList.UserId).toBe(
          component.exceptionProviderId
        );
      }
    );
  });

  describe('filterByProviderType function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      filteredProviderList = cloneDeep(mockPreferredProvidersList);
    });

    it('should filter the list by providerTypeIds', function () {
      expect(filteredProviderList.length).toBe(5);
      expect(filteredProviderList[0].UserLocationSetup.ProviderTypeId).toBe(1);
      expect(filteredProviderList[1].UserLocationSetup.ProviderTypeId).toBe(1);
      expect(filteredProviderList[2].UserLocationSetup.ProviderTypeId).toBe(3);
      expect(filteredProviderList[3].UserLocationSetup.ProviderTypeId).toBe(1);
      expect(filteredProviderList[4].UserLocationSetup.ProviderTypeId).toBe(2);
      component.providerTypeIds = [1, 2];
      filteredProviderList = component.filterByProviderType(
        filteredProviderList
      );
      expect(filteredProviderList.length).toBe(4);
    });

    it('should not filter the list by providerTypeIds if null or undefined', function () {
      expect(filteredProviderList.length).toBe(5);
      component.providerTypeIds = undefined;
      filteredProviderList = component.filterByProviderType(
        filteredProviderList
      );
      expect(filteredProviderList.length).toBe(5);
    });
  });

  describe('addOptionsForExaminingDentist function ->', function () {
    it('should add options to the examinedentist when optionsForExaminingDentist exists and not undefined', function () {
      var filteredProviderList = [];
      spyOn(component, 'addOptionsForExaminingDentist').and.callFake(
        function () {
          return filteredProviderList;
        }
      );
      component.optionsForExaminingDentist = null;
      component.addOptionsForExaminingDentist(mockProviderList);
      expect(mockProviderList.length).toBe(16);
    });

    it('should not add options to the examinedentist when optionsForExaminingDentist not exists ', function () {
      spyOn(
        component,
        'addOptionsForExaminingDentist'
      ).and.callFake(function () {});
      var ProviderList = [
        {
          UserId: '1',
          IsActive: true,
        },
        {
          UserId: '1',
          IsActive: true,
        },
        {
          UserId: '1',
          IsActive: true,
        },
      ];
      component.addOptionsForExaminingDentist(ProviderList);
      component.optionsForExaminingDentist = undefined;
      expect(ProviderList.length).toBe(3);
    });
  });

  describe('filterProviderListForOnlyActive function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      component.allProvidersList = cloneDeep(mockProviderList);
      component.currentLocation = { id: 2 };
      component.selectedProvider = '';
      component.loadProvidersByLocation = jasmine.createSpy();
      filteredProviderList = component.filterProvidersByUserLocations(
        component.allProvidersList,
        2
      );
      filteredProviderList.forEach(provider => {
        provider.IsActive = true;
      });
    });

    it('should filter the providerList for only providers who are active if onlyActive is true ', function () {
      component.activeProvidersOnly = true;
      var inactiveProvider = filteredProviderList[0];
      inactiveProvider.IsActive = false;
      var filteredList = component.filterProviderListForOnlyActive(
        filteredProviderList
      );
      expect(filteredList.length).toBe(filteredProviderList.length - 1);
      expect(filteredList).not.toContain(inactiveProvider);
    });

    it('should not filter the providerList for only providers who are active if onlyActive is false ', function () {
      component.activeProvidersOnly = false;
      var inactiveProvider = filteredProviderList[0];
      inactiveProvider.IsActive = false;
      var filteredList = component.filterProviderListForOnlyActive(
        filteredProviderList
      );
      expect(filteredList.length).toBe(filteredProviderList.length);
      expect(filteredList).toContain(inactiveProvider);
    });

    it('should filter the providerList for only providers who are active plus selectedProvider if onlyActive is true and selectedProvider is not empty ', function () {
      component.activeProvidersOnly = true;
      var inactiveProvider = filteredProviderList[0];
      component.selectedProvider = filteredProviderList[0].UserId;
      inactiveProvider.IsActive = false;
      var filteredList = component.filterProviderListForOnlyActive(
        filteredProviderList
      );
      expect(filteredList.length).toBe(filteredProviderList.length);
      expect(filteredList).toContain(inactiveProvider);
    });
  });

  describe('filterProviderListForShowOnSchedule function ->', function () {
    it('should return providerList when scope.filterShowOnSchedule is not true', function () {
      component.filterShowOnSchedule = false;

      var returnValue = component.filterProviderListForShowOnSchedule(
        'providerList',
        false
      );

      expect(returnValue).toBe('providerList');
    });

    it('should return correct results when scope.filterShowOnSchedule is true', function () {
      component.filterShowOnSchedule = true;
      var filterByLocationId = 'locationId';

      var providers = [
        // dentist with no exception
        { UserId: 1, UserLocationSetup: { ProviderTypeId: 1 } },
        // dentist with true exception
        { UserId: 2, UserLocationSetup: { ProviderTypeId: 1 } },
        // dentist with false exception
        { UserId: 3, UserLocationSetup: { ProviderTypeId: 1 } },
        // hygienist with no exception
        { UserId: 4, UserLocationSetup: { ProviderTypeId: 2 } },
        // hygienist with true exception
        { UserId: 5, UserLocationSetup: { ProviderTypeId: 2 } },
        // hygienist with false exception
        { UserId: 6, UserLocationSetup: { ProviderTypeId: 2 } },
        // other with no exception
        { UserId: 7, UserLocationSetup: { ProviderTypeId: 3 } },
        // other with true exception
        { UserId: 8, UserLocationSetup: { ProviderTypeId: 3 } },
        // other with false exception
        { UserId: 9, UserLocationSetup: { ProviderTypeId: 3 } },
      ];
      component.showOnScheduleExceptions = [
        // dentist with no exception
        { UserId: 1, LocationId: 'other', ShowOnSchedule: false },
        // dentist with true exception
        { UserId: 2, LocationId: filterByLocationId, ShowOnSchedule: true },
        // dentist with false exception
        { UserId: 3, LocationId: filterByLocationId, ShowOnSchedule: false },
        // hygienist with no exception
        { UserId: 4, LocationId: 'other', ShowOnSchedule: false },
        // hygienist with true exception
        { UserId: 5, LocationId: filterByLocationId, ShowOnSchedule: true },
        // hygienist with false exception
        { UserId: 6, LocationId: filterByLocationId, ShowOnSchedule: false },
        // other with no exception
        { UserId: 7, LocationId: 'other', ShowOnSchedule: true },
        // other with true exception
        { UserId: 8, LocationId: filterByLocationId, ShowOnSchedule: true },
        // other with false exception
        { UserId: 9, LocationId: filterByLocationId, ShowOnSchedule: false },
      ];

      var result = component.filterProviderListForShowOnSchedule(
        providers,
        filterByLocationId
      );

      expect(result.length).toBe(5);
    });
  });

  describe('filterProviderList function ->', function () {
    var filteredProviderList = [];
    var filterByLocationId = currentLocation.id;
    beforeEach(function () {
      component.filterByLocationId = 2;
      component.allProvidersList = cloneDeep(mockProviderList);
      component.currentLocation = { id: 2 };
      // filteredProviderList = component.filterProvidersByUserLocations(component.allProvidersList);

      spyOn(component, 'filterProvidersByUserLocations').and.callFake(
        function () {
          return filteredProviderList;
        }
      );
      spyOn(component, 'filterProviderListForOnlyActive').and.callFake(
        function () {
          return filteredProviderList;
        }
      );
      spyOn(component, 'filterProviderListForShowOnSchedule').and.returnValue(
        filteredProviderList
      );
      spyOn(component, 'setPreferredProviders').and.callFake(function () {
        return filteredProviderList;
      });
      spyOn(component, 'addExceptionProvider').and.callFake(function () {
        return filteredProviderList;
      });
      spyOn(component, 'defaultSelectedProvider').and.callFake(function () {});
    });

    it('should call filterProvidersByUserLocations ', function () {
      component.filterProviderList(
        component.allProvidersList,
        filterByLocationId
      );
      expect(component.filterProvidersByUserLocations).toHaveBeenCalledWith(
        component.allProvidersList,
        component.filterByLocationId
      );
    });

    it('should call filterProviderListForOnlyActive ', function () {
      component.filterProviderList(
        component.allProvidersList,
        filterByLocationId
      );
      expect(component.filterProviderListForOnlyActive).toHaveBeenCalledWith(
        filteredProviderList
      );
    });

    it('should call ctrl.setPreferredProviders ', function () {
      component.filterProviderList(
        component.allProvidersList,
        filterByLocationId
      );
      expect(component.setPreferredProviders).toHaveBeenCalledWith(
        filteredProviderList,
        component.filterByLocationId
      );
    });

    it('should call ctrl.addExceptionProvider ', function () {
      component.filterProviderList(
        component.allProvidersList,
        filterByLocationId
      );
      expect(component.defaultSelectedProvider).toHaveBeenCalledWith(
        filteredProviderList
      );
    });

    it('should call ctrl.addExceptionProvider ', function () {
      component.filterProviderList(
        component.allProvidersList,
        filterByLocationId
      );
      expect(component.addExceptionProvider).toHaveBeenCalledWith(
        filteredProviderList
      );
    });
  });

  describe('defaultsSelectedProvider function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      filteredProviderList = cloneDeep(mockPreferredProvidersList);
      component.patientInfo = { PreferredDentist: null };
      jasmine.clock().install();
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it('should do nothing if scope.selectedProvider is already set', function () {
      component.selectedProvider = '1234';
      component.defaultSelectedProvider(filteredProviderList);
      expect(component.selectedProvider).toEqual('1234');
    });

    it('should do nothing if setPreferred is undefined or false', function () {
      component.selectedProvider = '';
      component.setPreferred = false;
      component.defaultSelectedProvider(filteredProviderList);
      expect(component.selectedProvider).toEqual('');
    });

    it(
      'should set scope.selectedProvider to either patientInfo.Profile.PreferredDentist' +
        'if scope.setPreferred is true and patientInfo.Profile.PreferredDentist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 1 has been passed to directive ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 1;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        component.patientInfo = {
          Profile: {
            PreferredDentist: mockPreferredProvidersList[0].ProviderId,
          },
        };

        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to either patientInfo.Profile.PreferredHygienist' +
        'if scope.setPreferred is true and patientInfo.Profile.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        component.patientInfo = {
          Profile: {
            PreferredHygienist: mockPreferredProvidersList[0].ProviderId,
          },
        };

        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to patientInfo.PreferredDentist' +
        'if scope.setPreferred is true and patientInfo.PreferredDentist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 1 has been passed to directive ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 1;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        component.patientInfo = {
          PreferredDentist: mockPreferredProvidersList[0].ProviderId,
        };

        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to patientInfo.PreferredHygienist' +
        'if scope.setPreferred is true and patientInfo.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        component.patientInfo = {
          PreferredHygienist: mockPreferredProvidersList[0].ProviderId,
        };

        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should not set scope.selectedProvider to provider who has provider.IsPreferred set to true and ProviderTypeId is not 4' +
        ' if selectedProvider is undefined and scope.setPreferred is true and patientInfo.PreferredDentist is not in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 1 has been passed to directive ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 1;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        component.patientInfo.PreferredDentist = '1234';
        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual('');
      }
    );

    it(
      'should set scope.selectedProvider to provider who has provider.IsPreferred set to true and ProviderTypeId = 2 ' +
        ' if selectedProvider is undefined and scope.setPreferred is true and patientInfo.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 2;
        component.patientInfo.PreferredHygienist =
          mockPreferredProvidersList[0].ProviderId;
        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to provider who has provider.IsPreferred set to true and ProviderTypeId = 2 ' +
        ' if selectedProvider is undefined and scope.setPreferred is true and patientInfo.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 2;
        component.patientInfo.PreferredHygienist =
          mockPreferredProvidersList[0].ProviderId;
        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to provider who has provider.IsPreferred set to true and ProviderTypeId = 2 ' +
        ' if selectedProvider is undefined and scope.setPreferred is true and patientInfo.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 2;
        component.patientInfo.PreferredDentist = '1234';
        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual('');
      }
    );

    it(
      'should not set scope.selectedProvider if selectedProvider is undefined and scope.setPreferred is true and patientInfo is not available' +
        ' ',
      function () {
        component.selectedProvider = '';
        component.setPreferred = true;
        component.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 2;
        component.patientInfo = 'undefined';
        component.defaultSelectedProvider(filteredProviderList);
        jasmine.clock().tick(2);
        expect(component.selectedProvider).toEqual('');
      }
    );
  });
});
