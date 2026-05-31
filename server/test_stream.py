from app.services.nova_service import NovaService
import asyncio

async def main():

    nova = NovaService()

    async for chunk in nova.stream_website(
        "Create a SaaS landing page"
    ):
        print(chunk, end="", flush=True)

asyncio.run(main())