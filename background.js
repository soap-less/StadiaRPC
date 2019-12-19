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

//Shout out to u/kirbyfan64sos for letting me know about .map(Number)
let localVersion = chrome.runtime.getManifest()["version"];
chrome.runtime.onStartup.addListener(function() {
    getLiveVersion().then(() => {
        localVersion = localVersion.split('.').map(Number);
        liveVersion = liveVersion.split('.').map(Number);
        for (i = 0; i < liveVersion.length; i++){
            if (liveVersion[i] > localVersion[i]) {
                chrome.browserAction.setBadgeText({text: "!"});
                break;
            } else if (i === liveVersion.length - 1) {
                chrome.browserAction.setBadgeText({text: ""});
            }
        }
    });
});