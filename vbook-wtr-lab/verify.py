import urllib.request
import re
import json
import ssl

# Ignore SSL errors
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_html(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        return response.read().decode('utf-8')

def verify_detail():
    url = "https://wtr-lab.com/en/novel/28524/nba-godfather-i-have-10-000-passive-auras"
    print(f"Fetching {url}...")
    html = get_html(url)
    
    # Regex for title: <div class="novel-header"> ... <h1>Title</h1>
    # This is tricky with regex on full HTML.
    # Let's look for specific unique strings.
    
    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', html)
    print(f"Title found: {title_match.group(1) if title_match else 'Not found'}")
    
    # Author
    author_match = re.search(r'/author/[^"]*">([^<]*)</a>', html)
    print(f"Author found: {author_match.group(1) if author_match else 'Not found'}")
    
    # Description (approximate)
    # Look for "contents-about"
    if "contents-about" in html:
        print("Description container found.")
    else:
        print("Description container NOT found.")

def verify_toc():
    url = "https://wtr-lab.com/en/novel/28524/nba-godfather-i-have-10-000-passive-auras"
    # TOC might be loaded via JS or on a separate tab, but usually present in source or accessible.
    # The browser inspection showed it under #contents-toc.
    # Let's check if that div exists in the initial HTML.
    html = get_html(url)
    if "contents-toc" in html:
        print("TOC container found.")
        # Check for chapter links
        if re.search(r'href="[^"]*/chapter-\d+"', html):
            print("Chapter links found.")
        else:
            print("Chapter links NOT found (might be dynamic).")
    else:
        print("TOC container NOT found (might be dynamic).")

def verify_translation_api():
    api_key = "AIzaSyAw_nFl6bdaxsbmtpImwEEoBm7_nxmDdTM"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    data = {
        "contents": [{
            "parts": [{
                "text": "Hello, world!"
            }]
        }]
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode('utf-8'))
            print("Translation API Test: Success")
            # print(result)
    except Exception as e:
        print(f"Translation API Test: Failed - {e}")

if __name__ == "__main__":
    try:
        verify_detail()
        verify_toc()
        verify_translation_api()
    except Exception as e:
        print(f"Verification failed: {e}")
