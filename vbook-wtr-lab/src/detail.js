function execute(url) {
    url = url.replace(/\/$/, "");
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var name = doc.select("div.novel-header h1").text();
        var cover = doc.select("div.novel-cover img").attr("src");
        var author = doc.select("div.novel-details a[href*='/author/']").text();
        var description = doc.select("div#contents-about").text().replace("Show more", "").trim();
        var host = "https://wtr-lab.com";

        var genreElements = doc.select("div.novel-header a[href*='/en/novel-list?genre=']");
        var genres = [];
        for (var i = 0; i < genreElements.size(); i++) {
            var e = genreElements.get(i);
            genres.push({
                title: e.text(),
                input: e.attr("href"),
                script: "genre.js"
            });
        }

        return Response.success({
            name: name,
            cover: cover,
            host: host,
            author: author,
            description: description,
            detail: description,
            ongoing: true,
            genres: genres
        });
    }
    return null;
}
