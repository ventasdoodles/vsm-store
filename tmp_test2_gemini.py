import asyncio
from openai import AsyncOpenAI
import logging

logging.basicConfig(level=logging.DEBUG)

async def test():
    client = AsyncOpenAI(
        api_key="AIzaSyAOKBHnjrXczi6QER59yZm4e5p00IINtLg",
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    print("Calling API...")
    resp = await client.chat.completions.create(
        model="gemini-2.5-pro",
        messages=[{"role": "user", "content": "Hello"}],
        max_tokens=100
    )
    print("Got response:", resp.choices[0].message.content)

if __name__ == "__main__":
    asyncio.run(test())
