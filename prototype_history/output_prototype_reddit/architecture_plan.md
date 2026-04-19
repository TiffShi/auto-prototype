# Architecture Plan: Reddit-Type App

## Stack
- **Frontend:** Vue 3 (Vite) — Port **5173**
- **Backend:** FastAPI (Python) — Port **8080**

---

## Functional Requirements

### Core Features

#### Posts
- Create a new post (title, body, subreddit/community, author)
- View a feed of all posts (sorted by newest / top votes)
- View a single post detail page
- Upvote / Downvote a post
- Delete a post

#### Comments
- Add a comment to a post
- View all comments on a post
- Upvote / Downvote a comment
- Delete a comment

#### Communities (Subreddits)
- Create a community (name, description)
- View all communities
- View posts filtered by community

#### Users (Lightweight — no auth required)
- Set a username (stored in localStorage) to identify posts/comments
- Display username on posts and comments

---

## API Endpoints (FastAPI — Port 8080)

### Communities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/communities` | List all communities |
| POST | `/communities` | Create a community |
| GET | `/communities/{id}` | Get a single community |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | List all posts (optional `?community_id=`) |
| POST | `/posts` | Create a post |
| GET | `/posts/{id}` | Get a single post |
| DELETE | `/posts/{id}` | Delete a post |
| POST | `/posts/{id}/vote` | Upvote or downvote a post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts/{id}/comments` | Get comments for a post |
| POST | `/posts/{id}/comments` | Add a comment to a post |
| DELETE | `/comments/{id}` | Delete a comment |
| POST | `/comments/{id}/vote` | Upvote or downvote a comment |

---

## Data Models

### Community
```json
{ "id": "uuid", "name": "string", "description": "string", "created_at": "datetime" }
```

### Post
```json
{ "id": "uuid", "title": "string", "body": "string", "author": "string", "community_id": "uuid", "upvotes": 0, "downvotes": 0, "created_at": "datetime" }
```

### Comment
```json
{ "id": "uuid", "post_id": "uuid", "body": "string", "author": "string", "upvotes": 0, "downvotes": 0, "created_at": "datetime" }
```

### Vote Payload
```json
{ "direction": "up" | "down" }
```

---

## File Structure

```
project-root/
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS, port 8080
│   ├── database.py              # In-memory store (dicts/lists) — no DB needed
│   ├── models.py                # Pydantic request/response models
│   ├── routers/
│   │   ├── communities.py       # Community routes
│   │   ├── posts.py             # Post routes
│   │   └── comments.py         # Comment routes
│   └── requirements.txt         # fastapi, uvicorn
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js           # Vite config, dev server port 5173, proxy /api -> 8080
│   ├── package.json
│   ├── src/
│   │   ├── main.js              # Vue app entry point
│   │   ├── App.vue              # Root component, router-view
│   │   ├── api/
│   │   │   └── index.js         # Axios instance (baseURL: http://localhost:8080)
│   │   ├── router/
│   │   │   └── index.js         # Vue Router routes
│   │   ├── stores/
│   │   │   ├── userStore.js     # Pinia store — username from localStorage
│   │   │   ├── postStore.js     # Pinia store — posts state
│   │   │   └── communityStore.js# Pinia store — communities state
│   │   ├── views/
│   │   │   ├── HomeView.vue         # Feed of all posts
│   │   │   ├── CommunityView.vue    # Posts filtered by community
│   │   │   ├── PostDetailView.vue   # Single post + comments
│   │   │   ├── CreatePostView.vue   # Create post form
│   │   │   └── CommunitiesView.vue  # List + create communities
│   │   └── components/
│   │       ├── NavBar.vue           # Top navigation, username display
│   │       ├── PostCard.vue         # Post summary card (used in feed)
│   │       ├── PostVote.vue         # Upvote/downvote buttons
│   │       ├── CommentItem.vue      # Single comment display
│   │       ├── CommentForm.vue      # Add comment form
│   │       └── UsernameModal.vue    # Modal to set username on first visit
```

---

## Key Implementation Notes

1. **Ports are fixed:** Backend runs on **8080**, Frontend on **5173**. No exceptions.
2. **In-memory storage:** All data lives in Python dicts/lists in `database.py` — no SQLite or external DB.
3. **CORS:** FastAPI must allow origin `http://localhost:5173`.
4. **Username:** Stored in `localStorage` via Pinia `userStore`. Prompted via `UsernameModal.vue` on first visit.
5. **Voting:** Each vote call sends `{ "direction": "up" | "down" }` and the backend increments the appropriate counter.
6. **Vue Router routes:**
   - `/` → `HomeView`
   - `/communities` → `CommunitiesView`
   - `/communities/:id` → `CommunityView`
   - `/posts/create` → `CreatePostView`
   - `/posts/:id` → `PostDetailView`