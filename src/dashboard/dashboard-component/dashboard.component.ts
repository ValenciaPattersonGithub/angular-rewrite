import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { WidgetbarComponent } from '../widgets/bar-chart-widget/bar-chart-widget.component';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';

declare let _: any;
@Component({
  selector: 'dash-board',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  constructor(
    @Inject('locationService') private locationService,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('platformSessionCachingService') private platformSessionCachingService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('DashboardService') private dashboardService,
    @Inject('UserServices') private userServices,
    @Inject('localize') private localize,
    @Inject('FeatureService') private featureService,
    private featureFlagService: FeatureFlagService
  ) {

  }
  //initial properties
  dashboardId = 3;
  batchIds = []; // To load batches
  dashboardDefinition;
  userLocation;
  standardItems;
  hiddenItems;
  unSelectedItems;
  hiddenWidgetFilterOptions;
  columns;
  draggable;
  resizable;
  customItemMap;
  gridsterOpts;
  saveLayoutDisabled = true;
  setDefaultItem;
  isDevelopmentMode = false;
  widgetId = { Value: 'Show Hidden', Id: null };

  // Define data fields
  dayDateDisplay: any = moment(new Date()).format('dddd, MMMM D, YYYY');
  displayName: string = "";
  callMethods = true;
  dataRange;
  isReferralFlagEnabled: boolean = false;
  @ViewChild(WidgetbarComponent, { static: false })
  WidgetbarComponent: WidgetbarComponent;

  featureFlagMethod() {
    this.featureService.isEnabled('DevelopmentMode').then((res) => {
      this.isDevelopmentMode = res;
      this.userLocation = this.locationService.getCurrentLocation();
      this.getFullNameWithProfessionalDesignation();
    });
  }

  ngOnInit() {
    if (this.callMethods) {
      this.featureFlagMethod();
    }
  }

  getFullNameWithProfessionalDesignation() {
    const users = this.referenceDataService.get(this.referenceDataService.entityNames.users);
    const userContext = this.platformSessionCachingService.userContext.get();
    if (userContext !== null) {
      const currentuser = userContext.Result.User;
      const user = _.find(users, { UserId: currentuser.UserId });
      if (!_.isNil(user)) {
        this.userSuccess({ Value: user });
      } else {
        this.userServices.Users.get(
          { Id: currentuser.UserId }, this.userSuccess);
      }
    }
  }
  userSuccess = (res) => {
    const user = res.Value;
    const middleName = user.MiddleName || '';
    const suffixName = user.SuffixName || '';
    const designation = user.ProfessionalDesignation || '';
    this.displayName = user.FirstName + (middleName.length > 0 ? ' ' +
      middleName.charAt(0) : '') + ' ' +
      user.LastName + (suffixName.length > 0 ? ', ' +
        suffixName : '') + ' - ' +
      user.UserCode +
      (designation.length > 0 ? ', ' +
        designation : '');
    // remove trailing whitespace from the computed name.
    this.displayName.trim();
    this.dashboardService.BatchLoader.Init([this.userLocation.id], user, this.dashboardId, this.batchIds,
      this.dashboardLoadSuccess,
      this.dashboardLoadFailed
    );

    //Create login event (if first visit)
    const firstVisit = localStorage.getItem('isFirstVisit');
    if (firstVisit !== 'false') {
      this.userServices.LoginActivityEvent.create('');
      localStorage.setItem('isFirstVisit', 'false');
    }
    }

    getReferralFeatureFlag() {
        this.featureFlagService.getOnce$(FuseFlag.DashboardReferralsWidgetMvp).subscribe((value) => {
            this.isReferralFlagEnabled = value;
        });
    }

  dashboardLoadSuccess = (definition) => {
    this.dashboardService.DashboardId = this.dashboardId;
      this.dashboardDefinition = {};
      this.dashboardDefinition.Items = [];
      this.getReferralFeatureFlag();
      _.each(definition.Items, (item) => {
          if ((item.ItemId===30 && this.isReferralFlagEnabled) || item.ItemId!=30)
            this.dashboardDefinition.Items.push(item);
      });
    _.each(this.dashboardDefinition.Items, (widget) => {
      widget.Locations = [this.userLocation.id];
    });
    this.createGridster();
  }

  dashboardLoadFailed = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the dashboard definition. Refresh the page to try again.'),
      this.localize.getLocalizedString('Server Error'));
  }

  createGridster = () => {
    if (this.dashboardDefinition) {
      this.standardItems = _.filter(this.dashboardDefinition.Items, (item) => {
        return !item.IsHidden;
      });
      this.hiddenItems = _.filter(this.dashboardDefinition.Items, (item) => {
        return item.IsHidden;
      });
      this.unSelectedItems = this.hiddenItems.map((item) => {
        return { Value: item.Title, Id: item.ItemId };
      });
      this.hiddenWidgetFilterOptions = _.sortBy(this.unSelectedItems, (item) => {
        return item.Value;
      });
      this.setDefaultItem = ({ Value: 'Show Hidden', Id: null });
      this.columns = this.dashboardDefinition.Columns;
      this.draggable = this.dashboardDefinition.CanDrag;
      this.resizable = this.dashboardDefinition.CanResize;
    } else {
      this.draggable = false;
      this.resizable = false;
    }

    if (_.isNull(this.standardItems)) {
      this.standardItems = [];
    }
    if (_.isNull(this.columns)) {
      this.columns = 6;
    }

    // map the gridsterItem to the custom item structure
    this.customItemMap = {
      sizeX: 'item.Size.Width',
      sizeY: 'item.Size.Height',
      row: 'item.Position[0]',
      col: 'item.Position[1]'
    };

    this.gridsterOpts = {
      minRows: 2, // the minimum height of the grid, in rows
      maxRows: 100,
      columns: this.columns, // the width of the grid, in columns
      colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
      rowHeight: '*0.9', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
      margins: [10, 10], // the pixel distance between each widget
      defaultSizeX: 2, // the default width of a gridster item, if not specifed
      defaultSizeY: 1, // the default height of a gridster item, if not specified
      mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
      resizable: {
        enabled: this.resizable,
        start: (event, uiWidget, $element) => {
        }, // optional callback fired when resize is started,
        resize: (event, uiWidget, $element) => {
        }, // optional callback fired when item is resized,
        stop: (event, uiWidget, $element) => {
          this.saveLayoutDisabled = false;
        } // optional callback fired when item is finished resizing
      },
      draggable: {
        enabled: this.draggable, // whether dragging items is supported
        handle: '.widget-handle', // optional selector for resize handle
        start: (event, uiWidget, $element) => {
        }, // optional callback fired when drag is started,
        drag: (event, uiWidget, $element) => {
        }, // optional callback fired when item is moved,
        stop: (event, uiWidget, $element) => {
          this.saveLayoutDisabled = false;
        } // optional callback fired when item is finished dragging
      }
    };
  }
  onClose(id) {
    const hiddenItem = this.dashboardDefinition.Items.find((item) => {
      return item.ItemId === id;
    });
    hiddenItem.IsHidden = true;
    this.saveLayoutDisabled = false;
    this.createGridster();
  }

  changeFilter(value) {
    this.widgetId = { Value: 'Show Hidden', Id: null };
    if (value && this.dashboardDefinition.Items) {
      const selectedItem = this.dashboardDefinition.Items.find((item) => {
        return item.ItemId === value.Id;
      });
      if (selectedItem) {
        // selectedItem.initMode = widgetInitStatus.ToLoad; // This is to force the widget to load data again when it is visible
        selectedItem.IsHidden = false;
        selectedItem.Position = null;
        this.saveLayoutDisabled = false;
        this.createGridster();
      }
    }
  }


  saveLayout() {
    if (this.saveLayoutDisabled) {
      return;
    }
    _.each(this.dashboardDefinition.Items, (item) => {
      item.Position = [1, 1];
    });

    this.dashboardService.DashboardDefinitions.save(
      { id: this.dashboardService.DashboardId }, this.dashboardDefinition,
      this.successSave,
      this.failedCreate
    );
  }
  successSave = (resp: any) => {
    this.saveLayoutDisabled = true;
    this.toastrFactory.success(this.localize.getLocalizedString('Your layout has been saved.'), this.localize.getLocalizedString('Success'));
  }
  failedCreate = (resp: any) => {
    this.toastrFactory.error(this.localize.getLocalizedString('Your layout has not been saved.'), this.localize.getLocalizedString('Failed'));
  }

}
