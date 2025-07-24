Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Must be run from an Administrator account 
"Script Started..."

$friendlyName = "Fuse UI Developer"

# Retrieve existing certificate if it exists
$certs = Get-ChildItem -Recurse -Path Cert:\LocalMachine\My | ? { [bool] ( $_.PSObject.Properties.name -match "^FriendlyName$" ) } `
       | ? { $_.FriendlyName -eq $friendlyName }

if ( $null -eq $certs -or ($certs -is [array] -and $certs.Length -eq 0) )
{
    # Certificate does not exist. Create it.
    "Creating Certificate"
    $certObjecct = New-SelfSignedCertificate -FriendlyName $friendlyName -DnsName "local.test-fuse-web.practicemgmt-test.pattersondevops.com","local.stage-fuse-web.practicemgmt-stage.pattersondevops.com" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddMonths(72)

    # Generate a random secure password
    $length = 16
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()'
    $randomPwd = -join ((Get-Random -Count $length -InputObject ($chars.ToCharArray())))

  # Convert random password to secure string
    $mypwd = ConvertTo-SecureString -String $randomPwd -AsPlainText -Force

    $pfx = "local.fuse-web.practicemgmt.pattersondevops.com.pfx"
    
    if (Test-Path -PathType Leaf -Path $pfx)
    {
        "Removing old .pfx: $pfx"
        Remove-Item -Force $pfx
    }

    # Export the certificate to PFX with the random password
    Export-PfxCertificate -NoClobber -Password $mypwd -FilePath $pfx -Cert $certObjecct
    Import-PfxCertificate -Exportable -Password $mypwd -FilePath $pfx -CertStoreLocation Cert:\CurrentUser\Root
    Remove-Item -Force $pfx

    # Verify certificate creation
    $certs = Get-ChildItem -Recurse -Path Cert:\LocalMachine\My | ? { [bool] ( $_.PSObject.Properties.name -match "^FriendlyName$" ) } `
        | ? { $_.FriendlyName -eq $friendlyName }

    if ( $null -eq $certs -or ($certs -is [array] -and $certs.Length -eq 0) )
    {
        "Something's really wrong - we just created the cert above, but now can't find it?"
        exit 1
    }
    else
    {
       "Script Completed..."
    }
}
else
{
"Certificate exists..."
}