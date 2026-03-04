# Haneus Cafe POS

A full-stack point-of-sale and inventory management system for coffee shops, featuring inventory tracking, sales management, and an admin dashboard.

---

## Project Structure

```
Inventory-Management-System-Haneus-Cafe-POS/
│
├── BACKEND/                  # Django backend (API, business logic, DB)
│   ├── api/                  # Django app for API endpoints
│   │   ├── admin.py          # Django admin registration (User, Product, Sale)
│   │   ├── apps.py
│   │   ├── models.py         # User, Product, Sale models
│   │   ├── serializers.py    # DRF serializers
│   │   ├── urls.py           # API endpoint routing
│   │   └── views.py          # Auth, Product, Sale views
│   ├── pos_core/             # Django project core settings
│   │   ├── settings.py       # DB config, AUTH_USER_MODEL, CORS
│   │   ├── urls.py           # Root URL routing
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── python/               # Utility scripts
│   │   └── db_config.py      # Database connection test
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── FRONTEND/                 # Frontend (HTML, CSS, vanilla JS)
│   ├── login.html            # Login page (connected to backend)
│   ├── register.html         # Registration page
│   ├── dashboard.html        # Admin dashboard
│   ├── products.html         # Product list
│   ├── createproduct.html    # Create product form
│   ├── lowstock.html         # Low stock alerts
│   ├── managestock.html      # Stock management
│   ├── sales.html            # Sales & orders
│   └── profile.html          # User profile
│
├── index.html                # Redirects to FRONTEND/login.html
├── .env.example              # Environment variable template
├── .gitignore
├── metadata.json
└── README.md
```

---

## Tech Stack

**Frontend:**
- HTML, CSS, vanilla JavaScript
- Lucide Icons (via CDN)
- Google Fonts (Inter)

**Backend:**
- Python 3.10+
- Django 4.2
- Django REST Framework
- django-cors-headers

**Database:**
- MySQL via XAMPP

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- XAMPP (for MySQL)

### 1. Frontend

No build step required. The frontend is plain HTML/CSS/JS. Open `FRONTEND/login.html` directly in your browser, or serve the project root with any static file server.

### 2. Backend Setup

```bash
cd BACKEND
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
pip install mysqlclient       # MySQL driver for XAMPP
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver    # http://localhost:8000
```

### 3. Database Configuration

1. Open XAMPP Control Panel and start **Apache** and **MySQL**.
2. Go to `http://localhost/phpmyadmin`.
3. Click **Databases** tab, create a database named `Haneus-Inventory` with collation `utf8mb4_general_ci`.
4. Create `BACKEND/.env` based on `BACKEND/.env.example`:

```
DB_ENGINE=mysql
DB_NAME=Haneus-Inventory
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
```

5. Run migrations:

```bash
cd BACKEND
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Viewing your data:**
- Go to `http://localhost/phpmyadmin`, click `Haneus-Inventory` in the sidebar.
- The `users` table stores all admin user accounts.
- Other tables: `api_product`, `api_sale`.

---

## Login Page (`FRONTEND/login.html`)

The login page is connected to the Django backend at `http://localhost:8000/api/auth/login/`.

**How it works:**
1. User enters their **Username** (which is their email address from registration) and **Password**.
2. The form sends a `POST` request with `{ "username": "...", "password": "..." }` to the backend.
3. On success, the backend returns `{ "success": true, "user": { id, username, email, first_name, last_name } }`.
4. The user data is saved to `localStorage` and the browser redirects to `dashboard.html`.
5. On failure, an error message is displayed below the form.

**Database table:** Admin user accounts are stored in the `users` table (custom Django user model).

**Registration note:** When a user registers via `register.html`, their email is used as both `username` and `email`. So to log in, they enter their email in the "Username" field.

### API Endpoint Used

`POST /api/auth/login/`

- **Request body:** `{ "username": "string", "password": "string" }`
- **Success response (200):** `{ "success": true, "user": { "id", "username", "email", "first_name", "last_name" } }`
- **Error response (401):** `{ "error": "Invalid username or password." }`
- **Defined in:** `BACKEND/api/urls.py` → `path("auth/login/", views.LoginView.as_view())`

### Python Files Implemented

- **`BACKEND/api/models.py`** — Added `User` model extending `AbstractUser` with `db_table = "users"`. This creates the `users` table in the `Haneus-Inventory` database instead of Django's default `auth_user`.
- **`BACKEND/api/views.py`** — `LoginView` receives `username` + `password`, calls `django.contrib.auth.authenticate()`, and returns user data via `UserSerializer` on success or `401` on failure.
- **`BACKEND/api/serializers.py`** — `LoginSerializer` validates incoming `username` (CharField) and `password` (CharField). `UserSerializer` serializes the response with fields: `id`, `username`, `email`, `first_name`, `last_name`.
- **`BACKEND/api/urls.py`** — Maps `auth/login/` to `LoginView`.
- **`BACKEND/api/admin.py`** — Registered custom `User` model with Django's `UserAdmin` so admin users can be managed at `http://localhost:8000/admin/`.
- **`BACKEND/pos_core/settings.py`** — Added `AUTH_USER_MODEL = "api.User"` to tell Django to use the custom User model. Default `DB_NAME` changed to `Haneus-Inventory`.

---

## API Endpoints (CRUD)

All endpoints are prefixed with `/api/`.

**Authentication:**
- `POST /api/auth/register/` — Register a new admin user (sends: `name`, `email`, `password`)
- `POST /api/auth/login/` — Login with username + password, returns user data

**Products (full CRUD):**
- `GET /api/products/` — List all products
- `POST /api/products/` — Create a new product
- `GET /api/products/<id>/` — Get product detail
- `PUT /api/products/<id>/` — Update a product
- `DELETE /api/products/<id>/` — Delete a product

**Sales (full CRUD):**
- `GET /api/sales/` — List all sales
- `POST /api/sales/` — Create a new sale
- `GET /api/sales/<id>/` — Get sale detail
- `PUT /api/sales/<id>/` — Update a sale
- `DELETE /api/sales/<id>/` — Delete a sale

**Django Admin Panel:**
- `http://localhost:8000/admin/` — Manage data via Django admin

---

## What Was Updated

1. **Django backend created** — Full Python/Django REST Framework backend with CRUD for Products, Sales, and User authentication.
2. **Custom User model** — `api.User` extends `AbstractUser` with `db_table = "users"`. Set via `AUTH_USER_MODEL = "api.User"` in settings.
3. **Login page connected** — `FRONTEND/login.html` sends `POST /api/auth/login/` to Django backend, stores user data in `localStorage`, redirects to dashboard.
4. **Flexible database configuration** — `BACKEND/pos_core/settings.py` reads `DB_ENGINE` env var. Default database: `Haneus-Inventory` (MySQL via XAMPP).
5. **Backend folder structure** — Separated into `pos_core/` (Django config), `api/` (REST API), and `python/` (utility scripts).
6. **Frontend is pure HTML/CSS/JS** — No build tools required. Lucide Icons loaded via CDN.
7. **.gitignore updated** — Covers Python (`__pycache__/`, `venv/`, `*.pyc`), Django (`staticfiles/`), and OS/IDE files.
