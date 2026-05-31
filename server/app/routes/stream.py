# from fastapi import APIRouter
# from fastapi.responses import StreamingResponse
# from app.services.nova_service import NovaService

# router = APIRouter()


# @router.get("/stream")
# async def stream(prompt: str):

#     nova = NovaService()

#     async def event_generator():

#         async for chunk in nova.stream_website(prompt):

#             yield f"data: {chunk}\n\n"

#     return StreamingResponse(
#         event_generator(),
#         media_type="text/event-stream"
#     )


from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.nova_service import NovaService
from app.services.project_service import save_project

router = APIRouter()


@router.get("/stream")
async def stream(prompt: str):

    nova = NovaService()

    async def event_generator():

        full_html = ""

        async for chunk in nova.stream_website(prompt):

            full_html += chunk

            yield f"data: {chunk}\n\n"

        save_project(
            prompt,
            full_html
        )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )