:: Wrapper: Offline Launcher
:: Original Author: benson#0411
:: Project Runner: xomdjl_#1337
:: License: MIT
set WRAPPER_VER=1.2.3
set WRAPPER_BLD=72
title Wrapper: Offline v%WRAPPER_VER% ^(build %WRAPPER_BLD%^) [Initializing...]

::::::::::::::::::::
:: Initialization ::
::::::::::::::::::::

:: Stop commands from spamming stuff, cleans up the screen
@echo off && cls

:: Lets variables work or something idk im not a nerd
SETLOCAL ENABLEDELAYEDEXPANSION

:: Make sure we're starting in the correct folder, and that it worked (otherwise things would go horribly wrong)
pushd "%~dp0"
if !errorlevel! NEQ 0 goto error_location
if not exist utilities ( goto error_location )
if not exist wrapper ( goto error_location )
if not exist server ( goto error_location )
goto noerror_location
:error_location
echo Doesn't seem like this script is in a Wrapper: Offline folder.
pause && exit
:noerror_location

:: patch detection
if exist "patch.jpg" goto patched

:: Prevents CTRL+C cancelling (please close with 0) and keeps window open when crashing
if "%~1" equ "point_insertion" goto point_insertion
start "" /wait /B "%~F0" point_insertion
exit

:point_insertion

:: Check *again* because it seems like sometimes it doesn't go into dp0 the first time???
pushd "%~dp0"
if !errorlevel! NEQ 0 goto error_location
if not exist utilities ( goto error_location )
if not exist wrapper ( goto error_location )
if not exist server ( goto error_location )

:: Create checks folder if nonexistent
if not exist "utilities\checks" md utilities\checks

:: Operator, attention!
if not exist "utilities\checks\disclaimer.txt" (
	echo DISCLAIMER
  echo:
	echo Wrapper: Offline is a project to preserve the original GoAnimate flash-based themes.
	echo We believe they should be archived for others to use and learn about in the future.
	echo All business themes have been removed, please use Vyond Studio if you wish to get those.
	echo This is still unlawful use of copyrighted material, but ^(in our opinion^) morally justifiable use.
	echo:
	echo We are not affiliated in any form with Vyond or GoAnimate Inc. We generate no profit from this.
	echo We do not wish to promote piracy, and we avoid distributing content that is still in use by GoAnimate Inc.
	echo We have tried to reduce any harm we could do to GoAnimate Inc while making this project.
	echo:
	echo Excluding Adobe Flash and GoAnimate Inc's assets, Wrapper: Offline is free/libre software.
	echo You are free to redistribute and/or modify it under the terms of the MIT ^(aka Expat^) license,
	echo except for some dependencies which have different licenses with slightly different rights.
	echo Read the LICENSE file in Offline's base folder and the licenses in utilities/sourcecode for more info.
	echo:
	echo By continuing to use Wrapper: Offline, you acknowledge the nature of this project, and your right to use it.
	echo If you object to any of this, feel free to close Wrapper: Offline now.
	echo You will be allowed to accept 20 seconds after this message has appeared.
	echo: 
	PING -n 21 127.0.0.1>nul
	echo If you still want to use Wrapper: Offline, press Y. If you no longer want to, press N.
	:disclaimacceptretry
	set /p ACCEPTCHOICE= Response:
	echo:
	if not '!acceptchoice!'=='' set acceptchoice=%acceptchoice:~0,1%
	if /i "!acceptchoice!"=="y" goto disclaimaccepted
	if /i "!acceptchoice!"=="n" exit
	goto disclaimacceptretry
	:disclaimaccepted
	echo: 
	echo Sorry for all the legalese, let's get back on track.
	echo You've accepted the disclaimer. To reread it, remove this file. > utilities\checks\disclaimer.txt
)

:: Welcome, Director Ford!
echo Wrapper: Offline
echo A project from VisualPlugin originally adapted by Benson
echo Adapted by xomdjl_ and the Wrapper: Offline Team
echo Version !WRAPPER_VER!, build !WRAPPER_BLD!
echo:

:: Confirm measurements to proceed.
set SUBSCRIPT=y
echo Loading settings...
if not exist utilities\config.bat ( goto configmissing )
call utilities\config.bat
echo:
if !VERBOSEWRAPPER!==y ( echo Verbose mode activated. && echo:)
goto configavailable

:: Restore config
:configmissing
echo Settings are missing for some reason?
echo Restoring...
goto configcopy
:returnfromconfigcopy
if not exist utilities\config.bat ( echo Something is horribly wrong. You may be in a read-only system/admin folder. & pause & exit )
call utilities\config.bat
:configavailable

::::::::::::::::::::::
:: Dependency Check ::
::::::::::::::::::::::

if !SKIPCHECKDEPENDS!==y (
	echo Checking dependencies has been skipped.
	echo:
	goto skip_dependency_install
)

if !VERBOSEWRAPPER!==n (
	echo Checking for dependencies...
	echo:
)

title Wrapper: Offline v!WRAPPER_VER! ^(build !WRAPPER_BLD!^) [Checking dependencies...]

:: Preload variables
set NEEDTHEDEPENDERS=n
set ADMINREQUIRED=n
set FLASH_DETECTED=n
set FLASH_CHROMIUM_DETECTED=n
set FLASH_FIREFOX_DETECTED=n
set NODEJS_DETECTED=n
set HTTPSERVER_DETECTED=n
set HTTPSCERT_DETECTED=n
if !INCLUDEDCHROMIUM!==y set BROWSER_TYPE=chrome

:: Flash Player
if !VERBOSEWRAPPER!==y ( echo Checking for Flash installation... )
if exist "!windir!\SysWOW64\Macromed\Flash\*pepper.exe" set FLASH_CHROMIUM_DETECTED=y
if exist "!windir!\System32\Macromed\Flash\*pepper.exe" set FLASH_CHROMIUM_DETECTED=y
if exist "!windir!\SysWOW64\Macromed\Flash\*plugin.exe" set FLASH_FIREFOX_DETECTED=y
if exist "!windir!\System32\Macromed\Flash\*plugin.exe" set FLASH_FIREFOX_DETECTED=y
if !BROWSER_TYPE!==chrome (
	if !FLASH_CHROMIUM_DETECTED!==n (
		echo Flash for Chrome could not be found.
		echo:
		set NEEDTHEDEPENDERS=y
		set ADMINREQUIRED=y
		goto flash_checked
	) else (
		echo Flash is installed.
		echo:
		set FLASH_DETECTED=y
		goto flash_checked
	)
)
if !BROWSER_TYPE!==firefox (
	if !FLASH_FIREFOX_DETECTED!==n (
		echo Flash for Firefox could not be found.
		echo:
		set NEEDTHEDEPENDERS=y
		set ADMINREQUIRED=y
		goto flash_checked
	) else (
		echo Flash is installed.
		echo:
		set FLASH_DETECTED=y
		goto flash_checked
	)
)
:: just assume chrome it's what everyone uses
if !BROWSER_TYPE!==n (
	if !FLASH_CHROMIUM_DETECTED!==n (
		echo Flash for Chrome could not be found.
		echo:
		set NEEDTHEDEPENDERS=y
		set ADMINREQUIRED=y
		goto flash_checked
	) else (
		echo Flash is installed.
		echo:
		set FLASH_DETECTED=y
		goto flash_checked
	)
)
:flash_checked

:: Node.js
if !VERBOSEWRAPPER!==y ( echo Checking for Node.js installation... )
for /f "delims=" %%i in ('npm -v 2^>nul') do set output=%%i
IF "!output!" EQU "" (
	echo Node.js could not be found.
	echo:
	set NEEDTHEDEPENDERS=y
	set ADMINREQUIRED=y
	goto httpserver_checked
) else (
	echo Node.js is installed.
	echo:
	set NODEJS_DETECTED=y
)
:nodejs_checked

:: http-server
if !VERBOSEWRAPPER!==y ( echo Checking for http-server installation... )
npm list -g | findstr "http-server" >nul
if !errorlevel! == 0 (
	echo http-server is installed.
	echo:
	set HTTPSERVER_DETECTED=y
) else (
	echo http-server could not be found.
	echo:
	set NEEDTHEDEPENDERS=y
)
:httpserver_checked

:: HTTPS cert
if !VERBOSEWRAPPER!==y ( echo Checking for HTTPS certificate... )
certutil -store -enterprise root | findstr "WOCRTV3" >nul
if !errorlevel! == 0 (
	echo HTTPS cert installed.
	echo:
	set HTTPSCERT_DETECTED=y
) else (
	:: backup check in case non-admin method used
	if exist "utilities\checks\httpscert.txt" (
		echo HTTPS cert probably installed.
		echo:
		set HTTPSCERT_DETECTED=y
	) else (
		echo HTTPS cert could not be found.
		echo:
		set NEEDTHEDEPENDERS=y
	)
)
popd

:: Assumes nothing is installed during a dry run
if !DRYRUN!==y (
	echo Let's just ignore anything we just saw above.
	echo Nothing was found. Nothing exists. It's all fake.
	set NEEDTHEDEPENDERS=y
	set ADMINREQUIRED=y
	set FLASH_DETECTED=n
	set FLASH_CHROMIUM_DETECTED=n
	set FLASH_FIREFOX_DETECTED=n
	set NODEJS_DETECTED=n
	set HTTPSERVER_DETECTED=n
	set HTTPSCERT_DETECTED=n
	set BROWSER_TYPE=n
)

::::::::::::::::::::::::
:: Dependency Install ::
::::::::::::::::::::::::

if !NEEDTHEDEPENDERS!==y (
	if !SKIPDEPENDINSTALL!==n (
		echo:
		echo Installing missing dependencies...
		echo:
	) else (
	echo Skipping dependency install.
	goto skip_dependency_install
	)
) else (
	echo All dependencies are available.
	echo Turning off checking dependencies...
	echo:
	:: Initialize vars
	set CFG=utilities\config.bat
	set TMPCFG=utilities\tempconfig.bat
	:: Loop through every line until one to edit
	if exist !tmpcfg! del !tmpcfg!
	set /a count=1
	for /f "tokens=1,* delims=0123456789" %%a in ('find /n /v "" ^< !cfg!') do (
		set "line=%%b"
		>>!tmpcfg! echo(!line:~1!
		set /a count+=1
		if !count! GEQ 14 goto linereached
	)
	:linereached
	:: Overwrite the original setting
	echo set SKIPCHECKDEPENDS=y>> !tmpcfg!
	echo:>> !tmpcfg!
	:: Print the last of the config to our temp file
	more +15 !cfg!>> !tmpcfg!
	:: Make our temp file the normal file
	copy /y !tmpcfg! !cfg! >nul
	del !tmpcfg!
	:: Set in this script
	set SKIPCHECKDEPENDS=y
	goto skip_dependency_install
)

title Wrapper: Offline v!WRAPPER_VER! ^(build !WRAPPER_BLD!^) [Installing dependencies...]

:: Preload variables
set INSTALL_FLAGS=ALLUSERS=1 /norestart
set SAFE_MODE=n
if /i "!SAFEBOOT_OPTION!"=="MINIMAL" set SAFE_MODE=y
if /i "!SAFEBOOT_OPTION!"=="NETWORK" set SAFE_MODE=y
set CPU_ARCHITECTURE=what
if /i "!processor_architecture!"=="x86" set CPU_ARCHITECTURE=32
if /i "!processor_architecture!"=="AMD64" set CPU_ARCHITECTURE=64
if /i "!PROCESSOR_ARCHITEW6432!"=="AMD64" set CPU_ARCHITECTURE=64

:: Check for admin if installing Flash or Node.js
:: Skipped in Safe Mode, just in case anyone is running Wrapper in safe mode... for some reason
:: and also because that was just there in the code i used for this and i was like "eh screw it why remove it"
if !ADMINREQUIRED!==y (
	if !VERBOSEWRAPPER!==y ( echo Checking for Administrator rights... && echo:)
	if /i not "!SAFE_MODE!"=="y" (
		fsutil dirty query !systemdrive! >NUL 2>&1
		if /i not !ERRORLEVEL!==0 (
			color cf
			if !VERBOSEWRAPPER!==n ( cls )
			echo:
			echo ERROR
			echo:
			if !FLASH_DETECTED!==n (
				if !NODEJS_DETECTED!==n (
					echo Wrapper: Offline needs to install Flash and Node.js.
				) else (
					echo Wrapper: Offline needs to install Flash.
				)
			) else (
				echo Wrapper: Offline needs to install Node.js.
			)
			echo To do this, it must be started with Admin rights.
			echo:
			echo Close this window and re-open Wrapper: Offline as an Admin.
			echo ^(right-click start_wrapper.bat and click "Run as Administrator"^)
			echo:
			if !DRYRUN!==y (
				echo ...yep, dry run is going great so far, let's skip the exit
				pause
				goto postadmincheck
			)
			pause
			exit
		)
	)
	if !VERBOSEWRAPPER!==y ( echo Admin rights detected. && echo:)
)
:postadmincheck

:: Flash Player
if !FLASH_DETECTED!==n (
	:start_flash_install
	echo Installing Flash Player...
	echo:
	if !BROWSER_TYPE!==n (
		:: Ask what type of browser is being used.
		echo What web browser do you use? If it isn't here,
		echo look up whether it's based on Chromium or Firefox.
		echo If it's not based on either, then
		echo Wrapper: Offline will not be able to install Flash.
		echo Unless you know what you're doing and have a
		echo version of Flash made for your browser, please
		echo install a Chrome or Firefox based browser.
		echo:
		echo Enter 1 for Chrome
		echo Enter 2 for Firefox
		echo Enter 3 for Edge
		echo Enter 4 for Opera
		echo Enter 5 for Brave
		echo Enter 6 for Chrome-based browser
		echo Enter 7 for Firefox-based browser
		echo Enter 0 for a non-standard browser ^(skips install^)
		:browser_ask
		set /p FLASHCHOICE=Response:
		echo:
		if "!flashchoice!"=="1" goto chromium_chosen
		if "!flashchoice!"=="2" goto firefox_chosen
		if "!flashchoice!"=="3" goto chromium_chosen
		if "!flashchoice!"=="4" goto chromium_chosen
		if "!flashchoice!"=="5" goto chromium_chosen
		if "!flashchoice!"=="6" goto chromium_chosen
		if "!flashchoice!"=="7" goto firefox_chosen
		if "!flashchoice!"=="0" echo Flash will not be installed.&& goto after_flash_install
		echo You must pick a browser.&& goto browser_ask

		:chromium_chosen
		set BROWSER_TYPE=chrome && if !VERBOSEWRAPPER!==y ( echo Chromium-based browser picked. && echo:) && goto escape_browser_ask

		:firefox_chosen
		set BROWSER_TYPE=firefox && if !VERBOSEWRAPPER!==y ( echo Firefox-based browser picked. ) && goto escape_browser_ask
	)

	:escape_browser_ask
	echo To install Flash Player, Wrapper: Offline must kill any currently running web browsers.
	echo Please make sure any work in your browser is saved before proceeding.
	echo Wrapper: Offline will not continue installation until you press a key.
	echo:
	pause
	echo:

	:: Summon the Browser Slayer
	if !DRYRUN!==y (
		echo The users brought down the batch script upon the Browser Slayer, and in his defeat entombed him in the unactivated code.
		goto lurebrowserslayer
	)
	echo Rip and tear, until it is done.
	for %%i in (firefox,palemoon,iexplore,microsoftedge,chrome,chrome64,opera,brave) do (
		if !VERBOSEWRAPPER!==y (
			 taskkill /f /im %%i.exe /t
			 wmic process where name="%%i.exe" call terminate
		) else (
			 taskkill /f /im %%i.exe /t >nul
			 wmic process where name="%%i.exe" call terminate >nul
		)
	)
	:lurebrowserslayer
	echo:

	if !BROWSER_TYPE!==chrome (
		echo Starting Flash for Chrome installer...
		if not exist "utilities\installers\flash_windows_chromium.msi" (
			echo ...erm. Bit of an issue there actually. The installer doesn't exist.
			echo A normal copy of Wrapper: Offline should come with one.
			echo You may be able to find a copy on this website:
			echo https://helpx.adobe.com/flash-player/kb/archived-flash-player-versions.html
			echo Although Flash is needed, Offline will continue launching.
			pause
		)
		if !DRYRUN!==n ( msiexec /i "utilities\installers\flash_windows_chromium.msi" !INSTALL_FLAGS! /quiet )
	)
	if !BROWSER_TYPE!==firefox (
		echo Starting Flash for Firefox installer...
		if not exist "utilities\installers\flash_windows_firefox.msi" (
			echo ...erm. Bit of an issue there actually. The installer doesn't exist.
			echo A normal copy of Wrapper: Offline should come with one.
			echo You may be able to find a copy on this website:
			echo https://helpx.adobe.com/flash-player/kb/archived-flash-player-versions.html
			echo Although Flash is needed, Offline will try to install anything else it can.
			pause
			goto after_flash_install
		)
		if !DRYRUN!==n ( msiexec /i "utilities\installers\flash_windows_firefox.msi" !INSTALL_FLAGS! /quiet )
	)

	echo Flash has been installed.
	echo:
)
:after_flash_install

:: Node.js
if !NODEJS_DETECTED!==n (
	echo Installing Node.js...
	echo:
	:: Install Node.js
	if !CPU_ARCHITECTURE!==64 (
		if !VERBOSEWRAPPER!==y ( echo 64-bit system detected, installing 64-bit Node.js. )
		if not exist "utilities\installers\node_windows_x64.msi" (
			echo We have a problem. The 64-bit Node.js installer doesn't exist.
			echo A normal copy of Wrapper: Offline should come with one.
			echo You should be able to find a copy on this website:
			echo https://nodejs.org/en/download/
			echo Although Node.js is needed, Offline will try to install anything else it can.
			pause
			goto after_nodejs_install
		)
		echo Proper Node.js installation doesn't seem possible to do automatically.
		echo You can just keep clicking next until it finishes, and Wrapper: Offline will continue once it closes.
		if !DRYRUN!==n ( msiexec /i "utilities\installers\node_windows_x64.msi" !INSTALL_FLAGS! )
		goto nodejs_installed
	)
	if !CPU_ARCHITECTURE!==32 (
		if !VERBOSEWRAPPER!==y ( echo 32-bit system detected, installing 32-bit Node.js. )
		if not exist "utilities\installers\node_windows_x32.msi" (
			echo We have a problem. The 32-bit Node.js installer doesn't exist.
			echo A normal copy of Wrapper: Offline should come with one.
			echo You should be able to find a copy on this website:
			echo https://nodejs.org/en/download/
			echo Although Node.js is needed, Offline will try to install anything else it can.
			pause
			goto after_nodejs_install
		)
		echo Proper Node.js installation doesn't seem possible to do automatically.
		echo You can just keep clicking next until it finishes, and Wrapper: Offline will continue once it closes.
		if !DRYRUN!==n ( msiexec /i "utilities\installers\node_windows_x32.msi" !INSTALL_FLAGS! )
		goto nodejs_installed
	)
	if !CPU_ARCHITECTURE!==what (
		echo:
		echo Well, this is a little embarassing.
		echo Wrapper: Offline can't tell if you're on a 32-bit or 64-bit system.
		echo Which means it doesn't know which version of Node.js to install...
		echo:
		echo If you have no idea what that means, press 1 to just try anyway.
		echo If you're in the future with newer architectures or something
		echo and you know what you're doing, then press 3 to keep going.
		echo:
		:architecture_ask
		set /p CPUCHOICE= Response:
		echo:
		if "!cpuchoice!"=="1" if !DRYRUN!==n ( msiexec /i "utilities\installers\node_windows_x32.msi" !INSTALL_FLAGS! ) && if !VERBOSEWRAPPER!==y ( echo Attempting 32-bit Node.js installation. ) && goto nodejs_installed
		if "!cpuchoice!"=="3" echo Node.js will not be installed. && goto after_nodejs_install
		echo You must pick one or the other.&& goto architecture_ask
	)
	:nodejs_installed
	echo Node.js has been installed.
	set NODEJS_DETECTED=y
	echo:
	goto install_cert
)
:after_nodejs_install

:: http-server
if !HTTPSERVER_DETECTED!==n (
	if !NODEJS_DETECTED!==y (
		echo Installing http-server...
		echo:

		:: Skip in dry run, not much use to run it
		if !DRYRUN!==y (
			echo ...actually, nah, let's skip this part.
			goto httpserverinstalled
		) 

		:: Attempt to install through NPM normally
		call npm install http-server -g

		:: Double check for installation
		echo Checking for http-server installation again...
		npm list -g | find "http-server" > nul
		if !errorlevel! == 0 (
			goto httpserverinstalled
		) else (
			echo:
			echo Online installation attempt failed. Trying again from local files...
			echo:
			if not exist "utilities\installers\http-server-master" (
				echo Well, we'd try that if the files existed.
				echo A normal copy of Wrapper: Offline should come with them.
				echo You should be able to find a copy on this website:
				echo https://www.npmjs.com/package/http-server
				echo Although http-server is needed, Offline will try to install anything else it can.
				pause
				goto after_nodejs_install
			)
			call npm install utilities\installers\http-server-master -g
			goto triplecheckhttpserver
		)

		:: Triple check for installation
		echo Checking for http-server installation AGAIN...
		:triplecheckhttpserver
		npm list -g | find "http-server" > nul
		if !errorlevel! == 0 (
			goto httpserverinstalled
		) else (
			echo:
			echo Local file installation failed. Something's not right.
			echo Unless this was intentional, ask for support or install http-server manually.
			echo Enter "npm install http-server -g" into a command prompt.
			echo:
			pause
			exit
		)
	) else (
		color cf
		echo:
		echo http-server is missing, but somehow Node.js has not been installed yet.
		echo Seems either the install failed, or Wrapper: Offline managed to skip it.
		echo If installing directly from nodejs.org does not work, something is horribly wrong.
		echo Please ask for help in the #support channel on Discord, or email me.
		pause
		exit
	)
	:httpserverinstalled
	echo http-server has been installed.
	echo:
	goto install_cert
)

:: Install HTTPS certificate
:install_cert
if !HTTPSCERT_DETECTED!==n (
	echo Installing HTTPS certificate...
	echo:
	if not exist "server\the.crt" (
		echo ...except it doesn't exist for some reason.
		echo Wrapper: Offline requires this to run.
		echo You should get a "the.crt" file from someone else, or redownload Wrapper: Offline.
		echo Offline has nothing left to do since it can't launch without the.crt, so it will close.
		pause
		exit
	)
	:: Check for admin
	if /i not "!SAFE_MODE!"=="y" (
		fsutil dirty query !systemdrive! >NUL 2>&1
		if /i not !ERRORLEVEL!==0 (
			if !VERBOSEWRAPPER!==n ( cls )
			echo For Wrapper: Offline to work, it needs an HTTPS certificate to be installed.
			echo If you have administrator privileges, you should reopen start_wrapper.bat as Admin.
			echo ^(do this by right-clicking start_wrapper.bat and click "Run as Administrator"^)
			echo:
			echo If you can't do that, there's another method, but it's less reliable and is done per-browser.
			echo: 
			echo Press Y if you have admin access, and press N if you don't.
			:certaskretry
			set /p CERTCHOICE= Response:
			echo:
			if not '!certchoice!'=='' set certchoice=%certchoice:~0,1%
			if /i "!certchoice!"=="y" echo This window will now close so you can restart it with admin. & pause & exit
			if /i "!certchoice!"=="n" goto certnonadmin
			echo You must answer Yes or No. && goto certaskretry

			:: Non-admin cert install
			pushd utilities
			start SilentCMD open_http-server.bat
			popd
			echo: 
			echo A web browser window will open.
			echo When you see a security notice, go past it.
			echo This is completely harmless in a local setting like this.
			echo If you see a message like this on the real internet, you should stay away.
			:: Pause to allow startup
			PING -n 8 127.0.0.1>nul
			if !INCLUDEDCHROMIUM!==n (
				if !CUSTOMBROWSER!==n (
					start https://localhost:4664/certbypass.html
				) else (
					start !CUSTOMBROWSER! https://localhost:4664/certbypass.html >nul
				)
			) else (
				pushd utilities\ungoogled-chromium
				start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile https://localhost:4664/certbypass.html >nul
				popd
			)
			pause
			echo:
			echo If you intend on using another browser, you'll have to do this again by going to the server page and passing the security message.
			echo You've used a non-admin method of installing the HTTPS certificate. To redo the process, delete this file. > utilities\checks\httpscert.txt
			goto after_cert_install
		)
	)
	pushd server
	if !VERBOSEWRAPPER!==y (
		if !DRYRUN!==n ( certutil -addstore -f -enterprise -user root the.crt )
	) else (
		if !DRYRUN!==n ( certutil -addstore -f -enterprise -user root the.crt >nul )
	)
	set ADMINREQUIRED=y
	popd
)
:after_cert_install

:: Alert user to restart Wrapper without running as Admin
if !ADMINREQUIRED!==y (
	color 20
	if !VERBOSEWRAPPER!==n ( cls )
	echo:
	echo Dependencies needing Admin now installed^^!
	echo:
	echo Wrapper: Offline no longer needs Admin rights,
	echo please restart normally by double-clicking.
	echo:
	echo If you saw this from running normally,
	echo Wrapper: Offline should continue normally after a restart.
	echo:
	if !DRYRUN!==y (
		echo ...you enjoying the dry run experience? Skipping closing.
		pause
		color 0f
		goto skip_dependency_install
	)
	pause
	exit
)
color 0f
echo All dependencies now installed^^! Continuing with Wrapper: Offline boot.
echo:

:skip_dependency_install

::::::::::::::::::::::
:: Starting Wrapper ::
::::::::::::::::::::::

title Wrapper: Offline v!WRAPPER_VER! ^(build !WRAPPER_BLD!^) [Loading...]

:: Close existing node apps
:: Hopefully fixes EADDRINUSE errors??
if !VERBOSEWRAPPER!==y (
	if !CEPSTRAL!==n (
		echo Closing any existing node and/or PHP apps...
		if !DRYRUN!==n ( TASKKILL /IM node.exe /F )
		if !DRYRUN!==n ( TASKKILL /IM php.exe /F )
		echo:
	) else (
		echo Closing any existing node apps...
		if !DRYRUN!==n ( TASKKILL /IM node.exe /F )
	)
) else (
	if !CEPSTRAL!==n (
		if !DRYRUN!==n ( TASKKILL /IM node.exe /F 2>nul )
		if !DRYRUN!==n ( TASKKILL /IM php.exe /F 2>nul )
	) else (
		if !DRYRUN!==n ( TASKKILL /IM node.exe /F 2>nul )
	)
)

:: Start Node.js, http-server and PHP for VFProxy
if !CEPSTRAL!==n (
	echo Loading Node.js, http-server and PHP ^(for VFProxy only^)...
) else (
	echo Loading Node.js and http-server...
)
pushd utilities
if !VERBOSEWRAPPER!==y (
	if !DRYRUN!==n ( start /MIN open_http-server.bat )
	if !DRYRUN!==n ( start /MIN open_nodejs.bat )
	if !DRYRUN!==n ( 
		if !CEPSTRAL!==n ( 
			start /MIN open_vfproxy_php.bat
		)
	)
) else (
	if !DRYRUN!==n ( start SilentCMD open_http-server.bat )
	if !DRYRUN!==n ( start SilentCMD open_nodejs.bat )
	if !DRYRUN!==n ( 
		if !CEPSTRAL!==n (
			start SilentCMD open_vfproxy_php.bat
		)
	)
)
popd

:: Pause to allow startup
:: Prevents the video list opening too fast
PING -n 6 127.0.0.1>nul

:: Open Wrapper in preferred browser
if !INCLUDEDCHROMIUM!==n (
	if !CUSTOMBROWSER!==n (
		echo Opening Wrapper: Offline in your default browser...
		if !DRYRUN!==n ( start http://localhost:4343 )
	) else (
		echo Opening Wrapper: Offline in your set browser...
		echo If this does not work, you may have set the path wrong.
		if !DRYRUN!==n ( start !CUSTOMBROWSER! http://localhost:4343 )
	)
) else (
	echo Opening Wrapper: Offline using included Chromium...
	pushd utilities\ungoogled-chromium
	if !APPCHROMIUM!==y (
		if !DRYRUN!==n ( start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile --app=http://localhost:4343 )
	) else (
		if !DRYRUN!==n ( start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile http://localhost:4343 )
	)
	popd
)

echo Wrapper: Offline has been started^^! The video list should now be open.

::::::::::::::::
:: Post-Start ::
::::::::::::::::

title Wrapper: Offline v!WRAPPER_VER! ^(build !WRAPPER_BLD!^)
if !VERBOSEWRAPPER!==y ( goto wrapperstarted )
:wrapperstartedcls
cls
:wrapperstarted

echo:
echo Wrapper: Offline v!WRAPPER_VER! ^(build !WRAPPER_BLD!^) running
echo A project from VisualPlugin adapted by Benson and the Wrapper: Offline Team
echo:
if !VERBOSEWRAPPER!==n ( echo DON'T CLOSE THIS WINDOW^^! Use the quit option ^(0^) when you're done. )
if !VERBOSEWRAPPER!==y ( echo Verbose mode is on, see the two extra CMD windows for extra output. )
if !DRYRUN!==y ( echo Don't forget, nothing actually happened, this was a dry run. )
if !JUSTIMPORTED!==y ( echo Note: You'll need to reload the editor for your file to appear. )
:: Hello, code wanderer. Enjoy seeing all the secret options easily instead of finding them yourself.
echo:
echo Enter 1 to reopen the video list
echo Enter 2 to import a file
echo Enter 3 to open the server page
echo Enter ? to open the FAQ
echo Enter clr to clean up the screen
echo Enter 0 to close Wrapper: Offline
set /a _rand=(!RANDOM!*67/32768)+1
if !_rand!==25 echo Enter things you think'll show a secret if you're feeling adventurous
:wrapperidle
echo:
set /p CHOICE=Choice:
if "!choice!"=="0" goto exitwrapperconfirm
set FUCKOFF=n
if "!choice!"=="1" goto reopen_webpage
if "!choice!"=="2" goto start_importer
if "!choice!"=="3" goto open_server
if "!choice!"=="?" goto open_faq
if /i "!choice!"=="clr" goto wrapperstartedcls
if /i "!choice!"=="cls" goto wrapperstartedcls
if /i "!choice!"=="clear" goto wrapperstartedcls
:: funni options
if "!choice!"=="43" echo OH MY GOD. FOURTY THREE CHARS. NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO & goto wrapperidle
if /i "!choice!"=="benson" echo watch benson on youtube & goto wrapperidle
if /i "!choice!"=="ford" echo what up son & goto wrapperidle
if /i "!choice!"=="no" echo stahp & goto wrapperidle
if /i "!choice!"=="yes" echo Alright. & goto wrapperidle
if /i "!choice!"=="fuck off" goto youfuckoff
if /i "!choice!"=="fuck you" echo No, fuck you. & goto wrapperidle
if /i "!choice!"=="sex" echo that's fake & goto wrapperidle
if /i "!choice!"=="watch benson on youtube" goto w_a_t_c_h
if /i "!choice!"=="browser slayer" goto slayerstestaments
if /i "!choice!"=="patch" goto patchtime
if /i "!choice!"=="random" goto sayarandom
if /i "!choice!"=="narutofan420" echo i am narutofan420 i am a naruto fan i watch naruto i watched all 3 series and still watch it & goto wrapperidle
if /i "!choice!"=="die" echo die please & goto wrapperidle
if /i "!choice!"=="aaron doan" echo YOU^^!^^!^^! Noo Wrapper Is Patched Forever^^!^^!^^! Cries And Hits You So Many Times & goto wrapperidle
if /i "!choice!"=="spark" echo WHY DID SOMEONE FUCK UP THE LAUNCHER? & goto wrapperidle
:: dev options
if /i "!choice!"=="amnesia" goto wipe_save
if /i "!choice!"=="restart" goto restart
if /i "!choice!"=="folder" goto open_files
echo Time to choose. && goto wrapperidle

:reopen_webpage
if !INCLUDEDCHROMIUM!==n (
	if !CUSTOMBROWSER!==n (
		echo Opening Wrapper: Offline in your default browser...
		start http://localhost:4343
	) else (
		echo Opening Wrapper: Offline in your set browser...
		start !CUSTOMBROWSER! http://localhost:4343 >nul
	)
) else (
	echo Opening Wrapper: Offline using included Chromium...
	pushd utilities\ungoogled-chromium
	if !APPCHROMIUM!==y (
		start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile --app=http://localhost:4343 >nul
	) else (
		start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile http://localhost:4343 >nul
	)
	popd
)
goto wrapperidle

:open_server
if !INCLUDEDCHROMIUM!==n (
	if !CUSTOMBROWSER!==n (
		echo Opening the server page in your default browser...
		start https://localhost:4664
	) else (
		echo Opening the server page in your set browser...
		start !CUSTOMBROWSER! https://localhost:4664 >nul
	)
) else (
	echo Opening the server page using included Chromium...
	pushd utilities\ungoogled-chromium
	if !APPCHROMIUM!==y (
		start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile --app=https://localhost:4664 >nul
	) else (
		start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile https://localhost:4664 >nul
	)
	popd
)
goto wrapperidle

:open_files
pushd ..
echo Opening the wrapper-offline folder...
start explorer.exe wrapper-offline
popd
goto wrapperidle

:start_importer
echo Opening the importer...
call utilities\import.bat
cls
title Wrapper: Offline v!WRAPPER_VER! ^(build !WRAPPER_BLD!^)
set JUSTIMPORTED=y
goto wrapperstartedcls

:youfuckoff
echo You fuck off.
set FUCKOFF=y
goto wrapperidle

:open_faq
echo Opening the FAQ...
start notepad.exe FAQ.txt
goto wrapperidle

:wipe_save
call utilities\reset_install.bat
if !errorlevel! equ 1 goto wrapperidle
:: flows straight to restart below

:restart
TASKKILL /IM node.exe /F
start "" /wait /B "%~F0" point_insertion
exit

:w_a_t_c_h
echo watch benson on youtube
echo watch benson on youtube
echo watch benson on youtube
echo watch benson on youtube
echo watch benson on youtube
echo wa
goto wrapperidle

:patchtime
echo:
echo would you like to patch whoper online
echo press y or n
:patchtimeretry
set /p PATCHCHOICE= Response:
echo:
if not '!patchchoice!'=='' set patchchoice=%patchchoice:~0,1%
if /i "!patchchoice!"=="y" echo too bad B^) & goto wrapperidle
if /i "!patchchoice!"=="n" echo good & goto wrapperidle
echo yes or no question here && goto patchtimeretry

:sayarandom
:: welcome to "inside jokes with no context" land
set /a _rand=!RANDOM!*15/32767
if !_rand!==0 echo stress level ^>0
if !_rand!==1 echo Something random.
if !_rand!==2 echo oisjdoiajfgmafvdsdg
if !_rand!==3 echo my head is unscrewed & echo what do i need it for
if !_rand!==4 echo when you're eating popcorn you're eating busted nuts
if !_rand!==5 echo chicken chicken chicken chicken chicken chicken chicken chicken chicken chicken chicken chicken 
if !_rand!==6 echo when u nut so hard that ur roblox crashes
if !_rand!==7 echo seven seven seven seven seven seven seven seven seven seven seven seven seven seven seven seven
if !_rand!==8 echo DONT ASK HOW I GOT IT OR YOU WILL BE BANNED FROM MY CHANNEL WITH NO SECOND CHANCES
if !_rand!==9 echo everything you know is wrong & echo black is white up is down and short is long
if !_rand!==10 echo It's a chekcpoint.
if !_rand!==11 echo Another monday... & echo Another mind-numbing, run-of-the-mill monday... & echo ANOTHER MUNDANE, MORIBUND, HUMDRUM MONDAY!
if !_rand!==12 echo try typing "with style" when exiting
if !_rand!==13 echo elmo
if !_rand!==14 echo gnorm gnat says: trans rights are human rights
if !_rand!==15 echo wrapper inline
goto wrapperidle

:slayerstestaments
echo:
echo In the first age,
PING -n 3 127.0.0.1>nul
echo In the first battle,
PING -n 3 127.0.0.1>nul
echo When the shadows first lengthened,
PING -n 4 127.0.0.1>nul
echo One stood.
PING -n 3 127.0.0.1>nul
echo Slowed by the waste of unoptimized websites,
PING -n 4 127.0.0.1>nul
echo His soul harvested by the trackers of Google
PING -n 5 127.0.0.1>nul
echo And exposed beyond anonymity, 
PING -n 4 127.0.0.1>nul
echo He chose the path of perpetual torment.
PING -n 6 127.0.0.1>nul
echo In his ravenous hatred,
PING -n 3 127.0.0.1>nul
echo He found no peace,
PING -n 3 127.0.0.1>nul
echo And with boiling blood,
PING -n 3 127.0.0.1>nul
echo He scoured the search results,
PING -n 4 127.0.0.1>nul
echo Seeking vengeance against the companies who had wronged him.
PING -n 6 127.0.0.1>nul
echo He wore the crown of the Taskkillers,
PING -n 4 127.0.0.1>nul
echo and those that tasted the bite of his sword
PING -n 5 127.0.0.1>nul
echo named him...
PING -n 3 127.0.0.1>nul
echo the Browser Slayer.
PING -n 3 127.0.0.1>nul
:: here comes something that looks awesome normaly but is disgusting when escaped for batch
:: credit to http://www.gamers.org/~fpv/doomlogo.html
echo ^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=     ^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=     ^=^=^=^=^=^=^=^=^=^=^=^=^=^=^=   ^=^=^=^=^=^=^=^=  ^=^=^=^=^=^=^=^=
echo ^\^\ ^. ^. ^. ^. ^. ^. ^.^\^\   //^. ^. ^. ^. ^. ^. ^.^\^\   //^. ^. ^. ^. ^. ^. ^.^\^\  ^\^\^. ^. ^.^\^\// ^. ^. //
echo ^|^|^. ^. ^._____^. ^. ^.^|^| ^|^|^. ^. ^._____^. ^. ^.^|^| ^|^|^. ^. ^._____^. ^. ^.^|^| ^|^| ^. ^. ^.^\/ ^. ^. ^.^|^|
echo ^|^| ^. ^.^|^|   ^|^|^. ^. ^|^| ^|^| ^. ^.^|^|   ^|^|^. ^. ^|^| ^|^| ^. ^.^|^|   ^|^|^. ^. ^|^| ^|^|^. ^. ^. ^. ^. ^. ^. ^|^|
echo ^|^|^. ^. ^|^|   ^|^| ^. ^.^|^| ^|^|^. ^. ^|^|   ^|^| ^. ^.^|^| ^|^|^. ^. ^|^|   ^|^| ^. ^.^|^| ^|^| ^. ^| ^. ^. ^. ^. ^.^|^|
echo ^|^| ^. ^.^|^|   ^|^|^. _-^|^| ^|^|-_ ^.^|^|   ^|^|^. ^. ^|^| ^|^| ^. ^.^|^|   ^|^|^. _-^|^| ^|^|-_^.^|^\ ^. ^. ^. ^. ^|^|
echo ^|^|^. ^. ^|^|   ^|^|-^'  ^|^| ^|^|  ^`-^|^|   ^|^| ^. ^.^|^| ^|^|^. ^. ^|^|   ^|^|-^'  ^|^| ^|^|  ^`^|^\_ ^. ^.^|^. ^.^|^|
echo ^|^| ^. _^|^|   ^|^|    ^|^| ^|^|    ^|^|   ^|^|_ ^. ^|^| ^|^| ^. _^|^|   ^|^|    ^|^| ^|^|   ^|^\ ^`-_/^| ^. ^|^|
echo ^|^|_-^' ^|^|  ^.^|/    ^|^| ^|^|    ^\^|^.  ^|^| ^`-_^|^| ^|^|_-^' ^|^|  ^.^|/    ^|^| ^|^|   ^| ^\  / ^|-_^.^|^|
echo ^|^|    ^|^|_-^'      ^|^| ^|^|      ^`-_^|^|    ^|^| ^|^|    ^|^|_-^'      ^|^| ^|^|   ^| ^\  / ^|  ^`^|^|
echo ^|^|    ^`^'         ^|^| ^|^|         ^`^'    ^|^| ^|^|    ^`^'         ^|^| ^|^|   ^| ^\  / ^|   ^|^|
echo ^|^|            ^.^=^=^=^' ^`^=^=^=^.         ^.^=^=^=^'^.^`^=^=^=^.         ^.^=^=^=^' /^=^=^. ^|  ^\/  ^|   ^|^|
echo ^|^|         ^.^=^=^'   ^\_^|-_ ^`^=^=^=^. ^.^=^=^=^'   _^|_   ^`^=^=^=^. ^.^=^=^=^' _-^|/   ^`^=^=  ^\/  ^|   ^|^|
echo ^|^|      ^.^=^=^'    _-^'    ^`-_  ^`^=^'    _-^'   ^`-_    ^`^=^'  _-^'   ^`-_  /^|  ^\/  ^|   ^|^|
echo ^|^|   ^.^=^=^'    _-^'          ^`-__^\^._-^'         ^`-_^./__-^'         ^`^' ^|^. /^|  ^|   ^|^|
echo ^|^|^.^=^=^'    _-^'                                                     ^`^' ^|  /^=^=^.^|^|
echo ^=^=^'    _-^'                                                            ^\/   ^`^=^=
echo ^\   _-^'                                                                ^`-_   /
echo  ^`^'^'                                                                      ^`^`^'
goto wrapperidle

::::::::::::::
:: Shutdown ::
::::::::::::::

:: Confirmation before shutting down
:exitwrapperconfirm
echo:
echo Are you sure you want to quit Wrapper: Offline?
echo Be sure to save all your work.
echo Type Y to quit, and N to go back.
:exitwrapperretry
set /p EXITCHOICE= Response:
echo:
if /i "!exitchoice!"=="y" goto point_extraction
if /i "!exitchoice!"=="yes" goto point_extraction
if /i "!exitchoice!"=="n" goto wrapperstartedcls
if /i "!exitchoice!"=="no" goto wrapperstartedcls
if /i "!exitchoice!"=="with style" goto exitwithstyle
echo You must answer Yes or No. && goto exitwrapperretry

:point_extraction

title Wrapper: Offline v!WRAPPER_VER! ^(build !WRAPPER_BLD!^) [Shutting down...]

:: Shut down Node.js, PHP and http-server
if !VERBOSEWRAPPER!==y (
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F )
	if !DRYRUN!==n ( TASKKILL /IM php.exe /F )
	echo:
) else (
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F 2>nul )
	if !DRYRUN!==n ( TASKKILL /IM php.exe /F 2>nul )
)

:: This is where I get off.
echo Wrapper: Offline has been shut down.
if !FUCKOFF!==y ( echo You're a good listener. )
echo This window will now close.
if !INCLUDEDCHROMIUM!==y (
	echo You can close the web browser now.
)
echo Open start_wrapper.bat again to start W:O again.
if !DRYRUN!==y ( echo Go wet your run next time. ) 
pause & exit

:exitwithstyle
title Wrapper: Offline v!WRAPPER_VER! ^(build !WRAPPER_BLD!^) [Shutting down... WITH STYLE]
echo SHUTTING DOWN THE WRAPPER OFFLINE
PING -n 3 127.0.0.1>nul
color 9b
echo BEWEWEWEWWW PSSHHHH KSHHHHHHHHHHHHHH
PING -n 3 127.0.0.1>nul
TASKKILL /IM node.exe /F
echo NODE DOT JS ANNIHILATED
PING -n 3 127.0.0.1>nul
TASKKILL /IM php.exe /F
echo PHP DESTROYED
PING -n 3 127.0.0.1>nul
echo TIME TO ELIMINATE WRAPPER OFFLINE
PING -n 3 127.0.0.1>nul
echo BOBOOBOBMWBOMBOM SOUND EFFECTSSSSS
PING -n 3 127.0.0.1>nul
echo WRAPPER OFFLINE ALSO ANNIHILA
PING -n 2 127.0.0.1>nul
exit

:patched
title candypaper nointernet PATCHED edition
color 43
echo OH MY GODDDDD
PING -n 3 127.0.0.1>nul
echo SWEETSSHEET LACKOFINTERNS PATCHED DETECTED^^!^^!^^!^^!^^!^^!^^!^^!^^!^^!^^!^^!
PING -n 3 127.0.0.1>nul
echo can never be use again...
PING -n 4 127.0.0.1>nul
echo whoever put patch.jpeg back, you are grounded grounded gorrudjnmed for 6000
PING -n 3 127.0.0.1>nul
:grr
echo g r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r 
goto grr

:configcopy
if not exist utilities ( md utilities )
echo :: Wrapper: Offline Config>> utilities\config.bat
echo :: This file is modified by settings.bat. It is not organized, but comments for each setting have been added.>> utilities\config.bat
echo :: You should be using settings.bat, and not touching this. Offline relies on this file remaining consistent, and it's easy to mess that up.>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Opens this file in Notepad when run>> utilities\config.bat
echo setlocal>> utilities\config.bat
echo if "%%SUBSCRIPT%%"=="" ( pushd "%~dp0" ^& start notepad.exe config.bat ^& exit )>> utilities\config.bat
echo endlocal>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Shows exactly Offline is doing, and never clears the screen. Useful for development and troubleshooting. Default: n>> utilities\config.bat
echo set VERBOSEWRAPPER=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Won't check for dependencies (flash, node, etc) and goes straight to launching. Useful for speedy launching post-install. Default: n>> utilities\config.bat
echo set SKIPCHECKDEPENDS=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Won't install dependencies, regardless of check results. Overridden by SKIPCHECKDEPENDS. Mostly useless, why did I add this again? Default: n>> utilities\config.bat
echo set SKIPDEPENDINSTALL=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Opens Offline in an included copy of ungoogled-chromium. Allows continued use of Flash as modern browsers disable it. Default: y>> utilities\config.bat
echo set INCLUDEDCHROMIUM=y>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Opens INCLUDEDCHROMIUM in headless mode. Looks pretty nice. Overrides CUSTOMBROWSER and BROWSER_TYPE. Default: y>> utilities\config.bat
echo set APPCHROMIUM=y>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Opens Offline in a browser of the user's choice. Needs to be a path to a browser executable in quotes. Default: n>> utilities\config.bat
echo set CUSTOMBROWSER=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Lets the launcher know what browser framework is being used. Mostly used by the Flash installer. Accepts "chrome", "firefox", and "n". Default: n>> utilities\config.bat
echo set BROWSER_TYPE=chrome>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Runs through all of the scripts code, while never launching or installing anything. Useful for development. Default: n>> utilities\config.bat
echo set DRYRUN=n>> utilities\config.bat
echo:>> utilities\config.bat
goto returnfromconfigcopy
