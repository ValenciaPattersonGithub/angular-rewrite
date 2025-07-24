using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Owin;
using NWebsec.Owin;
using Owin;
using System.Configuration;

[assembly: OwinStartup(typeof(PAT.Soar.UI.Startup))]

namespace PAT.Soar.UI
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Temporary logic to force use of devazure settings when running on localhost only, per new dev process.
            // Once all devs are comfortably switched over, we can clean up/remove all of this "devazure" setting
            // stuff (because those will be the new defaults on localhost) and remove this as well.
            string domainUrl;
            string vapiUrl;

            bool isLocalhost = ConfigurationManager.AppSettings["DomainUrl"].Contains("localhost");

            if (isLocalhost)
            {
                string useEnvironment = ConfigurationManager.AppSettings["LocalhostUseEnvironment"].ToLowerInvariant();
                if (useEnvironment == "test")
                {
                    domainUrl = "devazure_DomainUrl";
                    vapiUrl = "devazure_VersionedEnterpriseUrl";
                }
                else if (useEnvironment == "stage")
                {
                    domainUrl = "masterazure_DomainUrl";
                    vapiUrl = "masterazure_VersionedEnterpriseUrl";
                }
                else
                    throw new InvalidOperationException($"Invalid LocalhostUseEnvironment setting: {useEnvironment}");
            }
            else
            {
                domainUrl = "DomainUrl";
                vapiUrl = "VersionedEnterpriseUrl";
            }

            app
                .UseRedirectValidation()
                //  This line is currently not supported in the OWIN NWebSec package:
                //  <setNoCacheHttpHeaders enabled="true" />
                //  !! Some of these options should be handled in the OWIN NWebSec package in Web.config since they are handled in more places !!
                //  !! If they are enabled here as well, they will appear twice in the headers !!
                // .UseXfo(options => options.SameOrigin())
                // .UseHsts(options => options.MaxAge(365).IncludeSubdomains())
                // .UseXContentTypeOptions()
                .UseXDownloadOptions()
                // .UseXXssProtection(options => options.EnabledWithBlockMode())
                .UseCsp(options => options
                    .DefaultSources(config => config.Self())
                    .ScriptSources(config => config.UnsafeEval().UnsafeInline().Self())
                    .StyleSources(config => config.UnsafeInline().Self())
                    .ImageSources(config => config.Self().CustomSources("data:"))
                    .ObjectSources(config => config.None())
                    .MediaSources(config => config.None())
                    .FrameSources(config => config.Self().CustomSources("login.windows.net", "login.microsoftonline.com"))
                    .FontSources(config => config.Self())
                    .ConnectSources(config => config.Self().CustomSources(
                        ConfigurationManager.AppSettings[domainUrl],
                        ConfigurationManager.AppSettings[vapiUrl]))
                );
        }
    }
}
