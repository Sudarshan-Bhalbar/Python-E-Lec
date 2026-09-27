# Python-E-Lec

Six interactive Python labs and their companion notes. The existing labs simulate
a subset of Python in JavaScript; they do not run a Python interpreter.

Run locally with `python -m http.server 8000`, then open
http://localhost:8000. No frontend dependencies or build step are needed.
Drafts and progress stay in browser storage; unavailable storage falls back to
the current session.

GitHub Pages: select **GitHub Actions** in the repository's Settings → Pages.
The workflow deploys on pushes to `main` and can also be run manually. It uploads
only HTML, notes, and public assets.
Published site: https://sudarshan-bhalbar.github.io/Python-E-Lec/

The site runs entirely in the browser. No backend, database, API, or credentials
are required. Progress and drafts are stored on the current browser and device.
