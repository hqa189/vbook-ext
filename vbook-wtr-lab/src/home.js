function execute() {
    return Response.success([
        { title: "Daily Ranking", input: "https://wtr-lab.com/en/ranking/daily", script: "gen.js" },
        { title: "Weekly Ranking", input: "https://wtr-lab.com/en/ranking/weekly", script: "gen.js" },
        { title: "Monthly Ranking", input: "https://wtr-lab.com/en/ranking/monthly", script: "gen.js" }
    ]);
}
