from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import video_processor
import fact_checker

app = FastAPI(
    title="Vigil AI Lite API",
    description="Analyzes video URLs for misinformation using a Triage & Escalate model."
)

# Configure CORS to allow requests from the React frontend
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    video_url: HttpUrl

@app.get("/", tags=["Status"])
def read_root():
    return {"status": "Vigil AI Lite API is running."}

@app.post("/analyze", tags=["Analysis"])
async def analyze_video(request: VideoRequest):
    """
    Main endpoint to analyze a video. It implements the 'Triage & Escalate' model.
    """
    files_to_clean = []
    try:
        # 1. Download video and get metadata
        metadata = video_processor.download_video_and_get_metadata(str(request.video_url))
        video_path = metadata.get("video_path")
        if video_path:
            files_to_clean.append(video_path)
            print(metadata)
        video_title = metadata.get("title", "")

        # 2. TRIAGE: Check with Google Fact Check API first
        fact_check_result = fact_checker.query_google_fact_check(query_text=video_title)
        
        if fact_check_result and fact_check_result.get("rating"):
            return {
                "source": "Google Fact-Check Database",
                "report": fact_check_result
            }

        # 3. ESCALATE: If no result, proceed with Gemini analysis
        keyframes = video_processor.extract_keyframes(video_path)
        files_to_clean.extend(keyframes)
        
        if not keyframes:
            raise HTTPException(status_code=400, detail="Could not extract frames from video.")
            
        gemini_report = fact_checker.analyze_with_gemini(metadata, keyframes)
        
        return {
            "source": "Vigil AI Generative Analysis",
            "report": gemini_report
        }

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")
    finally:
        # 4. Cleanup all temporary files
        video_processor.cleanup_files(files_to_clean)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

