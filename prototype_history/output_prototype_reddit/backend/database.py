from typing import Dict, List, Optional
from datetime import datetime, timezone
import uuid

# ---------------------------------------------------------------------------
# In-memory data stores
# ---------------------------------------------------------------------------

communities: Dict[str, dict] = {}
posts: Dict[str, dict] = {}
comments: Dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def new_id() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


def utcnow() -> str:
    """Return current UTC time as an ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Community helpers
# ---------------------------------------------------------------------------

def create_community(name: str, description: str) -> dict:
    community_id = new_id()
    community = {
        "id": community_id,
        "name": name,
        "description": description,
        "created_at": utcnow(),
    }
    communities[community_id] = community
    return community


def get_all_communities() -> List[dict]:
    return sorted(communities.values(), key=lambda c: c["created_at"], reverse=True)


def get_community(community_id: str) -> Optional[dict]:
    return communities.get(community_id)


# ---------------------------------------------------------------------------
# Post helpers
# ---------------------------------------------------------------------------

def create_post(title: str, body: str, author: str, community_id: str) -> dict:
    post_id = new_id()
    post = {
        "id": post_id,
        "title": title,
        "body": body,
        "author": author,
        "community_id": community_id,
        "upvotes": 0,
        "downvotes": 0,
        "created_at": utcnow(),
    }
    posts[post_id] = post
    return post


def get_all_posts(community_id: Optional[str] = None) -> List[dict]:
    result = list(posts.values())
    if community_id:
        result = [p for p in result if p["community_id"] == community_id]
    return sorted(result, key=lambda p: p["created_at"], reverse=True)


def get_post(post_id: str) -> Optional[dict]:
    return posts.get(post_id)


def delete_post(post_id: str) -> bool:
    if post_id in posts:
        del posts[post_id]
        # Cascade-delete associated comments
        to_delete = [cid for cid, c in comments.items() if c["post_id"] == post_id]
        for cid in to_delete:
            del comments[cid]
        return True
    return False


def vote_post(post_id: str, direction: str) -> Optional[dict]:
    post = posts.get(post_id)
    if post is None:
        return None
    if direction == "up":
        post["upvotes"] += 1
    elif direction == "down":
        post["downvotes"] += 1
    return post


# ---------------------------------------------------------------------------
# Comment helpers
# ---------------------------------------------------------------------------

def create_comment(post_id: str, body: str, author: str) -> dict:
    comment_id = new_id()
    comment = {
        "id": comment_id,
        "post_id": post_id,
        "body": body,
        "author": author,
        "upvotes": 0,
        "downvotes": 0,
        "created_at": utcnow(),
    }
    comments[comment_id] = comment
    return comment


def get_comments_for_post(post_id: str) -> List[dict]:
    result = [c for c in comments.values() if c["post_id"] == post_id]
    return sorted(result, key=lambda c: c["created_at"])


def get_comment(comment_id: str) -> Optional[dict]:
    return comments.get(comment_id)


def delete_comment(comment_id: str) -> bool:
    if comment_id in comments:
        del comments[comment_id]
        return True
    return False


def vote_comment(comment_id: str, direction: str) -> Optional[dict]:
    comment = comments.get(comment_id)
    if comment is None:
        return None
    if direction == "up":
        comment["upvotes"] += 1
    elif direction == "down":
        comment["downvotes"] += 1
    return comment