# v0.1.0
# { "Depends": "py-genlayer:latest" }

from genlayer import *
import json
import base64

class ImageDetector(gl.Contract):
    last_result: str

    def __init__(self):
        self.last_result = ""

    @gl.public.write
    def analyze_image(self, image_url: str) -> None:
        prompt = f"""
Look at the image at this URL and determine:
1. Is it AI-generated or a real photograph?
2. Confidence score from 1 to 10
3. Brief reason for your decision (one sentence)

Respond using ONLY the following format:
{{"image_type": "AI" or "Real", "score": 5, "reason": "your reason here"}}
It is mandatory that you respond only using the JSON format above,
nothing else. Don't include any other words or characters,
your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parseable by a JSON parser without errors.

Image URL: {image_url}
"""

        def get_result():
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            return result

        raw = gl.eq_principle.prompt_comparative(
            get_result, "image_type must be the same"
        )
        self.last_result = raw

    @gl.public.view
    def get_last_result(self) -> str:
        return self.last_result