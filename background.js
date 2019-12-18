chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    chrome.tabs.sendMessage(request.tab, request.info, function (response) {
        sendResponse(response);
    });
    return true;
});

let liveVersion = ""
async function getLiveVersion() {
    let response = await fetch("https://raw.githubusercontent.com/soap-less/StadiaRPC/master/manifest.json");
    let json = await response.json();
    liveVersion = json["version"];
};

//Shout out to StackOverflow for letting me know .split exists. Splits the version into a list of 3 numbers and then compares them.
chrome.runtime.onStartup.addListener(function() {
    getLiveVersion().then(() => {
        let localVersion = chrome.runtime.getManifest()["version"];
        localVersion = localVersion.split('.');
        liveVersion = liveVersion.split('.');

        for (i = 0; i < localVersion.length; i++){
            localVersion[i] = parseInt(localVersion[i])
        }

        for (i = 0; i < liveVersion.length; i++){
            liveVersion[i] = parseInt(liveVersion[i])
        }

        alert(localVersion.toString());
        alert(liveVersion.toString());

        for (i = 0; i < liveVersion.length; i++){
            if (liveVersion[i] > localVersion[i]) {
                alert("hi")
                chrome.browserAction.setBadgeText({text: "!"});
                break;
            } else if (i === liveVersion.length - 1) {
                chrome.browserAction.setBadgeText({text: ""});
            }
        }
    });
});