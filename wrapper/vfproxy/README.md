# VFProxy
 A PHP wrapper of the new VoiceForge API, which automatically converts it to MP3 using LAME for compatibility with the LVM.

## How to use

* Method 1: Test it out by going to the online, pre-configured server at [this link](http://seamus-server.tk/vfproxy/speech.php?voice=David&msg=Hello%20world!). See `VOICELIST.txt` in this repository for all the supported voice arguments. Keep in mind that the server being used to host this automatically shuts off every night at 11PM CST/12AM EST/04:00 UTC and turns back on sometime the next morning.
* Method 2: Set it up yourself by following these instructions:

First, install [WampServer](http://www.wampserver.com/en/) then clone/download this project. When you're done, unzip the folder, copy the path where you unzipped the folder, and follow these steps:
* Navigate to `localhost`
* Click on "Add a Virtual Host"
* Name the virtual space whatever you want, preferrably "vfproxy".
* Go to where you extracted the folder, copy the path to it's location and paste it into the complete absolute path of the Virtual Host folder.
* Click the "Start the creation of the Virtual Host" button
* When it's done, navigate to the WampServer tray icon, right click, go into "Tools" and click "Restart DNS".
* Wait 5-10 seconds and make sure a command prompt window pops up for a split-second.
* After all that, navigate to `http://{YOUR_VIRTUAL_HOST_NAME}/vfproxy/speech.php?voice=David&text=Hello%20world!`. `{YOUR_VIRTUAL_HOST_NAME}` being whatever you set the virtual host name to, e.g. I set mine to "vfproxy".

This will work with XAMPP too since despite the different software it seems to work VERY similar.

### Licenses

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

### Acknowledgements

* Credit to Cepstral for the original voices.
* Credit to LAME for their MP3-encoding software.
* Special thanks to ItsCrazyScout for going through the VoiceForge APK and finding the new API link, as well as being kind enough to host this program on his website to demonstrate an online, pre-configured version.

### Disclaimer

Copyright Disclaimer Under Section 107 of the Copyright Act 1976, allowance is made for "fair use" for purposes such as criticism, comment, news reporting, teaching, scholarship, and research. Fair use is a use permitted by copyright statute that might otherwise be infringing. Non-profit, educational or personal use tips the balance in favor of fair use.

I do not own the rights to any copyrighted material used in this project. This project is STRICTLY for experimental and historical purposes only, to show how the Gracie Films website used to be like back then, and therefore protects it under fair use. If anyone over at Gracie Films wants me to take it down, I will be happy to do so.
