'use strict';

angular.module('Soar.Dashboard').service('DashboardService', [
  '$resource',
  'WidgetInitStatus',
  function ($resource, widgetInitStatus) {
    var definitionsEndPoint = $resource(
      '_soarapi_/dashboards/:id',
      {},
      {
        get: { method: 'GET' },
        save: { method: 'POST' },
      }
    );
    var batchEndPoint = $resource(
      '_soarapi_/dashboards/:id/batch/:batchId',
      {},
      {
        get: { method: 'GET' },
      }
    );

    function _BatchLoader() {
      this.Init = function (
        locationIds,
        userData,
        dashboardId,
        batchIds,
        onCompletedCallback,
        onFailedCallback
      ) {
        var batchPending = 0;
        var definitionLoaded = false;
        var loadedBatchData = [];
        var dashboardDefinition = null;

        var dashboardFilter = {
          DashboardType: dashboardId,
          LocationIds: locationIds,
          ProviderIds: userData && [userData.UserId],
        };
        definitionsEndPoint.save(
          dashboardFilter,
          function (result) {
            onDashboardDefinitionLoaded(result.Value);
            onCompletedCallback(dashboardDefinition);
          },
          function () {
            onFailedCallback();
          }
        );
        batchIds.forEach(function (batchId) {
          batchPending++;
          batchEndPoint.save(
            { batchId: batchId },
            dashboardFilter,
            function (result) {
              onBatchLoaded(batchId, result.Value);
            },
            function () {
              onBatchFailed(batchId);
            }
          );
        });

        function computeInitMode(items) {
          items.forEach(function (item) {
            if (item.BatchLoadId > 0) item.initMode = widgetInitStatus.Loading;
            else if (item.BatchLoadId == 0)
              item.initMode = widgetInitStatus.ToLoad;
            else if (item.BatchLoadId < 0)
              item.initMode = widgetInitStatus.Loaded;
          });
        }

        function onDashboardDefinitionLoaded(definition) {
          definitionLoaded = true;

          definition.Items.forEach(function (item) {
            item.userData = userData;
          });

          computeInitMode(definition.Items);

          // if the initial data has arrived, find the matched data and added to the widget definition.
          if (loadedBatchData.length > 0) {
            loadedBatchData.forEach(function (batch) {
              setInitData(definition.Items, batch);
            });
          }

          if (batchPending <= 0) {
            definition.Items.forEach(function (item) {
              if (item.BatchLoadId > 0) {
                item.BatchLoadId = 0; // Trigger the initial loading of the widget
                item.initMode = widgetInitStatus.ToLoad;
              }
            });
          }
          dashboardDefinition = definition;
        }

        function onBatchLoaded(batchId, batchData) {
          batchPending--;

          if (!definitionLoaded) {
            loadedBatchData.push(batchData);
          } else {
            setInitData(dashboardDefinition.Items, batchData);
            if (batchPending <= 0) {
              dashboardDefinition.Items.forEach(function (item) {
                if (item.BatchLoadId > 0) {
                  item.BatchLoadId = 0;
                  item.initMode = widgetInitStatus.ToLoad; // Trigger the initial loading of the widget
                }
              });
            }
          }
        }

        function onBatchFailed(batchId) {
          batchPending--;

          if (definitionLoaded) {
            dashboardDefinition.Items.forEach(function (item) {
              if (
                item.BatchLoadId == batchId ||
                (item.BatchLoadId > 0 && batchPending <= 0)
              ) {
                item.BatchLoadId = 0;
                item.initMode = widgetInitStatus.ToLoad; // Trigger the initial loading of the widget
              }
            });
          }
        }

        function setInitData(items, batch) {
          items.forEach(function (item) {
            if (item.ItemId in batch.ChartData) {
              item.initData = batch.ChartData[item.ItemId];
              item.BatchLoadId = -1; // Indicate that the data is loaded.
              item.initMode = widgetInitStatus.Loaded;
            }
          });
        }
      };
    }

    return {
      DashboardDefinitions: definitionsEndPoint,
      BatchLoader: new _BatchLoader(),
    };
  },
]);
