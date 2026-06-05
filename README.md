# HireFlow - Full-Stack Job Portal System

HireFlow is a highly responsive, modern Job Portal System designed to connect Job Seekers with Recruiters. It features a complete Node.js Express backend, a MySQL database relational schema, and a modern Vanilla CSS/JS single-page-feel web client.

---

## Technical Stack
- **Frontend**: HTML5, Vanilla CSS3 (custom HSL palettes, glassmorphism, responsive grids), Vanilla JavaScript (ES6 Modules, dynamic routing feel, client state management).
- **Backend**: Node.js, Express.js (MVC architecture, clean separation of models, services, and controllers).
- **Database**: MySQL (Connection pool, transactional integrity for profile registrations, cascade deletion constraints).
- **Authentication**: JWT token verification (`jsonwebtoken`), Password hashing (`bcryptjs`).
- **Configuration & Dependencies**: `dotenv`, `cors`, `mysql2`, `nodemon`.

---

## Project Directory Structure

```text
/d:/SQL/
  ├── hirefront/                     # Client Side Files
  │   ├── pages/
  │   │   ├── index.html             # Auth (Login / Register) view
  │   │   ├── jobs.html              # Job listings list view
  │   │   ├── job-detail.html        # Single job detail view & apply panel
  │   │   └── dashboard.html         # Candidate & Recruiter control centers
  │   ├── css/
  │   │   ├── style.css              # Global styles, variables, typography, layouts
  │   │   ├── auth.css               # Authentication cards & form transitions
  │   │   ├── jobs.css               # Search grid, filters, and cards
  │   │   └── dashboard.css          # Tables, statistics cards, and modal styles
  │   └── js/
  │       ├── api.js                 # Global fetch handler, toast system, navbar router
  │       ├── auth.js                # Register and login client logic
  │       ├── jobs.js                # Search, filtering, and job cards builder
  │       ├── job-detail.js          # Detail viewer and application submissions
  │       └── dashboard.js           # Candidate submissions/Recruiter application reviewer
  │
  ├── hireflow-backend/              # Server Side Files
  │   ├── config/
  │   │   └── db.js                  # promise-based MySQL connection pool
  │   ├── models/                    # SQL Database Query abstraction layers
  │   │   ├── userModel.js
  │   │   ├── seekerModel.js
  │   │   ├── recruiterModel.js
  │   │   ├── jobModel.js
  │   │   └── applicationModel.js
  │   ├── services/                  # Business Logic layer (MVC)
  │   │   ├── authService.js
  │   │   ├── jobService.js
  │   │   └── applicationService.js
  │   ├── controllers/               # Request handling & HTTP response mapping
  │   │   ├── authController.js
  │   │   ├── jobController.js
  │   │   └── applicationController.js
  │   ├── routes/                    # API endpoints routers
  │   │   ├── authRoutes.js
  │   │   ├── jobRoutes.js
  │   │   └── applicationRoutes.js
  │   ├── middleware/
  │   │   └── authMiddleware.js      # JWT decryption & role guards
  │   ├── server.js                  # Entry point (serves API & static frontend)
  │   ├── schema.sql                 # MySQL schema with FK constraints and seed data
  │   ├── package.json               # Package configurations
  │   └── .env                       # Environment configs
  └── README.md                      # Setup and documentation (This file)
```

---

## Installation & Setup Instructions

### 1. Database Setup
Ensure you have MySQL installed and running on your local machine.

- Log in to your MySQL terminal or database client (e.g. Workbench, DBeaver):
  ```bash
  mysql -u root -p
  ```
- Import the database schema and sample data:
  ```sql
  SOURCE d:/SQL/hireflow-backend/schema.sql;
  ```
  *(Note: If importing from terminal CLI, you can run: `mysql -u root -p < d:/SQL/hireflow-backend/schema.sql`)*. This will create the database `hireflow_db` and seed it with pre-defined recruiter accounts, seeker accounts, jobs, and applications for testing.

### 2. Configuration Setup
Modify the environment variables in [hireflow-backend/.env](file:///d:/SQL/hireflow-backend/.env):
```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=hireflow_db
DB_PORT=3306
JWT_SECRET=super_secret_jwt_key_hireflow_2026
```

### 3. Install Backend Dependencies
Open your terminal inside the `/hireflow-backend/` directory and install the Node modules:
```bash
cd d:/SQL/hireflow-backend
npm install
```

### 4. Running the Application
To run the server in development mode (reloads automatically on code modifications):
```bash
npm run dev
```
To run the server in production mode:
```bash
npm start
```

### 5. Accessing the Application
Once the server is running, the Node backend will serve the API endpoints as well as serve the client frontend statically.
- Open your browser and navigate to: **`http://localhost:5000/`**
- This will automatically redirect to the login page: **`http://localhost:5000/pages/index.html`**

---

## REST API Documentation

### Authentication Endpoints
| HTTP Method | Endpoint | Authorization | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ name, email, password, role, ...profileData }` | Registers user & creates seeker/recruiter profile. Returns token. |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates email/password. Returns token and user metadata. |

### Jobs Endpoints
| HTTP Method | Endpoint | Authorization | Query Parameters | Request Body | Description |
|---|---|---|---|---|---|
| `GET` | `/api/jobs` | Public | `search`, `location`, `minSalary` | None | Retrieves all active jobs matching optional filters. |
| `GET` | `/api/jobs/my-jobs` | Recruiter Only | None | None | Retrieves all jobs posted by the logged-in recruiter with candidate statistics. |
| `GET` | `/api/jobs/:id` | Public | None | None | Retrieves detailed information for a single job listing. |
| `POST` | `/api/jobs` | Recruiter Only | None | `{ title, description, location, salary }` | Creates and publishes a new job listing. |

### Applications Endpoints
| HTTP Method | Endpoint | Authorization | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/api/applications/apply` | Seeker Only | `{ job_id }` | Submits seeker application. Validates duplicates. |
| `GET` | `/api/applications/my-applications` | Seeker Only | None | Retrieves seeker's application history with status states. |
| `GET` | `/api/applications/job/:jobId` | Recruiter Only | None | Retrieves candidates list who applied for the recruiter's job ID. |
| `PUT` | `/api/applications/:id/status` | Recruiter Only | `{ status }` | Shortlists or rejects a candidate application (`shortlisted`/`rejected`). |

---

## Database Relational Architecture

### Database Entity-Relationship Diagram Description
1. **`users`**: Base table holding credentials and user type.
   - One user can have exactly one profile in `job_seekers` OR `recruiters` depending on the `role` enum ('job_seeker', 'recruiter').
2. **`job_seekers`**: Linked to `users` via `user_id` (FOREIGN KEY with `ON DELETE CASCADE`). Contains skills, experience (years), and clickable resume link (URL).
3. **`recruiters`**: Linked to `users` via `user_id` (FOREIGN KEY with `ON DELETE CASCADE`). Contains company name.
4. **`jobs`**: Linked to `recruiters` via `recruiter_id` (FOREIGN KEY with `ON DELETE CASCADE`). Holds job listings metadata.
5. **`applications`**: A join table mapping `jobs` to `job_seekers`.
   - Links `job_id` (FOREIGN KEY with `ON DELETE CASCADE`) and `seeker_id` (FOREIGN KEY with `ON DELETE CASCADE`).
   - Tracks submission timestamps and current review state ('applied', 'shortlisted', 'rejected').
