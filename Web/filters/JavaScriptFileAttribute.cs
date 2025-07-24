using System.Web.Mvc;

namespace PAT.Soar.UI.Web.filters
{
    public class JavaScriptFileAttribute : ActionFilterAttribute
    {
        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {            
            var response = filterContext.HttpContext.Response;
            response.ContentType = "text/javascript";
        }
    }
}