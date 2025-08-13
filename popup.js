document.getElementById("summerizer").addEventListener("click", (e) => {


    const result = document.getElementById("result");

    const options = document.getElementById("summary-type").value;
    console.log(options)

    // checking for api key

    chrome.storage.sync.get(["GeminiKey"], ({ GeminiKey }) => {
        if (!GeminiKey) {
            result.textContent = "API Key not found. Please set it in the options page.";
            return;
        }

        // gettitng text from current page 

        result.textContent = "Extracting article text...";

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async ({ articleText }) => {
                if (!articleText) {
                    result.textContent = "Couldn't extract article text from this page...";
                    return;
                }

                try {
                    let res = await getResponse(articleText, options, GeminiKey);
                    result.textContent = res

                } catch (error) {

                    result.textContent = "An error occurred while generating the summary. Please try again later.";
                }


            })
        })
    })





})


document.getElementById("copy-btn").addEventListener("click", () => {

    const text = document.getElementById("result").textContent;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("copy-btn");
        btn.textContent = "Copied!";
        setTimeout(() => {
            btn.textContent = "Copy";
        }, 2000);
    })
})
async function getResponse(text, type, apikey) {
    let maxLimit = 20000;

    const trimmedText = text.length > maxLimit ? text.slice(0, maxLimit) + "..." : text;

    const typeList = {
        "brief": `Summarize in 2-3 sentences:\n\n${trimmedText}`,
        "detailed": `Provide a detailed summary:\n\n${trimmedText}`,
        "bullet-point": `Give summary in 5-6 bullet points (start each line with "-"):\n\n${trimmedText}`,
    };

    const prompt = typeList[type] || typeList.brief;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        throw error;
    }
}

