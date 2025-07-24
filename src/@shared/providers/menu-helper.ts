import { Inject, Injectable } from '@angular/core';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { FeatureFlag } from 'src/featureflag/featureflag.service';

/**
 * Top-level menu item.
 */
export class MenuItem {
  Text: string;
  Url: string;
  TemplateUrl?: string;
  Title: string;
  IconClass: string;
  Selected: boolean;
  Disabled: boolean;
  Target: string;
  SubMenuItems?: SubMenuItem[];
  RouteValue?: string;
  Template?: string;
}

/**
 * Sub-menu item.
 */
export class SubMenuItem {
  Text: string;
  Plural: string;
  RouteValue: string;
  Url: string;
  Template?: string;
  Title: string;
  Amfa?: string;
  AddAmfa?: string;
  Controls: boolean;
  Disabled: boolean;
  AddSeparator?: string;
  FeatureFlag?: FeatureFlag<boolean>;
}

/**
 * Container class for navigation menu items.
 */
@Injectable()
export class MenuHelper {
  constructor(
    @Inject('patSecurityService') private patSecurityService: { IsAuthorizedByAbbreviation: (type: string) => boolean; },
  ) { }

  private authAccessByType(authtype: string) {
    return this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
  }

  /**
   * Returns the business menu items.
   * 
   * @returns Business menu items
   */
  businessMenuItems(): MenuItem[] {
    return [
      {
        Text: 'Practice at a Glance',
        Url: '#/BusinessCenter/PracticeAtAGlance',
        TemplateUrl:
          'App/BusinessCenter/practice-at-a-glace/practice-at-a-glance.html',
        Title: 'Practice At A Glance',
        IconClass: 'fa fa-th-large fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-dsh-dsh-view'),
        Target: '_self',
      },
      {
        Text: 'Reports',
        Url: '#/BusinessCenter/Reports',
        TemplateUrl: 'App/BusinessCetner/reports/reports-page.html',
        Title: 'Report Categories',
        IconClass: 'far fa-file fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-report-report-view'),
        Target: '_self',
        SubMenuItems: [
          {
            Text: 'Activity',
            Plural: 'Activity',
            RouteValue: 'activity',
            Url: '#/BusinessCenter/Reports?type=activity',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Activity',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Clinical',
            Plural: 'Clinical',
            RouteValue: 'clinical',
            Url: '#/BusinessCenter/Reports?type=clinical',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Clinical',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Financial',
            Plural: 'Financial',
            RouteValue: 'financial',
            Url: '#/BusinessCenter/Reports?type=financial',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Financial',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Insurance',
            Plural: 'Insurance',
            RouteValue: 'insurance',
            Url: '#/BusinessCenter/Reports?type=insurance',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Insurance',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Patient',
            Plural: 'Patient',
            RouteValue: 'patient',
            Url: '#/BusinessCenter/Reports?type=patient',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Patient',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Provider',
            Plural: 'Provider',
            RouteValue: 'provider',
            Url: '#/BusinessCenter/Reports?type=provider',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Provider',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Provider Goals',
            Plural: 'Provider Goals',
            RouteValue: 'provider goal report',
            Url: '#/BusinessCenter/Reports?type=provider goals',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Provider Goals',
            Amfa: 'soar-report-pat-patan',
            AddAmfa: 'soar-report-pat-patan',
            Controls: false,
            Disabled: !this.authAccessByType('soar-report-pat-patan'),
            FeatureFlag: FuseFlag.ShowProviderGoalReport,
          },
          {
            Text: 'Referral',
            Plural: 'Referral',
            RouteValue: 'referral',
            Url: '#/BusinessCenter/Reports?type=referral',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Referral',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Schedule',
            Plural: 'Schedule',
            RouteValue: 'schedule',
            Url: '#/BusinessCenter/Reports?type=schedule',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Schedule',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Service',
            Plural: 'Service',
            RouteValue: 'service',
            Url: '#/BusinessCenter/Reports?type=service',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Service',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Favorite Reports',
            Plural: 'Favorite Reports',
            RouteValue: 'favorite reports',
            Url: '#/BusinessCenter/Reports?type=favorite',
            Template: 'App/BusinessCenter/reports/reports-page.html',
            Title: 'Favorite Reports',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            AddSeparator: 'Y', // if need to show top separator pass 'Y' else 'N'
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
        ],
      },
      {
        Text: 'Insurance',
        Url: '#/BusinessCenter/Insurance',
        TemplateUrl: 'App/BusinessCenter/insurance/insurance.html',
        Title: 'Insurance',
        IconClass: 'fa fa-umbrella fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
        Target: '_self',
        SubMenuItems: [
          {
            Text: 'Claim & Predetermination',
            Plural: 'Claims & Predeterminations',
            RouteValue: 'claims',
            Url: '#/BusinessCenter/Insurance/Claims',
            Template: 'App/BusinessCenter/insurance/claims/claims.html',
            Title: 'Claims & Predeterminations',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
          {
            Text: 'Carrier',
            Plural: 'Carriers',
            RouteValue: 'carriers',
            Url: '#/BusinessCenter/Insurance/Carriers',
            Template: 'App/BusinessCenter/insurance/carriers/carriers.html',
            Title: 'Carriers',
            Amfa: 'soar-ins-ibcomp-view',
            AddAmfa: 'soar-ins-ibcomp-add',
            Controls: true,
            Disabled: !this.authAccessByType('soar-ins-ibcomp-view'),
          },
          {
            Text: 'Plan',
            Plural: 'Plans',
            RouteValue: 'plans',
            Url: '#/BusinessCenter/Insurance/Plans',
            Template:
              'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plans.html',
            Title: 'Plans',
            Amfa: 'soar-ins-ibplan-view',
            AddAmfa: 'soar-ins-ibplan-add',
            Controls: true,
            Disabled: !this.authAccessByType('soar-ins-ibplan-view'),
          },
          {
            Text: 'Fee Schedule',
            Plural: 'Fee Schedules',
            RouteValue: 'feeschedule',
            Url: '#/BusinessCenter/Insurance/FeeSchedule',
            Template:
              'App/BusinessCenter/insurance/fee-schedule/fee-schedule-landing.html',
            Title: 'Fee Schedules',
            Amfa: 'soar-ins-ifsch-view',
            AddAmfa: 'soar-ins-ifsch-add',
            Controls: true,
            Disabled: !this.authAccessByType('soar-ins-ifsch-view'),
          },
          {
            Text: 'Apply Bulk Insurance Payment',
            Plural: 'Apply Bulk Insurance Payment',
            RouteValue: 'bulkpayment',
            Url: '#/BusinessCenter/Insurance/BulkPayment',
            Template:
              'App/BusinessCenter/insurance/bulk-payment/bulk-payment-w.html',
            Title: 'Apply Bulk Insurance Payment',
            Amfa: 'soar-acct-aipmt-view',
            AddAmfa: 'soar-acct-aipmt-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-acct-aipmt-view'),
          },
          {
            Text: 'ERA',
            Plural: 'ERA',
            RouteValue: 'era',
            Url: '#/BusinessCenter/Insurance/ERA',
            Template: 'App/BusinessCenter/insurance/ERA/ERA.html',
            Title: 'ERA',
            Amfa: 'soar-acct-aipmt-view',
            AddAmfa: 'soar-acct-aipmt-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-acct-aipmt-view'),
          },
          {
            Text: 'Payer Reports',
            Plural: 'Payer Reports',
            RouteValue: 'payerreport',
            Url: '#/BusinessCenter/Insurance/PayerReport',
            Template:
              'App/BusinessCenter/insurance/payer-report/payer-report.html',
            Title: 'Payer Reports',
            Amfa: 'soar-ins-iclaim-view',
            AddAmfa: 'soar-ins-iclaim-add',
            Controls: false,
            Disabled: !this.authAccessByType('soar-ins-iclaim-view'),
          },
        ],
      },
      {
        Text: 'Receivables',
        Url: '#/BusinessCenter/Receivables',
        TemplateUrl:
          '',
        Title: 'Receivables',
        IconClass: 'fa fa-download fa-3x',
        Selected: false,
          Disabled: !this.authAccessByType('soar-biz-comtmp-view'),
        Target: '_self',
        SubMenuItems: [
          {
            Text: 'Total Receivables',
            Plural: 'Total Receivables',
            RouteValue: 'Total',
            Url: '#/BusinessCenter/Receivables/TotalReceivables',
            Template:
              'App/BusinessCenter/receivables/total-receivables/total-receivables.html',
            Title: 'Total Receivables',
            Controls: false,
            Disabled: !this.authAccessByType('soar-biz-bizrcv-view'),
          },
          {
            Text: 'Statement',
            Plural: 'Statements',
            RouteValue: 'statements',
            Url: '#/BusinessCenter/Receivables/Statements',
            Template: 'App/BusinessCenter/receivables/statements/statements.html',
            Title: 'Statements',
            Controls: true,
            Disabled: !this.authAccessByType('soar-acct-astmt-view'),
          },
          {
            Text: 'Statement',
            Plural: 'Statements (New)',
            RouteValue: 'newstatements',
            Url: '#/BusinessCenter/Receivables/NewStatements',
            Title: 'Statements (New)',
            Controls: true,
            Disabled: !this.authAccessByType('soar-acct-astmt-view'),
            FeatureFlag: FuseFlag.EnableNewStatementsExperience,
          },
          {
            Text: 'Deposit',
            Plural: 'Deposits',
            RouteValue: 'deposits',
            Url: '#/BusinessCenter/Receivables/Deposits',
            Template: 'App/BusinessCenter/receivables/deposits/deposits.html',
            Title: 'Deposits',
            Controls: true,
            Disabled: !this.authAccessByType('soar-biz-dep-view'),
          },
        ],
      },
      {
        Text: 'Forms & Documents',
        Url: '#/BusinessCenter/FormsDocuments',
        TemplateUrl: 'App/BusinessCetner/forms-documents/forms-documents.html',
        Title: 'Forms & Documents',
        IconClass: 'far fa-folder-open fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-doc-docimp-view'),
        Target: '_self',
        SubMenuItems: [
          {
            Text: 'Patients',
            Plural: 'Patients',
            RouteValue: 'FormsDocuments',
            Url: '#/BusinessCenter/FormsDocuments/Patients',
            Template: '',
            Title: 'Forms & Documents',
            Disabled: !this.authAccessByType('soar-doc-docimp-view'),
            Controls: false,
          },
          {
            Text: 'Templates & Forms',
            Plural: 'Templates & Forms',
            RouteValue: 'FormsTemplates',
            Url: '#/BusinessCenter/FormsDocuments/FormsTemplates',
            Template: '',
            Title: 'Templates & Forms',
            Disabled: !this.authAccessByType('soar-doc-docimp-view'),
            Controls: true,
          },
        ],
      },
      {
        Text: 'Mass Updates',
        Title: 'Mass Updates',
        Url: '#/BusinessCenter/MassUpdate',
        RouteValue: '#/BusinessCenter/AppointmentsTransfer',
        Template:
          'src/business-center/mass-updates/mass-update/mass-update.component.html',
        IconClass: 'fa fa-th-large fa-3x',
        Disabled: !this.authAccessByType('soar-report-admin-actlog'),
        Selected: false,
        Target: '_self',
        SubMenuItems: [
          {
            Text: 'Mass Patient Transfer',
            Plural: 'Mass Patient Transfer',
            RouteValue: '',
            Url: '#/BusinessCenter/MassUpdate',
            Template: '',
            Title: 'Mass Patient Transfer',
            Disabled: !this.authAccessByType('soar-report-admin-actlog'),
            Controls: false,
          },
          {
            Text: 'Mass Appointment Transfer',
            Plural: 'Mass Appointment Transfer',
            RouteValue: '#/BusinessCenter/AppointmentsTransfer',
            Url: '#/BusinessCenter/AppointmentsTransfer',
            Template: '',
            Title: 'Mass Appointment Transfer',
            Disabled: false,
            Controls: true,
          },
        ],
      },
    ];
  }

  /**
   * Returns the patient menu items.
   * 
   * @returns Patient menu items
   */
  patientMenuItems(): MenuItem[] {
    return [
      {
        Text: 'All Patients',
        Url: '#/Patient#/AllPatients',
        Title: 'All Patients',
        IconClass: 'fa fa-th-large fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-dsh-dsh-view'),
        Target: '_self',
      },
      {
        Text: 'Preventive Care',
        Url: '#/Patient#/PreventiveCare',
        Title: 'Preventive Care',
        IconClass: 'fa fa-th-large fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-dsh-dsh-view'),
        Target: '_self',
      },
      {
        Text: 'Treatment Plans',
        Url: '#/Patient#/TreatmentPlans',
        Title: 'Treatment Plans',
        IconClass: 'fa fa-th-large fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-dsh-dsh-view'),
        Target: '_self',
      },
      {
        Text: 'Appointments',
        Url: '#/Patient#/Appointments',
        Title: 'Appointments',
        IconClass: 'fa fa-th-large fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-dsh-dsh-view'),
        Target: '_self',
      },
      {
        Text: 'Other To Do',
        Url: '#/Patient#/OtherToDo',
        Title: 'Other To Do',
        IconClass: 'fa fa-th-large fa-3x',
        Selected: false,
        Disabled: !this.authAccessByType('soar-dsh-dsh-view'),
        Target: '_self',
      },
    ];
  }
}
