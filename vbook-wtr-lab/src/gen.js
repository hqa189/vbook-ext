function execute(url, page) {
    if (!page) page = 1;
    if (url.indexOf("?") > -1) {
        url = url + "&page=" + page;
    } else {
        url = url + "?page=" + page;
    }

    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var novels = [];
        // Selector for novel list items.
        // Based on inspection, usually `div.novel-item` or similar.
        // Let's try a generic `div` that contains `a[href*='/novel/']` and `img`.

        var items = doc.select("div.row > div"); // Bootstrap style often used
        // Or better, look for the list container.

        // Fallback: Find all links to novels.
        var links = doc.select("a[href*='/novel/']");
        for (var i = 0; i < links.size(); i++) {
            var e = links.get(i);
            var name = e.text();
            var link = e.attr("href");

            // Try to find cover image inside or near the link
            var cover = e.select("img").attr("src");
            if (!cover) {
                // Maybe the link is the title and the image is in a sibling link?
                // This is tricky without exact DOM.
                // Let's assume the link wraps the image or is the title.
            }

            if (name && link && link.match(/\/novel\/\d+\//)) {
                novels.push({
                    name: name,
                    link: link,
                    host: "https://wtr-lab.com",
                    cover: cover || "",
                    description: ""
                });
            }
        }

        // Deduplicate
        var uniqueNovels = [];
        var seen = {};
        for (var i = 0; i < novels.length; i++) {
            if (!seen[novels[i].link]) {
                seen[novels[i].link] = true;
                uniqueNovels.push(novels[i]);
            }
        }

        var next = (uniqueNovels.length > 0) ? (parseInt(page) + 1) : null;
        return Response.success(uniqueNovels, next);
    }
    return null;
}
