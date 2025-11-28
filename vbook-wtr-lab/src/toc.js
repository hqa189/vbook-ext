function execute(url) {
    // Ensure we are on the TOC tab if not already (though the URL passed might be the main novel URL)
    // wtr-lab loads TOC dynamically or via a specific tab.
    // Based on inspection, the TOC is in div#contents-toc.
    // If the passed URL is the main novel URL, we might need to fetch it.
    // The previous inspection showed TOC items are available on the main page under the tab.

    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var chapters = [];
        var el = doc.select("div#contents-toc a");
        for (var i = 0; i < el.size(); i++) {
            var e = el.get(i);
            chapters.push({
                name: e.text(),
                url: e.attr("href"),
                host: "https://wtr-lab.com"
            });
        }
        return Response.success(chapters);
    }
    return null;
}
