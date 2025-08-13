document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["GeminiKey"], ({ GeminiKey }) => {
        if (GeminiKey) {
            document.getElementById("GeminiKey").value = GeminiKey;
        }

        document.getElementById("save-btn").addEventListener("click", (e) => {
            e.preventDefault();  

            const apikey = document.getElementById("GeminiKey").value.trim();
            if (!apikey) return;

            chrome.storage.sync.set({ GeminiKey: apikey }, () => {
                document.getElementById("msg").textContent = "API Key saved successfully";

                setTimeout(() => window.close(), 2000);
            });
        });
    });
});
