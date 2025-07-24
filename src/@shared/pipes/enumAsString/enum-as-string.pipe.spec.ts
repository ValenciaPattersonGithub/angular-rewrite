import { EnumAsStringPipe } from './enum-as-string.pipe';
import {
  CommunicationCategory,
  CommunicationReason,
  CommunicationStatus,
  CommunicationType,
  Gender
} from '../../../patient/common/models/enums';
import { TestBed, inject } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
describe('EnumAsStringPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ]
    });
  });
  it('create an instance', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new EnumAsStringPipe(translateService);
    expect(pipe).toBeTruthy();
  }));
  it('should handle CommunicationCategory Enum values', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new EnumAsStringPipe(translateService);
    const formattedValue = pipe.transform(3, CommunicationCategory);
    expect(formattedValue).toEqual('Misc Communication');
  }));
  it('should handle CommunicationReason Enum values', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new EnumAsStringPipe(translateService);
    const formattedValue = pipe.transform(1, CommunicationReason);
    expect(formattedValue).toEqual('Preventive Care');
  }));
  it('should handle CommunicationStatus Enum values', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new EnumAsStringPipe(translateService);
    const formattedValue = pipe.transform(2, CommunicationStatus);
    expect(formattedValue).toEqual('Received');
  }));
  it('should handle CommunicationType Enum values', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new EnumAsStringPipe(translateService);
    const formattedValue = pipe.transform(5, CommunicationType);
    expect(formattedValue).toEqual('US Mail');
  }));
  it('should display N/A when enum values is not valid', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new EnumAsStringPipe(translateService);
    const formattedValue = pipe.transform(-1, CommunicationCategory);
    expect(formattedValue).toEqual('N/A');
  }));
  it('should handle Gender Enum values', inject([TranslateService], (translateService: TranslateService) => {
    const pipe = new EnumAsStringPipe(translateService);
    const formattedValue = pipe.transform('M', Gender);
    expect(formattedValue).toEqual('Male');
  }));
});
