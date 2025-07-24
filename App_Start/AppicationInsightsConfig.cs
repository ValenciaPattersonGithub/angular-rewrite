using Microsoft.ApplicationInsights.Channel;
using PAT.Enterprise.Logger.AppInsights;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PAT.Soar.UI
{
    public class ApplicationInsightsConfig
    {
        public static void Register()
        {
            SystemTelemetryInitializer.Register();
        }
    }
}