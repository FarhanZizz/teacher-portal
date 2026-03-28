# TeacherHub — Full Stack Teacher Management Portal

A full-stack application built with **CodeIgniter 4 (PHP)** for the backend API and **ReactJS** for the frontend, featuring JWT-based authentication and a relational database design.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | CodeIgniter 3/4, PHP 8+             |
| Auth      | JWT (HS256, custom library)         |
| Database  | MySQL 5.7+ **or** PostgreSQL 12+    |
| Frontend  | ReactJS 18, React Router v6, Axios  |
| Styling   | CSS Modules, Google Fonts           |

---

## Project Structure

```
teacher-portal/
├── backend/                    # CodeIgniter API
│   ├── application/
│   │   ├── config/
│   │   │   ├── config.php      # App config + JWT secret
│   │   │   ├── database.php    # DB credentials
│   │   │   └── routes.php      # API route definitions
│   │   ├── controllers/
│   │   │   ├── Api_Controller.php   # Base: CORS, JWT helper, respond()
│   │   │   ├── Auth.php             # Register, Login, Logout, Me
│   │   │   ├── Teachers.php         # CRUD + combined POST
│   │   │   ├── Users.php            # Auth user listing
│   │   │   └── Options.php          # CORS preflight
│   │   ├── models/
│   │   │   ├── Auth_model.php
│   │   │   └── Teacher_model.php
│   │   └── libraries/
│   │       └── Jwt.php              # Custom JWT library (HS256)
│   ├── database/
│   │   ├── schema_mysql.sql         # MySQL schema + seed data
│   │   └── schema_pgsql.sql         # PostgreSQL schema + seed data
│   ├── .htaccess
│   └── index.php
│
└── frontend/                   # ReactJS Application
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js              # Router + protected routes
        ├── index.js
        ├── index.css           # Global design tokens
        ├── context/
        │   └── AuthContext.js  # Auth state (login/logout/register)
        ├── services/
        │   └── api.js          # Axios instance + API calls
        ├── components/
        │   ├── Layout.js / .module.css     # Sidebar shell
        │   ├── DataTable.js / .module.css  # Sortable, searchable table
        │   └── Toast.js                    # Notification toasts
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js    # Stats + recent teachers
            ├── TeachersPage.js     # Teachers datatable
            ├── UsersPage.js        # Auth users datatable
            ├── AddTeacherPage.js   # Combined POST form
            └── *.module.css
```

---

## Database Schema

```
auth_user
─────────────────────────────────────────────
id           INT  PK AUTO_INCREMENT
email        VARCHAR(180) UNIQUE NOT NULL
first_name   VARCHAR(100) NOT NULL
last_name    VARCHAR(100) NOT NULL
password     VARCHAR(255) NOT NULL  (bcrypt)
phone        VARCHAR(20)
created_at   DATETIME
updated_at   DATETIME

teachers
─────────────────────────────────────────────
id               INT  PK AUTO_INCREMENT
user_id          INT  FK → auth_user.id  (UNIQUE — enforces 1-1)
university_name  VARCHAR(255) NOT NULL
gender           ENUM(male, female, other)
year_joined      YEAR NOT NULL
subject          VARCHAR(150)
bio              TEXT
created_at       DATETIME
updated_at       DATETIME
```

---

## API Endpoints

### Auth (public)
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| POST   | `/api/auth/register`   | Register new user     |
| POST   | `/api/auth/login`      | Login, returns JWT    |
| POST   | `/api/auth/logout`     | Logout (token aware)  |
| GET    | `/api/auth/me`         | Get own profile       |

### Teachers (🔒 JWT required)
| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/teachers`        | List all teachers + user data        |
| POST   | `/api/teachers`        | **Create auth_user + teacher together** |
| GET    | `/api/teachers/:id`    | Get single teacher                   |
| PUT    | `/api/teachers/:id`    | Update teacher                       |
| DELETE | `/api/teachers/:id`    | Delete teacher + user (cascade)      |

### Users (🔒 JWT required)
| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| GET    | `/api/users`     | List all auth users |
| GET    | `/api/users/:id` | Get single user     |

### Example: Combined Teacher POST body
```json
{
  "email": "jane@mit.edu",
  "first_name": "Jane",
  "last_name": "Doe",
  "password": "secret123",
  "phone": "+1-555-0199",
  "university_name": "MIT",
  "gender": "female",
  "year_joined": 2021,
  "subject": "Computer Science",
  "bio": "Expert in machine learning."
}
```

---

## Setup Instructions

### Prerequisites
- PHP 8.0+
- Composer
- MySQL 5.7+ or PostgreSQL 12+
- Apache with `mod_rewrite` enabled (or Nginx)
- Node.js 18+ and npm

---

### Backend Setup

#### 1. Install CodeIgniter
```bash
cd backend
composer require codeigniter/framework
# OR download CI3 from https://codeigniter.com and place system/ folder here
```

#### 2. Configure the database
Edit `application/config/database.php`:
```php
$db['default']['hostname'] = 'localhost';
$db['default']['username'] = 'your_db_user';
$db['default']['password'] = 'your_db_password';
$db['default']['database'] = 'teacher_portal';
$db['default']['dbdriver'] = 'mysqli'; // or 'postgre' for PostgreSQL
```

#### 3. Create the database and run schema
**MySQL:**
```bash
mysql -u root -p < database/schema_mysql.sql
```

**PostgreSQL:**
```bash
psql -U postgres -f database/schema_pgsql.sql
```

#### 4. Configure Apache virtual host
```apache
<VirtualHost *:80>
    DocumentRoot "/path/to/backend"
    ServerName localhost
    Alias /teacher-api "/path/to/backend"

    <Directory "/path/to/backend">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### 5. Update base URL
In `application/config/config.php`:
```php
$config['base_url'] = 'http://localhost/teacher-api/';
```

#### 6. Test the API
```bash
curl -X POST http://localhost/teacher-api/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","first_name":"Test","last_name":"User","password":"pass123"}'
```

---

### Frontend Setup

#### 1. Install dependencies
```bash
cd frontend
npm install
```

#### 2. Configure API URL (optional)
Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost/teacher-api/api
```

#### 3. Start development server
```bash
npm start
```
App runs at `http://localhost:3000`

#### 4. Build for production
```bash
npm run build
```
Output in `frontend/build/` — deploy to any static host or serve via Apache/Nginx.

---

## Seed Credentials

After running the SQL schema, these accounts are available (password: `password123`):

| Email                    | Name          | Role    |
|--------------------------|---------------|---------|
| alice@university.edu     | Alice Johnson | Teacher |
| bob@university.edu       | Bob Williams  | Teacher |
| carol@university.edu     | Carol Martinez| Teacher |

---

## Key Design Decisions

1. **Custom JWT Library** — No third-party dependencies; pure PHP HS256 implementation.
2. **Single POST API** — `POST /api/teachers` inserts into both `auth_user` and `teachers` inside a database transaction, guaranteeing data consistency.
3. **1-1 Relationship** — Enforced by a `UNIQUE` constraint on `teachers.user_id` at the DB level.
4. **Cascade Delete** — Deleting a teacher also removes their `auth_user` row via `ON DELETE CASCADE`.
5. **Token-based Auth** — Every protected endpoint uses `require_auth()` from the base controller.
