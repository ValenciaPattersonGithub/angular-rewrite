import { AgePipe } from './age.pipe';
import { TestBed } from '@angular/core/testing';
import * as moment from 'moment';
describe('AgePipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    });
  });
  const pipe = new AgePipe();
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return correct Age', () => {
    const today = moment();
    const birthdate = moment(new Date(1990, 1, 1));
    const years = today.diff(birthdate, 'years');
    const formattedValue = pipe.transform(new Date(1990, 1, 1));
    expect(formattedValue).toEqual(years);
  });
});
