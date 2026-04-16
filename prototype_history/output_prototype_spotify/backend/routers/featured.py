from fastapi import APIRouter
from models.schemas import FeaturedContent, Category
from data.mock_data import TRACKS, ALBUMS, ARTISTS, CATEGORIES

router = APIRouter()


@router.get("/featured", response_model=FeaturedContent)
def get_featured():
    """
    Return curated featured content for the home page:
    - Featured tracks (first 6)
    - New releases (albums sorted by year, top 6)
    - Featured artists (first 4)
    - Genre categories
    """
    featured_tracks = TRACKS[:6]

    new_releases = sorted(ALBUMS, key=lambda a: a["release_year"], reverse=True)[:6]

    featured_artists = ARTISTS[:4]

    categories = CATEGORIES

    return FeaturedContent(
        featured_tracks=featured_tracks,
        new_releases=new_releases,
        featured_artists=featured_artists,
        categories=categories,
    )


@router.get("/categories", response_model=list)
def get_categories():
    """Return all genre categories."""
    return CATEGORIES