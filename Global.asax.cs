using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Microsoft.ApplicationInsights.Channel;

namespace PAT.Soar.UI
{
    public class Global : HttpApplication
    {

        protected void Application_Start(object sender, EventArgs e)
        {
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            ApplicationInsightsConfig.Register();

            MvcHandler.DisableMvcResponseHeader = true;

        }

    }
}