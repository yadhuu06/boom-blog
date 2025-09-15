import os
import logging

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile

# -------------------------------------------------------------------
# Logging configuration
# -------------------------------------------------------------------
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# If no handlers are attached (e.g., when run standalone), add one
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# -------------------------------------------------------------------
# Environment & Cloudinary config
# -------------------------------------------------------------------
load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)
print("Cloud name:", cloudinary.config().cloud_name)
print("API key present:", bool(cloudinary.config().api_key))
print("API secret present:", bool(cloudinary.config().api_secret))
# -------------------------------------------------------------------
# Upload helper
# -------------------------------------------------------------------
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
    logger.info("Received upload request for folder: %s", folder)

    allowed_types = {"image/jpeg", "image/png", "image/gif"}
    if file.content_type not in allowed_types:
        logger.warning("Invalid content type: %s", file.content_type)
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPEG, PNG, and GIF are allowed.",
        )

    # Some UploadFile objects may not have .size; fall back to len(file.file.read()) if needed
    max_size = 5 * 1024 * 1024  # 5 MB
    size = getattr(file, "size", None)
    if size is None:
        try:
            pos = file.file.tell()
            file.file.seek(0, os.SEEK_END)
            size = file.file.tell()
            file.file.seek(pos)
        except Exception:
            logger.warning("Could not determine file size reliably.")
            size = 0

    if size and size > max_size:
        logger.warning("File too large: %s bytes", size)
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")

    try:
        logger.info("Uploading file to Cloudinary folder: %s", folder)
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            resource_type="image",
        )
        secure_url = result.get("secure_url")
        logger.info("Upload successful: %s", secure_url)
        return secure_url
    except Exception as e:
        logger.exception("Failed to upload to Cloudinary")
        raise HTTPException(status_code=500, detail=f"Failed to upload to Cloudinary: {e}")
