title Wrapper: Offline Reset Script
:: Resets any changed files to make a fresh install, meant for devs making a new release
:: Author: benson#0411
:: License: MIT

:: Initialize (stop command spam, clean screen, make variables work, set to UTF-8)
@echo off && cls
SETLOCAL ENABLEDELAYEDEXPANSION
chcp 65001 >nul

:: Move to base folder, and make sure it worked (otherwise things would go horribly wrong)
pushd "%~dp0"
if !errorlevel! NEQ 0 goto error_location
pushd ..
if !errorlevel! NEQ 0 goto error_location
if not exist utilities\reset_install.bat ( goto error_location )
if not exist wrapper ( goto error_location )
goto noerror_location
:error_location
echo Doesn't seem like this script is in Wrapper: Offline's utilities folder.
goto end
:noerror_location

:: Prevents CTRL+C cancelling and keeps window open when crashing
if "!SUBSCRIPT!"=="" (
	if "%~1" equ "point_insertion" goto point_insertion
	start "" /wait /B "%~F0" point_insertion
	exit
)
:point_insertion

:: patch detection
if exist "patch.jpg" echo why reset something patched && pause && exit

:: Predefine variables
set WRAPRESET=n
set ERROR_DELCACHE=n
set ERROR_DELCHECKS=n
set ERROR_DELCHROME=n
set ERROR_DELCONFIG=n
set ERROR_DELIMPORT=n
set ERROR_DELSAVE=n
set ERROR_DELSILENTCMD=n

:: Confirmation
echo Are you sure you'd like to reset Wrapper: Offline?
echo This will remove all saved videos and characters.
echo You should only use this if you're a dev or one told you to do it.
echo This decision is permanent, and can't be reversed.
echo:
echo Type y to reset Offline, and n to close this script.
:resetconfirmretry
set /p RESETCHOICE= Response:
echo:
if not '%resetchoice%'=='' set resetchoice=%resetchoice:~0,1%
if /i '%resetchoice%'=='y' goto resetconfirm2
if /i '%resetchoice%'=='n' exit
goto resetconfirmretry
echo: && echo: && echo:

:: Confirmation again because this is very volatile
:resetconfirm2
color cf
echo Are you ABSOLUTELY sure you wish to do this?
echo You are entirely responsible for losing your videos.
echo:
echo Type y to reset Offline, and n to close this script.
:resetconfirmretry2
set /p RESETCHOICE= Response:
echo:
if not '%resetchoice%'=='' set resetchoice=%resetchoice:~0,1%
if /i '%resetchoice%'=='y' goto dothereset
if /i '%resetchoice%'=='n' exit
if /i '%resetchoice%'=='yes' goto dothereset
if /i '%resetchoice%'=='no' exit
goto resetconfirmretry2

:dothereset

color 0f
set WRAPRESET=y

:: Reset _SAVED folder
rd /q /s wrapper\_SAVED || set ERROR_DELSAVE=y
md wrapper\_SAVED

:: Reset _CACHE folder
rd /q /s wrapper\_CACHÉ || set ERROR_DELCACHE=y
md wrapper\_CACHÉ
copy NUL "wrapper\_CACHÉ\_NO_REMÖVE"

:: Reset checks folder
rd /q /s utilities\checks || set ERROR_DELCHECKS=y
md utilities\checks

:: Reset settings
del /q /s utilities\config.bat || set ERROR_DELCONFIG=y
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

:: Reset Chromium profile
rd /q /s utilities\ungoogled-chromium\the_profile || set ERROR_DELCHROME=y
md utilities\ungoogled-chromium\the_profile
robocopy utilities\ungoogled-chromium\the_profile_initial utilities\ungoogled-chromium\the_profile /E

:: Reset SilentCMD (unnecessary but might as well)
del /q /s utilities\SilentCMD.exe.config || set ERROR_DELSILENTCMD=y

:: Reset imported assets
pushd server\store\3a981f5cb2739137\ || set ERROR_DELIMPORT=y & goto skipimportreset
rd /q /s import || set ERROR_DELIMPORT=y & goto skipimportreset
md import || set ERROR_DELIMPORT=y & goto skipimportreset
pushd import
echo ^<?xml version="1.0" encoding="utf-8"?^> >>theme.xml
echo ^<theme id="import" name="Imported Assets" cc_theme_id="import"^> >>theme.xml
echo ^<^^!--Sorry that there's no indenting, I couldn't get the import script to keep that.--^> >>theme.xml
echo ^<^^!--Also, be sure to leave a blank line before ^<theme^>, otherwise the import script breaks.--^> >>theme.xml
echo ^<char id="327068788" name="the benson apparition" cc_theme_id="family" thumbnail_url="char-default.png" copyable="Y"^> >>theme.xml
echo ^<tags^>family,every,copy,of,wrapper,offline,is,_free,software,but,is,also,_cat:personalized^</tags^> >>theme.xml
echo ^</char^> >>theme.xml
echo:>>theme.xml
echo ^</theme^> >>theme.xml
popd
utilities\7za.exe a "server\store\3a981f5cb2739137\import\import.zip" "server\store\3a981f5cb2739137\import\theme.xml" >nul || set ERROR_DELIMPORT=y & goto skipimportreset
del /q /s utilities\import_these || set ERROR_DELIMPORT=y & goto skipimportreset
md utilities\import_these || set ERROR_DELIMPORT=y & goto skipimportreset
:skipimportreset


echo Reset log:
if !ERROR_DELSAVE!==n (
	echo Saved movies/characters successfully deleted.
) else (
	echo Saved movies/characters could not be deleted.
)
if !ERROR_DELCACHE!==n (
	echo Cache successfully deleted.
) else (
	echo Cache could not be deleted.
)
if !ERROR_DELCHECKS!==n (
	echo Checks folder successfully deleted.
) else (
	echo Checks folder could not be deleted.
)
if !ERROR_DELCONFIG!==n (
	echo Settings successfully deleted.
) else (
	echo Settings could not be deleted.
)
if !ERROR_DELCHROME!==n (
	echo Chromium profile successfully deleted.
) else (
	echo Chromium profile could not be deleted.
)
if !ERROR_DELSILENTCMD!==n (
	echo SilentCMD config successfully deleted.
) else (
	echo SilentCMD config could not be deleted. Not like it matters.
)
if !ERROR_DELIMPORT!==n (
	echo Imported assets successfully deleted.
) else (
	echo Imported assets could not be deleted.
)
echo:
echo Remember to remove any leftover dev files too, assuming you're a dev.

:end
if "%SUBSCRIPT%"=="" (
	echo Closing...
	endlocal
	pause & exit
) else (
	if !WRAPRESET!==y ( endlocal & exit /b 0 )
	if !WRAPRESET!==n ( endlocal & exit /b 1 )
)