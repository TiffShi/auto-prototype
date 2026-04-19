from fastapi import APIRouter, HTTPException, status
from typing import List

import database
from models import CommentCreate, CommentResponse, VotePayload

router = APIRouter()


@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def list_comments(post_id: str):
    """Return all comments for a given post, sorted oldest first."""
    # Verify the post exists
    post = database.get_post(post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{post_id}' not found.",
        )
    return database.get_comments_for_post(post_id)


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(post_id: str, payload: CommentCreate):
    """Add a comment to a post."""
    post = database.get_post(post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{post_id}' not found.",
        )
    comment = database.create_comment(
        post_id=post_id,
        body=payload.body,
        author=payload.author,
    )
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: str):
    """Delete a comment by ID."""
    deleted = database.delete_comment(comment_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment '{comment_id}' not found.",
        )


@router.post("/comments/{comment_id}/vote", response_model=CommentResponse)
def vote_comment(comment_id: str, payload: VotePayload):
    """Upvote or downvote a comment."""
    comment = database.vote_comment(comment_id, payload.direction)
    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment '{comment_id}' not found.",
        )
    return comment