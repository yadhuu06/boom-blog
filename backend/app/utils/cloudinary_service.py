
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os
from fastapi import HTTPException,UploadFile


load_dotenv()


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True  
)

def upload_to_cloudinary(file: UploadFile, folder: str = "Boom") -> str:
    """
    Uploads an image to Cloudinary and returns the secure URL.
    
    Args:
        file: FastAPI UploadFile object (cropped image from frontend)
        folder: Cloudinary folder to store the image (default: "Boom")
    
    Returns:
        str: Secure URL of the uploaded image
    
    Raises:
        HTTPException: If the file is invalid or upload fails
    """
    print("call camee------------------------------------------------")
    
    allowed_types = {"image/jpeg", "image/png", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and GIF are allowed.")
    

    max_size = 5 * 1024 * 1024 
    if file.size > max_size:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")
    
    try:

        print("uploading-------------------------------")
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            resource_type="image"
        )
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to Cloudinary: {str(e)}")
