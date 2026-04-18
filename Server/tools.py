from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os
from dotenv import load_dotenv
from rich import print
load_dotenv()

tavily=TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def web_search(query : str) -> str :
    """Search the web for recent and reliable infromation on a topic . Returns Titles , URLS ans snippets"""
    results=tavily.search(query=query,max_results=5)
    out=[]
    for r in results['results']:
        out.append(f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['content'][:300]}\n")
    
    # print(out)

    return "\n----\n".join(out)

# print(web_search.invoke("What is todays bracking news"))



@tool
def scrape_url(url: str) -> str:
    """Scrape and return clean text content from a given URL for deeper reading."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        resp = requests.get(url, timeout=8, headers=headers)
        resp.raise_for_status()

        
        try:
            soup = BeautifulSoup(resp.text, "lxml")
        except:
            soup = BeautifulSoup(resp.text, "html.parser")

        # Remove unwanted elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
            tag.decompose()

        # Extract clean text
        text = soup.get_text(separator="\n", strip=True)

        # Clean empty lines
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = "\n".join(lines)

        return clean_text[:3000]

    except Exception as e:
        return f"Could not scrape URL: {str(e)}"
    
# print(scrape_url.invoke("https://www.usatoday.com/"))    