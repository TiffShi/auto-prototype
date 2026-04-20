from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from services.minio_service import get_presigned_url

router = APIRouter(prefix="/api/media", tags=["media"])


@router.get("/{object_path:path}")
def get_media(object_path: str):
    """
    Redirect to a presigned MinIO URL for the given object path.
    The object_path should be the object name stored in the drink's image_url field.
    """
    if not object_path:
        raise HTTPException(status_code=400, detail="Object path is required")

    try:
        url = get_presigned_url(object_path)
        return RedirectResponse(url=url, status_code=302)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))