import asyncio

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()


async def event_generator():

    chunks = [
        "<section data-section-id='hero'>",
        "<h1 class='text-5xl'>",
        "AI Website Builder",
        "</h1>",
        "<p>Build websites with AI</p>",
        "</section>"
    ]

    for chunk in chunks:

        yield f"data: {chunk}\n\n"

        await asyncio.sleep(1)


@router.get("/stream")
async def stream():

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )