'use strict';

angular
  .module('Soar.Widget')
  .constant('WidgetBarChartStyle', {
    Flat: 0,
    Pillar: 1,
  })
  .constant('WidgetInitStatus', {
    ToLoad: 0,
    Loading: 1,
    Loaded: 2,
  })
  .constant('WidgetMonthLabels', [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ])
  .constant('WidgetDateFilterValues', {
    YearToDate: 'YTD',
    MonthToDate: 'MTD',
    LastYear: 'Last Year',
    LastMonth: 'Last Month',
    Today: 'Today',
    Range: 'Date Range',
    All: 'All',
  });
