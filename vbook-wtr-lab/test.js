const fs = require('fs');
const path = require('path');
const https = require('https');

// Mock Response object
global.Response = {
    success: (data, next) => {
        return { status: 'success', data, next };
    },
    error: (msg) => {
        return { status: 'error', message: msg };
    }
};

// Mock fetch
global.fetch = (url, options) => {
    // Synchronous mock is hard, but vbook uses synchronous-like fetch or async awaited.
    // In our scripts we didn't use await, so vbook environment is likely synchronous or we need to handle promises.
    // However, Node.js fetch is async.
    // For this test script to work with the extension code which assumes synchronous `fetch(url).html()`,
    // we need to mock it carefully.
    // BUT: The extension code `var response = fetch(url); var doc = response.html();` implies synchronous behavior.
    // We can't easily make Node.js http synchronous.
    // We will use `child_process.execSync` with `curl` or similar if we really need sync, 
    // OR we rewrite the test to load the file content from disk if we pre-downloaded it,
    // OR we use a library like `sync-request`.

    // For simplicity, let's assume we can use `sync-request` if installed, but we can't install packages.
    // So we will use a hack: `child_process.execSync` to curl.

    const execSync = require('child_process').execSync;

    return {
        ok: true,
        html: () => {
            // Fetch real content
            try {
                // Use curl to get content. 
                // Note: This might be slow.
                console.log("Fetching: " + url);
                // Basic curl, might need user agent.
                let cmd = `curl -s -L -A "Mozilla/5.0" "${url}"`;
                // If POST
                if (options && options.method === 'POST') {
                    // Escape body for command line is hard.
                    // For the translation API, we need to send JSON.
                    // Let's skip mocking the translation API call via curl for now and just return a mock response for translation
                    // UNLESS we really want to test the API key.
                    // Let's try to test the API key.
                    let body = JSON.stringify(options.body).replace(/"/g, '\\"'); // Very basic escaping
                    // This is too fragile for Windows cmd.

                    // Alternative: Use a real async fetch and rewrite the test runner to be async, 
                    // but the extension code is written in a sync style (vbook engine).
                    // We can't change the extension code.
                    // We can't run sync code in Node easily.

                    // OK, for the purpose of this test, we will MOCK the network responses for the novel pages
                    // by reading from a local cache or just failing if we can't.
                    // BUT we want to verify it works against the real site.

                    // Let's use a helper to download files first? No.

                    // Let's use `curl` for GET requests (novel pages).
                    // For POST (Gemini), we might just mock it or try `curl` carefully.

                    if (url.includes("generativelanguage.googleapis.com")) {
                        // Mock Gemini response to avoid complex curl POST on Windows
                        console.log("Mocking Gemini API call...");
                        return {
                            json: () => ({
                                candidates: [{
                                    content: {
                                        parts: [{ text: "This is a translated text from Gemini (Mocked for Test)." }]
                                    }
                                }]
                            })
                        };
                    }
                }

                let content = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

                // Mock Document object (cheerio-like)
                // We need a simple parser. Regex? Too brittle.
                // We can't import cheerio.
                // We will use a very simple regex-based mock for the specific selectors we use.

                return {
                    select: (selector) => {
                        return {
                            text: () => {
                                // Regex to find text inside selector
                                // This is very limited.
                                if (selector.includes("h1")) return "Mock Title";
                                if (selector.includes("author")) return "Mock Author";
                                if (selector.includes("about")) return "Mock Description";
                                return "";
                            },
                            attr: (attr) => {
                                if (attr === "src") return "http://mock.com/cover.jpg";
                                if (attr === "href") return "/novel/123/mock";
                                return "";
                            },
                            size: () => 1,
                            get: (i) => ({
                                text: () => "Mock Item",
                                attr: (a) => "/novel/123/mock",
                                select: () => ({ attr: () => "" })
                            })
                        };
                    },
                    html: () => content // Return full HTML string
                };
            } catch (e) {
                console.error("Fetch failed: " + e.message);
                return { ok: false };
            }
        }
    };
};

// Load and execute scripts
function runTest() {
    try {
        // Test Detail
        const detailScript = fs.readFileSync(path.join(__dirname, 'src/detail.js'), 'utf8');
        const detailFn = new Function('url', detailScript + '\nreturn execute(url);');
        console.log("Testing detail.js...");
        const detailResult = detailFn("https://wtr-lab.com/en/novel/28524/nba-godfather-i-have-10-000-passive-auras");
        console.log("Detail Result:", detailResult);

        // Test TOC
        const tocScript = fs.readFileSync(path.join(__dirname, 'src/toc.js'), 'utf8');
        const tocFn = new Function('url', tocScript + '\nreturn execute(url);');
        console.log("\nTesting toc.js...");
        const tocResult = tocFn("https://wtr-lab.com/en/novel/28524/nba-godfather-i-have-10-000-passive-auras");
        console.log("TOC Result (first 2):", tocResult && tocResult.data ? tocResult.data.slice(0, 2) : tocResult);

        // Test Chap (Translation)
        const chapScript = fs.readFileSync(path.join(__dirname, 'src/chap.js'), 'utf8');
        const chapFn = new Function('url', chapScript + '\nreturn execute(url);');
        console.log("\nTesting chap.js...");
        const chapResult = chapFn("https://wtr-lab.com/en/novel/28524/nba-godfather-i-have-10-000-passive-auras/chapter-1");
        console.log("Chap Result:", chapResult);

    } catch (e) {
        console.error("Test failed:", e);
    }
}

runTest();
