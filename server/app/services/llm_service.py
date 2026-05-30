from app.services.nova_service import NovaService

nova_service = NovaService()

async def generate_website(user_prompt: str):
    return await nova_service.generate_website(user_prompt)