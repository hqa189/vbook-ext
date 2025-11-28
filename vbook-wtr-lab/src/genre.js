function execute() {
    // Hardcoded list of genres based on wtr-lab
    return Response.success([
        { title: "Action", input: "https://wtr-lab.com/en/novel-list?genre=1", script: "gen.js" },
        { title: "Adventure", input: "https://wtr-lab.com/en/novel-list?genre=2", script: "gen.js" },
        { title: "Fantasy", input: "https://wtr-lab.com/en/novel-list?genre=9", script: "gen.js" },
        { title: "Romance", input: "https://wtr-lab.com/en/novel-list?genre=26", script: "gen.js" },
        { title: "System", input: "https://wtr-lab.com/en/novel-finder?ti=696", script: "gen.js" }
    ]);
}
