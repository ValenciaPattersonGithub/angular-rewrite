import { TestBed } from '@angular/core/testing';
import { CsvHelper } from './csv-helper.service';

describe('CsvHelper', () => {
  let service: CsvHelper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvHelper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('downloadCsvFile', () => {
    it('should use msSaveOrOpenBlob if it is available', () => {
      const result = 'test';
      const fileName = 'testFile';
      const blob = new Blob([result], { type: 'text/csv;charset=utf-8;' });
      const mockNavigator = { msSaveBlob: true, msSaveOrOpenBlob: jasmine.createSpy('msSaveOrOpenBlob')};
      spyOnProperty(window, 'navigator').and.returnValue(mockNavigator);
    
      service.downloadCsvFile(result, fileName);
    
      expect(mockNavigator.msSaveOrOpenBlob).toHaveBeenCalledWith(blob, jasmine.any(String));
    });
  
    it('should create a download link if msSaveOrOpenBlob is not available', () => {
      const result = 'test';
      const fileName = 'testFile';
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
  
      service.downloadCsvFile(result, fileName);
  
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  })
});
