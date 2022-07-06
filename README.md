# Wrapper: Offline
Wrapper: Offline is a GoAnimate Server Emulator carrying on the torch of [VisualPlugin's GoAnimate Wrapper project](https://github.com/GoAnimate-Wrapper) after it's shutdown in 2020. Unlike the original project, Offline can not be shut down by Vyond. Why? It's because everything is hosted and programmed to function locally, no internet access required, barring the initial download (and TTS at this time). This project is important for archival purposes, as the ability to use this legacy editor and themes would be far trickier without it. Besides the main feature of Offline, we have also added other additional features and improvements compared to the original GoAnimate Wrapper project, and there will be more to come, as Offline will continue to get additional updates in the future.

[Find more info in the wiki.](https://github.com/Wrapper-Offline/Wrapper-Offline/wiki)

## Running / Installation
To start Wrapper: Offline on Windows, Download and run the installer [here](https://wrapper-offline.ga/) It'll automate just about everything for you and, well, start Wrapper: Offline.


If you want to import videos and characters from the original Wrapper or any other clones of it, open its folder and drag the "_SAVED" folder into Wrapper: Offline's "wrapper" folder. If you have already made any videos or characters, this will not work. Please only import on a new install with no saved characters or videos, or take the "_SAVED" folder in Wrapper: Offline out before dragging the old one in. If you want to import character IDs from the original LVM, you can paste `&original_asset_id=[ID HERE]` at the end of the link for the matching character creator.

## Updates & Support
For support, the first thing you should do is read through the FAQ, it most likely has what you want to know. Alternatively, If you can't find what you need, you can join the [Discord server](https://discord.gg/Kf7BzSw). Joining the server is recommended, as there is a whole community to help you out.

## Dependencies
This program relies on Flash, Node.js and http-server to work properly. SilentCMD is also used to suppress all the extra logging noise you'd only need for troubleshooting and development. These all have been included with the project (utilities folder) to ensure full offline operation and will be installed if missing. The "wrapper" folder and http-server have their own dependencies, but they are included as well.

## License
Most of this project is free/libre software[1] under the MIT license. You have the freedom to run, change, and share this as much as you want.
This includes:
  - Files in the "wrapper" folder
  - Batch files made for Wrapper: Offline
  - Node.js
  - http-server
  - SilentCMD
  - Chromium Web Store

ungoogled-chromium is under the BSD 3-Clause license, which grants similar rights, but has some differences from MIT. MediaInfo has a similar BSD 2-Clause license. 7zip's license is mostly LGPL, but some parts are under the BSD 3-clause License, and some parts have an unRAR restriction. Stylus is under the GNU GPLv3 license. These licenses can be found in each program's folder in utilities\sourcecode.

The source code for compiled programs are all stored in utilities\sourcecode, and you can modify these as you wish. Parts of Offline that run from their source code directly (such as batch scripts) are not included in that folder, for obvious reasons.

Flash Player (utilities folder) and GoAnimate's original assets (server folder) are proprietary and do not grant you these rights, but if they did, this project wouldn't need to exist. Requestly, an addon included in Offline's browser, is sadly proprietary software, but you're free to remove the Chromium profile and use a fresh one if this bothers you. Requestly is primarily included because of how popular it is with our community.

## Footnotes
[1] - See <https://www.gnu.org/philosophy/free-sw.html> for a better definition of free software.
