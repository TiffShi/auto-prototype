from fastapi import APIRouter, HTTPException, status
from typing import List

import database
from models import CommunityCreate, CommunityResponse

router = APIRouter()


@router.get("/communities", response_model=List[CommunityResponse])
def list_communities():
    """Return all communities sorted by newest first."""
    return database.get_all_communities()


@router.post(
    "/communities",
    response_model=CommunityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_community(payload: CommunityCreate):
    """Create a new community."""
    # Prevent duplicate community names (case-insensitive)
    existing = [
        c for c in database.communities.values()
        if c["name"].lower() == payload.name.lower()
    ]
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A community named '{payload.name}' already exists.",
        )
    community = database.create_community(
        name=payload.name,
        description=payload.description,
    )
    return community


@router.get("/communities/{community_id}", response_model=CommunityResponse)
def get_community(community_id: str):
    """Return a single community by ID."""
    community = database.get_community(community_id)
    if community is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community '{community_id}' not found.",
        )
    return community