# Wrapper: Offline
Wrapper: Offline is a GoAnimate Server Emulator carrying on the torch of [VisualPlugin's GoAnimate Wrapper project](https://github.com/GoAnimate-Wrapper) after it's shutdown in 2020. Unlike the original project, Offline can not be shut down by Vyond. Why? It's because of our twist on the GoAnimate Wrapper formula! Everything is hosted and programmed to function locally, no internet access required, barring the initial download (and TTS at this time). This project is important for archival purposes, as the ability to use this legacy editor and themes would be far trickier without it. Besides the main feature of Offline, we have also added other additional features and improvements compared to the original GoAnimate Wrapper project, and there will be more to come, as Offline will continue to get additional updates in the future.

## Running / Installation
To start Wrapper: Offline on Windows, Download and run the installer at https://wrapper-offline.ga/. It'll automate just about everything for you and, well, install Wrapper: Offline.

If you want to import videos and characters from the original Wrapper or any other clones of it, open its folder and drag the "_SAVED" folder into Offline's "wrapper" folder. If you have already made any videos or characters, this will not work. Please only import on a new install with no saved characters or videos, or take the "_SAVED" folder in Offline out before dragging the old one in. If you want to import character IDs from the original LVM, you can paste `&original_asset_id=[ID HERE]` at the end of the link for the matching character creator.

## Updates & Support
For support, the first thing you should do is read through faq.txt, it most likely has what you want to know. If you can't find what you need, you can join the [Discord server](https://discord.gg/Kf7BzSw). Joining the server is recommended, as there is a whole community to help you out.

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

While completely unnecessary, if you decide to use your freedom to change the software, it would be greatly appreciated if you sent it to me so I can implement it into the main program! With credit down here of course :)

## Credits
**Please do not contact anyone on the list for support, use the Discord server.**

Original Wrapper credits:
| Name                                         | Contribution         |
| -------------------------------------------- | -------------------- |
| [VisualPlugin](https://github.com/Windows81) | GoAnimate Wrapper    |
| [CLarramore](https://github.com/CLarramore)  | Bug fixes            |
| [PoleyMagik](https://github.com/PoleyMagik)  | Asset Store Archive  |

No members of the original team are officially working on Offline, even if they have contributed. Some members of the original team have asked to not be given credit, and they have been removed.

The current Project Lead will have (PL) on their name, the current Head of Development with have (HD) on their name, and developers will have (D) on their name, to show they are officially working on Wrapper: Offline. Everyone else has simply contributed something at some point, or left the development team.
Wrapper: Offline credits:
| Name                                                  | Contribution                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| [GoTest334 (PL)](https://github.com/GoTest334)        | Current Project Lead                                           |
| [sparrkz](https://github.com/sparrkzz)                | A lot of smaller stuff, the installer, lots of bug fixes, etc. |
| [octanuary (D)](https://github.com/octanuary)         | Stuff                                                          |
| [Blukas/GoTube (D)](https://github.com/theBlukas)     | Import idea, Mega Comedy World 2                               |
| [Benson (Child Groom)](https://github.com/watchbenson)| Wrapper: Offline                                               |
| [NathanSaturnBOI](https://github.com/NathanSaturnBOI) | Logo                                                           |
| VisualPlugin                                          | Text to speech voices                                          |
| creepyjokes2000                                       | Waveform fix, improved actions                                 |
| [JoshAnimate](https://github.com/joshtoons2008)       | Headgear fix                                                   |
| KrisAnimate                                           | Chromium parameter                                             |
| PoleyMagik                                            | Client Modifications                                           |

These are unaffiliated people that they haven't directly done anything for the project (and probably don't even know it exists) but still deserve credit for their things. Kinda like a shoutout but in a project's readme. ***Please do not contact them about Wrapper: Offline.***
| Name                                            | Contribution                     |
| ----------------------------------------------- | -------------------------------- |
| [Vyond](https://vyond.com)                      | Creators of the themes we love   |
| [http-party](https://github.com/http-party)     | Creators of http-server          |
| [Stephan Brenner](https://github.com/stbrenner) | Creator of SilentCMD             |

## Footnotes
[1] - See <https://www.gnu.org/philosophy/free-sw.html> for a better definition of free software.
