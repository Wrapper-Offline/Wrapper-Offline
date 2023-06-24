:: GoAniate 2014 Launcher
:: Author: SimplyA_Coder
:: Project Runner: GoTest334#9880
:: License: MIT
set WRAPPER_VER=2.1.0
title GoAnimate 2014 Launcher

::::::::::::::::::::
:: Initialization ::
::::::::::::::::::::

:: Stop commands from spamming stuff, cleans up the screen
@echo off && cls

:: Welcome, Director Ford!
echo GoAnimate 2014
echo A Legacy Video Maker with the old GoAnimate from 2014, built on Flash Player and NodeJS.
echo:


::::::::::::::::::::::
:: Starting Wrapper ::
::::::::::::::::::::::

title GoAnimate 2014 [Loading...]

:: Close existing node apps
:: Hopefully fixes EADDRINUSE errors??
if !VERBOSEWRAPPER!==y (
	echo Closing any existing node apps...
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F )
	echo:
) else (
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F 2>nul )
)

:: Start Node.js
echo Loading Node.js...
pushd utilities
if !VERBOSEWRAPPER!==y (
	if !DRYRUN!==n (
		start /MIN open_nodejs.bat
	)
) else (
	if !DRYRUN!==n (
		start SilentCMD open_nodejs.bat
	)
)
popd

:: Pause to allow startup
:: Prevents the video list opening too fast
PING -n 6 127.0.0.1>nul

:: Open GoAnimate in preferred browser
if !INCLUDEDCHROMIUM!==n (
	if !CUSTOMBROWSER!==n (
		echo Opening GoAnimate 2014 in your default browser...
		if !DRYRUN!==n ( start http://localhost:4343 )
	) else (
		echo Opening GoAnimate 2014 in your set browser...
		echo If this does not work, you may have set the path wrong.
		if !DRYRUN!==n ( start !CUSTOMBROWSER! http://localhost:4343 )
	)
) else (
	echo Opening GoAnimate 2014 using included Chromium...
	pushd utilities\ungoogled-chromium
	if !APPCHROMIUM!==y (
		if !DRYRUN!==n ( start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile --app=http://localhost:4343 )
	) else (
		if !DRYRUN!==n ( start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile http://localhost:4343 )
	)
	popd
)

echo GoAnimate 2014 has been started! Your dashboard should now be open.

::::::::::::::::
:: Post-Start ::
::::::::::::::::

title GoAnimate 2014 v!WRAPPER_VER!
if !VERBOSEWRAPPER!==y ( goto wrapperstarted )
:wrapperstartedcls
cls
:wrapperstarted

echo:
echo GoAnimate 2014
echo A Legacy Video Maker with the old GoAnimate from 2014, built on Flash Player and Adobe.
echo:
if !VERBOSEWRAPPER!==n ( echo DON'T CLOSE THIS WINDOW^^! Use the quit option ^(0^) when you're done. )
if !VERBOSEWRAPPER!==y ( echo Verbose mode is on, see the two extra CMD windows for extra output. )
if !DRYRUN!==y ( echo Don't forget, nothing actually happened, this was a dry run. )
if !JUSTIMPORTED!==y ( echo Note: You'll need to reload the editor for your file to appear. )
:: Hello, code wanderer. Enjoy seeing all the secret options easily instead of finding them yourself.
echo:
echo Enter 1 to reopen the video list
echo Enter clr to clean up the screen
echo Enter 0 to close GoAnimate 2014
set /a _rand=(!RANDOM!*67/32768)+1
:wrapperidle
echo:
set /p CHOICE=Choice:
if "!choice!"=="0" goto exitwrapperconfirm
set FUCKOFF=n
if "!choice!"=="1" goto reopen_webpage
if /i "!choice!"=="clr" goto wrapperstartedcls
if /i "!choice!"=="cls" goto wrapperstartedcls
if /i "!choice!"=="clear" goto wrapperstartedcls
:: funni options
if "!choice!"=="43" echo oh me goodness. there is the opening of the 43 chars. & goto wrapperidle
if /i "!choice!"=="how do me make video? that's it?" echo 43 chars bart sampson notsmirks uolliac caillou lol its so funny how do i do it? & goto wrapperidle
if /i "!choice!"=="hello. me name is keyyew." echo 43 FRICKING CHARS! & goto wrapperidle
if /i "!choice!"=="OH MY GOD NOW THAT IS SOME SCARY GAMERS RIGHT THERE" echo MOM I RATE THE GAME 8 OUT OF 8 BECAUSE IT WAS SO GREAT AND I HATE YOUR ONION GO AWAY & goto wrapperidle
if /i "!choice!"=="notsmirks" echo this person is very important to goanimate for his special videos without context.. & goto wrapperidle
if /i "!choice!"=="notsmirkles" echo GOCITY HAS THE NOTSMIRKLES VIRUS AGAIN NOUUUUUUUUUUUUUUUUU & goto wrapperidle
if /i "!choice!"=="this couch is kind of" echo IM SO SORRY JESSIE J & goto wrapperidle
if /i "!choice!"=="JESSIE J I APOLOGIZE ME AM VERY SORRY" echo do not worry me dear, next time won't be goof-d. & goto wrapperidle
if /i "!choice!"=="MOMMY. CAN I MAKE THE HAMBURGER." echo YES BOBBY. MY LOVING DARLING ANGEL SWEET AMAZING CHEERFUL DAUGHTER. NYOOM NYOOM NYOOM NYOOMAAAAAAAAAAAAAAAAAAAA OANNANANANANNA & goto wrapperidle
if /i "!choice!"=="class, i chew food" echo today we are lerning about schcmalrefernotsmunatonoftheunbelievedghostlies & goto wrapperidle
if /i "!choice!"=="that crispity...crunchity peanut buttery flavor of a butterfinger" echo Nobody fingers a butterfinger you disgusting maggot and I hate you! & goto wrapperidle
if /i "!choice!"=="excuse me?" echo OMG OMG HOW DARE YOU DISRESPECT MY ONION YOU OPINION DISRESPECTOR HOLY FEW COOKIE SHFKJNM,ADBHJ GFABDSZIJGKMHNAISJDGKNJISD 204 CHARS SHCHSHCNM,SHC NSMCHSCJSHC NSCNH & goto wrapperidle
if /i "!choice!"=="shut up shut up im trying to sleep" echo OH MY FRICKING GOD, IT'S SO FRICKING DARK OUTSIDE! & goto wrapperidle
if /i "!choice!"=="my lord. what shall i say? what shall i say to make my parents understand my anger?" echo AAAAAAAAAAAAAH! YOU FRICKING FRICKS! I'VE HAD IT! I'VE FRICKING HAD IT! & goto wrapperidle
if /i "!choice!"=="the boys are unstoppable." echo OH? NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO & goto wrapperidle
if /i "!choice!"=="me name's wardrobe cooking and i am attempting the vhs opening" echo m done goto wrapperidle
:: dev options
if /i "!choice!"=="amnesia" goto wipe_save
if /i "!choice!"=="restart" goto restart
if /i "!choice!"=="folder" goto open_files
echo Time to choose. && goto wrapperidle

:reopen_webpage
if !INCLUDEDCHROMIUM!==n (
	if !CUSTOMBROWSER!==n (
		echo Opening GoAnimate 2014 in your default browser...
		start http://localhost:4343
	) else (
		echo Opening GoAnimate 2014 in your set browser...
		start !CUSTOMBROWSER! http://localhost:4343 >nul
	)
) else (
	echo Opening GoAnimate 2014 using included Chromium...
	pushd utilities\ungoogled-chromium
	if !APPCHROMIUM!==y (
		start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile --app=http://localhost:4343 >nul
	) else (
		start chrome.exe --allow-outdated-plugins --user-data-dir=the_profile http://localhost:4343 >nul
	)
	popd
)
goto wrapperidle

:open_files
pushd ..
echo Opening the goanimate-2014 folder...
start explorer.exe goanimate-2014
popd
goto wrapperidle

:wipe_save
call utilities\reset_install.bat
if !errorlevel! equ 1 goto wrapperidle
:: flows straight to restart below

:restart
TASKKILL /IM node.exe /F
start "" /wait /B "%~F0" point_insertion
exit

::::::::::::::
:: Shutdown ::
::::::::::::::

:: Confirmation before shutting down
:exitwrapperconfirm
echo:
echo Are you sure you want to quit GoAnimate 2014?
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

title GoAnimate 2014 v!WRAPPER_VER! [Shutting down...]

:: Shut down Node.js
if !VERBOSEWRAPPER!==y (
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F )
	echo:
) else (
	if !DRYRUN!==n ( TASKKILL /IM node.exe /F 2>nul )
)

:: This is where I get off.
echo GoAnimate 2014 has been shut down.
if !FUCKOFF!==y ( echo You're a good listener. )
echo This window will now close.
if !INCLUDEDCHROMIUM!==y (
	echo You can close the web browser now.
)
echo Open launch_goanimate.bat again to start GA2014 again.
if !DRYRUN!==y ( echo Go wet your run next time. ) 
pause & exit

:exitwithstyle
title Gonimate 2014 v!WRAPPER_VER! [Shutting down... WITH STYLE]
echo GoAnimate 2014 is shutting down...
PING -n 3 127.0.0.1>nul
echo Please be patient as this will take a while.
PING -n 3 127.0.0.1>nul
TASKKILL /IM node.exe /F
echo Almost complete...
PING -n 3 127.0.0.1>nul
echo Node.js has successfully been shut down.
PING -n 3 127.0.0.1>nul
echo Almost complete...
PING -n 3 127.0.0.1>nul
echo GoAnimate 2014 has shut down.
PING -n 2 127.0.0.1>nul
exit

:configcopy
if not exist utilities ( md utilities )
echo :: GoAnimate 2014 Config>> utilities\config.bat
echo :: This file is modified by settings.bat. It is not organized, but comments for each setting have been added.>> utilities\config.bat
echo :: You should be using settings.bat, and not touching this. GA2014 relies on this file remaining consistent, and it's easy to mess that up.>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Opens this file in Notepad when run>> utilities\config.bat
echo setlocal>> utilities\config.bat
echo if "%%SUBSCRIPT%%"=="" ( pushd "%~dp0" ^& start notepad.exe config.bat ^& exit )>> utilities\config.bat
echo endlocal>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Shows exactly what GoAnimate 2014 is doing, and never clears the screen. Useful for development and troubleshooting. Default: n>> utilities\config.bat
echo set VERBOSEWRAPPER=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Won't check for dependencies (flash, node, etc) and goes straight to launching. Useful for speedy launching post-install. Default: n>> utilities\config.bat
echo set SKIPCHECKDEPENDS=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Won't install dependencies, regardless of check results. Overridden by SKIPCHECKDEPENDS. Mostly useless, why did I add this again? Default: n>> utilities\config.bat
echo set SKIPDEPENDINSTALL=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Opens GoAnimate 2014 in an included copy of ungoogled-chromium. Allows continued use of Flash as modern browsers disable it. Default: y>> utilities\config.bat
echo set INCLUDEDCHROMIUM=y>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Opens INCLUDEDCHROMIUM in headless mode. Looks pretty nice. Overrides CUSTOMBROWSER and BROWSER_TYPE. Default: y>> utilities\config.bat
echo set APPCHROMIUM=y>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Opens GoAnimate 2014 in a browser of the user's choice. Needs to be a path to a browser executable in quotes. Default: n>> utilities\config.bat
echo set CUSTOMBROWSER=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Lets the launcher know what browser framework is being used. Mostly used by the Flash installer. Accepts "chrome", "firefox", and "n". Default: n>> utilities\config.bat
echo set BROWSER_TYPE=chrome>> utilities\config.bat
echo:>> utilities\config.bat
echo :: Runs through all of the scripts code, while never launching or installing anything. Useful for development. Default: n>> utilities\config.bat
echo set DRYRUN=n>> utilities\config.bat
echo:>> utilities\config.bat
echo :: auto update (what do you think it does, obvious)>> utilities\config.bat
echo set AUTOUPDATE=y>> utilities\config.bat
echo:>> utilities\config.bat
echo :: discord rpc>> utilities\config.bat
echo set RPC=n>> utilities\config.bat
echo:>> utilities\config.bat
goto returnfromconfigcopy
