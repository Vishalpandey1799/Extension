chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["GeminiKey"], (result) => {
        if (!result.GeminiKey) {
            chrome.tabs.create({
                url: "options.html"
            });
        }
    });
});
