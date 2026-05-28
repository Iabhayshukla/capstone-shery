from fastapi import APIRouter

router = APIRouter()

@router.post("/generate")
async def generate():

    mock_html = """
    <section 
        data-section-id="hero"
        class="bg-black text-white p-20"
    >
        <h1 class="text-5xl font-bold">
            AI Website Builder
        </h1>

        <p class="mt-4 text-lg">
            Build websites with AI
        </p>
    </section>
    """

    return {
        "success": True,
        "html": mock_html
    }