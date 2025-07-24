import { TestBed } from '@angular/core/testing';

import { PdfService } from './pdf.service';
import { DomSanitizer } from '@angular/platform-browser';


describe('PdfService', () => {
  let service: PdfService
  let mockDoc = {
    document: {
      write: jasmine.createSpy('document.write'),
      close: jasmine.createSpy('document.close'),
    }
  };
  let mockWindow = {
    open: jasmine.createSpy('window.open').and.returnValue(mockDoc),
    navigator: { }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfService,
        { provide: 'windowObject', useValue: mockWindow },
        { provide: DomSanitizer, useValue: { bypassSecurityTrustResourceUrl: function(){} } }
      ]
    });
    service = TestBed.get(PdfService);
  });

  describe('initialize', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('viewPdfInNewWindow', () => {
    it('viewPdfInNewWindow should open new window and write html', () => {
      service.viewPdfInNewWindow('1', 'Title', 'Name');
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockDoc.document.write).toHaveBeenCalled()
      expect(mockDoc.document.close).toHaveBeenCalled();
      expect(service).toBeTruthy();
    });
  });
});
