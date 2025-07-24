import { Component, Input, OnInit, Output, EventEmitter, Inject, ViewChildren, QueryList } from '@angular/core';
import { GridsterItem } from 'angular-gridster2';
import { DashboardWidgetStatus } from '../../services/dashboard-widget';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { AppointmentStatus, AppointmentStatusDataService } from 'src/scheduling/appointment-statuses';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { ProviderType, RoleNames, User } from 'src/business-center/practice-settings/team-members/team-member';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SaveStates } from 'src/@shared/models/transaction-enum';
import { Location } from 'src/practices/common/models/location.model';
import { AlertTypes, AlertsDetails, AllAppointments, FilterOptions, GridSortField, ProviderAppointments } from './appointments-grid-widget';
import { SortDescriptor } from '@progress/kendo-data-query';
import escape from 'lodash/escape';
import { PatSharedService } from 'src/@shared/providers';
import { AppMultiselectComponent } from 'src/@shared/components/form-controls/multiselect/multiselect.component';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { Subscription } from 'rxjs';
import { LocationTimeService } from 'src/practices/common/providers/location-time.service';
import { AppointmentsWidget } from '../../services/dashboard-widget';

@Component({
  selector: 'appointments-grid-widget',
  templateUrl: './appointments-grid-widget.component.html',
  styleUrls: ['./appointments-grid-widget.component.scss']
})
export class AppointmentsGridWidgetComponent implements OnInit {

  @Input() data: GridsterItem;
  @Output() loadingComplete = new EventEmitter<DashboardWidgetStatus>();
  loadingStatus: DashboardWidgetStatus;
  appointmentsGridWidgetForm: FormGroup;
  appointmentStatuses: AppointmentStatus[];
  showNewPatientHeader = false;
  allAppointments: AllAppointments[] = [];
  providerAppointments: ProviderAppointments[] = [];
  dateFilter = moment().startOf('day').toDate();
  oldDate = moment().startOf('day').toDate();
  options = {
    providerFilterOptions: Array<FilterOptions>(),
    locationFilterOptions: Array<{
      text: string;
      value: number;
      isDisabled?: boolean;
      subCategory?: string
    }>()
  };
  filters = {
    providerFilter: Array<{ value: string, text: string, isDisabled?: boolean }>(),
    locationFilter: Array<{ value: number, text: string, isDisabled?: boolean }>()
  };

  usersFromServer: User[] = [];
  locationsFromServer: Location[] = [];
  tempLocations: Array<{ id: number }> = [];
  tempProviders: Array<{ id: string }> = [];
  validEmpStartDateControl: boolean;
  initializeCalled = false;

  scheduleUrl = AppointmentsWidget.ScheduleDate;
  sortsAscending = {
    time: false,
    patient: true,
    apptType: true,
    location: true,
    room: true,
    provider: true,
  };
  gridSortField: GridSortField;
  launchDarklyStatus = false;
  subscriptions: Subscription[] = [];
  featureFlagSubscription: Subscription;
  subscription: Subscription;

  @ViewChildren(AppMultiselectComponent) appMultiSelectComponents: QueryList<AppMultiselectComponent>;

  constructor(private appointmentStatusDataService: AppointmentStatusDataService,
    @Inject('UsersFactory') private usersFactory,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('tabLauncher') public tabLauncher,
    @Inject('AppointmentViewVisibleService') private appointmentViewVisibleService,
    @Inject('AppointmentViewDataLoadingService') private appointmentViewDataLoadingService,
    private dashboardWidgetService: DashboardWidgetService,
    private fb: FormBuilder,
    private translate: TranslateService,
    @Inject('$rootScope') public $rootScope,
    public patShared: PatSharedService,
    private featureFlagService: FeatureFlagService,
    private locationTimeService: LocationTimeService) { }

  ngOnInit(): void {
    this.$rootScope.$on('soar:reload-appointments-widget', () => {
      this.getAppointments();
    });
    this.loadingStatus = { itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: '' };
    this.appointmentsGridWidgetForm = this.fb?.group({
      appointmentWidgetCalendar: "",
      appointmentsGridWidgetLocationFilter: [],
      appointmentsGridWidgetProviderFilter: []
    });
    this.getAppointmentStatuses();
    this.initialize();
  }

  getAppointmentStatuses = () => {
    this.appointmentStatuses = this.appointmentStatusDataService.appointmentStatuses;
  }

  initialize = () => {
    const maxRetries = 3;
    let retries = 0;

    const fetchLocations = () => {
      this.locationsFromServer = this.referenceDataService.get(
        this.referenceDataService.entityNames.locations
      );

      if (!this.locationsFromServer || this.locationsFromServer?.length === 0) {
        retries++;
        if (retries < maxRetries) {
          setTimeout(fetchLocations, 2000); // Retry after 2 second
        } else {
          this.handleError();
        }
        return;
      }

      const userLocation = sessionStorage.getItem('userLocation');
      if (userLocation) {
        const loggedInUserLocationId = JSON.parse(userLocation)?.id;
        if (this.locationsFromServer && this.locationsFromServer?.length > 0) {
        //Get location text from locationsFromServer so it will match with the multi-select dropdown
          const loggedInUserLocationInfo = this.locationsFromServer?.find(location => location?.LocationId == loggedInUserLocationId);
          this.filters.locationFilter = [{ value: loggedInUserLocationInfo?.LocationId, text: loggedInUserLocationInfo?.NameLine1 }];
          this.tempLocations = this.filters?.locationFilter?.map(loc => { return { id: loc?.value } });
        }
      }

      const promises = [];
      promises.push(
        this.usersFactory.Users().then(
          res => {
            this.usersFromServer = res?.Value;
            const patAuthContext = sessionStorage.getItem('patAuthContext');
            if (this.usersFromServer && this.usersFromServer?.length > 0 && patAuthContext) {
              const loggedInUserId = JSON.parse(patAuthContext)?.userInfo?.userid;

            //Get usernamefrom usersFromServer so it will match with the multi-select dropdown with formatted name
              const loggedInUserInfo = this.usersFromServer?.find(user => user?.UserId == loggedInUserId);

              if (loggedInUserInfo) {
                this.filters.providerFilter = [{ value: loggedInUserInfo?.UserId, text: this.formatProviderName(loggedInUserInfo) }];
                this.tempProviders = this.filters?.providerFilter?.map(provider => { return { id: provider?.value } });
              }
              this.getAppointments();
            }
          },
          () => {
            this.handleError();
          }
        )
      );

      Promise.all(promises).then(() => {
        this.processUsersFromServer();
        this.processLocationsFromServer();
        this.initializeCalled = true;
      }, () => {
        this.handleError();
      });
    };

    fetchLocations();
  }

  handleError = () => {
    WidgetInitStatus.error;
    this.loadingComplete.emit(this.loadingStatus);
    this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
  }


  getAppointments = () => {
    this.loadingStatus.loading = WidgetInitStatus.ToLoad;
    this.loadingComplete.emit(this.loadingStatus);

    const locIds = [];
    const providerIds = [];

    this.tempLocations?.forEach(loc => {
      locIds.push(loc?.id);
    })

    this.tempProviders?.forEach(provider => {
      providerIds?.push(provider?.id);
    })

    this.featureFlagSubscription = this.featureFlagService.getOnce$(FuseFlag.DashboardAppointmentWidgetMvp).subscribe((value) => {
      this.launchDarklyStatus = value;
    });
    this.subscriptions?.push(this.featureFlagSubscription);

    const params = {
      StartTime: moment(this.dateFilter)?.startOf('day')?.toISOString(),
      EndTime: moment(this.dateFilter)?.endOf('day')?.toISOString(),
      LocationIds: locIds,
      ProviderUserIds: providerIds,
      LaunchDarklyStatus: this.launchDarklyStatus
    };
    this.subscription = this.dashboardWidgetService.getWidgetData(AppointmentsWidget.AppointmentsUrl, params).subscribe(
      res => {
        this.processAppointments(res?.Value);
        this.loadingStatus.loading = WidgetInitStatus.Loaded;
        this.loadingComplete.emit(this.loadingStatus);
      },
      () => {
        this.loadingStatus.loading = WidgetInitStatus.error;
        this.loadingComplete.emit(this.loadingStatus);
        this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
      }
    );
    this.subscriptions?.push(this.subscription);
  }

  processUsersFromServer = () => {
    this.options.providerFilterOptions = [];
    if (this.usersFromServer && this.usersFromServer?.length > 0) {
      this.usersFromServer?.forEach((user) => {
        // PBI 334209: Only display providers that have a Role at the selected location(s); we are already utilizing this logic with Reports

        const isProvider: boolean = user?.ProviderTypeId != ProviderType.NotAProvider;

        const isPracticeAdministrator: boolean =
          user?.Roles != null &&
          user?.Roles?.length > 0 &&
          user?.Roles?.find(role => role?.RoleName == RoleNames.PracticeAdmin) != null;

        const hasLocationInLocationFilter =
          user?.Locations != null &&
          user?.Locations?.length > 0 &&
          user?.Locations?.find((location) =>
            this.filters?.locationFilter?.find(
              locationFilter => locationFilter?.value?.toString() == location?.LocationId?.toString()
            )
          ) != null;
        if (isProvider && (isPracticeAdministrator || hasLocationInLocationFilter)) {
          this.options?.providerFilterOptions?.push({
            value: user?.UserId,
            text: this.formatProviderName(user),
            isDisabled: false
          });
        }
      });
    }

    const isLoggedInUserInProviderFilterOptions =
      this.options?.providerFilterOptions?.find(
        providerFilterOption =>
          providerFilterOption?.value == this.filters?.providerFilter[0]?.value
      ) != null;
    if (!isLoggedInUserInProviderFilterOptions) {
      // PBI 334209: If the user is not a provider then default to all providers
      this.filters.providerFilter = this.options?.providerFilterOptions;
    }

  }

  processLocationsFromServer = () => {
    this.options.locationFilterOptions = [];

    if (this.locationsFromServer && this.locationsFromServer?.length > 0) {
      this.locationsFromServer?.forEach((location) => {
        this.options?.locationFilterOptions?.push({
          text: location?.NameLine1,
          value: location?.LocationId,
          isDisabled: false
        });
      });
    }

    this.options?.locationFilterOptions?.sort((a, b) => {
      return a?.text?.localeCompare(b?.text);
    });
  }

  processAppointments = (appointments) => {
    this.allAppointments = [];
    this.providerAppointments = [];
    if (appointments) {
      this.allAppointments = this.mapAppointments(appointments?.Appointment);
      this.providerAppointments = this.filterAndFillAppointments(
        this.allAppointments
      );
    }
  }

  mapAppointments = (appointments) => {
    return appointments?.map((appointment) => {
      return appointment?.Appointment?.ProviderAppointments?.map((providerAppointment) => {
        return {
          providerId: providerAppointment?.UserId,
          startTime: providerAppointment?.StartTime,
          endTime: providerAppointment?.EndTime,
          appointment: appointment,
        } as AllAppointments;
      }) as AllAppointments;
    }) as AllAppointments[];
  };

  filterProviderAppointments = (appointments) => {
    const providerAppointments = appointments?.filter(
      x => this.appointmentProviderLocationFilter(x)
    );
    return providerAppointments?.filter((providerAppointment) => {
      return (
        providerAppointments?.find((pa) =>
          providerAppointment?.startTime == pa?.endTime
        ) == null
      );
    }) as ProviderAppointments[];
  };

  appointmentProviderLocationFilter = (providerAppointment) => {
    return (
      providerAppointment &&
      this.filters &&
      this.filters?.providerFilter &&
      this.filters?.locationFilter &&
      this.filters?.providerFilter?.find((providerFilter) =>
        providerFilter?.value?.toString() == providerAppointment?.providerId?.toString()
      ) != null &&
      this.filters?.locationFilter?.find((locationFilter) =>
        locationFilter?.value?.toString() == providerAppointment?.appointment?.Location?.LocationId?.toString()
      ) != null
    );
  };

  filterAndFillAppointments = (appointments) => {
    if (appointments) {
      let providerAppointments = appointments?.map((appointment) => this.filterProviderAppointments(appointment));
      providerAppointments = providerAppointments
        .reduce((a, e) => {
          return a?.concat(e) as string
        }, [])
        .sort((f, s) => {
          return Date.parse(f?.startTime) - Date.parse(s?.startTime);
        });
      providerAppointments?.forEach((providerAppointment) => {
        const alerts = {
          allergyAlerts: Array<AlertsDetails>(),
          medicalAlerts: Array<AlertsDetails>(),
          premedAlerts: Array<AlertsDetails>()
        };
        alerts.allergyAlerts = providerAppointment?.appointment?.MedicalHistoryAlerts?.filter(
          (alert) => {
            return alert?.MedicalHistoryAlertTypeId == AlertTypes.allergyAlerts;
          }
        );
        alerts.medicalAlerts = providerAppointment?.appointment?.MedicalHistoryAlerts?.filter(
          (alert) => {
            return alert?.MedicalHistoryAlertTypeId == AlertTypes.medicalAlerts;
          }
        );
        alerts.premedAlerts = providerAppointment?.appointment?.MedicalHistoryAlerts?.filter(
          (alert) => {
            return alert?.MedicalHistoryAlertTypeId == AlertTypes.premedAlerts;
          }
        );
        providerAppointment.alerts = alerts;
      });
      return providerAppointments as ProviderAppointments[];
    }
  };

  onDateChange = (newDate) => {
    if (this.oldDate != newDate) {
      this.oldDate = newDate;
      this.dateFilter = newDate;
      this.getAppointments();
    }
  }

  onStartDateStateChange = (event) => {
    this.validEmpStartDateControl = event;
  }

  showAppointmentModal = (providerAppointment) => {
    providerAppointment.appointment.Appointment.ObjectState = SaveStates.None;

    const appointment = {
      AppointmentId: providerAppointment?.appointment?.Appointment?.AppointmentId,
    };

    this.appointmentViewDataLoadingService.getViewData(appointment, false, 'soar:reload-appointments-widget')
      .then(
        () => {
          this.appointmentViewVisibleService.changeAppointmentViewVisible(
            true,
            false
          );
        },
        (error) => {
          console.log(error);//Found in angualrjs pages too
          this.toastrFactory.error(
            this.translate.instant('Ran into a problem loading the appointment'),
            this.translate.instant('Error')
          );
        }
      );

  };

  formatPatientName = (patient) => {
    return `${patient?.LastName as string}, ${patient?.FirstName as string} - ${patient?.PatientCode as string}`
  }

  findProviderName = (providerId, providers) => {
    const provider = providers?.find((provider) => {
      return provider?.UserId == providerId;
    });
    if (provider) {
      return this.formatProviderName(provider);
    } else {
      return '';
    }
  }

  locationChange = (list) => {
    let found = false;
    if (list && list?.length > 0) {
      for (let index = 0; index < list?.length; index++) {
        const loc = list[index];
        found = false;
        for (let innerIndex = 0; innerIndex < this.tempLocations?.length; innerIndex++) {
          const locInner = this.tempLocations[innerIndex];
          if (locInner?.id == loc?.value) {
            found = true;
            break;
          }
        }
        if (!found) { break }
      }
    } else {
      found = true;
    }

    if (!found || this.tempLocations?.length != list?.length) {
      this.tempLocations = [];
      list?.forEach((loc) => {
        this.tempLocations?.push({ id: loc?.value });
      });
      this.getAppointments();
    }
  }

  providerChange = (list) => {
    let found = false;
    if (list && list?.length > 0) {
      for (let index = 0; index < list?.length; index++) {
        const provider = list[index];
        found = false;
        for (let innerIndex = 0; innerIndex < this.tempProviders?.length; innerIndex++) {
          const providerInner = this.tempProviders[innerIndex];
          if (
            providerInner?.id == provider?.value
          ) {
            found = true;
            break;
          }
        }
        if (!found) break;
      }
    } else { found = true }

    if (!found || this.tempProviders?.length != list?.length) {
      this.tempProviders = [];
      list?.forEach((provider) => {
        this.tempProviders?.push({
          id: provider?.value
        });
      });
      this.getAppointments();
    }
  };

  navigate = (url) => {
    this.tabLauncher.launchNewTab(escape(url as string + moment(this.dateFilter)?.format('YYYY-M-DD')));
  };

  getStatusDescription = (status) => {
    return this.appointmentStatuses?.find((s) => {
      return s?.id == status;
    })?.descriptionNoSpace;
  }

  getStatusIcon = (status) => {
    return this.appointmentStatuses?.find((s) => {
      return s?.id == status;
    }).icon;
  };

  getAlertDescription = (alert) => {
    let alertMessage = "";
    if (alert && alert?.length > 0) {
      for (let index = 0; index < alert?.length; index++) {
        alertMessage += alert[index]?.MedicalHistoryAlertDescription as string + "<br/>";
      }
    }
    return alertMessage;
  }

  getOverViewUrl = (dataItem) => {
    return `#/Patient/${dataItem?.appointment?.Person?.PatientId as string}/Overview/`;
  }

  formatProviderName = (user: User) => {
    const middleName = user?.MiddleName || '';
    const suffixName = user?.SuffixName || '';
    const designation = user?.ProfessionalDesignation || '';
    return (
      `${user?.FirstName} ${middleName?.charAt(0) ? middleName?.charAt(0) + ' ' : ''}${user?.LastName}${suffixName ? ', ' + suffixName : ''} - ${user?.UserCode}${designation ? ', ' + designation : ''}`
    );
  };

  parseDate = (date): string | null => {
    const utcDate = this.locationTimeService.toUTCDateKeepLocalTime(date);
    return utcDate ? utcDate?.toISOString() : null;
  };

  sortChange = (sort: SortDescriptor[]): void => {
    if (sort) {
      if (sort[0].field == GridSortField.startTime) {
        this.sortTime();
      }
      else if (sort[0].field == GridSortField.Person) {
        this.sortPatient();
      }
      else if (sort[0].field == GridSortField.ApptType) {
        this.sortApptType();
      }
      else if (sort[0].field == GridSortField.Location) {
        this.sortLocation();
      }
      else if (sort[0].field == GridSortField.Room) {
        this.sortRoom();
      }
      else if (sort[0].field == GridSortField.Provider) {
        this.sortProvider();
      }
    }
  }

  sortTime = () => {
    this.providerAppointments?.sort((a, b) => {
      const result: number = this.patShared.compareValues(a?.startTime, b?.startTime);
      return this.sortsAscending.time ? result : -result;
    });
    this.sortsAscending.time = !this.sortsAscending.time;
  };

  sortPatient = () => {
    this.providerAppointments?.sort((a, b) => {
      const val1 = this.formatPatientName(a?.appointment?.Person);
      const val2 = this.formatPatientName(b?.appointment?.Person);
      const result: number = this.patShared.compareValues(val1, val2);
      return this.sortsAscending?.patient ? result : -result;
    });
    this.sortsAscending.patient = !this.sortsAscending.patient;
  };

  sortApptType = () => {
    this.providerAppointments?.sort((a, b) => {
      const val1 = a.appointment?.AppointmentType
        ? a.appointment?.AppointmentType?.Name
        : '';
      const val2 = b.appointment?.AppointmentType
        ? b.appointment?.AppointmentType?.Name
        : '';
      const result: number = this.patShared.compareValues(val1, val2);
      return this.sortsAscending?.apptType ? result : -result;
    });
    this.sortsAscending.apptType = !this.sortsAscending.apptType;
  };

  sortLocation = () => {
    this.providerAppointments?.sort((a, b) => {
      const val1 = a.appointment?.Location?.NameLine1;
      const val2 = b.appointment?.Location?.NameLine1;
      const result: number = this.patShared.compareValues(val1, val2);
      return this.sortsAscending.location ? result : -result;
    });
    this.sortsAscending.location = !this.sortsAscending.location;
  };

  sortRoom = () => {
    this.providerAppointments?.sort((a, b) => {
      const val1 = a?.appointment?.Room?.Name;
      const val2 = b?.appointment?.Room?.Name;
      const result: number = this.patShared.compareValues(val1, val2);
      return this.sortsAscending.room ? result : -result;
    });
    this.sortsAscending.room = !this.sortsAscending.room;
  };

  sortProvider = () => {
    this.providerAppointments?.sort((a, b) => {
      const val1 = this.findProviderName(
        a.providerId,
        a.appointment?.ProviderUsers
      );
      const val2 = this.findProviderName(
        b.providerId,
        b.appointment.ProviderUsers
      );
      const result: number = this.patShared.compareValues(val1, val2);
      return this.sortsAscending.provider ? result : -result;
    });
    this.sortsAscending.provider = !this.sortsAscending.provider;
  };

  ngOnDestroy() {
    this.subscriptions?.forEach(subscription => subscription?.unsubscribe());
  }
}