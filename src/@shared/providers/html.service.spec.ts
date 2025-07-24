import { TestBed } from '@angular/core/testing';
import { HtmlService } from './html.service';
import { DOCUMENT } from '@angular/common';

describe('HtmlService', () => {
  let htmlService: HtmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[{provide:DOCUMENT,useValue:document}],
    });
    htmlService = TestBed.inject(HtmlService);
  });

  it('should be created', () => {
    expect(htmlService).toBeTruthy();
  });

  it('should escape simple text without HTML tags', () => {
    const input ="Hello World!";
    expect(htmlService.escapeHtml(input)).toBe(input)
  });

  it('should escape text with HTML tags', () => {
    const input ='<div> Hello World! </div>';
    const output='&lt;div&gt; Hello World! &lt;/div&gt;'
    expect(htmlService.escapeHtml(input)).toBe(output);
  });

  it('should escape text with special characters', () => {
    const input ='A & B';
    const output='A &amp; B'
    expect(htmlService.escapeHtml(input)).toBe(output);
  });

  it('should escape empty input', () => {
    const input ='';
    const output=''
    expect(htmlService.escapeHtml(input)).toBe(output);
  });

});
