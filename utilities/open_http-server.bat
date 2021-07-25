:: opens http-server in a standalone batch so that i can use a tool that silently runs batch files
:: this is stupid
:: please help
@echo off
pushd "%~dp0"
title HTTP-SERVER HASN'T STARTED
pushd ..\server
http-server -p 4664 -c-1 -S -C the.crt -K the.key
echo:
echo If you see an error saying "http-server is not recognized",
echo please type "npm install http-server -g" in this window,
echo press enter, and restart Wrapper: Offline.
pause & exit