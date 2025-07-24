import { Inject, Injectable } from '@angular/core';
import { TeamMemberLocations, User, UserLocationRoles, providerTypes, ProviderType, UserLocationSetup, TeamMemberRoles, RoleNames } from '../../team-member';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';
import { SaveStates } from 'src/@shared/models/transaction-enum';
import { OrderByPipe } from 'src/@shared/pipes';
import cloneDeep from 'lodash/cloneDeep';
import { LocationTimeService } from 'src/practices/common/providers';
import { CommonFormatterService } from 'src/@shared/filters/common-formatter.service';

@Injectable({
  providedIn: 'root'
})

// This service is used into TeamMemberLocation and TeamMemberLocationSetup Component

export class TeamMemberLocationService {
  private availableLocationSource = new BehaviorSubject<Array<TeamMemberLocations>>(null);
  availableLocation = this.availableLocationSource.asObservable();

  constructor(
    @Inject('StaticData') private staticData,
    @Inject('RolesFactory') private rolesFactory,
    @Inject('AmfaInfo') private amfaInfo,
    @Inject('LocationServices') private locationServices,
    @Inject('localize') private localize,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('UserServices') private userServices,
    public locationTimeService: LocationTimeService,
    public CommonFiltersService: CommonFormatterService
  ) { }

  // List of Provider Types with names and ids
  getProviderTypes = (): Promise<SoarResponse<Array<providerTypes>>> => {
    return this.staticData?.ProviderTypes();
  };

  // Get All types of Roles List
  getRoles = (): Promise<Array<UserLocationRoles>> => {
    return new Promise((resolve, reject) => {
      this.rolesFactory.Roles().then((res) => {
        resolve(res?.Result)
      },
        () => {
          reject('Roles');
        });
    });
  };

  // Gets list of locations this user is permitted to add userLocationsSetup and roles for
  getPermittedLocations = (): Promise<SoarResponse<Array<TeamMemberLocations>>> => {
    return new Promise((resolve, reject) => {
      let actionIdParam = this.amfaInfo['plapi-user-usrrol-create']?.ActionId;
      this.locationServices.getPermittedLocations({ actionId: actionIdParam }).$promise.then((res) => {
        resolve(res);
      },
        () => {
          reject('locations');
        });
    });
  };

  // This was originally in user-role
  // I'm actually not sure how it is used but am guessing it was necessary?
  getGroupedLocations = (locations: Array<TeamMemberLocations>) => {
    let allLocations = [];
    let pendingInactiveLocations = [];
    let inactiveLocations = [];
    let groupedLocations = [];

    let dateNow = moment().format('MM/DD/YYYY');
    if (locations?.length > 0) {
      locations.forEach(location => {
        if (location) {
          if (location.DeactivationTimeUtc) {
            let toCheck = moment(location.DeactivationTimeUtc)?.format('MM/DD/YYYY');
            let timeZone = this.locationTimeService.getTimezoneInfo(location.Timezone, null);

            location.NameLine1 = location.NameLine1 + ' (' + timeZone?.displayAbbr + ')';
            location.InactiveDate = '  -  ' + moment(location.DeactivationTimeUtc).format('MM/dd/yyyy');

            if (moment(toCheck).isBefore(dateNow) || moment(toCheck).isSame(dateNow)) {
              location.LocationStatus = this.localize.getLocalizedString('Inactive');
              location.SortOrder = 3;
              inactiveLocations.push(location);
            } else {
              location.LocationStatus = this.localize.getLocalizedString('Pending Inactive');
              location.SortOrder = 2;
              pendingInactiveLocations.push(location);
            }
          }
          else {
            let timeZone = this.locationTimeService.getTimezoneInfo(location.Timezone, null);
            location.NameLine1 = location.NameLine1 + ' (' + timeZone?.displayAbbr + ')';
            location.InactiveDate = '';
            location.LocationStatus = this.localize.getLocalizedString('Active'); 'Active';
            location.SortOrder = 1;
            groupedLocations.push(location);
          }
        }
      });

      allLocations = this.applyOrderByPipe(groupedLocations, 'asc', 'NameLine1');
      inactiveLocations = this.applyOrderByPipe(inactiveLocations, 'asc', 'DeactivationTimeUtc');
      pendingInactiveLocations = this.applyOrderByPipe(pendingInactiveLocations, 'desc', 'DeactivationTimeUtc');

      pendingInactiveLocations.forEach(location => {
        allLocations.push(location);
      });
      inactiveLocations.forEach(location => {
        allLocations.push(location);
      });
    }

    return allLocations;
  }

  applyOrderByPipe = (data, sortOrder: string, orderKey: string) => {
    const orderPipe = new OrderByPipe();
    return orderPipe.transform(data, { sortColumnName: orderKey, sortDirection: (sortOrder == 'asc' ? 0 : 1) });
  }

  // location setups need to succeed before updating roles so 
  // queue these and return resolve
  saveUserLocationSetups = (userLocationSetups: Array<UserLocationSetup>): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      let saveActions = [];
      // update existing userLocationSetups
      if (userLocationSetups?.length > 0) {

        let editedUserLocationSetups = userLocationSetups.filter(userLocationSetup =>
          userLocationSetup?.ObjectState === SaveStates.Update);

        if (editedUserLocationSetups?.length > 0) {
          saveActions.push(this.updateUserLocationSetups(editedUserLocationSetups));
        }

        // remove existing userLocationSetups with ObjectState=Delete
        let removeUserLocationSetups = userLocationSetups.filter(userLocationSetup =>
          userLocationSetup?.ObjectState === SaveStates.Delete);
        if (removeUserLocationSetups?.length > 0) {
          saveActions.push(this.deleteUserLocationSetups(removeUserLocationSetups));
        }

        // add new userSetupLocations
        let addedUserLocationSetups = userLocationSetups.filter(userLocationSetup =>
          userLocationSetup?.ObjectState === SaveStates.Add);
        if (addedUserLocationSetups?.length > 0) {
          saveActions.push(this.addUserLocationSetups(addedUserLocationSetups));
        }

        if (saveActions?.length > 0) {
          Promise.allSettled(saveActions).then(res => {
            let rejectedApis = "";
            if (res?.length > 0) {
              res.forEach(p => {
                if (p.status == "rejected") {
                  rejectedApis += p.reason;
                }
              })
            }
            if (rejectedApis != "") {
              reject(rejectedApis);
            } else {
              resolve(true);
            }
          }, (errorMsg) => {
            reject(errorMsg)
          });
        } else {
          //need to return default resolve, when we are not performing any action, because this function is calling from Promise.all() 
          resolve(true);
        }
      }
      else {
        // make sure we resolve the promise even if we have no locations to save
        resolve(true);
      }
    });
  }

  addUserLocationSetups = (userLocationSetups: Array<UserLocationSetup>): Promise<UserLocationSetup> => {
    return new Promise((resolve, reject) => {
      this.userServices.UserLocationSetups.create(userLocationSetups).$promise.then(res => {
        resolve(res);
      }, () => {
        reject('UserLocationSaveApi');
      });
    });
  }

  updateUserLocationSetups = (userLocationSetups: Array<UserLocationSetup>): Promise<Array<UserLocationSetup>> => {
    return new Promise((resolve, reject) => {
      this.userServices.UserLocationSetups.update(userLocationSetups).$promise.then(res => {
        resolve(res);
      },
        () => {
          reject('UserLocationUpdateApi');
        });
    });
  }

  deleteUserLocationSetups = (userLocationSetups: Array<UserLocationSetup>): Promise<Array<UserLocationSetup>> => {
    return new Promise((resolve, reject) => {
      let userId = userLocationSetups[0]?.UserId;
      // list of LocationIds to be removed
      let removeLocationIds = userLocationSetups.map(userLocationSetup => userLocationSetup.LocationId);
      this.userServices.UserLocationSetups.delete({ userId: userId }, removeLocationIds).$promise.then((res) => {
        resolve(res);
      },
        () => {
          reject('UserLocationDeleteApi');
        });
    });
  }

  // Get User Roles
  getUserRoles = (userId: string): Promise<TeamMemberRoles> => {
    return new Promise((resolve, reject) => {
      this.rolesFactory.UserRoles(userId).then((res) => {
        resolve(res?.Result)
      },
        () => {
          reject();
        });
    });
  };

  getUserLocationSetups = (userId): Promise<SoarResponse<Array<UserLocationSetup>>> => {
    return new Promise((resolve, reject) => {
      this.userServices.UserLocationSetups.get({ userId: userId }).$promise.then(res => {
        resolve(res);
      },
        () => {
          reject();
        });
    });
  }

  getMergedLocationRolesData = (userLocationSetups: Array<UserLocationSetup>, userRoles: TeamMemberRoles) => {
    let locationRoleskeys = Object.keys(userRoles?.LocationRoles);
    if (locationRoleskeys?.length > 0) {
      locationRoleskeys.forEach(locationRoleskey => {
        let allLocationsRoles = userRoles?.LocationRoles[locationRoleskey];
        if (allLocationsRoles?.length > 0) {
          allLocationsRoles.forEach(locationRoles => {
            let locationId = Number(locationRoleskey);
            // find the matching userLocationSetup
            let userLocationSetup = userLocationSetups?.find(item => item?.LocationId === locationId);
            if (userLocationSetup) {
              // add this set of locationRoles to the userLocationSetup 
              userLocationSetup.$$UserLocationRoles.push(locationRoles);
              // set objectState
              userLocationSetup.$$UserLocationRoles?.forEach(userLocationRole => {
                userLocationRole.$$ObjectState = SaveStates?.None;
              });
            }
          });
        }
      })
    }
  }

  // This function check if the user is PracticeAdmin or not. and it set the $$isPracticeAdmin as true and false accordingly under User main object. 
  // Secondly this function set $$UserPracticeRoles under user main object
  getMergedPracticeRolesData = (userRoles: TeamMemberRoles, user: User): User => {
    //Default user.$$isPracticeAdmin to false
    user.$$isPracticeAdmin = false;
    let PracticeRoleskey = Object.keys(userRoles?.PracticeRoles)[0];
    if (PracticeRoleskey) {
      let allUserRoles = userRoles?.PracticeRoles[PracticeRoleskey];
      if (allUserRoles?.length > 0) {
        let practiceRolesToDisplay = allUserRoles.filter(role =>
          role?.RoleName?.toLowerCase() !== RoleNames?.RxUser?.toLowerCase());
        if (practiceRolesToDisplay?.length > 0) {
          // if the user has practice roles other than rx, this is an admin
          user.$$isPracticeAdmin = true;
        }
        // practice roles exist for all current locations so add these to the user                    
        user.$$UserPracticeRoles = new Array<UserLocationRoles>();
        // add this set of practiceRoles to the userLocationSetup
        allUserRoles.forEach(practiceRole => {
          practiceRole.$$ObjectState = SaveStates.None;
          user?.$$UserPracticeRoles?.push(practiceRole);
        });
      }
    }
    return user;
  }

  // set location data on userLocationSetup
  // set whether logged in user can edit this location
  getMergedLocationData = (userLocationSetups, locations, permittedLocations) => {

    if (userLocationSetups?.length > 0) {
      userLocationSetups?.forEach(userLocationSetup => {
        if (userLocationSetup) {
          // set the location based on userLocationSetup.LocationId
          userLocationSetup.$$Location = {};
          let ofcLocation = locations?.find(loc => loc?.LocationId === userLocationSetup.LocationId);
          if (ofcLocation) {
            userLocationSetup.$$Location = ofcLocation;
          }
          // set whether logged in user can edit this userLocationSetup
          userLocationSetup.$$CanEditLocation = false;
          let permittedLocation = permittedLocations?.find(loc => loc?.LocationId === userLocationSetup.LocationId);
          if (permittedLocation) {
            userLocationSetup.$$CanEditLocation = true;
          }
        }
      });
    }
  }

  getMergedUserData = (userLocationSetups: Array<UserLocationSetup>, users, providerTypes: Array<providerTypes>) => {
    if (userLocationSetups?.length > 0) {
      userLocationSetups.forEach(userLocationSetup => {
        if (userLocationSetup) {
          userLocationSetup.$$ProviderOnClaims = null;
          userLocationSetup.$$ProviderTypeName = null;
          // set provider on claims name if ProviderOnClaimsRelationship set to 2 (Other)
          if (userLocationSetup.ProviderOnClaimsRelationship === 1) {
            userLocationSetup.$$ProviderOnClaims = this.localize.getLocalizedString('Self');
          }
          if (Number(userLocationSetup.ProviderOnClaimsRelationship) === 2) {
            let providerOnClaims = users?.find(user => user?.UserId === userLocationSetup.ProviderOnClaimsId);
            if (providerOnClaims) {


              let formattedProviderOnClaims = this.CommonFiltersService.getDisplayNamePerBestPractice(providerOnClaims);
              userLocationSetup.$$ProviderOnClaims = formattedProviderOnClaims;
            }
          }
          // set provider type name
          let providerType = providerTypes?.find(item => item?.Id === userLocationSetup.ProviderTypeId);
          if (providerType) {
            userLocationSetup.$$ProviderTypeName = providerType?.Name;
          }
          // set employment status display
          userLocationSetup.$$ProviderQualifierTypeName = '';
          if (Number(userLocationSetup.ProviderQualifierType) === 2) {
            userLocationSetup.$$ProviderQualifierTypeName = this.localize.getLocalizedString('Full Time');
          }
          if (Number(userLocationSetup.ProviderQualifierType) === 1) {
            userLocationSetup.$$ProviderQualifierTypeName = this.localize.getLocalizedString('Part Time');
          }
        }
      });
    }
  }

  // returns a list of providers determined by their userLocationSetups
  getProvidersByUserLocationSetups = (locationId) => {
    let filteredProviderList = [];
    // get provider list from referenceData
    let allProvidersList = this.referenceDataService.get(this.referenceDataService.entityNames.users);
    // filter list for providers for this location that are not 'Not a Provider'
    if (allProvidersList?.length > 0) {
      allProvidersList.forEach(provider => {
        let userLocationSetup = provider?.Locations?.find(userLocationSetup => userLocationSetup?.LocationId === locationId);
        if (userLocationSetup && userLocationSetup?.ProviderTypeId !== ProviderType.NotAProvider) {
          provider.UserLocationSetup = cloneDeep(userLocationSetup);
          filteredProviderList.push(provider);
        }
      });
    }

    return filteredProviderList;
  }

  rxRoleFilter = (user: User) => {
    return user?.$$UserPracticeRoles?.filter(practiceRole =>
      (practiceRole?.RoleName)?.toLowerCase() !== RoleNames.RxUser?.toLowerCase()
    )
  }
}
