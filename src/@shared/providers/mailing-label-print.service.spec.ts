import { TestBed } from '@angular/core/testing';

import { MailingLabelPrintService } from './mailing-label-print.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const mockAllPatient = {
  PageCount: 50,
  CurrentPage: 0,
  SortCriteria: {
      PatientName: 0,
      PatientDateOfBirth: 0,
      PreviousAppointmentDate: 0,
      NextAppointmentDate: 0,
      LastCommunicationDate: 0,
      PreventiveCareDueDate: 0,
      TreatmentPlanTotalBalance: 0,
      ResponsiblePartyName: 0
  },
  TotalCount: 3,
  Rows: [
      {
          PatientName: "Felix Harrington",
          Address1: "13th street",
          Address2: "Near KFC",
          City: "California",
          State: "New York",
          ZipCode: "10000001"
      },
      {
          PatientName: "Barack Obama",
          Address1: "Presidential Library",
          Address2: "PO BOX 9100",
          City: "",
          State: "DC",
          ZipCode: "39902391"
      },
      {
          PatientName: "Hilary Clinton",
          Address1: "Silver Spring",
          Address2: "Maryland",
          City: "",
          State: "",
          ZipCode: ""
      },
      {
        PatientName: "Felix Harrington",
        Address1: "13th street",
        Address2: "Near KFC",
        City: "California",
        State: "New York",
        ZipCode: "10000001"
    },
    {
        PatientName: "Barack Obama",
        Address1: "Presidential Library",
        Address2: "PO BOX 9100",
        City: "",
        State: "DC",
        ZipCode: "39902391"
    },
    {
        PatientName: "Hilary Clinton",
        Address1: "Silver Spring",
        Address2: "Maryland",
        City: "",
        State: "",
        ZipCode: ""
    },
    {
      PatientName: "Felix Harrington",
      Address1: "13th street",
      Address2: "Near KFC",
      City: "California",
      State: "New York",
      ZipCode: "10000001"
  },
  {
      PatientName: "Barack Obama",
      Address1: "Presidential Library",
      Address2: "PO BOX 9100",
      City: "",
      State: "DC",
      ZipCode: "39902391"
  },
  {
      PatientName: "Hilary Clinton",
      Address1: "Silver Spring",
      Address2: "Maryland",
      City: "",
      State: "",
      ZipCode: ""
  },
  {
    PatientName: "Felix Harrington",
    Address1: "13th street",
    Address2: "Near KFC",
    City: "California",
    State: "New York",
    ZipCode: "10000001"
},
{
    PatientName: "Barack Obama",
    Address1: "Presidential Library",
    Address2: "PO BOX 9100",
    City: "",
    State: "DC",
    ZipCode: "39902391"
},
{
    PatientName: "Hilary Clinton",
    Address1: "Silver Spring",
    Address2: "Maryland",
    City: "",
    State: "",
    ZipCode: ""
},
{
  PatientName: "Felix Harrington",
  Address1: "13th street",
  Address2: "Near KFC",
  City: "California",
  State: "New York",
  ZipCode: "10000001"
},
{
  PatientName: "Barack Obama",
  Address1: "Presidential Library",
  Address2: "PO BOX 9100",
  City: "",
  State: "DC",
  ZipCode: "39902391"
},
{
  PatientName: "Hilary Clinton",
  Address1: "Silver Spring",
  Address2: "Maryland",
  City: "",
  State: "",
  ZipCode: ""
},
{
  PatientName: "Felix Harrington",
  Address1: "13th street",
  Address2: "Near KFC",
  City: "California",
  State: "New York",
  ZipCode: "10000001"
},
{
  PatientName: "Barack Obama",
  Address1: "Presidential Library",
  Address2: "PO BOX 9100",
  City: "",
  State: "DC",
  ZipCode: "39902391"
},
{
  PatientName: "Hilary Clinton",
  Address1: "Silver Spring",
  Address2: "Maryland",
  City: "",
  State: "",
  ZipCode: ""
},
{
  PatientName: "Felix Harrington",
  Address1: "13th street",
  Address2: "Near KFC",
  City: "California",
  State: "New York",
  ZipCode: "10000001"
},
{
  PatientName: "Barack Obama",
  Address1: "Presidential Library",
  Address2: "PO BOX 9100",
  City: "",
  State: "DC",
  ZipCode: "39902391"
},
{
  PatientName: "Hilary Clinton",
  Address1: "Silver Spring",
  Address2: "Maryland",
  City: "",
  State: "",
  ZipCode: ""
},
{
  PatientName: "Felix Harrington",
  Address1: "13th street",
  Address2: "Near KFC",
  City: "California",
  State: "New York",
  ZipCode: "10000001"
},
{
  PatientName: "Barack Obama",
  Address1: "Presidential Library",
  Address2: "PO BOX 9100",
  City: "",
  State: "DC",
  ZipCode: "39902391"
},
{
  PatientName: "Hilary Clinton",
  Address1: "Silver Spring",
  Address2: "Maryland",
  City: "",
  State: "",
  ZipCode: ""
},
{
  PatientName: "Felix Harrington",
  Address1: "13th street",
  Address2: "Near KFC",
  City: "California",
  State: "New York",
  ZipCode: "10000001"
},
{
  PatientName: "Barack Obama",
  Address1: "Presidential Library",
  Address2: "PO BOX 9100",
  City: "",
  State: "DC",
  ZipCode: "39902391"
},
{
  PatientName: "Hilary Clinton",
  Address1: "Silver Spring",
  Address2: "Maryland",
  City: "",
  State: "",
  ZipCode: ""
},
{
  PatientName: "Felix Harrington",
  Address1: "13th street",
  Address2: "Near KFC",
  City: "California",
  State: "New York",
  ZipCode: "10000001"
},
{
  PatientName: "Barack Obama",
  Address1: null,
  Address2: "PO BOX 9100",
  City: "",
  State: "DC",
  ZipCode: "39902391"
},
{
  PatientName: "Hilary Clinton",
  Address1: "Silver Spring",
  Address2: null,
  City: "",
  State: "",
  ZipCode: ""
},
  ]
}
const mockStyle = `<style>body { background-color: #dddddd; padding: 0; border: 0; margin: 0; }.page { background-color: #ffffff; width: 8.5in; height: 11in; margin: .25in auto; border: 1px dotted #888888; }.page-content { margin-top: .5in; margin-left: .27in; }.page-content::after { content: ' '; display: block; height: 0; clear: both; }.label { width: 2.63in; height: 1in; margin-right: 0; float: left; text-align: center; overflow: hidden; border: 1px dotted; border-radius: 5px; }.label-content { margin: .125in .125in 0; }button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }@media print { .body { background-color: transparent; } button { display: none;} .page { background-color: transparent; border: none; page-break-after: always; width: 8.5in; height: auto; } .label { border: none; } }</style>`;

const mockDocumentOpen = {
  write: jasmine.createSpy()
}

describe('MailingLabelPrintService', () => {
  let service: MailingLabelPrintService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [TranslateService]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(MailingLabelPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe("getPrintHtml ->", () => {
    beforeEach(() => {
      window.open = jasmine.createSpy().and.returnValue({
        document: {
          open: () => mockDocumentOpen,
          write: jasmine.createSpy(),
        },
      });
    });

    it("should create new Html window for printing labels", () => {
      spyOn(service,'labelPrint')
      
      service.getPrintHtml(mockAllPatient);

      expect(window.open).toHaveBeenCalled();
      expect(mockDocumentOpen.write).toHaveBeenCalled();
      expect(service.doc.write).toHaveBeenCalledWith("");
      expect(service.labelPrint).toHaveBeenCalledWith(mockAllPatient);
    })
  })

  describe("labelPrint ->", () => {    
    it("should print patient data as labels on new html window with print button", () => {
      service.doc = document;
      service.doc.write = jasmine.createSpy();
      service.doc.close = jasmine.createSpy();

      service.labelPrint(mockAllPatient);

      expect(service.doc.write).toHaveBeenCalled();
      expect(service.doc.close).toHaveBeenCalled();
      expect(service.style).toEqual(mockStyle);
    })
  })
});
