let currentVersion = ""

async function getVersion() {
    let response = await fetch("https://raw.githubusercontent.com/soap-less/StadiaRPC/master/manifest.json");
    let json = await response.json();
    currentVersion = json["version"];
};

chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    chrome.tabs.sendMessage(request.tab, request.info, function (response) {
        sendResponse(response);
    });
    return true;
});

chrome.runtime.onStartup.addListener(function() {
    getVersion().then(() => {
        let manifestVersion = chrome.runtime.getManifest()["version"];
        if (manifestVersion !== currentVersion) {
            chrome.browserAction.setBadgeText({text: "!"});
        }
    });
});