describe('common-filters -> ', function () {
  var filter, timeZoneFactory;

  // access module where filter is located
  beforeEach(
    module('common.filters', function ($provide) {
      timeZoneFactory = {
        ConvertDateToMomentTZ: jasmine
          .createSpy('timeZoneFactory.ConverDateToMomentTZ')
          .and.callFake(function (date) {
            return moment(date);
          }),
      };
      $provide.value('TimeZoneFactory', timeZoneFactory);
    })
  );

  // name the describe after the filter's name
  describe('age -> ', function () {
    // inject $filter
    beforeEach(inject(function ($filter) {
      // assign $filter to a private variable
      filter = $filter('age');
    }));

    // describe how the unit test should work
    it('should return as 0 when value is not greater than a year', function () {
      var birthDate = new Date();

      // pass filter the value to use and what the expected outcome
      // should be
      expect(filter(birthDate)).toBe(0);
    });

    it('should return as 0 when value is null', function () {
      expect(filter(null)).toBe(0);
    });

    it('should return correct age when birth date is March 3, 1990', function () {
      var staticBirthdateDate = new Date('March 3, 1990');
      var ageDifMs = Date.now() - staticBirthdateDate.getTime();
      var ageDate = new Date(ageDifMs);
      var age = Math.abs(ageDate.getUTCFullYear() - 1970);

      var birthDate = new Date('March 3, 1990');

      expect(filter(birthDate)).toBe(age);
    });

    it('should return correct age regardless of time', function () {
      var staticBirthdateDate = new Date('January 12, 1990 00:01:00');
      var ageDifMs = Date.now() - staticBirthdateDate.getTime();
      var ageDate = new Date(ageDifMs);
      var age = Math.abs(ageDate.getUTCFullYear() - 1970);

      var birthDate = new Date('January 12, 1990 23:59:00');

      expect(filter(birthDate)).toBe(age);
    });
  });

  describe('tel -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('tel');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return 123456789 when value matches numeric', function () {
      var value = '123456789';
      expect(filter(value)).toBe('123456789');
    });

    it('should return in format (PPP) ###-#### when value length is 10', function () {
      var value = '+2175552365';
      expect(filter(value)).toBe('(217) 555-2365');
    });

    it('should return (PPP) ###-#### when value length is 11', function () {
      var value = '+12175552365';
      expect(filter(value)).toBe('(217) 555-2365');
    });

    it('should return CCC (PP) ###-#### when value length is 12', function () {
      var value = '+112175552365';
      expect(filter(value)).toBe('112 (17) 555-2365');
    });
  });

  describe('fileSize -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('fileSize');
    }));

    it('should return 0 KB when value is null', function () {
      expect(filter(null)).toBe('0 KB');
    });

    it('should return with value in MB when value is greater than 1,000,000', function () {
      var value = 1000001;
      expect(filter(value)).toBe('1 MB');
    });

    it('should return with value in KB when value is less than 1,000,000', function () {
      var value = 500000;
      expect(filter(value)).toBe('500 KB');
    });
  });

  describe('toDisplayTimeUtc ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toDisplayTimeUtc');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value as h:mm a in utc when value is a date', function () {
      var value = new Date('2017-01-01T20:45:00Z');
      expect(filter(value)).toBe('8:45 pm');
    });

    it('should return value as h:mm a in utc when value is a date string', function () {
      var value = '2017-01-01T20:45:00Z';
      expect(filter(value)).toBe('8:45 pm');
    });
  });

  describe('toDisplayTime ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toDisplayTime');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value as h:mm a when value is a date', function () {
      var value = new Date('2017-01-01T20:45:00Z');
      var expected = moment(moment.utc(value).toDate()).format('h:mm a');
      expect(filter(value)).toBe(expected);
    });

    it('should return value as h:mm a when value is a date string', function () {
      var value = '2017-01-01T20:45:00';
      var expected = moment(moment.utc(value).toDate()).format('h:mm a');
      expect(filter(value)).toBe(expected);
    });
  });

  describe('toDisplayDate -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toDisplayDate');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value as MMMM D, YYYY when value is a date', function () {
      var value = new Date('12/19/2014');
      expect(filter(value)).toBe('December 19, 2014');
    });
  });

  describe('toShortDisplayDate -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toShortDisplayDate');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value in format MM/DD/YYYY when value is a date', function () {
      var value = new Date('December 19, 2014');
      expect(filter(value)).toBe('12/19/2014');
    });
  });

  describe('toShortDisplayDateLocal ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toShortDisplayDateLocal');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value as MM/DD/YYYY a when value is a date', function () {
      var value = new Date('2017-01-01T02:45:00Z');
      expect(filter(value).length).toBe(10);
    });

    it('should return value as MM/DD/YYYY a when value is a date string', function () {
      var value = '2017-01-01T02:45:00';
      expect(filter(value).length).toBe(10);
    });
  });

  describe('toDisplayDateMMDDYY -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toDisplayDateMMDDYY');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value in format MM/DD/YY when value is a date', function () {
      var value = new Date('January 4, 2014');
      expect(filter(value)).toBe('01/04/14');
    });
  });

  describe('toDisplayDateMMMDYYYY -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toDisplayDateMMMDYYYY');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value in format MMM D YYYY when value is a date', function () {
      var value = new Date('January 4, 2014');
      expect(filter(value)).toBe('Jan 4 2014');
    });
  });

  describe('toDisplayDateMDYYYY -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toDisplayDateMDYYYY');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value in format M/D/YYYY when value is a date', function () {
      var value = new Date('January 4, 2014');
      expect(filter(value)).toBe('1/4/2014');
    });
  });

  describe('toShortDisplayToday -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toShortDisplayToday');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value in format MM/DD/YYYY when value is a date', function () {
      var value = new Date('January 4, 2014');
      expect(filter(value)).toBe('01/04/2014');
    });

    it('should return Today when value is a date is today date', function () {
      var value = moment.utc(new Date());
      expect(filter(value)).toBe('Today');
    });
  });

  describe('toShortDisplayTodayLocal -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toShortDisplayTodayLocal');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value in format MM/DD/YYYY when value is a date', function () {
      var value = new Date('January 4, 2014');
      var timezone = 'Central';
      expect(filter(value, timezone)).toBe('01/04/2014');
    });

    it('should return Today when value is a date is today date', function () {
      var value = moment.utc(new Date());
      var timezone = 'Central';
      expect(filter(value, timezone)).toBe('Today');
    });
    it('should return No Location when no timezone is given', function () {
      var value = moment.utc(new Date());
      expect(filter(value)).toBe('No Location');
    });
  });

  describe('toShortDisplayLocal -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('toShortDisplayLocal');
    }));

    it('should return empty string when value is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return value in format MM/DD/YYYY when value is a date', function () {
      var value = new Date('January 4, 2014');
      var timezone = 'Central';
      expect(filter(value, timezone)).toBe('01/04/2014');
    });
    it('should return No Location when no timezone is given', function () {
      var value = moment.utc(new Date());
      expect(filter(value)).toBe('No Location');
    });
  });

  describe('PrioritySort -> ', function () {
    var mock = [
      { name: 'Mike' },
      { name: 'Keith' },
      { name: 'Ryan' },
      { name: 'Isaac' },
      { name: 'Andrew' },
    ];

    beforeEach(inject(function ($filter) {
      filter = $filter('PrioritySort');
    }));

    it('should return sort value in alphabetical order A-Z', function () {
      var result = filter(mock, 'name');
      expect(result[0].name).toBe('Andrew');
    });
  });

  describe('highlightSearchCriteria -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('highlightSearchCriteria');
    }));

    it('should return empty string when input value is null', function () {
      expect(filter(null, 'Mi')).toBe('');
    });

    it('should return html when search criteria matches input', function () {
      var input = 'Mike';
      var searchCriteria = 'Mi';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        '<span class="search-highlight">' + input + '</span>'
      );
    });

    it('should return html when search criteria with a space matches input', function () {
      var input = 'Mike A Taylor';
      var searchCriteria = 'Mike T';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        '<span class="search-highlight">' + input + '</span>'
      );
    });

    it('should return html when search criteria with a comma matches input', function () {
      var input = 'Granny, Indiana';
      var searchCriteria = 'Gran, IN';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        '<span class="search-highlight">' + input + '</span>'
      );
    });

    it('should return input when search criteria has no match', function () {
      var input = 'Granny, Indiana';
      var searchCriteria = 'Apple';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(input);
    });

    it('should return input when search criteria with just a space', function () {
      var input = 'Granny, Indiana';
      var searchCriteria = ' ';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(input);
    });

    it('should return input when search criteria with just a comma', function () {
      var input = 'Granny, Indiana';
      var searchCriteria = ',';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(input);
    });
  });

  describe('highlightSearchCriteriaContains -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('highlightSearchCriteriaContains');
    }));

    it('should return empty string when input value is null', function () {
      expect(filter(null, 'Mi')).toBe('');
    });

    it('should return html when search criteria contains input', function () {
      var input = 'Mike';
      var searchCriteria = 'ik';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        '<span class="search-highlight">' + input + '</span>'
      );
    });

    it('should return input when search criteria has no match', function () {
      var input = 'Mike';
      var searchCriteria = 'Taylor';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(input);
    });
  });

  describe('highlightSearchCriteriaPhone -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('highlightSearchCriteriaPhone');
    }));

    it('should return empty string when input is null', function () {
      expect(filter(null, '2175552365')).toBe('');
    });

    it('should return input when search criteria contains - or /', function () {
      var input = '2175552365';
      var searchCriteriaWithDash = '217-555-2365';
      var searchCriteriaWithSlash = '217/555/2365';

      expect(filter(input, searchCriteriaWithDash)).toBe(input);
      expect(filter(input, searchCriteriaWithSlash)).toBe(input);
    });

    it('should return input when search criteria is empty', function () {
      var input = '2175552365';
      var searchCriteria = '';

      expect(filter(input, searchCriteria)).toBe(input);
    });

    it('should return html when search criteria matches input some', function () {
      var input = '2175552365';
      var searchCriteria = '217555';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe(
        '<span class="search-highlight">' + input + '</span>'
      );
    });

    it('should return html when search criteria matches input exactly', function () {
      var input = '2175552365';
      var searchCriteria = '2175552365';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe(
        '<span class="search-highlight">' + input + '</span>'
      );
    });
  });

  describe('highlightSearchCriteriaState -> ', function () {
    var mockState = { StateName: 'Minnesota', StateCode: 'MN' };
    beforeEach(inject(function ($filter) {
      filter = $filter('highlightSearchCriteriaState');
    }));

    it('should return empty string when input value is null', function () {
      expect(filter(null, 'IN')).toBe('');
    });

    it('should return empty string when input value is empty string', function () {
      expect(filter('', 'IN')).toBe('');
    });

    it('should return html when search criteria matches State Code', function () {
      var input = 'Minnesota';
      var searchCriteria = 'MN';
      var result = filter(input, searchCriteria, mockState);
      expect(result.toString()).toBe(
        '<span class="search-highlight">' + input + '</span>'
      );
    });

    it('should return html when search criteria matches State Name', function () {
      var input = 'Minnesota';
      var searchCriteria = 'Minnes';
      var result = filter(input, searchCriteria, mockState);
      expect(result.toString()).toBe(
        '<span class="search-highlight">' + input + '</span>'
      );
    });

    it('should return input when state has no match', function () {
      var input = 'Minnesota';
      var searchCriteria = 'Sota';
      var result = filter(input, searchCriteria, mockState);
      expect(result.toString()).toBe(input);
    });
  });

  describe('highlightSearchCriteriaDate -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('highlightSearchCriteriaDate');
    }));

    it('should return empty string when input is null', function () {
      expect(filter(null)).toBe('');
    });

    it('should return input in date format MMM DD, YYYY when search criteria is an empty string', function () {
      var input = 'December 22, 2014';
      var result = filter(input, '');

      expect(result.toString()).toBe('Dec 22, 2014');
    });

    it('should return html when search criteria is MM/DD/YYYY replaces / with -', function () {
      var input = 'December 22, 2014';
      var searchCriteria = '12/22/2014';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe(
        '<span class="search-highlight">' +
          moment(input).format('MMM DD, YYYY') +
          '</span>'
      );
    });

    it('should return html when search criteria is /MM/DD/YYYY removes first /', function () {
      var input = 'December 22, 2014';
      var searchCriteria = '/12/22/2014';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe(
        '<span class="search-highlight">' +
          moment(input).format('MMM DD, YYYY') +
          '</span>'
      );
    });

    it('should return input in date format MMM DD, YYYY when search criteria is NaN/DD/YYYY', function () {
      var input = 'December 22, 2014';
      var searchCriteria = 'asdf/22/2014';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe('Dec 22, 2014');
    });

    it('should return input in date format MMM DD, YYYY when search criteria is MM/NaN/YYYY', function () {
      var input = 'December 22, 2014';
      var searchCriteria = '12/asdf/2014';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe('Dec 22, 2014');
    });

    it('should return input when search criteria is MM/DD/NaN', function () {
      var input = 'December 22, 2014';
      var searchCriteria = '12/22/asdf';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe('Dec 22, 2014');
    });

    it('should return html when search criteria is MM/DD/YYYY', function () {
      var input = 'December 22, 2014';
      var searchCriteria = '12/22/2014';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe(
        '<span class="search-highlight">' +
          moment(input).format('MMM DD, YYYY') +
          '</span>'
      );
    });

    it('should return input in date format MMM DD, YYYY when search criteria is NaN/DD', function () {
      var input = 'December 22, 2014';
      var searchCriteria = 'asdf/22';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe('Dec 22, 2014');
    });

    it('should return input in date format MMM DD, YYYY when search criteria is MM/NaN', function () {
      var input = 'December 22, 2014';
      var searchCriteria = '12/asdf';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe('Dec 22, 2014');
    });

    it('should return html when search criteria is MM/DD', function () {
      var input = 'December 22, 2014';
      var searchCriteria = '12/22';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe(
        '<span class="search-highlight">' +
          moment(input).format('MMM DD, YYYY') +
          '</span>'
      );
    });

    it('should return input in date format MMM DD, YYYY when search criteria is NaN', function () {
      var input = 'December 22, 2014';
      var searchCriteria = 'asdf';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe('Dec 22, 2014');
    });

    it('should return html when search criteria is MM', function () {
      var input = 'December 22, 2014';
      var searchCriteria = '12';
      var result = filter(input, searchCriteria);

      expect(result.toString()).toBe(
        '<span class="search-highlight">' +
          moment(input).format('MMM DD, YYYY') +
          '</span>'
      );
    });
  });

  describe('startFrom -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('startFrom');
    }));

    it('should return value as "text" when input is "Some text" and start is at 5', function () {
      var input = 'Some text';
      var start = 5;
      var result = filter(input, start);

      expect(result).toBe('text');
    });
  });

  describe('percentage -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('percentage');
    }));

    it('should retun value as %11 when input is .105 and decimals is 0', function () {
      var input = 0.11;
      var decimals = 0;
      var result = filter(input, decimals);

      expect(result).toBe('11%');
    });

    it('should retun value as %10.5 when input is .105 and decimals is 1', function () {
      var input = 0.105;
      var decimals = 1;
      var result = filter(input, decimals);

      expect(result).toBe('10.5%');
    });
  });

  describe('zipCode -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('zipCode');
    }));

    it('should return value as 62401 when input is 62401', function () {
      expect(filter('62401')).toEqual('62401');
    });

    it('should return value as 62401-1234 when input is 624011234', function () {
      expect(filter('624011234')).toEqual('62401-1234');
    });
  });

  describe('boldTextSearchCriteria -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('boldTextSearchCriteria');
    }));

    it('should return empty string when input value is null', function () {
      expect(filter(null, 'Bo')).toBe('');
    });

    it('should return html with bold text to match criteria when search criteria matches input', function () {
      var input = 'Bob Adams';
      var searchCriteria = 'Bo';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        '<span class="bold-search-text">Bo</span>b Adams'
      );
    });
  });

  describe('boldTextSearchCriteriaPhone -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('boldTextSearchCriteriaPhone');
    }));

    it('should return empty string when input value is null', function () {
      expect(filter(null, '217')).toBe('');
    });

    it('should return html with bold text to match criteria when search criteria matches input', function () {
      var input = '2178889999';
      var searchCriteria = '217-';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        _.escape('<span class="bold-search-text">(217) </span>888-9999')
      );
    });

    it('should return html with bold text to match criteria when search criteria match area code and first part of number', function () {
      var input = '2178889999';
      var searchCriteria = '217-88';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        _.escape(
          '<span class="bold-search-text">(217) </span><span class="bold-search-text">88</span>8-9999'
        )
      );
    });

    it('should return html with bold text to match criteria when search criteria match area code and number', function () {
      var input = '2178889999';
      var searchCriteria = '217-888-99';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        _.escape(
          '<span class="bold-search-text">(217) </span><span class="bold-search-text">888</span>-<span class="bold-search-text">99</span>99'
        )
      );
    });
  });

  describe('boldTextSearchCriteriaDate -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('boldTextSearchCriteriaDate');
    }));

    it('should return empty string when input value is null', function () {
      expect(filter(null, '12-3')).toBe('');
    });

    it('should return html with bold text to match criteria when search criteria matches month', function () {
      var input = '12-03-1973';
      var searchCriteria = '12/';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        '<span class="bold-search-text">12</span>/03/1973'
      );
    });

    it('should return html with bold text to match criteria when search criteria matches month and day', function () {
      var input = '12-03-1973';
      var searchCriteria = '12/3';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        _.escape(
          '<span class="bold-search-text">12/</span><span class="bold-search-text">03/</span><span>1973</span>'
        )
      );
    });

    it('should return html with bold text to match criteria when search criteria match matches month and day and year', function () {
      var input = '12-03-1973';
      var searchCriteria = '12/3/1973';
      var result = filter(input, searchCriteria);
      expect(result.toString()).toBe(
        '<span class="bold-search-text">12/03/1973</span>'
      );
    });
  });

  describe('boldTextIfContains -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('boldTextIfContains');
    }));

    it('should return empty string when input value is null', function () {
      expect(filter(null, 'ere')).toBe('');
    });

    it('should return original input when match does not find match', function () {
      var input = 'Jeremiah Johnson';
      var match = 'bbb';
      var result = filter(input, match);
      expect(result.toString()).toBe(input);
    });

    it('should return html with any matching text in bold', function () {
      var input = 'Jeremiah Johnson';
      var match = 'ere';
      var result = filter(input, match);
      expect(result.toString()).toBe(
        'J<span class="bold-search-text">ere</span>miah Johnson'
      );
    });

    it('should return html any matching with space text in bold', function () {
      var input = 'Jeremiah Johnson';
      var match = 'iah Jo';
      var result = filter(input, match);
      expect(result.toString()).toBe(
        'Jerem<span class="bold-search-text">iah Jo</span>hnson'
      );
    });
  });

  describe('boldTextPhoneIfContains -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('boldTextPhoneIfContains');
    }));

    it('should return empty string when input value is null', function () {
      expect(filter(null, '217')).toBe('');
    });

    it('should return input when match is null', function () {
      expect(filter('2175403725', '')).toBe('2175403725');
    });

    it('should remove delimiters from match', function () {
      var input = '2173405725';
      var match = '734-/';
      var result = filter(input, match);
      expect(result.toString()).toBe(
        _.escape(
          '(21<span class="bold-search-text">7</span>) <span class="bold-search-text">3</span><span class="bold-search-text">4</span>0-5725'
        )
      );
    });

    it('should return original input when match does not find match', function () {
      var input = '2173405725';
      var match = '888';
      var result = filter(input, match);
      expect(result.toString()).toBe(input);
    });

    it('should return formatted html as trusted sce', function () {
      var input = '2173405725';
      var match = '734';
      var result = filter(input, match);
      expect(result.$$unwrapTrustedValue()).toEqual(
        _.escape(
          '(21<span class="bold-search-text">7</span>) <span class="bold-search-text">3</span><span class="bold-search-text">4</span>0-5725'
        )
      );
    });

    it('should return formatted html with any matching text in bold', function () {
      var input = '2173405725';
      var match = '734';
      var result = filter(input, match);
      expect(result.toString()).toBe(
        _.escape(
          '(21<span class="bold-search-text">7</span>) <span class="bold-search-text">3</span><span class="bold-search-text">4</span>0-5725'
        )
      );

      input = '2173405725';
      match = '5725';
      result = filter(input, match);
      expect(result.toString()).toBe(
        _.escape(
          '(217) 340-<span class="bold-search-text">5</span><span class="bold-search-text">7</span><span class="bold-search-text">2</span><span class="bold-search-text">5</span>'
        )
      );
    });
  });

  describe('displayDeletedNote ->', function () {
    var sce, retVal;
    beforeEach(inject(function ($filter, $sce) {
      retVal = 'sce return';
      filter = $filter('displayDeletedNote');
      spyOn($sce, 'trustAsHtml').and.callFake(() => retVal);
      sce = $sce;
    }));

    it('should escape unmatched tags', function () {
      var input = '<script>alert(1)</script>';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(
        '<del>&lt;script&gt;alert(1)&lt;/script&gt;</del>'
      );
      expect(result).toBe(retVal);
    });

    it('should restore strong, em, p, and b open and close tags', function () {
      var input = '<strong>strong</strong><em>em</em><p>p</p><b>b</b>';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore br tags', function () {
      var input = '<br/><br />';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore </span>', function () {
      var input = '</span>';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore <span>', function () {
      var input = '<span><span >';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore <span style="style contents">', function () {
      var input = '<span style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore <strong style="style contents">', function () {
      var input = '<strong style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore <em style="style contents">', function () {
      var input = '<em style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore <p style="style contents">', function () {
      var input = '<p style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore <b style="style contents">', function () {
      var input = '<b style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore &amp;, &lt;, &gt;, &quot;, &#39;, &nbsp;', function () {
      var input = '&amp;&lt;&gt;&quot;&#39;&nbsp;';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore spanish characters', function () {
      var input =
        '&Aacute;&#193;&aacute;&#225;&Eacute;&#201;&eacute;&#233;&Iacute;&#205;&iacute;&#237;&Oacute;&#211;&oacute;&#243;&Uacute;&#218;&uacute;&#250;&Ntilde;&#209;&ntilde;&#241;&Uuml;&#220;&uuml;&#252;&#161;&#191;&laquo;&#171;&raquo;&#187;';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });

    it('should restore lists and subscript', function () {
      var input = '<ul></ul><ol></ol><sub></sub><sup></sup><s></s>';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(`<del>${input}</del>`);
      expect(result).toBe(retVal);
    });
  });

  describe('displayNote ->', function () {
    var sce, retVal;
    beforeEach(inject(function ($filter, $sce) {
      retVal = 'sce return';
      filter = $filter('displayNote');
      spyOn($sce, 'trustAsHtml').and.callFake(() => retVal);
      sce = $sce;
    }));

    it('should escape unmatched tags', function () {
      var input = '<script>alert(1)</script>';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(
        '&lt;script&gt;alert(1)&lt;/script&gt;'
      );
      expect(result).toBe(retVal);
    });

    it('should restore strong, em, p, and b open and close tags', function () {
      var input = '<strong>strong</strong><em>em</em><p>p</p><b>b</b>';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore br tags', function () {
      var input = '<br/><br />';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore </span>', function () {
      var input = '</span>';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore <span>', function () {
      var input = '<span><span >';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore <span style="style contents">', function () {
      var input = '<span style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore <strong style="style contents">', function () {
      var input = '<strong style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore <em style="style contents">', function () {
      var input = '<em style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore <p style="style contents">', function () {
      var input = '<p style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore <b style="style contents">', function () {
      var input = '<b style="color:#123456">';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore &amp;, &lt;, &gt;, &quot;, &#39;, &nbsp;', function () {
      var input = '&amp;&lt;&gt;&quot;&#39;&nbsp;';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore spanish characters', function () {
      var input =
        '&Aacute;&#193;&aacute;&#225;&Eacute;&#201;&eacute;&#233;&Iacute;&#205;&iacute;&#237;&Oacute;&#211;&oacute;&#243;&Uacute;&#218;&uacute;&#250;&Ntilde;&#209;&ntilde;&#241;&Uuml;&#220;&uuml;&#252;&#161;&#191;&laquo;&#171;&raquo;&#187;';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });

    it('should restore lists and subscript', function () {
      var input = '<ul></ul><ol></ol><sub></sub><sup></sup><s></s>';
      var result = filter(input);

      expect(sce.trustAsHtml).toHaveBeenCalledWith(input);
      expect(result).toBe(retVal);
    });
  });

  describe('removeSpacesFromString -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('removeSpacesFromString');
    }));

    it('should return value as "Sometext" when input is "Some text"', function () {
      var input = 'Some text';
      var result = filter(input);

      expect(result).toBe('Sometext');
    });
    it('should return value as 123 when input as integer 123', function () {
      var input = 123;
      var result = filter(input);

      expect(result).toBe(123);
    });
  });

  describe('transactionStatusIdToString -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('transactionStatusIdToString');
    }));

    it('should do conversion when a valid number is passed in', function () {
      expect(filter(1)).toBe('Proposed');
      expect(filter(2)).toBe('Referred');
      expect(filter(3)).toBe('Rejected');
      expect(filter(4)).toBe('Completed');
      expect(filter(5)).toBe('Pending');
      expect(filter(6)).toBe('Existing');
      expect(filter(7)).toBe('Accepted');
      expect(filter(8)).toBe('Referred Completed');
    });

    it('should not do conversion when an invalid number is passed in', function () {
      expect(filter(-1)).toBe('');
      expect(filter(0)).toBe('');
      expect(filter(9)).toBe('');
    });

    it('should not do conversion when an invalid character is passed in', function () {
      expect(filter('-1')).toBe('');
      expect(filter('0')).toBe('');
      expect(filter('7')).toBe('');
      expect(filter('A')).toBe('');
      expect(filter('Dental')).toBe('');
    });
  });

  describe('convertToothRangeToQuadrantOrArchCode -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('convertToothRangeToQuadrantOrArchCode');
    }));

    it('should do conversion when a valid range (single range) is passed in', function () {
      expect(filter('1-8')).toBe('UR');
      expect(filter('A-E')).toBe('UR');
      expect(filter('9-16')).toBe('UL');
      expect(filter('F-J')).toBe('UL');
      expect(filter('1-16')).toBe('UA');
      expect(filter('A-J')).toBe('UA');
      expect(filter('25-32')).toBe('LR');
      expect(filter('P-T')).toBe('LR');
      expect(filter('17-24')).toBe('LL');
      expect(filter('K-O')).toBe('LL');
      expect(filter('17-32')).toBe('LA');
      expect(filter('K-T')).toBe('LA');
      expect(filter('1-32')).toBe('FM');
      expect(filter('A-T')).toBe('FM');
    });

    it('should not do conversion when an invalid range is passed in', function () {
      expect(filter('1-9')).toBe('1-9');
      expect(filter('1-7')).toBe('1-7');
      expect(filter('1-')).toBe('1-');
      expect(filter(22)).toEqual(22);
      expect(filter('A')).toEqual('A');
      expect(filter('A-')).toEqual('A-');
      expect(filter('1-8,9')).toBe('1-8,9');
      expect(filter('1-8,17-24')).toBe('1-8,17-24');
      expect(filter('A-L')).toBe('A-L');
      expect(filter('4,5')).toBe('4,5');
      expect(filter('4,1-8')).toBe('4,1-8');
    });

    it('should not do conversion when a falsy tooth is passed in', function () {
      expect(filter(null)).toBe(null);
      expect(filter()).toBe();
      expect(filter('')).toBe('');
      expect(filter(0)).toEqual(0);
    });
  });

  describe('ctrl.calculateLabel', function () {
    var textField, valueField, dropDownLabel, options;
    beforeEach(inject(function ($filter) {
      filter = $filter('multiSelectLabel');
      textField = 'Text';
      valueField = 'Selected';
      dropDownLabel = 'Transaction Types';
      options = [
        {
          Text: 'All Transaction Types',
          Selected: true,
          Id: 0,
          IsAllOption: true,
          IsDefault: true,
        },
        { Text: 'Services', Selected: true, Id: 1 },
        { Text: 'Account Payments', Selected: true, Id: 2 },
        { Text: 'Insurance Payments', Selected: true, Id: 3 },
        { Text: '- Adjustments', Selected: true, Id: 4 },
        { Text: '+ Adjustments', Selected: true, Id: 5 },
        { Text: 'Finance Charges', Selected: true, Id: 6 },
      ];
    }));
    it('should handle every option selected', function () {
      expect(filter(options, valueField, textField, dropDownLabel)).toEqual(
        '(6) All Transaction Types'
      );
    });
    it('should handle every option selected with no label', function () {
      dropDownLabel = undefined;
      expect(filter(options, valueField, textField, dropDownLabel)).toEqual(
        '(6) All Options'
      );
    });
    it('should handle some options selected', function () {
      options[0].Selected = false;
      options[1].Selected = false;
      expect(filter(options, valueField, textField, dropDownLabel)).toEqual(
        '(5) Transaction Types'
      );
    });
    it('should handle some options selected with no lable', function () {
      dropDownLabel = undefined;
      options[0].Selected = false;
      options[1].Selected = false;
      expect(filter(options, valueField, textField, dropDownLabel)).toEqual(
        '(5) Options'
      );
    });
    it('should handle one options selected', function () {
      _.each(options, x => {
        x.Selected = false;
      });
      options[1].Selected = true;
      expect(filter(options, valueField, textField, dropDownLabel)).toEqual(
        '(1) Services'
      );
    });
  });

  describe('formatCurrencyWithParensIfNeg -> function', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('formatCurrencyWithParensIfNeg');
    }));

    it('should set the currency value to $50', function () {
      var result = filter(50);
      expect(result).toEqual('$50.00');
    });

    it('should set the currency value', function () {
      var result = filter(0);
      expect(result).toEqual('$0.00');
    });

    it('should set the currency value to 1 cent', function () {
      var result = filter(0.01);
      expect(result).toEqual('$0.01');
    });

    it('should round up the currency value to 1 cent', function () {
      var result = filter(0.0085);
      expect(result).toEqual('$0.01');
    });

    it('should round down the currency value to $0', function () {
      var result = filter(0.0035);
      expect(result).toEqual('$0.00');
    });

    it('should set the currency value with parenthesis if negative', function () {
      var result = filter(-1);
      expect(result).toEqual('($1.00)');
    });

    it('should set the currency value rounded up with parenthesis if negative', function () {
      var result = filter(-0.0085);
      expect(result).toEqual('($0.01)');
    });

    it('should set the currency value rounded down with parenthesis if negative', function () {
      var result = filter(-0.0035);
      expect(result).toEqual('$0.00');
    });

    it('should return an undefined value', function () {
      var result = filter('treefidy');
      expect(result).toEqual(undefined);
    });

    it('pre-formatted dollar amount should return an undefined value', function () {
      var result = filter('$123.45');
      expect(result).toEqual(undefined);
    });

    it('funky pre-formatted dollar amountshould return an undefined value', function () {
      var result = filter('S123.45');
      expect(result).toEqual(undefined);
    });
  });
});
