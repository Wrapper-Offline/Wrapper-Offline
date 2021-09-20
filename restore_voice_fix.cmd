@echo off
cd /d "%~dp0"
if not exists server goto nothere
if not exists utilities goto nothere
if not exists wrapper goto nothere
if exists wrapper\tts\main.js del wrapper\tts\main.js
if exists wrapper\tts\info.json del wrapper\tts\info.json
title Voice Fix toogler
choice /c ED /m "Enable voice fix or disable?"
if errorlevel equ 1 goto enable
if errorlevel equ 2 goto disable

:enable
:: Download info.json with the voice fix.
aria2c -o"wrapper\tts\info.json" "https://raw.githubusercontent.com/michelle1574/Wrapper-Offline-with-Business-Friendly/dbcdd0e27c573c903297dbb663d018be972a9bf7/wrapper/tts/info.json"
:: Download main.js with the voice fix.
aria2c -o"wrapper\tts\main.js" "https://raw.githubusercontent.com/michelle1574/Wrapper-Offline-with-Business-Friendly/dbcdd0e27c573c903297dbb663d018be972a9bf7/wrapper/tts/main.js"
goto done

:disable
:: Download info.json without the voice fix.
aria2c -o"wrapper\tts\info.json" "https://raw.githubusercontent.com/michelle1574/Wrapper-Offline-with-Business-Friendly/main/wrapper/tts/info.json"
:: Download main.js without the voice fix.
aria2c -o"wrapper\tts\main.js" "https://raw.githubusercontent.com/michelle1574/Wrapper-Offline-with-Business-Friendly/main/wrapper/tts/main.js"
goto done

:done
echo Done
pause
exit

:notthere
echo This is not Wrapper:offline folder.
pause
exit