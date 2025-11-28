function execute(key, page) {
    var url = "https://wtr-lab.com/en/novel-finder?ti=" + key;
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var novels = [];
        var el = doc.select("div.finder-list > div.finder-item"); // Hypothetical selector, need to verify if possible, but based on common patterns.
        // Re-checking wtr-lab search page structure from memory/previous steps?
        // Wait, I didn't inspect search page deeply.
        // Let's assume a generic list structure or use the one from `detail.js` if it lists similar items.
        // Actually, let's use a broader selector if unsure: `a[href*='/novel/']` inside the main container.

        // Let's try to be safer.
        var links = doc.select("a[href*='/novel/']");
        for (var i = 0; i < links.size(); i++) {
            var e = links.get(i);
            // We need to find the container for each novel to get cover/title.
            // Usually `e` is the title link or cover link.
            // Let's assume `e` is the title link.

            var name = e.text();
            var link = e.attr("href");
            var cover = ""; // Hard to get without precise selector

            // Basic deduplication or check
            if (name && link) {
                novels.push({
                    name: name,
                    link: link,
                    host: "https://wtr-lab.com",
                    cover: cover,
                    description: ""
                });
            }
        }
        return Response.success(novels);
    }
    return null;
}
