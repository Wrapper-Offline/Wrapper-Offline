# Wrapper: Offline
Wrapper: Offline is an easy-to-use GoAnimate Server Emulator that uses Electron. Unlike the original project, Offline can not be shut down by Vyond. Why? It's because everything is hosted and programmed to function locally, no internet access required, barring the initial download (and TTS at this time). This project is important for archival purposes, as the ability to use this legacy editor and themes would be far trickier without it. Besides the main feature of Offline, we have also added other additional features and improvements compared to the original GoAnimate Wrapper project, and there will be more to come, as Offline will continue to get additional updates in the future.

[Find more info in the wiki.](https://github.com/Wrapper-Offline/Wrapper-Offline/wiki)

## Running / Installation
To get Wrapper: Offline on Windows, go to the Releases tab of our GitHub repository and download the latest version. Once it's finished downloading, extract it and run wrapper-offline.exe. It'll start Wrapper: Offline. If you would rather run the source code from the latest commit, you can clone the repository instead and run `npm start` in the root folder.

If you want to import videos and characters from other instances of Wrapper: Offline, open its folder and drag the "_SAVED" and "_ASSETS" folder into the Wrapper: Offline folder. If you have already made any videos or characters, this will not work. Please only import on a new install with no saved characters or videos, or take the folders in Wrapper: Offline out before dragging the old one in. If you want to import character IDs from the original LVM, you can click on CREATE A CHARACTER in the video list, scroll down to "Copy a character", and type in a character ID.

## Building
To build Wrapper: Offline, you need to run `npm run build` in the root folder of Offline. Note: the "server" folder won't be included in the build. You need to copy it manually.

## Updates & Support
For support, the first thing you should do is read through the FAQ, it most likely has what you want to know. Alternatively, if you can't find what you need, you can join the [Discord server](https://discord.gg/Kf7BzSw). Joining the server is recommended, as there is a whole community to help you out.

## Dependencies
This program relies on Flash and FFmpeg to work properly. Luckily, they require no download, as they have already been included in Wrapper: Offline.

## License
Most of this project is free/libre software under the MIT license. You have the freedom to run, change, and share this as much as you want.
FFmpeg is under the GNU GPLv2 license, which grants similar rights, but has some differences from MIT. Flash Player (extensions folder) and GoAnimate's original assets (server folder) are proprietary and do not grant you these rights, but if they did, this project wouldn't need to exist.

## Credits
These are unaffiliated people that they haven't directly done anything for the project but still deserve credit for their things. Kinda like a shoutout but in a project's readme. ***Please do not contact them about Wrapper: Offline, use the Discord server.***

Name | Contribution
---- | ----
[Vyond](https://vyond.com) | Creators of the themes we love
[VisualPlugin](https://github.com/Windows81) | GoAnimate Wrapper, character dump
[It'sJay](https://github.com/PoleyMagik) | Asset Store Archive, client modifications

No members of the original GoAnimate Wrapper team are officially working on Offline, even if they have contributed. Some members of the original team have asked to not be given credit, and they have been removed.
