function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var contentDiv = doc.select("div#chapter-content");

        // Remove ads or unwanted elements if any (optional)
        // contentDiv.select(".ad").remove();

        var originalText = contentDiv.html(); // Get HTML to preserve paragraphs

        // Translation Logic
        var apiKey = "AIzaSyAw_nFl6bdaxsbmtpImwEEoBm7_nxmDdTM"; // User provided key
        var translatedText = translateContent(originalText, apiKey);

        return Response.success(translatedText);
    }
    return null;
}

function translateContent(htmlContent, apiKey) {
    // Simple text extraction for translation to avoid breaking HTML structure too much
    // Ideally we should traverse nodes, but for simplicity we'll translate text blocks.
    // However, sending HTML to Gemini is often fine if we ask it to preserve structure.

    // Let's try to translate the text content of paragraphs.
    // Parsing HTML in JS environment without full DOM might be tricky, 
    // but vbook uses Jsoup (Java) or similar.
    // Here we are in JS. `doc` is a Document object from vbook's internal engine.
    // `contentDiv` is an Element.

    // Strategy: Get text, translate, return text. 
    // OR: Send chunks of text to Gemini.

    // Let's try a robust approach:
    // 1. Clean the HTML to just text/paragraphs.
    // 2. Send to Gemini.

    // Since we can't easily parse/reconstruct HTML complexly here without libraries,
    // and `Html.parse` returns a Java-like object wrapper,
    // let's try to just get the text and format it.

    // Actually, `contentDiv.html()` gives us the string.
    // Let's strip tags and just translate text? No, we lose formatting.

    // Better approach:
    // Use Gemini to translate the HTML directly, asking it to preserve tags.
    // But we must be careful about context window.

    var prompt = "Translate the following novel chapter from English to Vietnamese. Preserve the HTML tags and structure exactly. Do not add any introductory or concluding text. Just the translated content:\n\n" + htmlContent;

    var apiResponse = fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    if (apiResponse.ok) {
        var json = apiResponse.json();
        if (json.candidates && json.candidates.length > 0 && json.candidates[0].content && json.candidates[0].content.parts.length > 0) {
            return json.candidates[0].content.parts[0].text;
        }
    }

    // Fallback to original if translation fails
    return htmlContent + "<br><br><b>(Translation failed, showing original)</b>";
}
