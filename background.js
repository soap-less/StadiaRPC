const url = chrome.runtime.getURL('games.json');
let games = {};
fetch(url).then(resp => resp.json()).then(json => games = json);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    Object.keys(games).forEach(gameName => {
        let game = games[gameName];
        if (game["play"] === tab.url) {
            alert(tab.url)
        }
    });
});