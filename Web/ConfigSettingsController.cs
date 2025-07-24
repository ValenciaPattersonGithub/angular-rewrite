using System.Web.Mvc;
using PAT.Enterprise.Utilities;
using PAT.Soar.UI.Web.filters;

namespace PAT.Soar.UI.Web
{
    public class ConfigSettingsController : Controller
    {
        [JavaScriptFile]
        [OutputCache(Duration = 120, VaryByParam = "none")]
        public ActionResult Index()
        {
            ViewBag.Version = VersionHelper.GetAssemblyVersionForObject(typeof(ConfigSettingsController));
            return PartialView();
        }
    }

}