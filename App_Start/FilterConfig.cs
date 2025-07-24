using System.Web.Mvc;
using PAT.Soar.UI.Web.filters;

namespace PAT.Soar.UI
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new JavaScriptFileAttribute());
        }
    }
}