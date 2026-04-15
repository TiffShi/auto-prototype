from fastapi import APIRouter, HTTPException, status
from typing import List, Optional

import database
from models import PostCreate, PostResponse, VotePayload

router = APIRouter()


@router.get("/posts", response_model=List[PostResponse])
def list_posts(community_id: Optional[str] = None):
    """
    Return all posts, optionally filtered by community_id.
    Results are sorted newest first.
    """
    return database.get_all_posts(community_id=community_id)


@router.post(
    "/posts",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(payload: PostCreate):
    """Create a new post inside an existing community."""
    # Validate that the referenced community exists
    community = database.get_community(payload.community_id)
    if community is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community '{payload.community_id}' not found.",
        )
    post = database.create_post(
        title=payload.title,
        body=payload.body,
        author=payload.author,
        community_id=payload.community_id,
    )
    return post


@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: str):
    """Return a single post by ID."""
    post = database.get_post(post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{post_id}' not found.",
        )
    return post


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: str):
    """Delete a post (and its comments) by ID."""
    deleted = database.delete_post(post_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{post_id}' not found.",
        )


@router.post("/posts/{post_id}/vote", response_model=PostResponse)
def vote_post(post_id: str, payload: VotePayload):
    """Upvote or downvote a post."""
    post = database.vote_post(post_id, payload.direction)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{post_id}' not found.",
        )
    return post