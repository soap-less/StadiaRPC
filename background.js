chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if(request.action == "presence") {
      chrome.tabs.sendMessage(request.tab, {action: 'presence', info: request.info}, function(response){
        sendResponse(response);
      });

    } else if(request.action == "join"){
        chrome.tabs.create({url: 'https://stadia.google.com/links?party_invite=' + request.secret});
        
    } else if(request.action == "joinRequest"){
      chrome.tabs.sendMessage(request.tab, {action: 'joinRequest', user: request.user}, function(response){
        sendResponse(response);
      });
    }
    
    return true;
});

// Register Party
chrome.runtime.sendMessage("agnaejlkbiiggajjmnpmeheigkflbnoo", {action: 'party', clientId: '648430151390199818'}, function(response) {
    console.log('Party registred', response);
});