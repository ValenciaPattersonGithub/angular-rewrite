import { Component, Inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DrawTypeModel } from './draw-types.model';
import { DrawTypesService } from 'src/@shared/providers/drawtypes.service';
@Component({
  selector: 'draw-types-landing',
  templateUrl: './draw-types-landing.component.html',
  styleUrls: ['./draw-types-landing.component.scss']
})
export class DrawTypesLandingComponent implements OnInit, OnChanges {
  @Input() drawTypes: Array<DrawTypeModel> = [];

  breadCrumbs: { name: string, path: string, title: string }[] = [];
  loadingMessageNoResults: string;
  loadingList = true;
  columns: { field: string, title: string, width: string }[] = [];
  hasAuthViewAccess = false;
  // Initial filter descriptor
  state = {
    skip: 0,
    sort: [
      {
        field: "Description",
        dir: "asc",
      }, 
    ],

    filter: {
      logic: "and",
      filters: [
        {
          field: "Description",
          operator: "contains",
          value: ""
        },
        {
          field: "AffectedAreaName",
          operator: "contains",
          value: ""
        }
      ],
    }
  };

  constructor(
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('StaticData') private staticData,
    private drawtypesService: DrawTypesService,
  ) {
    this.authAccess();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.drawTypes) {
      this.affectedAreaName();
    }
  }

  async ngOnInit(): Promise<void> {
    this.getPageNavigation();
    this.initKendoColumns();
    const drawTypes = await this.drawtypesService.getAll()
    this.drawTypes = drawTypes;
    this.loadingMessageNoResults = this.localize?.getLocalizedString('There are no {0}.', ['draw types']);
    this.affectedAreaName();
  }

  getPageNavigation = () => {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings'
      },
      {
        name: this.localize.getLocalizedString('Draw Types'),
        path: '/BusinessCenter/DrawTypes/',
        title: 'Draw Types'
      }
    ];
  };

  //#region authorization
  authAccess = () => {
    if (!this.authViewAccess()) {
      this.toastrFactory.error(this.localize?.getLocalizedString('User is not authorized to access this area.'), this.localize?.getLocalizedString('Not Authorized'));
      window.location.href = '/';
    }
  }

  authViewAccess = () => {
    this.hasAuthViewAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bdrwtp-view');
    return this.hasAuthViewAccess;
  };

  //end region

  //kendo columns
  initKendoColumns() {
    this.columns = [
      {
        field: 'Description',
        title: 'Description',
        width: '500'
      },
      {
        field: 'AffectedAreaName',
        title: 'Impacts',
        width: '500'
      }
    ]
  }

  affectedAreaName = () => {
    // get the affected area name
    this.staticData?.AffectedAreas()?.then((res) => {
      if (res && res?.Value) {
        this.drawTypes?.forEach((dt) => {
          const item = res?.Value?.find(x => x.Id == dt.AffectedAreaId);
          if (item && item?.Name) {
            dt.AffectedAreaName = item?.Name;
          }
        });
      }
    });

    this.loadingList = false;
  };
}