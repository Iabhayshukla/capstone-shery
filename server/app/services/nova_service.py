import os
import boto3
from dotenv import load_dotenv
from fastapi import HTTPException
from app.prompts.website_prompt import build_website_prompt
import logging

logger = logging.getLogger(__name__)

load_dotenv()


class NovaService:

    def __init__(self):
        self.client = boto3.client(
            service_name="bedrock-runtime",
            region_name=os.getenv("AWS_REGION")
        )

        self.model_id = os.getenv("MODEL_ID")

    async def generate_website(self, user_prompt: str):
        if not user_prompt.strip():
            raise HTTPException(
                status_code=400,
                detail="Prompt cannot be empty"
            )
        try:

            response = None

            for attempt in range(3):

                try:

                    response = self.client.converse(
                        modelId=self.model_id,
                        inferenceConfig={
                            "temperature": 0.7,
                            "topP": 0.9,
                            "maxTokens": 8000
                        },
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "text": build_website_prompt(user_prompt)
                                    }
                                ]
                            }
                        ]
                    )

                    break

                except Exception as e:

                    logger.warning(
                        f"Attempt {attempt + 1} failed: {e}"
                    )

                    if attempt == 2:
                        raise HTTPException(
                            status_code=500,
                            detail="Website generation failed after 3 attempts"
                        )

            html = response["output"]["message"]["content"][0]["text"]

            html = html.replace("```html", "")
            html = html.replace("```", "")
            html = html.strip()

            for asset in [
                "hero-image.jpg",
                "hero.jpg",
                "banner.jpg",
                "logo.png",
                "background.jpg",
                "image.jpg"
            ]:
                html = html.replace(asset, "")

            return html

        except Exception as e:
            logger.error(f"Generation Error: {e}")
            raise HTTPException(status_code=500,detail="Website generation failed")

    async def stream_website(self, prompt: str):
        if not prompt.strip():
            raise HTTPException(
                status_code=400,
                detail="Prompt cannot be empty"
            )
        try:

            response = self.client.converse_stream(
                modelId=self.model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "text": build_website_prompt(prompt)
                            }
                        ]
                    }
                ]
            )

            full_html = ""

            for event in response["stream"]:

                if "contentBlockDelta" in event:

                    delta = event["contentBlockDelta"]

                    if "delta" in delta:

                        if "text" in delta["delta"]:

                            text = delta["delta"]["text"]

                            text = text.replace("```html", "")
                            text = text.replace("```", "")
                            text = text.replace('\\"', '"')
                            text = text.replace("html\n<!DOCTYPE", "<!DOCTYPE")
                            text = text.replace("html\r\n<!DOCTYPE", "<!DOCTYPE")

                            full_html += text

                            yield text

            logger.info(f"Generated HTML Length: {len(full_html)}")

        except Exception as e:
            logger.error(f"Streaming Error: {e}")
            yield """
<!DOCTYPE html>
<html>
<body style="font-family:Arial;padding:40px">
<h1>Generation Failed</h1>
<p>Please try again.</p>
</body>
</html>
"""   

    async def test_stream(self, prompt: str):

        response = self.client.converse_stream(
            modelId=self.model_id,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        )

        return  response