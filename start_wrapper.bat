:: Wrapper: Offline Launcher
:: Author: benson#0411
:: Project Runner: GoTest334#9880
:: License: MIT
set WRAPPER_VER=1.3.0
title Wrapper: Offline v%WRAPPER_VER% [Initializing...]

::::::::::::::::::::
:: Initialization ::
::::::::::::::::::::

:: Stop commands from spamming stuff, cleans up the screen
@echo off && cls

:: check for updates

pushd "%~dp0"
if !AUTOUPDATE!==y ( 
	pushd "%~dp0"
	if exist .git (
		echo Updating...
		call utilities\PortableGit\bin\git.exe checkout main
		call utilities\PortableGit\bin\git.exe fetch --all
		call utilities\PortableGit\bin\git.exe reset --hard origin/main
		PING -n 3 127.0.0.1>nul
		cls
	) else (
		echo Git not found. Skipping update.
		PING -n 3 127.0.0.1>nul
		cls
	)
) else (
	echo Auto-updating is off. Skipping update.
	PING -n 3 127.0.0.1>nul
	cls
)

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

:: Welcome, Director Ford!
echo Wrapper: Offline
echo A project from VisualPlugin adapted by GoTest334 and the Wrapper: Offline team
echo Version !WRAPPER_VER!
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
:: Starting Wrapper ::
::::::::::::::::::::::

title Wrapper: Offline v!WRAPPER_VER! [Loading...]

:: Close existing node apps
:: Hopefully fixes EADDRINUSE errors??
if !VERBOSEWRAPPER!==y (
	echo Closing any existing node apps...
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F )
	echo:
) else (
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F 2>nul )
)

:: Start Node.js and http-server
echo Loading Node.js and http-server...
pushd utilities
if !VERBOSEWRAPPER!==y (
	if !DRYRUN!==n (
		start /MIN open_http-server.bat
		start /MIN open_nodejs.bat
	)
) else (
	if !DRYRUN!==n (
		start SilentCMD open_http-server.bat
		start SilentCMD open_nodejs.bat
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

title Wrapper: Offline v!WRAPPER_VER!
if !VERBOSEWRAPPER!==y ( goto wrapperstarted )
:wrapperstartedcls
cls
:wrapperstarted

echo:
echo Wrapper: Offline v!WRAPPER_VER! running
echo A project from VisualPlugin adapted by GoTest334 and the Wrapper: Offline team
echo:
if !VERBOSEWRAPPER!==n ( echo DON'T CLOSE THIS WINDOW^^! Use the quit option ^(0^) when you're done. )
if !VERBOSEWRAPPER!==y ( echo Verbose mode is on, see the two extra CMD windows for extra output. )
if !DRYRUN!==y ( echo Don't forget, nothing actually happened, this was a dry run. )
if !JUSTIMPORTED!==y ( echo Note: You'll need to reload the editor for your file to appear. )
:: Hello, code wanderer. Enjoy seeing all the secret options easily instead of finding them yourself.
echo:
echo Enter 1 to reopen the video list
echo Enter 2 to open the server page
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
if "!choice!"=="2" goto open_server
if "!choice!"=="?" goto open_faq
if /i "!choice!"=="clr" goto wrapperstartedcls
if /i "!choice!"=="cls" goto wrapperstartedcls
if /i "!choice!"=="clear" goto wrapperstartedcls
:: funni options
if "!choice!"=="43" echo OH MY GOD. FOURTY THREE CHARS. NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO & goto wrapperidle
if /i "!choice!"=="benson" echo Child Groom & goto wrapperidle
if /i "!choice!"=="ford" echo what up son & goto wrapperidle
if /i "!choice!"=="no" echo stahp & goto wrapperidle
if /i "!choice!"=="yes" echo Alright. & goto wrapperidle
if /i "!choice!"=="fuck off" goto youfuckoff
if /i "!choice!"=="fuck you" echo No, fuck you. & goto wrapperidle
if /i "!choice!"=="sex" echo that's fake & goto wrapperidle
if /i "!choice!"=="browser slayer" goto slayerstestaments
if /i "!choice!"=="patch" goto patchtime
if /i "!choice!"=="random" goto sayarandom
if /i "!choice!"=="die" echo die please & goto wrapperidle
if /i "!choice!"=="aaron doan" echo YOU^^!^^!^^! Noo Wrapper Is Patched Forever^^!^^!^^! Cries And Hits You So Many Times & goto wrapperidle
if /i "!choice!"=="spark" echo WHY DID SOMEONE FUCK UP THE LAUNCHER? & goto wrapperidle
if /i "!choice!"=="xom" echo I break wrapper and i dont fix it HAHAHAHAHHA
if /i "!choice!"=="GoTest334" ehco Attention nightshift personnel. Please report to your assigned post.
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

:youfuckoff
echo You fuck off.
set FUCKOFF=y
goto wrapperidle

:open_faq
echo Opening the FAQ...
start notepad.exe FAQ.md
goto wrapperidle

:wipe_save
call utilities\reset_install.bat
if !errorlevel! equ 1 goto wrapperidle
:: flows straight to restart below

:restart
TASKKILL /IM node.exe /F
start "" /wait /B "%~F0" point_insertion
exit

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
set /a _rand=!RANDOM!*17/32767
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
if !_rand!==16 echo Ronald McDonald Orgy
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

title Wrapper: Offline v!WRAPPER_VER! [Shutting down...]

:: Shut down Node.js and http-server
if !VERBOSEWRAPPER!==y (
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F )
	echo:
) else (
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F 2>nul )
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
title Wrapper: Offline v!WRAPPER_VER! [Shutting down... WITH STYLE]
echo SHUTTING DOWN THE WRAPPER OFFLINE
PING -n 3 127.0.0.1>nul
color 9b
echo BEWEWEWEWWW PSSHHHH KSHHHHHHHHHHHHHH
PING -n 3 127.0.0.1>nul
TASKKILL /IM node.exe /F
echo NODE DOT JS ANNIHILATED
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
