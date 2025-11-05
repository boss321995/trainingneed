# Training Need System

A sample Training Need system with Nuxt 3 frontend and Express.js mock backend.

## Features

### Frontend (Nuxt 3)

- JWT token authentication (mock)
- Role-based access control (user, manager, hrd_admin)
- Training Need submission form
- Reports dashboard for HRD admins
- Responsive UI with TailwindCSS

### Backend (Express.js)

- Mock JWT validation
- In-memory data storage
- RESTful API endpoints
- CSV export functionality

## Project Structure

```
trainingneed/
├── backend/
│   ├── db.js                 # Mock database
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── employees.js     # Employee data routes
│   │   ├── training.js      # Training need routes
│   │   └── reports.js       # Reports and export routes
│   ├── server.js            # Express server
│   └── package.json
├── components/
│   ├── TrainingForm.vue     # Reusable training form
│   ├── ReportTable.vue      # Reports table component
│   └── SummaryChart.vue     # Summary dashboard
├── pages/
│   ├── index.vue            # Home page
│   ├── login.vue            # Login page
│   ├── training/
│   │   └── new.vue          # New training need form
│   └── reports/
│       └── index.vue        # Reports page
├── stores/
│   └── auth.ts              # Pinia auth store
├── middleware/
│   ├── auth.ts              # Auth middleware
│   └── role.ts              # Role middleware
├── plugins/
│   └── auth.client.ts       # Auth plugin
└── nuxt.config.ts
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the backend server:

   ```bash
   npm start
   ```

   or for development:

   ```bash
   npm run dev
   ```

   Backend will run on http://localhost:4000

### Frontend Setup

1. Install dependencies (from root directory):

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   Frontend will run on http://localhost:3000

## Usage

### Login

Use one of the mock tokens:

- `mock-user-token` - Regular user (John Doe, IT Department)
- `mock-manager-token` - Manager (Jane Smith, HR Department)
- `mock-admin-token` - HRD Admin (Bob Johnson, HR Department)

### API Endpoints

#### Authentication

- `POST /api/auth/validate` - Validate JWT token

#### Employee Data

- `GET /api/employee/:id` - Get employee information

#### Training Needs

- `POST /api/training-needs` - Submit new training need

#### Reports

- `GET /api/reports?quarter=Q1&department=IT` - Get filtered reports
- `GET /api/reports/export` - Export reports as CSV

## Production Notes

### JWT Token Integration

In production, replace the mock token validation in `backend/routes/auth.js` with actual JWT verification from `hrd.ntplc.co.th`.

### Database

Replace the in-memory arrays in `backend/db.js` with a proper database connection.

### CORS

Configure CORS settings in `backend/server.js` for production domains.

## Technologies Used

- **Frontend**: Nuxt 3, Vue 3, Pinia, TailwindCSS
- **Backend**: Node.js, Express.js, CORS
- **Data Export**: csv-writer

# yarn

yarn build

# bun

bun run build

````

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
````

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
