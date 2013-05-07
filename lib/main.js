const {Ci, Cc} = require("chrome");
self = require("self");
url = require("url");
runtime = require("runtime");
let pkcs = Cc["@mozilla.org/security/pkcs11;1"].getService(Ci.nsIPKCS11);

load=true;
loaded=false;
modname="";
platform=runtime.XPCOMABI.substr(0, runtime.XPCOMABI.indexOf("-"));

exports.main = function(options, callbacks)
{
  if (runtime.OS=="WINNT")
	 modname="opensc-pkcs11.dll";
  else if (runtime.OS=="Linux")
  {
	 if (platform=="x86") modname="opensc-pkcs11_32.so";
	 else if (platform=="x86_64") modname="opensc-pkcs11_64.so";
	 else
	 {
		load=false;
		console.error("Crypto Stick add-on: Unsupported CPU arch. Only i386 and x86-64 are supported");
	 }
  }
  else if (runtime.OS=="Darwin"){
	  modname="opensc-pkcs11_mac";
	  }
  else
  {
	 load=false;
	 console.error("Crypto Stick driver can't be loaded. Currently only Linux and Windows are supported. Sorry!");
  }


  toLoad=url.toFilename(self.data.url(modname));
  if (options.loadReason!="startup" && load)
  {
        try
        {
	       pkcs.addModule("Crypto Stick", toLoad, 1, 0);
	       loaded=true;
	       console.log("Crypto Stick driver has been successfully installed");
        }
        catch(e)
        {
	     console.error("Installing driver unsuccessfull: "+e);
        }
  }
};

exports.onUnload = function (reason)
{
        if (reason!="shutdown" && loaded)
        {
	       try
	       {
		      pkcs.deleteModule("Crypto Stick");
		      console.log("Crypto Stick driver has been successfully uninstalled");
	       }
	       catch (e)
	       {
		      console.error("Crypto Stick driver couldn't be unloaded. Maybe haven't been installed?"+e);
	       }
        }
        else
	       console.log("Crypto Stick add-on is turning off. Driver don't have to be unloaded");
};
