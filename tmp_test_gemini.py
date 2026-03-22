import asyncio
from graqle.backends.api import GeminiBackend

async def test():
    backend = GeminiBackend()
    print("Sending prompt...")
    resp = await backend.generate("Hello, are you Gemini?", max_tokens=100)
    print("Response:", resp)

if __name__ == "__main__":
    asyncio.run(test())
