import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonFormatterService {

  public readonly commonDateFormat = "MM/DD/YYYY";

  constructor() { }

  getDisplayNamePerBestPractice = (person): string => {
    let displayName = '';
    // If person is not available then return blank
    if (!person) {
      return '';
    } else {
      // set suffix (handles patient (Suffix) or user (SuffixName)
      let suffix = person.Suffix ? person.Suffix : person.SuffixName ? person.SuffixName : "";

      // Set preferredName
      let preferredName = person.PreferredName ? '(' + person.PreferredName + ')' : "";

      // Set middleName
      let middleName = person.MiddleName ? person.MiddleName?.charAt(0) + "." : "";

      displayName = ([person.FirstName, preferredName, middleName]?.filter((text) => { return text; })?.join(' ')) + " " + [person.LastName, suffix]?.filter(text => { return text; })?.join(', ');

      // remove trailing whitespace from the computed name.
      return displayName.trim();
    }
  }
}
