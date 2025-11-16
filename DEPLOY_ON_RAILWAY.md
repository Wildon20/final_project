## Deploy to Railway (PHP + Apache, MySQL)

This project is prepared to run as a single Railway service using Docker (php:8.2-apache). It serves:
- Static frontend pages from the repo root (e.g., `index.html`, `services.html`, etc.)
- PHP API endpoints under `php-backend/api/*.php`

The frontend JS (`api-integration.js`) calls the API via relative paths like `/php-backend/api/...`, which works in this single-container setup.

### 1) Prerequisites
- GitHub repo connected to Railway
- Railway account (`railway.app`)

### 2) One-click Summary
1. Push this repository to GitHub.
2. In Railway → New Project → Deploy from GitHub → pick this repo.
3. Railway will detect the Dockerfile and build automatically.
4. Create a MySQL database in Railway and copy its credentials.
5. Add environment variables to your service:
   - `DB_HOST`
   - `DB_PORT` (default: `3306`)
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
6. Redeploy, then open the service URL. Your site will be served at `/`, the API at `/php-backend/api`.

### 3) Database (MySQL on Railway)
- From your Railway project: Add → Database → MySQL.
- In the MySQL service, go to Connect and copy host, port, db name, user, and password.
- In your web service (the one built from this repo), set environment variables:
  - `DB_HOST` = the host from Railway
  - `DB_PORT` = 3306 (or as provided)
  - `DB_NAME` = default db name provided
  - `DB_USER` = username provided
  - `DB_PASSWORD` = password provided

Optional: Import schema
- Use the provided SQL file under `php-backend/sql/` to initialize.
- You can import via a local client connecting to Railway MySQL or via a migration job.

### 4) Local test with Docker
```bash
docker build -t graduation-project .
docker run -p 8080:80 \
  -e DB_HOST=localhost \
  -e DB_PORT=3306 \
  -e DB_NAME=drt_dental_smart \
  -e DB_USER=root \
  -e DB_PASSWORD= \
  graduation-project
```
Open http://localhost:8080

### 5) Notes
- `php-backend/config/database.php` now reads DB settings from environment variables.
- `railway.toml` is included to document service/environment. Railway will still use the Dockerfile automatically.
- The Node `backend/` is not used by the frontend currently. If you later want to deploy it as a separate API service, add it as another Railway service pointing to the `backend/` directory (its own Dockerfile exists there).


