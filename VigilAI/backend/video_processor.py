import cv2
import yt_dlp
import os
import uuid
import numpy as np  # Added for placeholder image generation

TEMP_DIR = "temp_media"

def setup_temp_dir():
    """Ensures the temporary directory exists."""
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)

def download_video_and_get_metadata(url: str) -> dict:
    """
    Downloads a video from a URL to a temporary path and extracts metadata.
    Returns a dictionary with video_path, title, uploader.
    """
    setup_temp_dir()
    video_id = str(uuid.uuid4())
    output_template = os.path.join(TEMP_DIR, f"{video_id}.%(ext)s")
    
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': output_template,
        'quiet': False,  # Set to False to see download progress
        'socket_timeout': 30,  # Increase timeout
        'retries': 10,  # Increase number of retries
        'fragment_retries': 10,  # Increase fragment retries
        'skip_download': False,  # Set to True for testing without downloading
        'noplaylist': True,  # Only download single video, not playlist
    }
    
    try:
        print(f"Starting download from {url}...")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            video_path = ydl.prepare_filename(info_dict)
            print(f"Successfully downloaded to {video_path}")
            return {
                "video_path": video_path,
                "title": info_dict.get('title', 'N/A'),
                "uploader": info_dict.get('uploader', 'N/A'),
                "description": info_dict.get('description', 'N/A')[:500]  # Limit description length
            }
    except Exception as e:
        print(f"Error downloading video: {str(e)}")
        # For testing purposes, you can return a mock response when download fails
        # This allows the rest of the pipeline to be tested even if YouTube connection fails
        mock_video_path = os.path.join(TEMP_DIR, f"{video_id}_mock.mp4")
        with open(mock_video_path, 'wb') as f:
            f.write(b'MOCK VIDEO')  # Create a small dummy file
        
        return {
            "video_path": mock_video_path,
            "title": "Mock video due to download error",
            "uploader": "System",
            "description": f"Download failed with error: {str(e)}"
        }

def extract_keyframes(video_path: str, num_frames: int = 1) -> list[str]:
    """
    Extracts a specified number of frames from a video and saves them as JPEGs.
    Returns a list of file paths to the extracted frames.
    If the video cannot be processed, generates placeholder images.
    """
    frame_paths = []
    try:
        video_id = os.path.basename(video_path).split('.')[0]
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"Error: Could not open video file {video_path}")
            return generate_placeholder_frames(video_id, num_frames)
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            print(f"Error: Video has no frames or invalid frame count: {total_frames}")
            cap.release()
            return generate_placeholder_frames(video_id, num_frames)
        
        if total_frames < num_frames:
            num_frames = total_frames

        frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]
        
        for i, frame_index in enumerate(frame_indices):
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
            ret, frame = cap.read()
            if ret:
                frame_path = os.path.join(TEMP_DIR, f"{video_id}_frame_{i}.jpg")
                cv2.imwrite(frame_path, frame)
                frame_paths.append(frame_path)
            else:
                print(f"Warning: Could not read frame {frame_index}")
                
        cap.release()
        
        # If we couldn't extract any frames, generate placeholders
        if not frame_paths:
            print("Warning: No frames could be extracted, generating placeholders")
            return generate_placeholder_frames(video_id, num_frames)
            
        return frame_paths
        
    except Exception as e:
        print(f"Error extracting keyframes: {str(e)}")
        # Generate placeholder frames on error
        return generate_placeholder_frames(os.path.basename(video_path).split('.')[0], num_frames)

def generate_placeholder_frames(video_id: str, num_frames: int = 5) -> list[str]:
    """Generates placeholder image files when video processing fails."""
    frame_paths = []
    for i in range(num_frames):
        # Create a blank color image (black background)
        height, width = 480, 640
        img = np.zeros((height, width, 3), np.uint8)
        
        # Add text with error message
        cv2.putText(
            img, 
            f"Error processing video", 
            (width//10, height//2 - 30), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            1, 
            (255, 255, 255), 
            2
        )
        
        cv2.putText(
            img, 
            f"Frame {i+1} of {num_frames}", 
            (width//10, height//2 + 30), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            1, 
            (255, 255, 255), 
            2
        )
        
        # Save the placeholder image
        frame_path = os.path.join(TEMP_DIR, f"{video_id}_placeholder_{i}.jpg")
        cv2.imwrite(frame_path, img)
        frame_paths.append(frame_path)
    
    return frame_paths

def cleanup_files(files: list[str]):
    """Deletes a list of temporary files."""
    for file_path in files:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)