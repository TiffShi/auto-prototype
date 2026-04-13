#Unresolved Bugs Report

## Final QA Feedback:
VERDICT: FAIL

BACKEND ISSUES:
The backend crashes with `ModuleNotFoundError: No module named 'routers'`. The Dockerfile copies the app source to `/app/` with `COPY app/ /app/`, but uvicorn is being launched with `--app-dir /app` pointing to the wrong directory. The actual Python modules (`routers/`, `models/`, `services/`, `main.py`) are inside `backend/app/`, but the Dockerfile's `WORKDIR` is `/app` and copies into `/app/` directly — so the modules should be found. The real issue is the `--app-dir` flag combined with how uvicorn resolves imports.

The fix is to remove the `--app-dir` flag from the Dockerfile CMD and instead ensure the working directory is correct. Since `COPY app/ /app/` puts `main.py` directly in `/app/`, the CMD should simply be:

In `backend/Dockerfile`, change the CMD line from:
```
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "/app"]
```
to:
```
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

The `WORKDIR /app` already sets the working directory to `/app` where `main.py` and the `routers/`, `models/`, `services/` subdirectories live, so Python's import system will find them correctly without the `--app-dir` override.

FRONTEND ISSUES:
None. The frontend started successfully — Vite compiled and is serving on port 3000 with no errors.
