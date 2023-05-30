# GoAnimate 2014
GoAnimate 2014 is a GoAnimate Server Emulator carrying on the torch of [VisualPlugin's GoAnimate Wrapper project](https://github.com/GoAnimate-Wrapper) after it's shutdown in 2020. Unlike the original project, GA2014 can not be shut down by Vyond. Why? It's because everything is hosted and programmed to function locally, no internet access required, barring the initial download (and TTS at this time). This project is important for archival purposes, as the ability to use this legacy editor and themes would be far trickier without it. Besides the main feature of Offline, we have also added other additional features and improvements compared to the original GoAnimate Wrapper project, and there will be more to come, as Offline will continue to get additional updates in the future.


## Running / Installation
To start GoAnimate 2014 on Windows, you're first gonna need to install some programs:
  - Node.JS (download [here](https://nodejs.org/dist/v20.2.0/node-v20.2.0-x64.msi))
  - Ungoogled Chromium (download [here](https://github.com/Wyse-/ungoogled-chromium-binaries/releases/download/67.0.3396.87-3/ungoogled-chromium_67.0.3396.87-3_windows.zip))
  - WinRAR (download [here](https://www.win-rar.com/postdownload.html?&L=0))
  After installing these programs, extract Ungoogled Chromium using WINRAR. Once the process is done, open launch_goanimate.bat. It'll automate just about everything for you and, well, start GoAnimate 2014. AFter that, head to Chromium, run chrome.exe and navigate to http://localhost:4343/. **Currently there is no support for Linux or MacOS.**

If you want to import videos and characters from other LVMs such as Wrapper: Offline into GoAnimate 2014, open its folder and drag the "_SAVED" and "_ASSETS" folder into the GoAnimate 2014 folder. If you have already made any videos or characters, this will not work. Please only import on a new install with no saved characters or videos, or take the folders in GoAnimate 2014 out before dragging the old one in.

## License
Most of this project is free/libre software[1] under the MIT license. You have the freedom to run, change, and share this as much as you want.
This includes:
  - Files in the "wrapper" folder
  - Node.js

FFmpeg is under the GNU GPLv2 license, which grants similar rights, but has some differences from MIT. Flash Player (extensions folder) and GoAnimate's original assets (server folder) are proprietary and do not grant you these rights, but if they did, this project wouldn't need to exist.

## Credits
**Please do not contact anyone directly on the list for support, use the Discord server. ALL OF THESE CREDITS ARE THE CREDITS OF WRAPPER: OFFLINE EXCLUDING GOANIMATE LISTED BELOW.**

Original W:O credits:
| Name                                         | Contribution         |
| -------------------------------------------- | -------------------- |
| [VisualPlugin](https://github.com/Windows81) | Creator of the original GoAnimate Wrapper    |
| [CLarramore](https://github.com/CLarramore)  | Bug fixes            |
| [PoleyMagik](https://github.com/PoleyMagik)  | Asset Store Archive  |

No members of the original team are officially working on GA2014 or W:O, even if they have contributed. Some members of the original team have asked to not be given credit, and they have been removed.

The current Project Lead will have (PL) on their name, the current Director of Testing will have (DT) on their name, the current Head of Development with have (HD) on their name, and developers will have (D) on their name, to show they are officially working on GoAnimate 2014. Everyone else has simply contributed something at some point, or left the development team.
W:O credits:
| Name                                                  | Contribution                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| [GoTest334 (PL)](https://github.com/GoTest334)        | Current W:O project lead                                       |
| [Blukas/GoTube (DT)](https://github.com/theBlukas)    | Beta testing, Mega Comedy World 2                              |
| [octanuary (HD)](https://github.com/octanuary)        | Real importing, starters, API changes                          |
| [sparrkz](https://github.com/sparrkzz)                | A lot of smaller stuff, the installer, lots of bug fixes, etc. |
| [2Epik4u](https://github.com/2Epik4u)                 | Stuff                                                          |
| [Benson (Child Groom)](https://github.com/watchbenson)| Creator of W:O                                                 |
| [NathanSaturnBOI](https://github.com/NathanSaturnBOI) | W:O Logo                                                       |
| GoAnimate                                             | GoAnimate Logo, watermarks, favicon icon                       |
| VisualPlugin                                          | Text to speech voices                                          |
| creepyjokes2000                                       | Waveform fix, improved actions                                 |
| PoleyMagik                                            | Client Modifications                                           |

These are unaffiliated people that they haven't directly done anything for the project (and probably don't even know it exists) but still deserve credit for their things. Kinda like a shoutout but in a project's readme. ***Please do not contact them about Wrapper: Offline or GoAnimate 2014.***
| Name                                            | Contribution                     |
| ----------------------------------------------- | -------------------------------- |
| [Vyond](https://vyond.com)                      | Creators of the themes we love   |

## Footnotes
[1] - See <https://www.gnu.org/philosophy/free-sw.html> for a better definition of free software.
