from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

def research_pipeline(topic:str)->dict:

    state={}

    # Search agent
    print("\n"+" ="*50)
    print("Step 1 - Search agent is working")
    print("="*50)

    search_agent=build_search_agent()
    search_result = search_agent.invoke({
        "messages" : [("user", f"Find recent, reliable and detailed information about: {topic}")]
    })
    state["search_results"] = search_result['messages'][-1].content

    print("\n search result ",state['search_results'])

    #step 2 - reader agent
    print("\n"+" ="*50)
    print("Step 2 - Reader agent is working")
    print("="*50)

    reader_agent=build_reader_agent()
    reader_result=reader_agent.invoke({
        "messages": [("user",
            f"Based on the following search results about '{topic}', "
            f"pick the most relevant URL and scrape it for deeper content.\n\n"
            f"Search Results:\n{state['search_results'][:800]}"
        )]
    })

    state['scraped_content']=reader_result['messages'][-1].content
    print("\nScraped content: \n",state['scraped_content'])

    #step-3-writer chain
    print("\n"+" ="*50)
    print("Step 3 - Writer is drafting the report....")
    print("="*50)

    research_combined=(
        f"SEARCH RESULTS: \n {state['search_results']} \n\n"
        f"DETAILED SCRAPED CONTENT : \n {state['scraped_content']}"
    )

    state["report"]=writer_chain.invoke({
        "topic":topic,
        "research":research_combined
    })

    print("\n Final Report\n",state['report'])

    #Critic report
    print("\n"+" ="*50)
    print("Step 3 - Writer is drafting the report....")
    print("="*50)

    # critic_chain.invoke({
    #     "report":state['report']
    # })

    state["feedback"]=critic_chain.invoke({
        "report":state['report']
    })

    print("\n critic report \n",state["feedback"])
    return state



# if __name__ =="__main__":
#     topic=input("\n Enter the research topic : ")
#     research_pipeline(topic)


# from agents import build_search_agent, writer_chain, critic_chain
# from tools import scrape_url
# import re


# def extract_url(text):
#     """Extract first valid URL from text"""
#     urls = re.findall(r'https?://\S+', str(text))
#     return urls[0] if urls else None


# def research_pipeline(topic: str) -> dict:

#     state = {}

#     # -------------------------------
#     # Step 1 - Search Agent
#     # -------------------------------
#     print("\n" + "="*50)
#     print("Step 1 - Search agent is working")
#     print("="*50)

#     search_agent = build_search_agent()
#     search_result = search_agent.invoke({
#         "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
#     })

#     state["search_results"] = search_result['messages'][-1].content
#     print("\nSearch result:\n", state['search_results'])

#     # -------------------------------
#     # Step 2 - Extract URL + Scrape
#     # -------------------------------
#     print("\n" + "="*50)
#     print("Step 2 - Scraping is working")
#     print("="*50)

#     url = extract_url(state["search_results"])

#     if url:
#         print("Extracted URL:", url)
#         scraped_content = scrape_url.invoke(url)
#     else:
#         print("No URL found in search results")
#         scraped_content = "No valid URL found for scraping."

#     state["scraped_content"] = scraped_content
#     print("\nScraped content:\n", state["scraped_content"])

#     # -------------------------------
#     # Step 3 - Writer
#     # -------------------------------
#     print("\n" + "="*50)
#     print("Step 3 - Writer is drafting the report")
#     print("="*50)

#     research_combined = (
#         f"SEARCH RESULTS:\n{state['search_results']}\n\n"
#         f"SCRAPED CONTENT:\n{state['scraped_content']}"
#     )

#     state["report"] = writer_chain.invoke({
#         "topic": topic,
#         "research": research_combined
#     })

#     print("\nFinal Report:\n", state["report"])

#     # -------------------------------
#     # Step 4 - Critic
#     # -------------------------------
#     print("\n" + "="*50)
#     print("Step 4 - Critic is reviewing")
#     print("="*50)

#     state["feedback"] = critic_chain.invoke({
#         "report": state["report"]
#     })

#     print("\nCritic feedback:\n", state["feedback"])

#     return state


# if __name__ == "__main__":
#     topic = input("\nEnter the research topic: ")
#     research_pipeline(topic)