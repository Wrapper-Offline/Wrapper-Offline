<!-- markdownlint-disable MD012 MD022 MD026 MD032 -->
# Wrapper: Offline FAQ
This file contains tons of useful information based on questions I get a lot about the project. This file's a little visually noisy, but feel free to CTRL+F and skim through the headers to find what you want.

## About Wrapper: Offline

### What is Wrapper: Offline?
Wrapper: Offline (simply called "Offline" for the rest of this page) is a continuation of the original Wrapper project, which was taken down approximately on 2020-04-17. Unlike the original, Offline can not be taken down. Everything it needs to run is stored entirely on your computer. While its current use is for making content, the motive is to make a historical archive for the original Flash-based themes used with this editor.

### Where can I get updates?
#### Discord
You can join the Discord server here to get updates as they come out: <https://discord.gg/b7YSRkg>
If you don't want to use Discord, you could ask a friend who does to let you know when an update comes out, and they can send you the download link. Please do not email me asking for the latest version.
#### GitHub
Wrapper: Offline also has a GitHub repository! Get updates faster through here: <https://github.com/Wrapper-Offline/Wrapper-Offline-Public>

### Will it work forever? Even after Flash is retired?
It should, that's the goal. Perhaps in the future when we all run 6000-bit machines implanted into our brains it won't be compatible with that anymore, but I'm sure there'll always be a way to run it. There is also futureproofing for Flash's discontinuation, since Offline includes a Flash install and a version of ungoogled-chromium that supports Flash. By default, it starts from this, but you can change that in settings.bat. The included Chrome should not be used for browsing beyond using Flash content. You can also look into projects like [Lightspark](http://lightspark.github.io/) and [ruffle](https://ruffle.rs/) that are attempting to recreate Flash.

### So I could just unplug my internet and use it?
Pretty much, yes. Text-to-speech voices still require an internet connection, but there's no way to take that offline, and the TTS companies unlikely to block you unless you spam them really quickly. You can also change, add, or even remove voices by modifying files in `wrapper-offline/wrapper/tts`, should you wish to add a custom site or figure out a way to make them work offline too.

### How does Offline work exactly?
Well, it still uses the Node.js app the original Wrapper ran on. But, it also starts a web server on your computer (which is completely private and never connected to the actual internet) and Offline communicates with that server. Both are in their respective wrapper and server folders if you want to explore either. It also uses an older version of ungoogled-chromium that supports Flash, which you can find in the utilities folder. If you really wanted to, you could still put the server files into a proper web server, configure the Node.js app to connect to that, and run it from there. But that defeats the purpose of Offline, and some parts are likely to break.

### Wait... Chromium? I've heard something about that being a virus...
Chromium is literally Chrome. It's the libre software base Google uses to build Chrome, and then they tack proprietary parts like auto-updates and Google integration in so it's more appealing and they have more control over your experience. Ungoogled-chromium is just a version of Chromium that has any Google integration that's left in Chromium removed for privacy.
If you don't trust me, feel free to look through the code on GitHub: <https://github.com/Eloston/ungoogled-chromium>
And these VirusTotal results for it: <https://www.virustotal.com/gui/file/bab1f622f9a966baffa07838c305e586715979db884cd7369df96bb08c092f8a/detection>
And you can also see an independent report from this site that analyzes software for spyware traits: <https://spyware.neocities.org/articles/ungoogled_chromium.html>



## Using Offline

### How do I use it?
Once you've got it downloaded and extracted, all you have to do is open start_wrapper.bat and do what it says. It should install everything needed for you.

### Can I import my videos and characters from another Wrapper project, such as the original or GA4SR?
Yes! Take the _SAVED folder from your original, and drag it into the wrapper folder in Wrapper: Offline. If you've already saved anything in Offline, this'll likely override it.

### Can I import character IDs from the original LVM?
Also yes! To do that, go to the matching character creator, and paste `&original_asset_id=ID HERE` at the end of the URL.

### Can I share characters made in Offline with others?
Also also yes! Look in `wrapper-offline\wrapper\_SAVED`, find the matching XML file, and then send that. To save an XML character, put them in your _SAVED folder, and make the number at the end one above the highest in the folder.

### How can I start without the launcher?
This is meant for people who can't run the start_wrapper.bat file, such as Mac and GNU+Linux users.
On your first run:
1. Make sure Flash Player (<https://get.adobe.com/flashplayer/>) and Node.js (<https://nodejs.org/en/>) are installed
2. The first time you run, open a command prompt/terminal and enter "npm install http-server -g"
3. Look up how to install HTTPS certificates on your OS. Open the server folder and install the.crt.
   - If you can't figure out how to install HTTPS certs, you can go to localhost:4664 and add a security exception, but this'll need to be done on each browser you use Wrapper: Offline with.

Every time you want to start:
1. In a terminal, go to the folder named "server"  and enter http-server -p 4343 -S -C the.crt -K the.key
2. Now in a new terminal window, go to the folder named "wrapper" and enter npm start
3. Open your preferred browser and enter localhost:4343 in the address bar.

### Can I make Wrapper: Offline smaller?
The current size is ~1.5 GB. The base download can't be much smaller without being incomplete, but there a few steps you can take if you absolutely need more space.
#### System cleanout tips (Recommended)
1. If you're using Windows, you can run <https://old.reddit.com/r/TronScript/> overnight to clean out and potentially speed up your computer. This is a reputable script that automates many things that cleanup guides and technicians would do.
2. If you're using Linux, you can run <https://www.bleachbit.org> to clean out your computer.
3. You can use WinDirStat (QDirStat on Linux) to find the largest folders/files on your computer.
4. If there's a space hog on your computer that you use (such as a big game, or Offline itself), you can try <https://github.com/ImminentFate/CompactGUI> on Windows 10 to shrink them down. Win8 and below users can right click a folder and enable NTFS compression, but it's less effective. I don't know anything like this for Linux, but it's out there if you look.
#### Wrapper cleanout tips (Desperation)
1. If you've already installed them, you can remove the Flash and Node.js installers as well as the http-server folder from the utilities folder.
2. The `wrapper-offline/wrapper/_CACHE` folder contains any text-to-speech you've generated, and you can delete the files inside (NOT THE FOLDER ITSELF) if you no longer need them.
3. Windows 10 users can run <https://github.com/ImminentFate/CompactGUI> on the wrapper-offline folder.
4. If you don't plan on importing any characters made with the original Legacy Video Maker, make sure to scroll through all the stock characters to make them load, and then you can remove all zip files in `wrapper-offline/server/characters`.
5. If you prefer your own browser, you can configure settings.bat to use that and remove ungoogled-chromium from the utilities folder.



## Wrapper isn't working!

### The launcher is crashing!
There's likely not much way to solve this on your own. You should turn on VERBOSEWRAPPER in settings.bat, open a command prompt window, drag start_wrapper.bat onto it, and run it. Then, when it crashes, take a screenshot and post it in our Discord server. If you're tech savvy enough to understand whatever error pops up, feel free to elaborate.

### The editor/character creator won't load!
The cause of this is usually an error with http-server, the software Offline uses to host the asset files. To see its output, turn on VERBOSEWRAPPER in settings.bat. If there's an error, then you might just have to ask for support in the Discord. If there's no error however, you might simply have to make your browser trust the HTTPS certificate. Normally this is automatically fixed by the launcher, but it may have broken, and Firefox users simply have to deal with this sadly. Because, as a Firefox user, Firefox has to be **special**. This is not a concern beyond annoyance, as you're just connecting to yourself and nobody else can connect. But if you see a notice like this on a real website, *that* is a cause for concern and you should avoid the website. To fix this, you can visit <https://localhost:4343> or open the server page with the launcher, and add a security exception.



## A feature isn't here/working!

### File uploading isn't working!
It hasn't been added yet. It's never worked in any version of Wrapper, to my knowledge. There's a workaround beyond just using a standard video editor to add things after, although it's kinda tedious compared to the original file uploading system. Credit to GoTube for finding this! Go to the folder `wrapper-offline\server\store\3a981f5cb2739137\common\` and choose whichever folder for which type of thing you want. Add the file. For example, you can add a jpg/png into the prop folder, or an mp3 into the sound folder. Next, go to `wrapper-offline\wrapper\_THEMES` and open common.xml. Find a line that starts with the type of object you want (for example, props start with `<prop`.), and copy-paste it into a new line. Now modify your copied line to fit your item. The only part you _have_ to change is the `id` to whatever the name of your file is, but you should also change `name` to whatever you want the prop to be called. You could also add things like guns by changing `holdable` to 1. You can investigate this file further to make more complex custom props too, such as ones with different states.

### Business Friendly and Whiteboard are missing!
I go into this in more detail in the legalese section, but basically Vyond is still using them so I won't include them in Offline.

### Watermarks aren't working!
This is likely tied to file uploading not working. You're likely better off either placing them over your video as a prop, or using a video editor to place them on your video. My recommendations are Kdenlive and OpenShot, both of them are libre software you can use for free.

### Some TTS voices won't generate!
Some of them will never generate if your message is too long, as the current limit gives too much room and can go over what the voice services allow. If you're generating a short message and some voices still don't work, it may be possible that you've been rate-limited or a service has gone down. If all voices are not working, please check your internet connection.

### Starters aren't working!
I currently have no fix for this, you'll just have to either copy them directly from projects or recreate them.

### Resizing set in the Character Creator breaks when playing!
I currently have no fix for this, you'll just have to size them manually in the editor. Head resizing should be working fine, it's the size of the entire character that's broken.



## Can I use Offline on...

### macOS or GNU+Linux?
Yes, you can. See "How can I start without the launcher?" for instructions. However, this is likely to be much more tedious and annoying, and is currently untested. Linux support is currently planned and I fully intend on helping Linux users where possible, but Mac support is less likely and I have absolutely no experience with the operating system beyond similarities to Linux. Worth noting: if you're running 32-bit Linux, you will not be able to install Node.js. An older version that supports 32-bit *may* work, but this is untested.

### Any web browser?
As long as it allows you to run Flash, yes. You can change some options in settings.bat to change what browser it launches Offline in, by default it launches with an included browser that supports Flash.

### ChromeOS?
ChromeOS is very heavily locked down, and supporting it would likely be troublesome to make, especially since Linux support would need to be made first. It might end up no longer working by the end of 2020 anyway, since Flash will be discontinued and there may not be a way to install it on ChromeOS past that point. Feel free to try it yourself though.

### iOS or Android?
No. Not unless you use some remote desktop trickery with a regular computer. This will never happen, Flash does not run on iOS at all, and the few Android versions out there are extremely old and barely work.

### Windows Phone?
go back to 2013
‎


## Legalese things I guess

### Can I copy/modify Wrapper: Offline?
Absolutely! I'm a huge libre software advocate, and if you want to change something or make your own version or whatever, please feel free! Just about everything in Offline is under the MIT license, except for the original GoAnimate code (obviously) and ungoogled-chromium (which is under the BSD 3-Clause license). If you do make changes, let me know and I'd be glad to look into putting them in official releases :)
‎
### Why was the original Wrapper shut down?
The original Wrapper had the flaw of being hosted on a website. Without that website, it can't function. And because Vyond didn't want it to be there, they requested that it's taken down. Despite what people say about CyanAnimate or whoever causing it, the developer of Wrapper, VisualPlugin, actually contacted Vyond directly asking if it was okay right after release. Offline has fixed this flaw, and the only way to get rid of it is to raid the homes of everyone who has a copy and burn their hard drive. In case it isn't obvious, that won't happen. The torrent download is meant to make it harder to take down as well.

### Why is Business Friendly missing?
Vyond still uses that theme, and unless they abandon the theme I have no good reason to keep it in Offline. It's still available in their paid service, and even if it's an inferior version it's effectively just piracy at that point. Removing it, as well as a few other themes, is to try to avoid hurting Vyond. To quote the original Wrapper dev, VisualPlugin, on why Vyond took it down: "Vyond's objection is my unauthorised use of their intellectual property and their logo. It doesn't matter if it's Comedy World or Business Friendly - it's all theirs." And while they're all still theirs, the original themes are completely abandoned and without Wrapper: Offline they would be completely unarchived beyond what's shown in videos. This project is important to make sure that they are preserved. Business Friendly doesn't need preservation right now.

### Why do you avoid mentioning the original service GoAnimate/Vyond?
Because they are NOT affiliated or endorsing this project in any form. Wrapper: Offline is and almost certainly always will be a completely separate project. That's why the full name is simply Wrapper: Offline, and referring to it with that company's name (such as calling it GoAnimate Wrapper Offline) is wrong.

### Wait, you're using Vyond's copyrighted material, that's illegal!
We are using their copyrighted material, yes. I don't think there's any denying that. But I'm trying to avoid hurting Vyond. I already removed all the themes used in current Vyond (business friendly, whiteboard, etc) because I don't want to intrude on their user base, and I removed their branding as best as I could to separate this project from them and show that we aren't affiliated in any way. I've also added a disclaimer when starting Offline for the first time to make people fully aware of what they're going into. If people want a solid fast engine with professional themes, they'll go to Vyond, and I know there are people that genuinely use their service for business purposes. If people just want to make silly YouTube videos using themes they're nostalgic for, or want to see a historical archive of these old abandoned themes, they'll come here. The way I see it, the content in Offline has all been abandoned and mostly given a negative image  (grounded videos) that makes them avoided, and this is a way for us to preserve them for future people to learn about. By the time the copyright expires, nobody will care enough to preserve it. And I'm a strong believer that software should be preserved once it's been abandoned. If I download and play an old game that's no longer being sold officially, they've already stopped people from giving them money for it. I view this the exact same way. An obscure Garfield puzzle game from a decade ago only a few people remember deserves the same preservation as a famous game everyone played when it released. I've said it before, and I'll keep saying it for likely the rest of my life.
