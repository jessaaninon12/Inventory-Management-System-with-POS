# SariSari Management System

A modern, responsive **Point of Sale (POS) and Inventory Management System** built for Sari-Sari stores. Features a React + TypeScript frontend and a Django REST Framework backend targeting SQL Server (SSMS).

---

## Tech Stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons |
| Backend  | Python, Django, Django REST Framework                             |
| Database | SQL Server (SSMS 19) via `django-mssql-backend`                   |
| Tools    | Node.js, npm, XAMPP (optional), SSMS 19                           |

---

## Implemented Features

### Frontend (React + TypeScript)

- **Login & Registration** — Role-based login with **User Type dropdown** (Admin, Manager, CEO, Staff Worker) on the login page; registration form with matching role selection and full field validation (first name, surname, email, phone, address, password confirmation)
- **Dashboard** — Overview with stat cards (Today's Sales, Total Revenue, Total Products, Customer Credits)
  - Real-time UTC clock (hh:mm:ss AM/PM) in the header
  - Interactive sales trend bar chart (last 7 days)
  - Top Selling products list with **"View All"** overlay showing full ranked list
  - **Low Stock** indicator with overlay listing all items below threshold
  - **Pending POs** with overlay and **Resolve** button per PO
  - **Recent Stock** changes with overlay showing full history
- **Point of Sale (POS)** — Product grid with search, cart with quantity controls, checkout flow
- **Inventory Management** — Product cards with CRUD (Add, Edit, Delete), low stock warnings, per-product thresholds
- **Stock Management** — Purchase order tracking
- **User Management** — User cards with role badges (Admin/CEO/Manager only)
- **Reports & Analytics** — Weekly sales summary with PDF export placeholder (Admin/CEO only)
- **Customer Credits (CD)** — Credit tracking per customer (Manager only)
- **Dark/Light Mode** — Full theme toggle with CSS variable-based theming; all section cards (POS, Inventory, Stock, Users, Reports, CD) use consistent theme-aware colors for both light and dark modes
- **Themed UI Components** — Blue hamburger menu button (white hover in light mode, dark blue hover in dark mode); properly themed cards, borders, and backgrounds across all sections
- **Role-Based Access Control** — Sidebar sections restricted by user role
- **Responsive Design** — Collapsible sidebar, mobile-friendly layout
- **Comprehensive .gitignore** — Excludes `node_modules/`, `package-lock.json`, Python `venv/`, `__pycache__/`, IDE files, OS files, and build artifacts from version control
- **API Integration** — Fetch wrapper (`src/services/api.ts`) with automatic fallback to mock data when the Django backend is unreachable

### Backend (Django — Scaffolding)

The `backend/` folder contains **reference files** for the Django REST API:

| File                  | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `models.py`           | Django models: UserAccount, Category, Product, Sale, SaleItem |
| `serializers.py`      | DRF serializers for all models                            |
| `views.py`            | ModelViewSet for Products, Categories, Sales, Users       |
| `urls.py`             | DRF router with `/products/`, `/categories/`, `/sales/`, `/users/` endpoints |
| `settings_snippet.py` | Django settings fragment for MSSQL + CORS configuration   |
| `schema.sql`          | SQL Server DDL to create the `SariSariDB` database and all tables |

> **Note:** The backend folder is scaffolding — it contains models, serializers, views, and URL routing, but is **not yet a runnable Django project**. See [Remaining Backend Setup](#3-create-the-django-project-remaining-setup) below.

---

## Run Locally

### Prerequisites

- **Node.js** (v18+) and **npm**
- **Python** (3.10+) and **pip**
- **SQL Server** (2019 or later) — see [SSMS 19 Setup](#ssms-19-setup)
- **ODBC Driver 17 for SQL Server** — [Download here](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

---

### 1. Frontend Setup

```bash
# Navigate to the project folder
cd C:\Users\provu\Desktop\POS

# Install dependencies
npm install

# Create your .env.local file
copy .env.example .env.local

# Start the development server (http://localhost:3000)
npm run dev
```

The frontend runs on **http://localhost:3000** and works standalone with mock data. When the Django backend is running at `http://localhost:8000/api`, it will automatically connect to it.

---

### 2. Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```
VITE_API_URL=http://localhost:8000/api
```

---

### 3. Create the Django Project (Remaining Setup)

The `backend/` folder has the models, serializers, views, and URLs ready, but the following steps are needed to make it a runnable Django project:

```bash
# 1. Create a virtual environment
cd C:\Users\provu\Desktop\POS
python -m venv venv
venv\Scripts\activate

# 2. Install Python dependencies
pip install django djangorestframework django-cors-headers django-mssql-backend

# 3. Create the Django project
django-admin startproject sarisari_backend .
# This creates manage.py and sarisari_backend/ settings folder in the POS directory.

# 4. Create the Django app
python manage.py startapp api

# 5. Copy the scaffolding files into the app:
#    - Copy backend/models.py       → api/models.py
#    - Copy backend/serializers.py   → api/serializers.py
#    - Copy backend/views.py         → api/views.py
#    - Copy backend/urls.py          → api/urls.py
```

Then update `sarisari_backend/settings.py`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # Must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'SariSariDB',
        'USER': 'your_username',        # Replace with your SQL Server login
        'PASSWORD': 'your_password',    # Replace with your SQL Server password
        'HOST': 'localhost',            # Or your SSMS instance (e.g., DESKTOP-XXXX\SQLEXPRESS)
        'PORT': '',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

Update `sarisari_backend/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

Then run migrations and start the server:

```bash
python manage.py makemigrations api
python manage.py migrate
python manage.py createsuperuser   # Create an admin account
python manage.py runserver 8000    # http://localhost:8000/api
```

---

## SSMS 19 Setup

SQL Server Management Studio 19 is needed to manage the `SariSariDB` database.

### Install & Configure

1. **Install SQL Server 2019** (Developer or Express edition — both free):
   - Download: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - During setup, enable **SQL Server and Windows Authentication mode**
   - Note your instance name (e.g., `localhost` or `DESKTOP-XXXX\SQLEXPRESS`)

2. **Install SSMS 19**:
   - Download: https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

3. **Install ODBC Driver 17 for SQL Server**:
   - Download: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

### Create the Database

Open SSMS 19, connect to your SQL Server instance, then open a **New Query** and run the contents of `backend/schema.sql`:

```sql
CREATE DATABASE SariSariDB;
GO

USE SariSariDB;
GO

-- Tables: UserAccounts, Categories, Products, Sales, SaleItems
-- (see backend/schema.sql for the full DDL)
```

> **Note:** If using Django migrations (`python manage.py migrate`), you only need to create the empty database — Django will create the tables automatically. You do **NOT** need to run the full `schema.sql` manually in that case.

### Remaining SSMS Steps

- [ ] Verify SQL Server service is running (check **SQL Server Configuration Manager** → SQL Server Services)
- [ ] Create a SQL Server login for the app (or use Windows Authentication)
- [ ] Update `DATABASES` credentials in `sarisari_backend/settings.py` with your actual username, password, and host
- [ ] Confirm connectivity: in SSMS, right-click your server → Properties → Connections → ensure "Allow remote connections" is checked
- [ ] Test the ODBC connection: run `python -c "import pyodbc; print(pyodbc.drivers())"` — you should see `ODBC Driver 17 for SQL Server` in the list

---

## XAMPP Setup (Optional)

XAMPP is **not required** for local development since the frontend runs on Vite's dev server (port 3000) and the backend runs on Django's dev server (port 8000). However, if you want to use XAMPP's **Apache** as a reverse proxy for production-like deployment:

### Remaining XAMPP Steps

- [ ] Install XAMPP: https://www.apachefriends.org/download.html
- [ ] Start **Apache** from the XAMPP Control Panel
- [ ] Configure Apache as a reverse proxy — edit `C:\xampp\apache\conf\httpd.conf`:
  - Uncomment/enable `mod_proxy`, `mod_proxy_http`, `mod_proxy_balancer`, `mod_lbmethod_byrequests`
- [ ] Add a VirtualHost in `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
    ServerName sarisari.local

    # Proxy API requests to Django
    ProxyPass /api http://localhost:8000/api
    ProxyPassReverse /api http://localhost:8000/api

    # Serve the built frontend
    DocumentRoot "C:/Users/provu/Desktop/POS/dist"
    <Directory "C:/Users/provu/Desktop/POS/dist">
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
</VirtualHost>
```

- [ ] Build the frontend for production: `npm run build` (creates `dist/` folder)
- [ ] Add `127.0.0.1 sarisari.local` to `C:\Windows\System32\drivers\etc\hosts`
- [ ] Restart Apache and access `http://sarisari.local`

> **Tip:** For local development, you do NOT need XAMPP. Just run `npm run dev` (frontend) and `python manage.py runserver 8000` (backend) separately.

---

## Project Structure

```
POS/
├── backend/                  # Django backend scaffolding (reference files)
│   ├── models.py             # Django ORM models
│   ├── serializers.py        # DRF serializers
│   ├── views.py              # DRF viewsets
│   ├── urls.py               # DRF router configuration
│   ├── settings_snippet.py   # Django settings reference (MSSQL + CORS)
│   └── schema.sql            # SQL Server DDL for SariSariDB
├── src/                      # React frontend source
│   ├── App.tsx               # Main application component (all sections)
│   ├── constants.ts          # Mock data (users, products, sales)
│   ├── index.css             # Tailwind CSS + custom theme variables
│   ├── main.tsx              # React entry point
│   ├── types.ts              # TypeScript interfaces
│   └── services/
│       └── api.ts            # Django API fetch wrapper
├── .env.example              # Environment variable template
├── .gitignore
├── index.html                # Vite entry HTML
├── metadata.json             # App metadata
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite build configuration
```

---

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm install`     | Install frontend dependencies            |
| `npm run dev`     | Start Vite dev server on port 3000       |
| `npm run build`   | Build for production (outputs to `dist/`)|
| `npm run preview` | Preview production build                 |
| `npm run lint`    | TypeScript type-check (`tsc --noEmit`)   |
