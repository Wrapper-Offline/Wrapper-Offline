<!-- markdownlint-disable MD012 MD022 MD026 MD032 -->
# Wrapper: Offline FAQ
This file contains tons of useful information based on questions we get a lot about the project. This file's a little visually noisy, but feel free to CTRL+F and skim through the headers to find what you want.

## About Wrapper: Offline

### What is Wrapper: Offline?
Wrapper: Offlineis a continuation of the original Wrapper project, which was taken down approximately on 2020-04-17. Unlike the original, Wrapper: Offline can not be taken down. Everything it needs to run is stored entirely on your computer. While its current use is for making content, the motive is to make a historical archive for the original Flash-based themes used with this editor.

### Where can I get updates?
#### Discord
You can join the Discord server here to get updates as they come out: <https://discord.gg/b7YSRkg>
#### GitHub
Wrapper: Offline also has a GitHub repository! Get updates faster through here: <https://github.com/Wrapper-Offline/Wrapper-Offline>

### Will it work forever? Even after Flash is retired?
It should, that's the goal. Perhaps in the future when we all run 6000-bit machines implanted into our brains it won't be compatible with that anymore, but I'm sure there'll always be a way to run it. There is also futureproofing for Flash's discontinuation, since Offline includes a Flash install and a version of ungoogled-chromium that supports Flash. By default, it starts from this. The included Chromium Browser should not be used for browsing beyond using Flash content.

### So I could just unplug my internet and use it?
Pretty much, yes. Text-to-speech voices still require an internet connection, because there's no way to take that offline at the moment, Additionally, the TTS companies unlikely to block you unless you spam them really quickly. You can also change, add, or even remove voices by modifying files in `wrapper-offline/wrapper/tts`, should you wish to add a custom site or figure out a way to make them work offline too.

### How does Wrapper: Offline work exactly?
Well, it still uses the Node.js app the original Wrapper ran on. But, it also starts a web server on your computer (which is completely private and never connected to the actual internet) and Offline communicates with that server. Both are in their respective wrapper and server folders if you want to explore either. It also uses an older version of ungoogled-chromium that supports Flash, which you can find in the utilities folder. If you really wanted to, you could still put the server files into a proper web server, configure the Node.js app to connect to that, and run it from there. But that defeats the purpose of Offline, and some parts are likely to break.

### Wait... Chromium? I've heard something about that being a virus...
Chromium is literally Chrome and is NOT a virus. It's the libre software base Google uses to build Chrome, and then they tack proprietary parts like auto-updates and Google integration in so it's more appealing and they have more control over your experience. Ungoogled-chromium is just a version of Chromium that has any Google integration that's left in Chromium removed for privacy.
If you don't trust this, feel free to look through the code on GitHub: <https://github.com/Eloston/ungoogled-chromium>
And these VirusTotal results for it: <https://www.virustotal.com/gui/file/bab1f622f9a966baffa07838c305e586715979db884cd7369df96bb08c092f8a/detection>
And you can also see an independent report from this site that analyzes software for spyware traits: <https://spyware.neocities.org/articles/ungoogled_chromium.html>



## Using Wrapper: Offline

### How do I use it?
Once you've got it downloaded and extracted (Hense how you're able to read this likely), all you have to do is open start_wrapper.bat and do what it says. It should install everything needed for you.
Note: make sure you run "start_wrapper.bat" with administrative permissions the first time you run the program.

### Can I import my videos and characters from another Wrapper project, such as the original or GA4SR?
Yes. Take the _SAVED folder from your original video maker, and drag it into the wrapper folder in Wrapper: Offline. If you've already saved anything in Wrapper: Offline, this'll likely override it. Do keep in mind though that this is somewhat buggy and not guaranteed to work 100% of the time.

### Can I import character IDs from the original LVM?
Also yes! To do that, go to the matching character creator, and paste `&original_asset_id=ID HERE` at the end of the URL.

### Can I share characters made in Offline with others?
Also also yes! Look in `wrapper-offline\wrapper\_SAVED`, find the matching XML file, and then send that.

### How can I start without the launcher?
This is meant for people who can't run the start_wrapper.bat file, such as Mac and GNU+Linux users. This section will likely be outdated soon as we plan on bringing support over to Mac and linux users eventually.
Note: This is somewhat buggy and not guaranteed to work 100% of the time.

On your first run:
1. Make sure Flash Player and Node.js (<https://nodejs.org/en/>) are installed
2. The first time you run, open a command prompt/terminal and enter "npm install http-server -g"
3. Look up how to install HTTPS certificates on your OS. Open the server folder and install the.crt.
   - If you can't figure out how to install HTTPS certs, you can go to localhost:4664 and add a security exception, but this'll need to be done on each browser you use Wrapper: Offline with.

Every time you want to start:
1. In a terminal, go to the folder named "server"  and enter http-server -p 4343 -S -C the.crt -K the.key
2. Now in a new terminal window, go to the folder named "wrapper" and enter npm start
3. Open your preferred browser and enter localhost:4343 in the address bar.

### Can I make Wrapper: Offline smaller?
The current size is ~1.5 GB. The base download can't be much smaller without being incompatible. We do however plan to continue to reduce file size to the best of our abilities.


## Wrapper isn't working!

### Wrapper Offline is crashing and showing "This site can not be reached"!
There's likely not much way to solve this on your own if you are inexperienced. You should turn on VERBOSEMODE in settings.bat, save and close the settings and restart Wrapper: Offline. Then, when it crashes, take a screenshot of the NPM window and post it in our Discord server. If you're tech savvy enough to understand whatever error pops up, feel free to elaborate. Possible reasons for this is you're missing critical core files or your version of node.js is outdated.

### The editor/character creator won't load!
The cause of this is usually an error with http-server or node.js, the software Wrapper: Offline uses to host the asset files. To see its output, turn on VERBOSEMODE in settings.bat. If there's an error in any of the consol's, then you might just have to ask for support in the Discord. If there's no error however, you might simply have to make your browser trust the HTTPS certificate. Normally this is automatically fixed by the launcher, but it may have broken. This is not a concern beyond annoyance, as you're just connecting to yourself and nobody else can connect. But if you see a notice like this on a real website, *that* is a cause for concern and you should avoid the website. To fix this, you can visit <https://localhost:4343> or open the server page with the launcher, and add a security exception.



## A feature isn't here/working!

### Some themes and assets are missing!
I go into this in more detail in the legalese section, but basically Vyond is still using them so they are not include in Wrapper: Offline. Another reason is to reduce file size.

### Watermarks aren't working!
This feature has not been added yet. You're likely better off either placing them over your video as a prop, or using a video editor to place them on your video.

### Some TTS voices won't generate!
Some of them will never generate if your message is too long, as the current limit gives too much room and can go over what the voice services allow. If you're generating a short message and some voices still don't work, it is also highly likely that you've been rate-limited or a service has gone down. If all voices are not working, please check your internet connection.
Note: To avoid TTS rate limits you can use a VPN.

### Starters aren't working!
A fix is currently being worked on. For now, you'll just have to either copy them directly from projects or recreate them.

## Can I use Offline on...

### macOS or GNU+Linux?
(This section will be updated soon)

### Any web browser?
As long as it allows you to run Flash, yes. You can change some options in settings.bat to change what browser it launches Offline in, by default it launches with an included browser that supports Flash.

### ChromeOS?
(This section will be updated soon)

### iOS or Android?
No. Not unless you use something like chrome remote desktop with a regular computer. This will never happen, Flash does not run on iOS at all, and the few Android versions out there are extremely old and barely work.

### Windows Phone?
go back to 2013
‎


## Legalese things I guess

### Can I copy/modify Wrapper: Offline?
Absolutely! We're completely alright with it. and if you want to change something or make your own modifications or whatever, please feel free! Just about everything in Offline is under the MIT license, except for the original GoAnimate code (obviously) and ungoogled-chromium (which is under the BSD 3-Clause license). If you do make changes, feel free to let us know via our discord and we may consider putting them in official releases :)
‎
### Why are some themes and assets missing?
This is mainly due to file sizing issues. Along with the fact that Vyond still uses theme, and unless they abandon them. We will not be adding them in Wrapper: Offline. The're still available in their paid service, and even if it's an inferior version it's effectively just piracy at that point. Removing it, as well as a few other themes, is to try to avoid hurting Vyond.

### Why do you avoid mentioning the original service GoAnimate/Vyond?
Because they are NOT affiliated or endorsing this project in any form. Wrapper: Offline is and almost certainly always will be a completely separate project. That's why the full name is simply Wrapper: Offline, and referring to it with that company's name (such as calling it GoAnimate Wrapper Offline) is wrong.

### Wait, you're using Vyond's copyrighted material, isn't that illegal?
While the assets we used used to be copyrighted and owned by Vyond, they have been abandoned and the patent for them has expired. Due to this, they are now in the Public Domain and free to use by all, hence why this project still exists. Almost all LVM assets have also been deleted off of Vyond's server, with this project being one of the only places you can get them. Vyond simply does not care about their old stuff anymore, and they would've renewed the patent if they did. Nothing in this project is illegal.
