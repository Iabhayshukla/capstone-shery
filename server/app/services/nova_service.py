import os
import boto3
from dotenv import load_dotenv
from app.prompts.website_prompt import build_website_prompt

load_dotenv()


class NovaService:

    def __init__(self):
        self.client = boto3.client(
            service_name="bedrock-runtime",
            region_name=os.getenv("AWS_REGION")
        )

        self.model_id = os.getenv("MODEL_ID")

    async def generate_website(self, user_prompt: str):

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

        

        html = response["output"]["message"]["content"][0]["text"]

        html = html.replace("```html", "")
        html = html.replace("```", "")
        for asset in [
        "hero-image.jpg",
        "hero.jpg",
        "banner.jpg",
        "logo.png",
        "background.jpg",
        "image.jpg"
    ]:
        
            html = html.replace(asset, "")
        html = html.strip()

        return html

    async def stream_website(self, prompt: str):

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

                        full_html += text

                        yield text.replace("\n", " ")
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