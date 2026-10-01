# NotSpotify

A full-stack music streaming web application built from scratch - covering a Java Spring Boot REST API, two Next.js frontends, a PostgreSQL database, cloud-native media storage, and a complete DevOps pipeline running on AWS EKS.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [REST API Reference](#rest-api-reference)
  - [Authentication](#authentication-apiauthpost)
  - [Songs](#songs-apisong)
  - [Albums](#albums-apialbum)
  - [Search](#search-apisearch)
  - [User - Liked Songs](#user--liked-songs-apiuser)
  - [Playlists](#playlists-apiplaylist)
- [Authentication & Security](#authentication--security)
- [Media Storage - Cloudinary](#media-storage--cloudinary)
- [DevOps & Infrastructure](#devops--infrastructure)
  - [Docker Compose](#docker-compose)
  - [CI/CD - GitHub Actions](#cicd--github-actions)
  - [Terraform - AWS Infrastructure](#terraform--aws-infrastructure)
  - [Kubernetes & Helm Chart](#kubernetes--helm-chart)
  - [GitOps - ArgoCD](#gitops--argocd)
  - [Autoscaling - HPA & Karpenter](#autoscaling--hpa--karpenter)
  - [Observability - OpenTelemetry & Jaeger](#observability--opentelemetry--jaeger)
- [Admin Panel](#admin-panel)

---

## Architecture Overview

```
                         ┌──────────────────────────┐
                         │     NGINX Ingress        │
                         │  (AWS Load Balancer)     │
                         └────────┬────────┬────────┘
                                  │        │
                    /api/*        │        │  /admin/*
                ┌───────────┐     │        │    ┌────────────────┐
                │  Spring   │     │        └───►│   Next.js      │
                │   Boot    │◄────┘             │  Admin Panel   │
                │  Backend  │                   │  (port 3001)   │
                │(port 4000)│                   └────────────────┘
                └─────┬─────┘
                      │                    /*
                ┌─────▼──────┐      ┌────────────────┐
                │ PostgreSQL │      │   Next.js      │
                │ (port 5432)│      │  User Frontend │
                └─────┬──────┘      │  (port 3000)   │
                      │             └────────────────┘
                ┌─────▼──────┐
                │ Cloudinary │  (audio + cover image storage)
                └────────────┘
```

All three services run as separate Kubernetes Deployments inside the `notspotify` namespace and are exposed through a single NGINX Ingress backed by an AWS Load Balancer.

---

## Tech Stack

| Layer                      | Technology                                               |
| -------------------------- | -------------------------------------------------------- |
| **Backend API**            | Java 17, Spring Boot 3, Spring Security, Spring Data JPA |
| **Database**               | PostgreSQL 15                                            |
| **Authentication**         | JWT (HS256), BCrypt password hashing                     |
| **Media Storage**          | Cloudinary (audio files + cover images)                  |
| **User Frontend**          | Next.js 16 (App Router), Tailwind CSS                    |
| **Admin Frontend**         | Next.js 16 (App Router), Tailwind CSS                    |
| **Containerisation**       | Docker, Docker Compose                                   |
| **Container Registry**     | Docker Hub                                               |
| **Orchestration**          | Kubernetes (AWS EKS 1.31)                                |
| **Packaging**              | Helm 3                                                   |
| **GitOps**                 | ArgoCD                                                   |
| **CI/CD**                  | GitHub Actions                                           |
| **Infrastructure-as-Code** | Terraform (AWS provider)                                 |
| **Node Autoscaling**       | Karpenter v0.37.0                                        |
| **Pod Autoscaling**        | Kubernetes HPA                                           |
| **Observability**          | OpenTelemetry Operator + Jaeger                          |

---

## Project Structure

```
spotify-full-stack/
│
├── spotify-backend-java/          # Spring Boot REST API
│   └── src/main/java/com/spotify/backend/
│       ├── controller/            # REST endpoints (Auth, Song, Album, Search, User, Playlist)
│       ├── entity/                # JPA entities: User, Song, Album, Playlist
│       ├── repository/            # Spring Data JPA repositories
│       ├── security/              # JwtUtils, JwtAuthFilter, UserDetailsServiceImpl, SecurityConfig
│       ├── service/               # CloudinaryService
│       └── config/                # CORS (WebConfig), Cloudinary, DataInitializer
│
├── spotify-clone/                 # Next.js user-facing app (port 3000)
│   └── src/
│       ├── app/                   # App Router pages: /, /search, /album/[id], /artist/[id],
│       │                          #   /playlist/[id], /liked-songs
│       ├── components/            # AlbumItem, AuthModal, ClientAppWrapper, DisplayAlbum,
│       │                          #   DisplayArtist, DisplayHome, DisplayLikedSongs,
│       │                          #   DisplayPlaylist, DisplaySearch, DisplayWrapper,
│       │                          #   Navbar, Player, Sidebar, SongItem
│       └── context/               # PlayerContext, AuthContext
│
├── spotify-admin/                 # Next.js admin dashboard (port 3001)
│
├── helm/notspotify/               # Helm chart - packages the full stack for Kubernetes
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── backend-deployment.yaml
│       ├── clone-deployment.yaml
│       ├── admin-deployment.yaml
│       ├── postgres-statefulset.yaml
│       ├── ingress.yaml           # NGINX routing for all three services
│       └── secrets.yaml
│
├── k8s/
│   ├── argocd/application.yaml          # ArgoCD Application (GitOps sync config)
│   ├── autoscaling/
│   │   ├── hpa.yaml                     # HPA for backend (2–10), clone (2–8), admin (1–3)
│   │   └── karpenter-nodepool.yaml      # Karpenter NodePool + EC2NodeClass
│   └── observability/
│       ├── otel-collector.yaml          # OpenTelemetry Collector (OTLP → Jaeger)
│       ├── instrumentation.yaml         # Auto-instrumentation config
│       └── jaeger.yaml                  # Jaeger tracing backend
│
├── terraform/                     # AWS Infrastructure-as-Code
│   ├── vpc.tf                     # VPC, subnets, NAT gateway
│   ├── eks.tf                     # EKS cluster + managed node group
│   ├── iam_addons.tf              # IRSA roles: EBS CSI, ALB controller, Karpenter
│   ├── karpenter.tf               # Karpenter Helm release
│   ├── argocd.tf                  # ArgoCD Helm release
│   ├── metrics_server.tf          # Kubernetes Metrics Server (required for HPA)
│   ├── opentelemetry.tf           # Cert-Manager + OpenTelemetry Operator
│   ├── variables.tf
│   ├── outputs.tf
│   └── versions.tf
│
├── .github/workflows/ci.yml       # GitHub Actions CI/CD pipeline
├── docker-compose.yml             # Local full-stack compose file
└── .env.example                   # Environment variable template
```

---

## Getting Started (Local)

### Prerequisites

- Java 17+, Maven 3.8+
- Node.js 20+
- Docker & Docker Compose
- A free [Cloudinary](https://cloudinary.com) account

### Option A - Docker Compose

```bash
# Clone the repository
git clone https://github.com/vikramT75/notspotify.git
cd notspotify

# Configure environment variables
cp .env.example .env
# Add your Cloudinary keys and DB password to .env

# Start all services
docker compose up --build
```

| Service       | URL                   |
| ------------- | --------------------- |
| User frontend | http://localhost:3000 |
| Backend API   | http://localhost:4000 |
| Admin panel   | http://localhost:3001 |

```bash
# Tear down
docker compose down -v
```

### Option B - Run services individually

```bash
# 1. Start PostgreSQL
docker run -e POSTGRES_DB=spotify -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15-alpine

# 2. Start the backend
cd spotify-backend-java
mvn spring-boot:run

# 3. Start the user frontend
cd spotify-clone
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm install && npm run dev

# 4. Start the admin panel
cd spotify-admin
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm install && npm run dev
```

---

## Environment Variables

### Backend (environment / `application.properties`)

| Variable                | Description             | Example                                    |
| ----------------------- | ----------------------- | ------------------------------------------ |
| `DB_URL`                | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/spotify` |
| `DB_USERNAME`           | Database username       | `postgres`                                 |
| `DB_PASSWORD`           | Database password       | `securepassword`                           |
| `CLOUDINARY_NAME`       | Cloudinary cloud name   | `my-cloud`                                 |
| `CLOUDINARY_API_KEY`    | Cloudinary API key      | `123456789012345`                          |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret   | `abcdefghijklmnop`                         |

### Frontend (`.env.local` in `spotify-clone/` and `spotify-admin/`)

| Variable              | Description                 | Example                 |
| --------------------- | --------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:4000` |

> **Warning:** Never commit `.env.local` or a filled-in `.env` to version control. Both files are listed in `.gitignore`. Use GitHub Actions Secrets for CI/CD.

---

## REST API Reference

**Base URL:** `http://localhost:4000`

Endpoints that return or modify user-specific data require a `Bearer` JWT token in the `Authorization` header, except where marked **Public**.

---

### Authentication `/api/auth` · `POST`

#### `POST /api/auth/signup` - **Public**

Register a new user account. All signups receive the `USER` role.

**Request:**

```json
{
  "username": "name",
  "email": "name@example.com",
  "password": "secret123"
}
```

**Response `200`:**

```
"User registered successfully!"
```

**Response `400`:**

```
"Error: Email is already in use!"
"Error: Username is already taken!"
```

---

#### `POST /api/auth/login` - **Public**

Authenticate and receive a JWT token valid for 24 hours.

**Request:**

```json
{
  "username": "name",
  "password": "secret123"
}
```

**Response `200`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "name",
  "email": "name@example.com",
  "role": "USER"
}
```

> **Roles:** `USER` - regular listener. `ADMIN` - can upload and delete songs/albums.

---

### Songs `/api/song`

#### `GET /api/song/list` - **Public**

Fetch all songs.

**Response `200`:**

```json
{
  "success": true,
  "songs": [
    {
      "_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Dreamer",
      "desc": "An epic NCS track",
      "album": "NCS Essentials",
      "image": "https://res.cloudinary.com/...",
      "file": "https://res.cloudinary.com/...",
      "duration": "3:24",
      "artistName": "Alan Walker",
      "releaseDate": "2024-01-15"
    }
  ]
}
```

---

#### `POST /api/song/add` - **Admin only** · `multipart/form-data`

Upload a new song. The image and audio files are uploaded to Cloudinary; only the resulting URLs are stored in the database.

| Field         | Type     | Description               |
| ------------- | -------- | ------------------------- |
| `name`        | `string` | Song title                |
| `desc`        | `string` | Short description         |
| `album`       | `string` | Album name                |
| `artistName`  | `string` | Artist name               |
| `releaseDate` | `string` | Release date (any format) |
| `image`       | `file`   | Cover image               |
| `audio`       | `file`   | Audio file (max 50 MB)    |

**Response `200`:**

```json
{ "success": true, "message": "Song Added" }
```

---

#### `POST /api/song/remove` - **Admin only**

**Request:**

```json
{ "id": "<song-uuid>" }
```

**Response `200`:**

```json
{ "success": true, "message": "Song Remove" }
```

---

#### `GET /api/song/artist/{artistName}` - **Public**

Get all songs by a specific artist. The lookup is case-insensitive and exact.

**Response `200`:**

```json
{
  "success": true,
  "songs": [ ... ]
}
```

---

### Albums `/api/album`

#### `GET /api/album/list` - **Public**

Fetch all albums.

**Response `200`:**

```json
{
  "success": true,
  "albums": [
    {
      "_id": "uuid",
      "name": "NCS Essentials",
      "desc": "Best of NCS",
      "bgColour": "#1a1a2e",
      "image": "https://res.cloudinary.com/...",
      "collaborators": "Various Artists",
      "releaseDate": "2023-06-01"
    }
  ]
}
```

---

#### `POST /api/album/add` - **Admin only** · `multipart/form-data`

| Field           | Type     | Description                                |
| --------------- | -------- | ------------------------------------------ |
| `name`          | `string` | Album title                                |
| `desc`          | `string` | Description                                |
| `bgColour`      | `string` | Hex colour for UI theming (e.g. `#1a1a2e`) |
| `collaborators` | `string` | Contributing artists                       |
| `releaseDate`   | `string` | Release date                               |
| `image`         | `file`   | Cover image                                |

**Response `200`:**

```json
{ "success": true, "message": "Album Added" }
```

---

#### `POST /api/album/remove` - **Admin only**

**Request:**

```json
{ "id": "<album-uuid>" }
```

---

### Search `/api/search`

#### `GET /api/search?query={q}` - **Public**

Search songs by **title or artist name**, and albums by name. All matches are case-insensitive and partial. Songs matching by both name and artist are deduplicated in the response.

**Response `200`:**

```json
{
  "success": true,
  "songs": [ ... ],
  "albums": [ ... ]
}
```

---

### User - Liked Songs `/api/user`

All endpoints require `Authorization: Bearer <token>`.

#### `GET /api/user/liked-songs`

**Response `200`:**

```json
{
  "success": true,
  "likedSongs": [ ... ]
}
```

#### `POST /api/user/like-song`

```json
{ "songId": "<song-uuid>" }
```

**Response `200`:**

```json
{ "success": true, "message": "Song liked" }
```

#### `POST /api/user/unlike-song`

```json
{ "songId": "<song-uuid>" }
```

**Response `200`:**

```json
{ "success": true, "message": "Song unliked" }
```

---

### Playlists `/api/playlist`

All endpoints require `Authorization: Bearer <token>`.

#### `POST /api/playlist/create`

**Request:**

```json
{
  "name": "My Playlist",
  "desc": "Optional description"
}
```

**Response `200`:**

```json
{
  "success": true,
  "playlist": {
    "_id": "uuid",
    "name": "My Playlist",
    "desc": "Optional description",
    "songs": [],
    "user": { "username": "name" }
  }
}
```

#### `GET /api/playlist/user`

Get all playlists belonging to the current user.

**Response `200`:**

```json
{ "success": true, "playlists": [ ... ] }
```

#### `GET /api/playlist/{id}`

Get a playlist by ID (includes its full song list).

**Response `200`:**

```json
{
  "success": true,
  "playlist": {
    "_id": "uuid",
    "name": "Chill Vibes",
    "songs": [ ... ],
    "user": { "username": "name" }
  }
}
```

**Response `404`:** playlist not found.

#### `POST /api/playlist/add-song`

Add a song to a playlist. Only the playlist owner can do this.

```json
{
  "playlistId": "<playlist-uuid>",
  "songId": "<song-uuid>"
}
```

**Response `200`:**

```json
{ "success": true, "message": "Song added to playlist" }
```

#### `POST /api/playlist/remove-song`

Remove a song from a playlist. Only the playlist owner can do this.

```json
{
  "playlistId": "<playlist-uuid>",
  "songId": "<song-uuid>"
}
```

**Response `200`:**

```json
{ "success": true, "message": "Song removed from playlist" }
```

---

## Authentication & Security

The backend uses **stateless JWT authentication** via Spring Security. No session state is stored on the server.

### Flow

```
Client                             Server
  │                                   │
  │   POST /api/auth/login            │
  │  ─────────────────────────────►   │
  │                                   │  Authenticate credentials
  │                                   │  Generate JWT (HS256, 24h expiry)
  │   { "token": "eyJ..." }           │
  │  ◄─────────────────────────────   │
  │                                   │
  │   GET /api/user/liked-songs       │
  │   Authorization: Bearer eyJ...    │
  │  ─────────────────────────────►   │
  │                                   │  JwtAuthFilter validates token
  │                                   │  Loads user into SecurityContext
  │   { "success": true, ... }        │
  │  ◄─────────────────────────────   │
```

### Endpoint Access Matrix

| Access Level                   | Endpoints                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Public** (no token required) | `POST /api/auth/**`, `GET /api/song/list`, `GET /api/album/list`, `GET /api/search`, `GET /api/song/artist/**` |
| **Authenticated users**        | All `/api/user/**` and `/api/playlist/**`                                                                      |
| **Admin only**                 | `POST /api/song/add`, `POST /api/song/remove`, `POST /api/album/add`, `POST /api/album/remove`                 |

### Default Admin Account

A default admin account is seeded by `DataInitializer` on first startup **only if it does not already exist**:

```
Username: admin1
Password: admin1
```

> **Warning:** Change these credentials immediately in any non-local environment.

### Password Storage

Passwords are hashed with **BCrypt** before being saved. Plain-text passwords never reach the database.

### CORS

All origins are currently permitted (`*`) for local development. For production deployments, restrict `allowedOrigins` in `WebConfig.java` to your actual domain.

---

## Media Storage - Cloudinary

Song audio files and all cover images are stored on **Cloudinary**. The backend uploads files on receipt and stores only the resulting `secure_url` in PostgreSQL.

- Audio files are uploaded as `resource_type: video` (Cloudinary's umbrella type for audio).
- Audio duration is extracted from Cloudinary's upload response and stored as `m:ss`.
- The maximum upload size is **50 MB** per file, enforced in `application.properties`.

---

## DevOps & Infrastructure

### Docker Compose

`docker-compose.yml` at the repo root spins up the entire stack locally with four services:

| Service       | Built from               | Port |
| ------------- | ------------------------ | ---- |
| `postgres-db` | `postgres:15-alpine`     | 5432 |
| `backend`     | `./spotify-backend-java` | 4000 |
| `clone`       | `./spotify-clone`        | 3000 |
| `admin`       | `./spotify-admin`        | 3001 |

The backend service uses a `depends_on` with a `service_healthy` condition on PostgreSQL, so it only starts after the database passes its `pg_isready` healthcheck.

---

### CI/CD - GitHub Actions

The pipeline in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) triggers on every push or pull request to `master` or `main`.

#### Stage 1 - `build-and-test`

| Step                 | Action                                          |
| -------------------- | ----------------------------------------------- |
| Checkout             | `actions/checkout@v5`                           |
| JDK 17 + Maven cache | `actions/setup-java@v5`                         |
| Build backend        | `mvn -B clean package -DskipTests`              |
| Node 20              | `actions/setup-node@v5`                         |
| Build user frontend  | `npm ci && npm run build` (in `spotify-clone/`) |
| Build admin frontend | `npm ci && npm run build` (in `spotify-admin/`) |

#### Stage 2 - `docker-build` _(runs only if Stage 1 passes)_

| Step                        | Action                              |
| --------------------------- | ----------------------------------- |
| Authenticate to Docker Hub  | `docker/login-action@v4`            |
| Build + push backend        | `<username>/spotify-backend:latest` |
| Build + push user frontend  | `<username>/spotify-clone:latest`   |
| Build + push admin frontend | `<username>/spotify-admin:latest`   |

**Required GitHub repository secrets:**

| Secret               | Description                                   |
| -------------------- | --------------------------------------------- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username                      |
| `DOCKERHUB_TOKEN`    | A Docker Hub access token (not your password) |

---

### Terraform - AWS Infrastructure

All AWS resources are managed by Terraform under `terraform/`. Module dependencies control the apply order automatically.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Fill in AWS credentials and desired settings

terraform init
terraform plan
terraform apply
```

**What each file provisions:**

| File                | Resources                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `vpc.tf`            | Custom VPC (`10.0.0.0/16`), 3 public + 3 private subnets across AZs, single NAT Gateway, Kubernetes/Karpenter subnet tags              |
| `eks.tf`            | EKS cluster (Kubernetes 1.31), managed node group (`t3.medium`, 1–4 nodes), core add-ons: CoreDNS, kube-proxy, VPC CNI, EBS CSI driver |
| `iam_addons.tf`     | IRSA roles for EBS CSI driver, AWS Load Balancer Controller, and Karpenter                                                             |
| `karpenter.tf`      | Karpenter Helm release (`v0.37.0`) for node autoscaling                                                                                |
| `argocd.tf`         | ArgoCD Helm release (`v6.7.18`) for GitOps CD                                                                                          |
| `metrics_server.tf` | Kubernetes Metrics Server (`v3.12.1`) - required for HPA                                                                               |
| `opentelemetry.tf`  | Cert-Manager (`v1.14.4`) + OpenTelemetry Operator (`v0.57.0`)                                                                          |

**Key variables (`variables.tf`):**

| Variable              | Default          | Description                   |
| --------------------- | ---------------- | ----------------------------- |
| `aws_region`          | `us-east-1`      | AWS region                    |
| `cluster_name`        | `notspotify-eks` | EKS cluster name              |
| `cluster_version`     | `1.31`           | Kubernetes version            |
| `vpc_cidr`            | `10.0.0.0/16`    | VPC CIDR block                |
| `node_instance_types` | `["t3.medium"]`  | EC2 types for managed nodes   |
| `desired_nodes`       | `2`              | Initial node count            |
| `min_nodes`           | `1`              | Minimum nodes                 |
| `max_nodes`           | `4`              | Maximum nodes (managed group) |

> A single NAT Gateway is used to minimise cost in development. For production, use one NAT Gateway per Availability Zone for high availability.

---

### Kubernetes & Helm Chart

The application is packaged as a single Helm chart at `helm/notspotify/`.

**Templates included:**

| Template                    | Description                                                    |
| --------------------------- | -------------------------------------------------------------- |
| `backend-deployment.yaml`   | Spring Boot Deployment + ClusterIP Service                     |
| `clone-deployment.yaml`     | User frontend Deployment + ClusterIP Service                   |
| `admin-deployment.yaml`     | Admin frontend Deployment + ClusterIP Service                  |
| `postgres-statefulset.yaml` | PostgreSQL StatefulSet + ClusterIP Service                     |
| `postgres-pvc.yaml`         | PersistentVolumeClaim - 10 Gi, `gp2` StorageClass              |
| `ingress.yaml`              | NGINX Ingress: `/api` → backend, `/admin` → admin, `/` → clone |
| `secrets.yaml`              | DB credentials + Cloudinary keys as Kubernetes Secrets         |

**Manual deploy:**

```bash
# Configure kubectl for the EKS cluster
aws eks update-kubeconfig --name notspotify-eks --region us-east-1

# Install or upgrade the chart
helm upgrade --install notspotify ./helm/notspotify \
  --namespace notspotify --create-namespace \
  --set postgres.password=<secure_password> \
  --set backend.image.tag=latest
```

---

### GitOps - ArgoCD

ArgoCD is deployed to the cluster by Terraform and configured to watch this repository. Any push to `master` that modifies the Helm chart is automatically detected and synced to the cluster - no manual `helm upgrade` is needed.

**Apply the Application manifest:**

```bash
kubectl apply -f k8s/argocd/application.yaml
```

**Access the ArgoCD UI:**

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:80
# Visit http://localhost:8080
# Username: admin
# Get the initial password:
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

**Sync behaviour:**

- `automated.prune: true` : Kubernetes resources deleted from Git are pruned from the cluster automatically.
- `automated.selfHeal: true` : Manual `kubectl` changes that drift from the Git state are reverted automatically.

---

### Autoscaling - HPA & Karpenter

Two layers of autoscaling operate independently:

#### Pod Autoscaling - HPA (`k8s/autoscaling/hpa.yaml`)

Requires Metrics Server (deployed by Terraform). Scale-up is immediate; scale-down has a 5-minute stabilisation window to avoid flapping.

| Deployment        | Min Pods | Max Pods | Scale-up trigger              |
| ----------------- | -------- | -------- | ----------------------------- |
| `spotify-backend` | 2        | 10       | CPU > 70% **or** Memory > 80% |
| `spotify-clone`   | 2        | 8        | CPU > 70%                     |
| `spotify-admin`   | 1        | 3        | CPU > 80%                     |

```bash
kubectl apply -f k8s/autoscaling/hpa.yaml
```

#### Node Autoscaling : Karpenter (`k8s/autoscaling/karpenter-nodepool.yaml`)

Karpenter watches for unschedulable pods and provisions EC2 nodes in seconds - significantly faster than Cluster Autoscaler.

- **Instance families:** `c`, `m`, `t` (generation > 2)
- **Capacity types:** on-demand + spot (mixed for cost savings)
- **Cluster limits:** 50 vCPU / 100 Gi RAM
- **Consolidation:** `WhenUnderutilized` - idle nodes are removed to reduce cost
- **Node expiry:** 30 days (nodes are recycled periodically for security patching)

```bash
kubectl apply -f k8s/autoscaling/karpenter-nodepool.yaml
```

---

### Observability - OpenTelemetry & Jaeger

Distributed tracing is configured via the OpenTelemetry Operator (deployed by Terraform) with Jaeger as the tracing backend.

**Collector pipeline** (`k8s/observability/otel-collector.yaml`):

```
Application → OTLP (gRPC :4317 / HTTP :4318)
           → memory_limiter → batch → resource (inject environment=dev)
           → Jaeger (OTLP gRPC)
           → debug logger
```

All three telemetry signals (traces, metrics, logs) are handled. Trace data flows to `jaeger.notspotify.svc.cluster.local:4317`.

**Apply manifests:**

```bash
kubectl apply -f k8s/observability/
```

**Access Jaeger UI:**

```bash
kubectl port-forward svc/jaeger -n notspotify 16686:16686
# Visit http://localhost:16686
```

---

## Admin Panel

The admin panel (`spotify-admin/`, port 3001) is a separate Next.js application for managing the content library. It is only accessible to users with the `ADMIN` role.

**Features:**

- Upload songs with title, artist name, album, release date, cover image, and audio file
- Upload albums with name, description, accent colour, collaborators, and cover image
- Delete songs and albums from the library

**Default admin credentials** (seeded on first startup, only if the account does not already exist):

```
Username : admin1
Password : admin1
```

> **Warning:** Change the default admin password before deploying to any non-local environment.
