import os
import boto3
from dotenv import load_dotenv

load_dotenv()


class NovaService:

    def __init__(self):

        self.client = boto3.client(
            service_name="bedrock-runtime",
            region_name=os.getenv("AWS_REGION")
        )

        self.model_id = os.getenv("MODEL_ID")

    async def generate_website(self, prompt: str):

        response = self.client.converse(
            modelId=self.model_id,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "text": f"""
                            Generate a complete modern website.

                            IMPORTANT:
                            Return raw HTML only.
                            Do NOT wrap response in markdown.
                            Do NOT use ```html.
                            Do NOT use ```.

                            Return only valid HTML.
                            User Request:
                            {prompt}

                            Rules:
                            1. Output HTML only
                            2. Use semantic HTML
                            3. Include hero section
                            4. Include features section
                            5. Include contact section
                            6. No markdown
                            7. No explanation
                            8. Return only HTML
                            """
                        }
                    ]
                }
            ]
        )

        

        html = response["output"]["message"]["content"][0]["text"]

        html = html.replace("```html", "")
        html = html.replace("```", "")
        html = html.strip()

        return html

    async def stream_website(self, prompt: str):
        yield "Streaming..."