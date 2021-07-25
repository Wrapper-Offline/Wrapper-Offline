:: opens node.js in a standalone batch so that i can use a tool that silently runs batch files
:: this is stupid
:: please help
@echo off
pushd "%~dp0"
title NODE.JS HASN'T STARTED YET
pushd ..\wrapper
npm start
echo:
echo If you see an error saying "npm is not recognized",
echo please install Node.js from nodejs.org.
echo:
echo If you see an error that says "MODULE_NOT_FOUND",
echo please type "npm install" in this window, press enter,
echo and then type "npm start" and press enter.
pause & exit