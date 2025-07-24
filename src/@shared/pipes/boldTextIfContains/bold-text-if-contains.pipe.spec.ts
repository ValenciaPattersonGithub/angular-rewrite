import { BoldTextIfContainsPipe } from './bold-text-if-contains.pipe';
import { TestBed, inject } from '@angular/core/testing';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

describe('BoldTextIfContains', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule
      ]
    });
  });
  it('create an instance', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new BoldTextIfContainsPipe(domSanitizer);
    expect(pipe).toBeTruthy();
  }));

  it('providing no value returns value empty', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new BoldTextIfContainsPipe(domSanitizer);
    expect(pipe.transform('', '')).toBe('');
  }));

  it('providing value ', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new BoldTextIfContainsPipe(domSanitizer);
    expect(pipe.transform('cash', 'ca')).toBeDefined();
  }));

  it('when providing empty value ', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new BoldTextIfContainsPipe(domSanitizer);
    expect(pipe.transform('', 'ab')).toBeDefined();
  }));

  it('when providing value and result not matched', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new BoldTextIfContainsPipe(domSanitizer);
    expect(pipe.transform('cash', 'ab')).toBeDefined();
  }));

  it('when providing value that contains a dot and result matches', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new BoldTextIfContainsPipe(domSanitizer);
    expect(pipe.transform('Ann.Loc', '.')).toBeDefined();
  }));

  it('when providing value that contains a dot and result does not matches', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new BoldTextIfContainsPipe(domSanitizer);
    expect(pipe.transform('Cash', '.')).toBeDefined();
  }));

  it('when providing value that contains character both in uppercase and lowercase', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new BoldTextIfContainsPipe(domSanitizer);
    expect(pipe.transform('AaaBbCc', 'aabb')).toBeDefined();
  }));
});
