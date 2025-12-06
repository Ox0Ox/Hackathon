
# fact_checker.py
import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API
try:
  genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
except Exception as e:
  print(f"Error configuring Gemini API: {e}")

def query_google_fact_check(query_text: str) -> dict | None:
  """
  Queries the Google Fact Check Tools API.
  Returns a formatted dictionary if a credible claim is found, otherwise None.
  """
  api_key = os.getenv("FACT_CHECK_API_KEY")
  if not api_key:
    return None
  url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
  params = {"key": api_key, "query": query_text, "languageCode": "en"}
  try:
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    if "claims" in data and data["claims"]:
      claim = data["claims"][0]
      review = claim.get("claimReview", [{}])[0]
      return {
        "text": claim.get("text"),
        "claimant": claim.get("claimant"),
        "rating": review.get("textualRating"),
        "url": review.get("url")
      }
  except requests.exceptions.RequestException as e:
    print(f"Error querying Fact Check API: {e}")
  return None

def analyze_with_gemini(video_metadata: dict, keyframe_paths: list[str]) -> dict:
  """
  Analyzes video assets using the Gemini multi-modal model by acting as an OSINT analyst.
  """
  model = genai.GenerativeModel('gemini-2.5-pro')
  prompt_parts = [
    "You are 'Vigil AI', a world-class OSINT (Open-Source Intelligence) video analyst. Your mission is to investigate a video for signs of misinformation, manipulation, or deepfakery and produce a structured JSON 'Trust Report'.\n\n",
    "You are given the video's metadata and a series of keyframes. Perform the following analysis:\n",
    "1.  **Contextual Investigation:** For each keyframe, use your knowledge to determine if this footage has appeared online before in a different context. Note any discrepancies between the original context and the claims in the video's metadata.\n",
    "2.  **Claim Corroboration:** Based on the video's title and visual content, what is the central claim? Find credible, independent reports that either confirm or deny this event.\n",
    "3.  **Visual Anomaly Detection:** Examine the keyframes for common visual artifacts associated with deepfakes or digital manipulation (e.g., unnatural faces, inconsistent lighting, distorted backgrounds) and check if it seems to be ai generated. You must phrase findings as 'Observed visual red flags include...'\n\n",
    f"**Video Metadata:**\n- Title: {video_metadata.get('title')}\n- Uploader: {video_metadata.get('uploader')}\n\n",
    "**Keyframes:**\n",
  ]
  # Add image data to the prompt
  image_parts = []
  for path in keyframe_paths:
    image_parts.append({"mime_type": "image/jpeg", "data": open(path, "rb").read()})
  # Final instruction to the model
  instruction = "\n\nBased on all evidence, generate ONLY a valid JSON object with the following structure: { \"risk_level\": \"High/Medium/Low Risk/Verified\", \"summary\": \"A single-sentence summary of your most critical finding.\", \"context_check\": { \"status\": \"Context Match/Mismatch/No Earlier Context Found\", \"details\": \"...\" }, \"claim_verification\": { \"status\": \"Corroborated/Uncorroborated/Debunked\", \"details\": \"...\" }, \"visual_red_flags\": [\"List of observed anomalies.\"] }"
  response = model.generate_content(prompt_parts + image_parts + [instruction])
  # Clean up the response to be valid JSON
  cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
  import json
  return json.loads(cleaned_response)