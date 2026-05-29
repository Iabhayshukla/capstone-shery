import os
from dotenv import load_dotenv

load_dotenv()

class NovaService:

    async def generate_website(self, prompt: str):

        api_key = os.getenv("NOVA_API_KEY")

        print("KEY FOUND:", api_key[:10])

        return f"""
        <section class="p-20 bg-black text-white">
            <h1>{prompt}</h1>
            <p>Nova Service Connected Successfully</p>
        </section>
        """

    async def stream_website(self, prompt: str):
        yield "Streaming started..."