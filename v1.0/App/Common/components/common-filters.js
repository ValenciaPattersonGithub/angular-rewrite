'use strict';

angular
  .module('common.filters', ['ngSanitize'])
  .filter('absoluteValue', function () {
    return function absoluteValue(value) {
      return Math.abs(value);
    };
  })
  .filter('age', function () {
    return function (birthdate) {
      if (!birthdate) {
        return 0;
      }

      //var birthdateDate = new Date(birthdate);
      //var ageDifMs = Date.now() - birthdateDate.getTime();
      //var ageDate = new Date(ageDifMs);
      //var age = Math.abs(ageDate.getUTCFullYear() - 1970);

      //This code works better with the date-selector directive, which should be the only way to select DOB and therefore the best way to calculate age
      var age = moment(birthdate).local().startOf('day').toDate();
      age = moment().diff(age, 'years');

      if (age <= 0) return 0;

      return age;
    };
  })
  .filter('tel', function () {
    return function (tel) {
      if (!tel) {
        return '';
      }

      var value = tel.toString().trim().replace(/^\+/, '');

      if (value.match(/[^0-9]/)) {
        return tel;
      }

      var country, city, number;

      switch (value.length) {
        case 10: // +1PPP####### -> (PPP) ###-####
          country = 1;
          city = value.slice(0, 3);
          number = value.slice(3);
          break;

        case 11: // +CPPP####### -> C (PPP) ###-####
          country = value[0];
          city = value.slice(1, 4);
          number = value.slice(4);
          break;

        case 12: // +CCCPP####### -> CCC (PP) ###-####
          country = value.slice(0, 3);
          city = value.slice(3, 5);
          number = value.slice(5);
          break;

        default:
          return tel;
      }

      if (country == 1) {
        country = '';
      }

      number = number.slice(0, 3) + '-' + number.slice(3);

      return (country + ' (' + city + ') ' + number).trim();
    };
  })
  .filter('fileSize', function () {
    return function (size) {
      if (!size) {
        return '0 KB';
      }

      // If really large, show in MB
      if (size > 1000000) {
        return Math.round((size / 1000000) * 10) / 10 + ' MB';
      }

      // Default to show in KB
      return Math.round((size / 1000) * 10) / 10 + ' KB';
    };
  })
  .filter('trimStringSize', function () {
    // Displays trimmed string
    return function (str, len) {
      if (!str) {
        return '';
      }
      if (!len) {
        len = 15;
      }
      if (str.length > len) {
        return str.slice(0, len) + '...';
      }
      return str;
    };
  })
  .filter('toDisplayDateUtc', function () {
    // Displays April 1, 1980
    return function (date) {
      if (!date) {
        return '';
      }
      return moment.utc(date).format('MMMM D, YYYY');
    };
  })
  .filter('toShortDisplayDateUtc', function () {
    // Displays MM/DD/YYYY
    return function (date) {
      if (!date) {
        return '';
      }
      return moment.utc(date).format('MM/DD/YYYY');
    };
  })
  .filter('toDisplayTimeUtc', function () {
    // Displays H:MM am/pm
    return function (date) {
      if (!date) {
        return '';
      }
      return moment.utc(date).format('h:mm a');
    };
  })
  .filter('toDisplayTime', function () {
    // Displays H:MM am/pm
    return function (date) {
      if (!date) {
        return '';
      }
      var local = moment.utc(date).toDate();
      return moment(local).format('h:mm a');
    };
  })
  .filter('toDisplayDateUtcMMDDYY', function () {
    // Displays MM/DD/YY
    //          01/04/90
    return function (date) {
      if (!date) {
        return '';
      }
      return moment.utc(date).format('MM/DD/YY');
    };
  })
  .filter('daysAgo', function () {
    return function (date) {
      console.log(date);
      if (!date) {
        return '';
      }
      var today = new Date();
      var dateToUse = new Date(date);
      var days = Math.round((today - dateToUse) / (1000 * 60 * 60 * 24));

      if (days > 0) {
        return '(' + days + ' days ago)';
      } else if (days === 0) {
        return '(Today)';
      } else {
        return '';
      }
    };
  })
  .filter('toDisplayDate', function () {
    // Displays April 1, 1980
    return function (date) {
      if (!date) {
        return '';
      }
      return moment(angular.isDate(date) ? date.toISOString() : date).format(
        'MMMM D, YYYY'
      );
    };
  })
  .filter('toShortDisplayDate', function () {
    // Displays MM/DD/YYYY
    return function (date) {
      if (!date) {
        return '';
      }
      return moment(angular.isDate(date) ? date.toISOString() : date).format(
        'MM/DD/YYYY'
      );
    };
  })
  .filter('toShortDisplayDateLocal', function () {
    // Displays MM/DD/YYYY
    return function (date) {
      if (!date) {
        return '';
      }
      var local = moment.utc(date).toDate();
      return moment(local).format('MM/DD/YYYY');
    };
  })
  .filter('toDisplayDateMMDDYY', function () {
    // Displays MM/DD/YY
    //          01/04/90
    return function (date) {
      if (!date) {
        return '';
      }
      return moment(angular.isDate(date) ? date.toISOString() : date).format(
        'MM/DD/YY'
      );
    };
  })
  .filter('toDisplayToday', [
    '$filter',
    'localize',
    function ($filter, localize) {
      // Displays MM/DD/YY if not today's date else displays "Today"
      //          01/04/90 else "Today"
      return function (date) {
        if (!date) {
          return '';
        }

        if (moment(date).isSame(moment(new Date()), 'Day')) {
          return localize.getLocalizedString('Today');
        } else {
          return $filter('toDisplayDateMMDDYY')(date);
        }
      };
    },
  ])
  .filter('toShortDisplayToday', [
    '$filter',
    'localize',
    function ($filter, localize) {
      // Displays MM/DD/YYYY if not today's date else displays "Today"
      //          01/04/90 else "Today"
      return function (date) {
        if (!date) {
          return '';
        }

        if (moment(date).isSame(moment(new Date()), 'Day')) {
          return localize.getLocalizedString('Today');
        } else {
          return $filter('toShortDisplayDate')(date);
        }
      };
    },
  ])
  .filter('toShortDisplayTodayLocal', [
    '$filter',
    'localize',
    'TimeZoneFactory',
    function ($filter, localize, timeZoneFactory) {
      // date parameter must be UTC to use this filter
      // displays 'Today' if date is today, displays MM/DD/YYYY if date is not today
      // 'Today' else 01/04/90
      return function (date, timezone) {
        if (!date) {
          return '';
        }

        var localDate = timezone
          ? timeZoneFactory.ConvertDateToMomentTZ(date, timezone)
          : moment.utc(date).local(); // converts date parameter to local moment with respect to it originally being UTC
        var localNow = timezone
          ? timeZoneFactory.ConvertDateToMomentTZ(new Date(), timezone)
          : moment(new Date()); // converts new date to local moment with respect to it originally being local

        // if dates are not both local moments isSame 'day' does not work properly after hours
        if (localDate.isSame(localNow, 'day')) {
          return timezone
            ? localize.getLocalizedString('Today')
            : 'No Location';
        } else {
          return timezone ? localDate.format('MM/DD/YYYY') : 'No Location';
        }
      };
    },
  ])
  .filter('toShortDisplayLocal', [
    'localize',
    'TimeZoneFactory',
    function (localize, timeZoneFactory) {
      // date parameter must be UTC to use this filter
      // displays MM/DD/YYYY
      return function (date, timezone) {
        if (!date) {
          return '';
        }

        var localDate = timezone
          ? timeZoneFactory.ConvertDateToMomentTZ(date, timezone)
          : moment.utc(date).local(); // converts date parameter to local moment with respect to it originally being UTC
        return timezone
          ? localDate.format('MM/DD/YYYY')
          : localize.getLocalizedString('No Location');
      };
    },
  ])
  .filter('toDisplayDateMMMDYYYY', function () {
    // Displays MMM D YYYY
    //          Jan 4 2014
    return function (date) {
      if (!date) {
        return '';
      }
      return moment.utc(date).format('MMM D YYYY');
    };
  })
  .filter('toDisplayDateMDYYYY', function () {
    // Displays M/D/YYYY
    //          1/4/2014
    return function (date) {
      if (!date) {
        return '';
      }
      return moment(date).format('M/D/YYYY');
    };
  })
  .filter('toDisplayDateMMMDD', function () {
    // Displays MMM DD
    //          Jan 04
    return function (date) {
      if (!date) {
        return '';
      }
      return moment(date).format('MMM DD');
    };
  })
  .filter('toDisplayDateYYYY', function () {
    // Displays YYYY
    //          2014
    return function (date) {
      if (!date) {
        return '';
      }
      return moment(date).format('YYYY');
    };
  })
  .filter('PrioritySort', function () {
    return function (items, field) {
      var filtered = [];

      angular.forEach(items, function (item) {
        filtered.push(item);
      });

      filtered.sort(function (a, b) {
        return a[field] > b[field] ? 1 : -1;
      });

      return filtered;
    };
  })
  .filter('highlightSearchCriteria', [
    '$sce',
    function ($sce) {
      return function (input, searchCriteria) {
        // Safegaurd against bad input
        if (!input) {
          return '';
        }

        // Check for a match, make matches stand out (only if search criteria is there)
        if (searchCriteria.length > 0) {
          var regex = new RegExp('^' + searchCriteria.toLowerCase());
          if (regex.test(input.toLowerCase())) {
            return $sce.trustAsHtml(
              '<span class="search-highlight">' + input + '</span>'
            );
          }
        }

        // Need to check to see if the search criteria has any spaces/commas and check each word
        var searchCriteriaArray = searchCriteria.split(/[ ,]+/);
        if (searchCriteriaArray.length > 1) {
          for (var i = 0; i < searchCriteriaArray.length; i++) {
            if (searchCriteriaArray[i].length > 0) {
              var regex2 = new RegExp(
                '^' + searchCriteriaArray[i].toLowerCase()
              );
              if (regex2.test(input.toLowerCase())) {
                return $sce.trustAsHtml(
                  '<span class="search-highlight">' + input + '</span>'
                );
              }
            }
          }
        }

        // No match, just return!
        return input;
      };
    },
  ])
  .filter('highlightSearchCriteriaContains', [
    '$sce',
    function ($sce) {
      return function (input, searchCriteria) {
        // Safegaurd againt bad input
        if (!input) {
          return '';
        }

        // Check for a match, make matches stand out (only if search criteria is there)
        if (searchCriteria.length > 0) {
          if (
            input
              .trim()
              .toLowerCase()
              .indexOf(searchCriteria.trim().toLowerCase()) != -1
          ) {
            return $sce.trustAsHtml(
              '<span class="search-highlight">' + input + '</span>'
            );
          }
        }

        // No match, just return!
        return input;
      };
    },
  ])
  .filter('highlightSearchCriteriaPhone', [
    '$sce',
    function ($sce) {
      return function (input, searchCriteria) {
        // Safegaurd againt bad input
        if (!input || input.length == 0) {
          return '';
        }

        // If the search contains the - or / special characters, don't highlight
        if (
          searchCriteria.indexOf('-') != -1 ||
          searchCriteria.indexOf('/') != -1
        ) {
          return input;
        }

        // Check for a match, make matches stand out (only if search criteria is there)
        if (searchCriteria.length > 0) {
          var cleansedInput = input.replace(/[^0-9\\.]+/g, '');
          var cleansedSearchCriteria = searchCriteria.replace(
            /[^0-9\\.]+/g,
            ''
          );
          if (cleansedSearchCriteria.length > 0) {
            var regex = new RegExp('^' + cleansedSearchCriteria);
            if (
              regex.test(cleansedInput) ||
              cleansedInput.indexOf(cleansedSearchCriteria) != -1
            ) {
              return $sce.trustAsHtml(
                '<span class="search-highlight">' + input + '</span>'
              );
            }
          }
        }

        // No match, just return!
        return input;
      };
    },
  ])
  .filter('highlightSearchCriteriaState', [
    '$sce',
    function ($sce) {
      return function (input, searchCriteria, state) {
        // Safegaurd againt bad input
        if (!input || input.length == 0) {
          return '';
        }

        if (searchCriteria.length > 0) {
          var regex = new RegExp('^' + searchCriteria.toLowerCase());
          if (
            regex.test(state.StateCode.toLowerCase()) ||
            regex.test(state.StateName.toLowerCase())
          ) {
            return $sce.trustAsHtml(
              '<span class="search-highlight">' + input + '</span>'
            );
          }
        }

        // No match, just return!
        return input;
      };
    },
  ])
  .filter('highlightSearchCriteriaDate', [
    '$sce',
    function ($sce) {
      return function (input, searchCriteria) {
        // Safegaurd againt bad input
        if (!input) {
          return '';
        }

        // Check for a match, make matches stand out (only if search criteria is there)
        if (searchCriteria.length > 0) {
          var inputMoment = moment(input);

          // Replace /'s with -'s. They will be treated the same.
          var simplifiedCriteria = searchCriteria.replace('/', '-');
          while (simplifiedCriteria.indexOf('/') > -1) {
            simplifiedCriteria = simplifiedCriteria.replace('/', '-');
          }

          // Remove the leading - if it exists.
          if (simplifiedCriteria.indexOf('-') == 0) {
            simplifiedCriteria = simplifiedCriteria.slice(
              -(simplifiedCriteria.length - 1)
            );
          }

          // Remove the trailing - if it exists.
          if (
            simplifiedCriteria.lastIndexOf('-') ==
            simplifiedCriteria.length - 1
          ) {
            simplifiedCriteria = simplifiedCriteria.slice(
              0,
              simplifiedCriteria.length - 1
            );
          }

          // Split the - separated string into no more than 3 parts.
          var criteria = simplifiedCriteria.split('-', 3);

          // If we have 3 parts and they are all numeric, compare the month, day, and year in that order.
          if (
            criteria.length == 3 &&
            !isNaN(parseInt(criteria[2])) &&
            !isNaN(parseInt(criteria[1])) &&
            !isNaN(parseInt(criteria[0]))
          ) {
            // Added check for 2 digit year...
            if (
              inputMoment.month() + 1 == criteria[0] &&
              inputMoment.date() == criteria[1] &&
              moment(input).format('YY') == criteria[2]
            ) {
              return $sce.trustAsHtml(
                '<span class="search-highlight">' +
                  moment(input).format('MMM DD, YYYY') +
                  '</span>'
              );
            }
            if (
              inputMoment.month() + 1 == criteria[0] &&
              inputMoment.date() == criteria[1] &&
              inputMoment.year() == criteria[2]
            ) {
              return $sce.trustAsHtml(
                '<span class="search-highlight">' +
                  moment(input).format('MMM DD, YYYY') +
                  '</span>'
              );
            }
          }
          // If we have 2 parts and they are numeric, compare the month and day in that order.
          else if (
            criteria.length == 2 &&
            !isNaN(parseInt(criteria[1])) &&
            !isNaN(parseInt(criteria[0]))
          ) {
            if (
              inputMoment.month() + 1 == criteria[0] &&
              inputMoment.date() == criteria[1]
            ) {
              return $sce.trustAsHtml(
                '<span class="search-highlight">' +
                  moment(input).format('MMM DD, YYYY') +
                  '</span>'
              );
            }
          }
          // If we have 1 part, compare it against the month, day, or year. Any match is sufficient.
          else if (criteria.length == 1 && !isNaN(parseInt(criteria[0]))) {
            if (
              inputMoment.month() + 1 == criteria[0] ||
              inputMoment.date() == criteria[0] ||
              inputMoment.year() == criteria[0]
            ) {
              return $sce.trustAsHtml(
                '<span class="search-highlight">' +
                  moment(input).format('MMM DD, YYYY') +
                  '</span>'
              );
            }
          }
        }

        // No match, just return!
        return moment(input).format('MMM DD, YYYY');
      };
    },
  ])
  .filter('sex', [
    '$filter',
    function ($filter) {
      return function (input) {
        if (!input) {
          input = '';
        } else {
          var uppercaseInput = input.toUpperCase();

          if (uppercaseInput == 'M') {
            return 'Male';
          } else if (uppercaseInput == 'F') {
            return 'Female';
          }
        }

        return input;
      };
    },
  ])
  .filter('startFrom', function () {
    return function (input, start) {
      start = +start;
      return input.slice(start);
    };
  })
  .filter('percentage', [
    '$filter',
    function ($filter) {
      return function (input, decimals) {
        return $filter('number')(input * 100.0, decimals) + '%';
      };
    },
  ])
  .filter('titlecase', function () {
    return function (string) {
      var titlecasedString = '';
      if (string) {
        var lowerCaseWords = string.split(' ');
        var upperCaseWords = [];
        angular.forEach(lowerCaseWords, function (word) {
          word = word.toLowerCase();
          word = word.charAt(0).toUpperCase() + word.substring(1);
          upperCaseWords.push(word);
        });
        titlecasedString = upperCaseWords.join(' ');
      }
      return titlecasedString;
    };
  })
  .filter('zipCode', function () {
    return function (zip) {
      if (zip && zip.length > 5) {
        var first = zip.substring(0, 5);
        var last = zip.substring(5, 9);
        var value = first + '-' + last;

        return value;
      } else return zip;
    };
  })
  .filter('excludeFromList', [
    function () {
      return function (input, toExclude, comparisionFunction) {
        var list = angular.copy(input);

        if (list && toExclude) {
          if (angular.isArray(toExclude)) {
            for (var i = 0; i < toExclude.length; i++) {
              for (var j = 0; j < list.length; j++) {
                // Passing the list item first. Then, the item to filter.
                if (comparisionFunction(list[j], toExclude[i])) {
                  list.splice(j, 1);
                  j--;
                }
              }
            }
          } else {
            for (var k = 0; k < list.length; k++) {
              if (comparisionFunction(toExclude, list[k])) {
                list.splice(k, 1);
                k--;
              }
            }
          }
        }

        return list;
      };
    },
  ])
  // filter to change matching starting text to bold
  .filter('boldTextSearchCriteria', [
    '$sce',
    '$filter',
    function ($sce, $filter) {
      return function (input, searchCriteria) {
        // Safegaurd against bad input
        if (!input) {
          return '';
        }
        var result = $filter('escapeHTML')(input);
        // Check for a match, make matches stand out (only if search criteria is there)
        if (searchCriteria.length > 0) {
          // match starting text regardless of case
          var regex = new RegExp('(' + searchCriteria + ')', 'gi');
          result = result.replace(
            regex,
            '<span class="bold-search-text">$1</span>'
          );
          return $sce.trustAsHtml(result);
        }
        // No match, just return!
        return result;
      };
    },
  ])
  // filter to change matching starting text to bold
  .filter('boldTextSearchCriteriaSpecialCharacters', [
    '$sce',
    '$filter',
    function ($sce, $filter) {
      return function (input, searchCriteria) {
        // Safegaurd against bad input
        if (!input) {
          return '';
        }
        var result = $filter('escapeHTML')(input);
        // Check for a match, make matches stand out (only if search criteria is there)
        if (searchCriteria.length > 0) {
          // escape characters that have special meaning inside a regular expression
          searchCriteria = searchCriteria.replace(
            /[-[\]{}()*+?.,\\^$|#\s]/g,
            '\\$&'
          );
          // match starting text regardless of case
          var regex = new RegExp('(' + searchCriteria + ')', 'gi');
          result = result.replace(
            regex,
            '<span class="bold-search-text">$1</span>'
          );
          return $sce.trustAsHtml(result);
        }
        // No match, just return!
        return result;
      };
    },
  ])
  .filter('boldTextSearchCriteriaPhone', [
    '$filter',
    '$sce',
    function ($filter, $sce) {
      return function (input, searchCriteria) {
        // Safegaurd againt bad input
        if (!input || input.length == 0) {
          return '';
        }

        var result,
          regex,
          countryCode = '',
          areaCode = '',
          number = '',
          criteria,
          ndx = 0;
        var formattedAreaCode = '',
          formattedCountryCode = '',
          formattedPrefix = '',
          formattedNumber = '';

        // Break the search criteria into country code, area code, prefix, and number
        // Replace /'s with -'s. They will be treated the same.
        var simplifiedCriteria = searchCriteria.replace('/', '-');
        while (simplifiedCriteria.indexOf('/') > -1) {
          simplifiedCriteria = simplifiedCriteria.replace('/', '-');
        }

        // Remove the leading - if it exists.
        if (simplifiedCriteria.indexOf('-') == 0) {
          simplifiedCriteria = simplifiedCriteria.slice(
            -(simplifiedCriteria.length - 1)
          );
        }

        // Remove the trailing - if it exists.
        if (
          simplifiedCriteria.lastIndexOf('-') ==
          simplifiedCriteria.length - 1
        ) {
          simplifiedCriteria = simplifiedCriteria.slice(
            0,
            simplifiedCriteria.length - 1
          );
        }

        // Split the - separated string into no more than 3 parts.
        criteria = simplifiedCriteria.split('-', 4);

        // Check for a match, make matches stand out (only if search criteria is there)
        if (criteria.length > 0) {
          var formattedInput = $filter('tel')(input);
          // split the formatted input into sections
          var phoneNumber = formattedInput.split(' ', 2);

          // if phone number has country code handle this...
          if (phoneNumber.length == 3) {
            countryCode = phoneNumber[0];
            areaCode = phoneNumber[1];
            number = phoneNumber[2];
          } else if (phoneNumber.length == 2) {
            // handle area code, then both parts of number
            countryCode = '';
            areaCode = phoneNumber[0];
            number = phoneNumber[1];
          }

          // if country code matches the search criteria
          if (
            countryCode.length > 0 &&
            criteria[ndx] &&
            !isNaN(parseInt(criteria[ndx]))
          ) {
            // match starting text of each term regardless of case
            regex = new RegExp('^(' + criteria[ndx] + ')', 'gi');
            if (regex.test(countryCode)) {
              result = countryCode.replace(
                regex,
                '<span class="bold-search-text">$1</span>'
              );
              formattedCountryCode = result;
              var counter = ndx + 1;
              if (criteria[counter]) {
                ndx = ndx + 1;
              }
            } else {
              return input;
            }
          }

          // test to see if only one element in search criteria, if so only do that formatting
          if (criteria.length == 1 && !isNaN(parseInt(criteria))) {
            areaCode = areaCode.replace('(', '');
            areaCode = areaCode.replace(')', '');

            // match starting text of each term regardless of case
            regex = new RegExp('^(' + criteria + ')', 'gi');
            if (regex.test(areaCode)) {
              result = '<b>(' + areaCode + ') </b>';

              result =
                '<span class="bold-search-text">(' +
                _.escape(areaCode) +
                ') </span>';
              formattedAreaCode = result;
              counter = ndx + 1;
              if (criteria[counter]) {
                ndx = ndx + 1;
              }
            } else {
              return input;
            }
          } else {
            // if area code matches the the search criteria and more than one element in array
            if (
              areaCode.length > 0 &&
              criteria.length > 1 &&
              !isNaN(parseInt(criteria[ndx]))
            ) {
              areaCode = areaCode.replace('(', '');
              areaCode = areaCode.replace(')', '');

              // match starting text of each term regardless of case
              regex = new RegExp('^(' + criteria[ndx] + ')', 'gi');
              if (regex.test(areaCode)) {
                result =
                  '<span class="bold-search-text">(' +
                  _.escape(areaCode) +
                  ') </span>';
                formattedAreaCode = result;
                counter = ndx + 1;
                if (criteria[counter]) {
                  ndx = ndx + 1;
                }
              } else {
                return input;
              }
            } else {
              return input;
            }
          }

          // break the phone to prefix - num
          var numberFragments = number.split('-', 2);

          // match prefix
          var prefix = numberFragments[0];
          if (
            prefix.length > 0 &&
            criteria[ndx] &&
            !isNaN(parseInt(criteria[ndx]))
          ) {
            // match starting text of each term regardless of case
            regex = new RegExp('^(' + criteria[ndx] + ')', 'gi');
            if (regex.test(prefix)) {
              result = prefix.replace(
                regex,
                '<span class="bold-search-text">$1</span>'
              );
              formattedPrefix = result + '-';
              counter = ndx + 1;
              if (criteria[counter]) {
                ndx = ndx + 1;
              }
            } else {
              formattedPrefix = prefix + '-';
            }
          }

          // match number
          var num = numberFragments[1];
          if (
            num.length > 0 &&
            criteria[ndx] &&
            !isNaN(parseInt(criteria[ndx]))
          ) {
            // match starting text of each term regardless of case
            regex = new RegExp('^(' + criteria[ndx] + ')', 'gi');
            if (regex.test(num)) {
              result = num.replace(
                regex,
                '<span class="bold-search-text">$1</span>'
              );
              formattedNumber = result;
            } else {
              formattedNumber = num;
            }
          }
          result =
            formattedCountryCode +
            formattedAreaCode +
            formattedPrefix +
            formattedNumber;
          return $sce.trustAsHtml(_.escape(result));
        }
        return input;
      };
    },
  ])
  .filter('boldTextSearchCriteriaDate', [
    '$sce',
    function ($sce) {
      return function (input, searchCriteria) {
        // Safegaurd againt bad input
        if (!input) {
          return '';
        }

        var displayDate, regex, result;

        // Check for a match, make matches stand out (only if search criteria is there)
        if (searchCriteria.length > 0) {
          input = new Date(input);
          var inputMoment = moment(input);

          // Replace /'s with -'s. They will be treated the same.
          var simplifiedCriteria = searchCriteria.replace('/', '-');
          while (simplifiedCriteria.indexOf('/') > -1) {
            simplifiedCriteria = simplifiedCriteria.replace('/', '-');
          }

          // Remove the leading - if it exists.
          if (simplifiedCriteria.indexOf('-') == 0) {
            simplifiedCriteria = simplifiedCriteria.slice(
              -(simplifiedCriteria.length - 1)
            );
          }

          // Remove the trailing - if it exists.
          if (
            simplifiedCriteria.lastIndexOf('-') ==
            simplifiedCriteria.length - 1
          ) {
            simplifiedCriteria = simplifiedCriteria.slice(
              0,
              simplifiedCriteria.length - 1
            );
          }

          // Split the - separated string into no more than 3 parts.
          var criteria = simplifiedCriteria.split('-', 3);

          // If we have 3 parts and they are all numeric, compare the month, day, and year in that order.
          if (
            criteria.length == 3 &&
            !isNaN(parseInt(criteria[2])) &&
            !isNaN(parseInt(criteria[1])) &&
            !isNaN(parseInt(criteria[0]))
          ) {
            // Added check for 2 digit year...
            if (
              inputMoment.month() + 1 == criteria[0] &&
              inputMoment.date() == criteria[1] &&
              moment(input).format('YY') == criteria[2]
            ) {
              return $sce.trustAsHtml(
                '<span class="bold-search-text">' +
                  _.escape(moment(input).format('MM/DD/YYYY')) +
                  '</span>'
              );
            }
            if (
              inputMoment.month() + 1 == criteria[0] &&
              inputMoment.date() == criteria[1] &&
              inputMoment.year() == criteria[2]
            ) {
              return $sce.trustAsHtml(
                '<span class="bold-search-text">' +
                  _.escape(moment(input).format('MM/DD/YYYY')) +
                  '</span>'
              );
            }
          }
          // If we have 2 parts and they are numeric, compare the month and day in that order.
          else if (
            criteria.length == 2 &&
            !isNaN(parseInt(criteria[1])) &&
            !isNaN(parseInt(criteria[0]))
          ) {
            if (
              inputMoment.month() + 1 == criteria[0] &&
              inputMoment.date() == criteria[1]
            ) {
              // formatted date
              displayDate = moment(input).format('MM/DD/YYYY');
              // only bold entered search criteria
              displayDate =
                '<span class="bold-search-text">' +
                moment(input).format('MM/') +
                '</span>' +
                '<span class="bold-search-text">' +
                moment(input).format('DD/') +
                '</span>' +
                '<span>' +
                moment(input).format('YYYY') +
                '</span>';
              return $sce.trustAsHtml(_.escape(displayDate));
            }
          }
          // If we have 1 part, compare it against the month, day, or year. Any match is sufficient.
          else if (criteria.length == 1 && !isNaN(parseInt(criteria[0]))) {
            if (
              inputMoment.month() + 1 == criteria[0] ||
              inputMoment.date() == criteria[0] ||
              inputMoment.year() == criteria[0]
            ) {
              // formatted date
              displayDate = moment(input).format('MM/DD/YYYY');

              // match starting text of each term regardless of case
              regex = new RegExp('^(' + criteria[0] + ')', 'gi');
              if (regex.test(displayDate)) {
                result = displayDate.replace(
                  regex,
                  '<span class="bold-search-text">$1</span>'
                );
                return $sce.trustAsHtml(result);
              }
              return $sce.trustAsHtml(_.escape(displayDate));
            }
          }
        }
        // No match, just return!
        return _.escape(moment(new Date(input)).format('MM/DD/YYYY'));
      };
    },
  ])
  .filter('boldTextInString', function () {
    return function (displayValue, match) {
      var result = displayValue;
      // match starting text of each term regardless of case
      var regex = new RegExp('^(' + match + ')', 'gi');
      if (regex.test(displayValue)) {
        result = displayValue.replace(
          regex,
          '<span class="bold-search-text">$1</span>'
        );

        return result;
      }
      return result;
    };
  })
  .filter('escapeHTML', function () {
    return function (text) {
      if (text) {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/'/g, '&#39;')
          .replace(/"/g, '&quot;');
      } else {
        return '';
      }
    };
  })
  .filter('boldTextIfContains', [
    '$sce',
    '$filter',
    function ($sce, $filter) {
      return function (input, match) {
        // Safegaurd againt bad input
        if (!input || input.length == 0) {
          return '';
        }
        var result = $filter('escapeHTML')(input);
        if (!match || match.length == 0) {
          return $sce.trustAsHtml(result);
        }

        // match starting text of each term regardless of case
        match = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp('(' + match + ')', 'gi');
        if (regex.test(result)) {
          result = result.replace(
            regex,
            '<span class="bold-search-text">$1</span>'
          );
        }
        return $sce.trustAsHtml(result);
      };
    },
  ])
  .filter('boldTextPhoneIfContains', [
    '$filter',
    '$sce',
    function ($filter, $sce) {
      return function (input, match) {
        var result = input;
        // Safeguard against bad input
        if (!input || input.length == 0) {
          return '';
        }
        if (!match || match.length == 0) {
          return input;
        }

        // remove delimiters
        match = match.replace(/[/()\s-]/g, '');

        var formattedInput = $filter('tel')(input);
        // match starting text of each term regardless of case
        var find = new RegExp(match);
        var res = find.exec(input);

        var regex = new RegExp('(' + match + ')', 'gi');
        if (regex.test(input)) {
          var startIndex = res.index;
          var lastIndex = res.index + match.length;
          var counter = 0;
          result = '';
          for (var i = 0; i < formattedInput.length; i++) {
            if (!isNaN(parseInt(formattedInput[i]))) {
              if (counter >= startIndex && counter < lastIndex) {
                result =
                  result +
                  '<span class="bold-search-text">' +
                  formattedInput[i] +
                  '</span>';
              } else {
                result = result + formattedInput[i];
              }
              counter++;
            } else {
              result = result + formattedInput[i];
            }
          }
        }
        return $sce.trustAsHtml(_.escape(result));
      };
    },
  ])
  .filter('truncate', function () {
    // filter to truncate the text (end and length parameters can be customized)
    return function (text, length, end) {
      if (angular.isUndefined(text) || text === '' || text == null) return '';
      //convert input text into string
      text = text.toString();

      if (isNaN(length)) length = 10;

      if (angular.isUndefined(end) || end === null) end = '...';

      if (text.length <= length) {
        return text;
      } else {
        return String(text).substring(0, length - end.length) + end;
      }
    };
  })
  .filter('highlightTextIfContains', [
    '$sce',
    function ($sce) {
      // this filter makes the input text bold if it contains the search string
      // input -> actual input
      // searchString -> string that user want to highlight
      // maxLength -> length to which user want to truncate actual input on display (optional)
      // truncateSymbol -> symbol that user wish to show as truncation (optional)
      // Note- Do not use truncate filter separately, it will give bad result. Pass the length as parameter only.

      //function to escape special symbols
      var escapeSpecialSymbols = function (str) {
        var specials = /[.*+?|()\[\]{}\\$^]/g;
        return str.replace(specials, '\\$&');
      };
      return function (input, searchString, maxLength, truncateSymbol) {
        if (angular.isDefined(input) && input != null) {
          var originalInput = input;
          var textToReplace;

          // set default truncate symbol if not specified
          if (angular.isUndefined(truncateSymbol)) {
            truncateSymbol = '...';
          }
          var truncateSymbolLength = truncateSymbol.length;
          if (angular.isDefined(searchString) && searchString != '') {
            // set default truncate length if not specified
            if (angular.isUndefined(maxLength)) {
              maxLength = 10;
            }
            if (input.length > maxLength) {
              input =
                _.escape(input.substr(0, maxLength - truncateSymbolLength)) +
                truncateSymbol;
            }
            // loop to find searchword in partial visible-partial truncated area
            for (
              var i =
                maxLength - truncateSymbolLength - (searchString.length - 1);
              i < maxLength - truncateSymbolLength;
              ++i
            ) {
              if (
                originalInput
                  .substring(i, i + searchString.length)
                  .toLowerCase() == searchString
              ) {
                textToReplace = _.escape(input.substring(i, input.length));
                input =
                  _.escape(input.substr(0, i)) + '<b>' + textToReplace + '</b>';
                return input;
              }
            }
            // find words which are completed truncated
            var truncatedText = originalInput.substr(
              maxLength - truncateSymbolLength + 1,
              originalInput.length
            );
            if (
              new RegExp(
                '(' + escapeSpecialSymbols(searchString) + ')',
                'gi'
              ).test(truncatedText)
            ) {
              textToReplace = _.escape(
                input.substring(maxLength - truncateSymbolLength, input.length)
              );
              input =
                _.escape(input.substr(0, maxLength - truncateSymbolLength)) +
                '<b>' +
                textToReplace +
                '</b>';
              return input;
            }
            // find words which are completely visible
            textToReplace = new RegExp(
              '(' + escapeSpecialSymbols(_.escape(searchString)) + ')',
              'gi'
            );
            input = _.escape(input).replace(textToReplace, '<b>$1</b>');
          } else {
            if (angular.isDefined(maxLength) && input.length > maxLength) {
              input =
                _.escape(input.substr(0, maxLength - truncateSymbolLength)) +
                truncateSymbol;
            } else {
              input = _.escape(input);
            }
          }
        } else input = '';

        return input;
      };
    },
  ])
  .filter('displayDeletedNote', [
    '$sce',
    function ($sce) {
      function escape(input) {
        return (
          _.escape(input)
            // restore <strong>, </strong>, <em>, </em>, <p>, </p>, <b>, </b>
            .replace(/&lt;(\/?(strong|em|p|b))&gt;/g, '<$1>')
            // restore <ol>,</ol>, <ul>,</ul>, <li>,</li>
            .replace(/&lt;(\/?(ol|li|ul|s|sub|sup))&gt;/g, '<$1>')
            // restore <{strong|em|p|b|ol|li|ul} style="<style contents>">
            .replace(
              /&lt;?(strong|em|p|b|ol|li|ul|s|sub|sup) style=&quot;([^"]*?)&quot;&gt;/g,
              '<$1 style="$2">'
            )
            // restore <br/>
            .replace(/&lt;(br ?)\/&gt;/g, '<$1/>')
            // restore </span>
            .replace(/&lt;\/span&gt;/g, '</span>')
            //restore <span>
            .replace(/&lt;(span ?)&gt;/g, '<$1>')
            // restore <span style="<style contents>">
            .replace(
              /&lt;span style=&quot;([^"]*?)&quot;&gt;/g,
              '<span style="$1">'
            )
            // restore &amp;, &lt;, &gt;, &quot;, &#39;, &nbsp; and spanish characters
            .replace(
              /&amp;(amp;|lt;|gt;|quot;|#39;|nbsp;|Aacute;|#193;|aacute;|#225;|Eacute;|#201;|eacute;|#233;|Iacute;|#205;|iacute;|#237;|Oacute;|#211;|oacute;|#243;|Uacute;|#218;|uacute;|#250;|Ntilde;|#209;|ntilde;|#241;|Uuml;|#220;|uuml;|#252;iquest;|iexcl;||#161;|#191;|laquo;|#171;|raquo;|#187;)/g,
              '&$1'
            )
        );
      }
      return function (data) {
        return $sce.trustAsHtml('<del>' + escape(data) + '</del>');
      };
    },
  ])
  .filter('displayNote', [
    '$sce',
    function ($sce) {
      function escape(input) {
        return (
          _.escape(input)
            // restore <strong>, </strong>, <em>, </em>, <p>, </p>, <b>, </b>
            .replace(/&lt;(\/?(strong|em|p|b))&gt;/g, '<$1>')
            // restore <ol>,</ol>, <ul>,</ul>, <li>,</li>
            .replace(/&lt;(\/?(ol|li|ul|s|sub|sup))&gt;/g, '<$1>')
            // restore <{strong|em|p|b|ol|li|ul} style="<style contents>">
            .replace(
              /&lt;?(strong|em|p|b|ol|li|ul|s|sub|sup) style=&quot;([^"]*?)&quot;&gt;/g,
              '<$1 style="$2">'
            )
            // restore <br/>
            .replace(/&lt;(br ?)\/&gt;/g, '<$1/>')
            // restore </span>
            .replace(/&lt;\/span&gt;/g, '</span>')
            //restore <span>
            .replace(/&lt;(span ?)&gt;/g, '<$1>')
            // restore <span style="<style contents>">
            .replace(
              /&lt;span style=&quot;([^"]*?)&quot;&gt;/g,
              '<span style="$1">'
            )
            // restore &amp;, &lt;, &gt;, &quot;, &#39;, &nbsp; and spanish characters
            .replace(
              /&amp;(amp;|lt;|gt;|quot;|#39;|nbsp;|Aacute;|#193;|aacute;|#225;|Eacute;|#201;|eacute;|#233;|Iacute;|#205;|iacute;|#237;|Oacute;|#211;|oacute;|#243;|Uacute;|#218;|uacute;|#250;|Ntilde;|#209;|ntilde;|#241;|Uuml;|#220;|uuml;|#252;iquest;|iexcl;||#161;|#191;|laquo;|#171;|raquo;|#187;)/g,
              '&$1'
            )
        );
      }
      return function (data) {
        return $sce.trustAsHtml(escape(data));
      };
    },
  ])
  .filter('searchOnParticularColumn', function () {
    //This filter can be used to provide client side search functionality on grid for particular columns.
    //How to use:
    //searchOnParticularColumn:searchServiceCodesKeyword:['Code','CdtCodeName','Description','ServiceTypeDescription']
    //Where, searchServiceCodesKeyword - ngModel that holds search string and [] - list of columns on which you want to perform search
    return function (input, searchString, columnsObj) {
      var res = [];
      var value;

      //Check if searchString is present or not.
      if (angular.isUndefined(searchString)) {
        return input;
      }

      //Make searchString lowercase.
      searchString = searchString.toLowerCase();
      angular.forEach(input, function (item) {
        for (var index = 0; index < columnsObj.length; index++) {
          value = item[columnsObj[index]];
          if (angular.isDefined(value) && value != null) {
            //If value is string then make it lowercase.
            value = value.toString();

            value = value.toLowerCase();

            if (value != null && value.indexOf(searchString) !== -1) {
              res.push(item);
              break;
            }
          }
        }
      });
      return res;
    };
  })
  .filter('minutes', function () {
    return function (minutes) {
      if (!minutes) {
        return '0';
      }
      return Math.round(minutes / 60000);
    };
  })
  .filter('zipStrip', function () {
    return function (zipCode) {
      if (!zipCode) {
        return '';
      }
      if (zipCode.indexOf('-') > 0) {
        zipCode = zipCode.replace(/-/g, '');
      }
      return zipCode;
    };
  })
  .filter('mergeText', function () {
    //  This filter can be used to concat multiple words using custom separator.
    //  How to use:
    //  {{data | mergeText:',':['ProviderUserName','Location']}}
    //  Where,
    //  data - which contains record
    //  , - word separator
    //  [] - list of properties that you want to merge
    return function (input, mergeSymbol, textObj) {
      var result = '';
      var value;
      var formattedInput = [];

      //Check if input is present or not.
      if (!input) {
        return result;
      }

      //Check if mergeSymbol is present or not.
      if (!mergeSymbol) {
        mergeSymbol = ',';
      }

      //Check if textObj is present or not.
      if (!textObj) {
        return result;
      }

      if (textObj.length > 0) {
        for (var index = 0; index < textObj.length; index++) {
          // Check if property exists in the object
          value = textObj[index] in input ? input[textObj[index]] : null;
          if (
            typeof value !== 'undefined' &&
            value !== null &&
            value.length > 0
          ) {
            // push only valid fields into the array.
            // this removes invalid data
            formattedInput.push(value);
          }
        }
        result = formattedInput.join(mergeSymbol);
      }
      return result;
    };
  })
  .filter('getPatientNameAsPerBestPractice', function () {
    //  This filter can be used to get patient name as per best practices.
    //  How to use:
    //  $scope.patientName = $filter('getPatientNameAsPerBestPractice')(ctrl.patientInfo);
    //  Where,
    //  ctrl.patientInfo = {"PatientId":"8ba56983-5fe8-462b-8ae9-470881b4de02","FirstName":"Anil","MiddleName":"T","LastName":"Verma","PreferredName":"Anya","Prefix":"","Suffix":"Sr","AddressLine1":"","AddressLine2":"","City":"","State":"","ZipCode":"","Sex":"M","DateOfBirth":null,"IsPatient":true,"PatientCode":"VERAN1","EmailAddress":"","EmailAddressRemindersOk":false,"EmailAddress2":"","EmailAddress2RemindersOk":false,"PersonAccount":{"AccountId":"bec42805-8cd5-494b-aee5-d1be9a64b5e9","PersonId":"8ba56983-5fe8-462b-8ae9-470881b4de02","PersonAccountMember":{"AccountMemberId":"d1333515-02b8-4f9a-911d-3419b46f0b12","AccountId":"bec42805-8cd5-494b-aee5-d1be9a64b5e9","ResponsiblePersonId":"8ba56983-5fe8-462b-8ae9-470881b4de02","PersonId":"8ba56983-5fe8-462b-8ae9-470881b4de02","Balance30":0,"Balance60":0,"Balance90":0,"Balance120":0,"BalanceCurrent":7.4,"BalanceInsurance":0,"IsActive":true,"DataTag":"{\"Timestamp\":\"2015-12-08T10:02:16.007+00:00\",\"RowVersion\":\"W/\\\"datetime'2015-12-08T10%3A02%3A16.007Z'\\\"\"}","UserModified":"00000000-0000-0000-0000-000000000000","DateModified":"2015-12-08T10:02:15.3471401Z"},"DataTag":"{\"Timestamp\":\"2015-12-06T09:51:31.94+00:00\",\"RowVersion\":\"W/\\\"datetime'2015-12-06T09%3A51%3A31.94Z'\\\"\"}","UserModified":"00000000-0000-0000-0000-000000000000","DateModified":"2015-12-06T09:51:30.0730796Z"},"ResponsiblePersonType":1,"ResponsiblePersonId":"8ba56983-5fe8-462b-8ae9-470881b4de02","PreferredLocation":102,"PreferredDentist":"99d27666-528d-4c44-8901-5cf7c8b2f1a6","PreferredHygienist":"b34005ef-5a51-4775-9005-bdf506e2b3be","DataTag":"{\"Timestamp\":\"2015-12-08T10:02:16.22+00:00\",\"RowVersion\":\"W/\\\"datetime'2015-12-08T10%3A02%3A16.22Z'\\\"\"}","UserModified":"00000000-0000-0000-0000-000000000000","DateModified":"2015-12-08T10:02:14.6439881Z"}
    //  OR
    //  ctrl.patientInfo.Value = {"PatientId":"8ba56983-5fe8-462b-8ae9-470881b4de02","FirstName":"Anil","MiddleName":"T","LastName":"Verma","PreferredName":"Anya","Prefix":"","Suffix":"Sr","AddressLine1":"","AddressLine2":"","City":"","State":"","ZipCode":"","Sex":"M","DateOfBirth":null,"IsPatient":true,"PatientCode":"VERAN1","EmailAddress":"","EmailAddressRemindersOk":false,"EmailAddress2":"","EmailAddress2RemindersOk":false,"PersonAccount":{"AccountId":"bec42805-8cd5-494b-aee5-d1be9a64b5e9","PersonId":"8ba56983-5fe8-462b-8ae9-470881b4de02","PersonAccountMember":{"AccountMemberId":"d1333515-02b8-4f9a-911d-3419b46f0b12","AccountId":"bec42805-8cd5-494b-aee5-d1be9a64b5e9","ResponsiblePersonId":"8ba56983-5fe8-462b-8ae9-470881b4de02","PersonId":"8ba56983-5fe8-462b-8ae9-470881b4de02","Balance30":0,"Balance60":0,"Balance90":0,"Balance120":0,"BalanceCurrent":7.4,"BalanceInsurance":0,"IsActive":true,"DataTag":"{\"Timestamp\":\"2015-12-08T10:02:16.007+00:00\",\"RowVersion\":\"W/\\\"datetime'2015-12-08T10%3A02%3A16.007Z'\\\"\"}","UserModified":"00000000-0000-0000-0000-000000000000","DateModified":"2015-12-08T10:02:15.3471401Z"},"DataTag":"{\"Timestamp\":\"2015-12-06T09:51:31.94+00:00\",\"RowVersion\":\"W/\\\"datetime'2015-12-06T09%3A51%3A31.94Z'\\\"\"}","UserModified":"00000000-0000-0000-0000-000000000000","DateModified":"2015-12-06T09:51:30.0730796Z"},"ResponsiblePersonType":1,"ResponsiblePersonId":"8ba56983-5fe8-462b-8ae9-470881b4de02","PreferredLocation":102,"PreferredDentist":"99d27666-528d-4c44-8901-5cf7c8b2f1a6","PreferredHygienist":"b34005ef-5a51-4775-9005-bdf506e2b3be","DataTag":"{\"Timestamp\":\"2015-12-08T10:02:16.22+00:00\",\"RowVersion\":\"W/\\\"datetime'2015-12-08T10%3A02%3A16.22Z'\\\"\"}","UserModified":"00000000-0000-0000-0000-000000000000","DateModified":"2015-12-08T10:02:14.6439881Z"}

    return function (patientInfo) {
      var patientName = '';
      var patientDetails;

      // If patientInfo is not available then return blank
      if (!patientInfo) {
        return patientName;
      }

      // If data is present in patientInfo.Value property then use that else take it from patientInfo
      if (patientInfo.Value) {
        patientDetails = patientInfo.Value;
      } else {
        patientDetails = patientInfo;
      }

      // Set preferredName
      var preferredName = patientDetails.PreferredName
        ? '(' + patientDetails.PreferredName + ')'
        : '';

      // Set middleName
      var middleName = patientDetails.MiddleName
        ? patientDetails.MiddleName.charAt(0) + '.'
        : '';

      patientName =
        [patientDetails.FirstName, preferredName, middleName]
          .filter(function (text) {
            return text;
          })
          .join(' ') +
        ' ' +
        [patientDetails.LastName, patientDetails.Suffix]
          .filter(function (text) {
            return text;
          })
          .join(', ');

      // remove trailing whitespace from the computed name.
      return patientName.trim();
    };
  })
  .filter('removeSpacesFromString', function () {
    return function (text) {
      if (!angular.isString(text)) {
        return text;
      }
      return text.replace(/[\s]/g, '');
    };
  })
  .filter('newLine', [
    '$sce',
    function ($sce) {
      ///Line break replacing <br/> tag
      return function (carriageReturn) {
        if (!carriageReturn) {
          return '';
        }
        var text = carriageReturn.replace(/\n/g, '<br />');
        return $sce.trustAsHtml('<div class="">' + _.escape(text) + '</div>');
      };
    },
  ])
  .filter('getNameWithProfessionalDesignation', function () {
    //  This filter can be used to get provider name with professional designation.
    return function (provider) {
      var nameWithProfessionalDesignation = '';

      // If patientInfo is not available then return blank
      if (!provider) {
        return nameWithProfessionalDesignation;
      }
      nameWithProfessionalDesignation =
        provider.Name > ''
          ? provider.Name
          : provider.FirstName +
            ' ' +
            provider.LastName +
            (provider.ProfessionalDesignation > ''
              ? ', ' + provider.ProfessionalDesignation
              : '');

      // remove trailing whitespace from the computed name.
      return nameWithProfessionalDesignation.trim();
    };
  })
  .filter('convertToothRangeToQuadrantOrArchCode', [
    'StaticData',
    function (staticData) {
      return function (tooth) {
        // only do the translation for display if we get one quadrant or arch range (1-8), etc., not for (1-8,10) (1-9) (1-8,17-24), etc.
        if (
          tooth &&
          tooth.toString().indexOf('-') !== -1 &&
          tooth.toString().indexOf(',') === -1
        ) {
          var map = staticData.ToothRangeToCodeMap();
          return map[tooth] ? map[tooth] : tooth;
        }
        return tooth;
      };
    },
  ])
  .filter('transactionStatusIdToString', [
    '$filter',
    'localize',
    function ($filter, localize) {
      return function (statusId) {
        var statusDescription = '';

        switch (statusId) {
          case 1:
            statusDescription = localize.getLocalizedString('Proposed');
            break;
          case 2:
            statusDescription = localize.getLocalizedString('Referred');
            break;
          case 3:
            statusDescription = localize.getLocalizedString('Rejected');
            break;
          case 4:
            statusDescription = localize.getLocalizedString('Completed');
            break;
          case 5:
            statusDescription = localize.getLocalizedString('Pending');
            break;
          case 6:
            statusDescription = localize.getLocalizedString('Existing');
            break;
          case 7:
            statusDescription = localize.getLocalizedString('Accepted');
            break;
          case 8:
            statusDescription =
              localize.getLocalizedString('Referred Completed');
            break;
          default:
            statusDescription = '';
        }

        return statusDescription;
      };
    },
  ])
  .filter('getFullNameWithProfessionalDesignation', function () {
    return function (user) {
      var middleName = user.MiddleName || '';
      var suffixName = user.SuffixName || '';
      var designation = user.ProfessionalDesignation || '';
      var displayName =
        user.FirstName +
        (middleName.length > 0 ? ' ' + middleName.charAt(0) : '') +
        ' ' +
        user.LastName +
        (suffixName.length > 0 ? ', ' + suffixName : '') +
        ' - ' +
        user.UserCode +
        (designation.length > 0 ? ', ' + designation : '');

      // remove trailing whitespace from the computed name.
      return displayName.trim();
    };
  })
  .filter('getDisplayNamePerBestPractice', function () {
    return function (person) {
      var displayName = '';
      // If person is not available then return blank
      if (!person) {
        return '';
      }
      // set suffix (handles patient (Suffix) or user (SuffixName)
      var suffix = person.Suffix
        ? person.Suffix
        : person.SuffixName
        ? person.SuffixName
        : '';

      // Set preferredName
      var preferredName = person.PreferredName
        ? '(' + person.PreferredName + ')'
        : '';

      // Set middleName
      var middleName = person.MiddleName
        ? person.MiddleName.charAt(0) + '.'
        : '';

      displayName =
        [person.FirstName, preferredName, middleName]
          .filter(function (text) {
            return text;
          })
          .join(' ') +
        ' ' +
        [person.LastName, suffix]
          .filter(function (text) {
            return text;
          })
          .join(', ');

      // remove trailing whitespace from the computed name.
      return displayName.trim();
    };
  })
  .filter('getUserDisplayName', function () {
    return function (person) {
      var displayName = '';
      // If person is not available then return blank
      if (!person) {
        return '';
      }
      displayName =
        person.LastName + ', ' + person.FirstName + ' - ' + person.UserCode;

      // remove trailing whitespace from the computed name.
      return displayName.trim();
    };
  })
  .filter('InsurancePaymentIsValid', function () {
    return function (claimsList) {
      //at least one claim has a value or is being closed
      if (
        !_.filter(claimsList, function (claim) {
          return claim.FinalPayment || claim.PaymentAmount > 0;
        }).length > 0
      ) {
        return false;
      }

      //each service amount is not more than is allowed
      var valid = true;
      angular.forEach(claimsList, function (claim) {
        if (valid) {
          angular.forEach(
            claim.ServiceTransactionToClaimPaymentDtos,
            function (service) {
              if (
                parseFloat(
                  (service.Charges - service.TotalInsurancePayments).toFixed(2)
                ) <
                parseFloat(
                  service.PaymentAmount ? service.PaymentAmount.toFixed(2) : 0
                )
              ) {
                valid = false;
                return valid;
              }
            }
          );
        } else {
          return valid;
        }
      });
      return valid;
    };
  })
  .filter('RemainingAmountToDistribute', function () {
    return function (claimsList, amount) {
      var totalDistributed = 0;
      angular.forEach(claimsList, function (claim) {
        angular.forEach(
          claim.ServiceTransactionToClaimPaymentDtos,
          function (service) {
            totalDistributed += _.toNumber(service.PaymentAmount);
          }
        );
      });
      return amount - totalDistributed;
    };
  })
  .filter('displayNAIfDateIsNull', function () {
    return function (date) {
      if (!date) {
        return 'N/A';
      }
      return moment(angular.isDate(date) ? date.toISOString() : date).format(
        'MM/DD/YYYY'
      );
    };
  })
  .filter('formatAddress', function () {
    return function (address) {
      var returnString = '';
      // If address or components required for a valid address are not available then return blank
      if (!address) {
        return "' '";
      }

      // Build address string
      if (address.AddressLine1) {
        returnString += address.AddressLine1;
      }
      if (address.AddressLine2) {
        returnString += !returnString
          ? address.AddressLine2
          : ', ' + address.AddressLine2;
      }
      if (address.City) {
        returnString += !returnString ? address.City : ', ' + address.City;
      }
      if (address.State) {
        returnString += !returnString ? address.State : ', ' + address.State;
      }
      if (address.ZipCode) {
        // Format zipcode
        var formattedZipcode = address.ZipCode;
        if (address.ZipCode.length === 9) {
          formattedZipcode =
            formattedZipcode.substring(0, 5) - formattedZipcode.substring(5, 9);
        }
        returnString += !returnString
          ? formattedZipcode
          : ' ' + formattedZipcode;
      }

      // remove trailing whitespace from the computed address, return ' ' if address is empty
      if (returnString) {
        return returnString.trim();
      } else {
        return "' '";
      }
    };
  })
  .filter('surfaceStringFromCSVs', [
    'SurfaceHelper',
    function (surfaceHelper) {
      return function (surface) {
        var surfaceString = surfaceHelper.surfaceStringFromCSVs(surface);
        return surfaceString;
      };
    },
  ])
  .filter('pascalCaseSpaced', function () {
    return function (pascalString) {
      var spacedString = pascalString.replace(/([A-Z])/g, ' $1');
      return spacedString.trim();
    };
  })
  .filter('getDefaultDecimal', function () {
    return function (decimal) {
      if (decimal) {
        return decimal;
      }
      return 0;
    };
  })
  .filter('multiSelectLabel', function () {
    return function (options, valueField, textField, dropDownLabel) {
      if (_.every(options, x => x[valueField])) {
        return `(${_.filter(options, x => !x.IsAllOption).length}) All ${
          dropDownLabel ? dropDownLabel : 'Options'
        }`;
      } else if (
        _.filter(options, x => !x.IsAllOption && x[valueField]).length === 1
      ) {
        return `(1) ${_.find(options, x => x[valueField])[textField]}`;
      } else {
        return `(${
          _.filter(options, x => !x.IsAllOption && x[valueField]).length
        }) ${dropDownLabel ? dropDownLabel : 'Options'}`;
      }
    };
  })
  .filter('formatCurrencyWithParensIfNeg', function () {
    return function (value) {
      if (_.isNumber(value)) {
        if (value < 0) {
          var temp = Math.abs(value);
          if (temp < 0.005) {
            return temp.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            });
          } else {
            return (
              '(' +
              temp.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }) +
              ')'
            );
          }
        } else {
          return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          });
        }
      }
    };
  })
  .filter('filterOnIsActive', function () {
    return function (dataSet, showInactive) {
      var result = [];

      angular.forEach(dataSet, function (item) {
        if (showInactive) {
          if (item) {
            result.push(item);
          }
        } else {
          if (item && item.IsActive == true) {
            result.push(item);
          }
        }
      });

      return result;
    };
  });
