# Expense Tracker

A comprehensive full-stack budgeting and expense tracking web application that helps users manage their finances, track income and expenses, and visualize their financial data through interactive charts and analytics.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Testing](#testing)
- [Contributors](#contributors)

## Overview

Expense Tracker is a modern web application designed to help users take control of their finances. The platform provides tools for tracking income and expenses, categorizing spending, visualizing financial trends, and managing multiple accounts including shared accounts for collaborative financial management.

## Features

### Core Functionality

- **User Authentication**: Secure login and registration system with JWT-based authentication
- **Dashboard**: Centralized view displaying monthly savings/loss, financial summaries, and quick access to key features
- **Expense Management**: 
  - Add, edit, and delete expenses
  - Categorize expenses (housing, auto, food, utilities, entertainment, miscellaneous)
  - Tag expenses for better organization
  - Support for recurring expenses
  - Date-based filtering and search
- **Income Tracking**: Record and manage income sources with descriptions and amounts
- **Financial Analytics**: 
  - Interactive pie charts showing expense breakdown by category
  - Bar charts comparing income vs expenses month-over-month
  - Summary tables with detailed transaction breakdowns
- **Multi-Account Support**:
  - Create and manage multiple personal accounts
  - Create shared accounts for collaborative financial management
  - Invite members to shared accounts
  - Account switching functionality
- **Profile Management**: Update user profile information and profile pictures
- **Data Export**: Export expense data to CSV or PDF formats
- **Notifications**: Receive notifications for account invitations and other important updates

### User Interface

- Responsive design that works on desktop and mobile devices
- Modern UI built with Tailwind CSS and custom components
- Intuitive navigation with sidebar menu
- Real-time data updates
- Toast notifications for user feedback

## Tech Stack

### Frontend

- **React 19**: Modern React with hooks and context API
- **Vite**: Fast build tool and development server
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library for data visualization
- **Axios**: HTTP client for API requests
- **React Hot Toast**: Toast notification library
- **jsPDF**: PDF generation for exports
- **PapaParse**: CSV parsing and generation
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation utilities

### Backend

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Bcryptjs**: Password hashing
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing
- **Dotenv**: Environment variable management

### Development Tools

- **Jest**: Backend testing framework
- **Vitest**: Frontend testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Project Structure

```
Capstone-Public/
├── Group_21/
│   ├── backend/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication and account context middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── uploads/         # Uploaded files (profile images)
│   │   ├── tests/           # Backend tests
│   │   └── server.js        # Express server entry point
│   │
│   ├── frontend/
│   │   ├── public/          # Static assets
│   │   └── src/
│   │       ├── components/  # Reusable React components
│   │       ├── context/     # React context providers
│   │       ├── layouts/     # Layout components
│   │       ├── pages/       # Page components
│   │       ├── utils/       # Utility functions
│   │       ├── __tests__/   # Frontend tests
│   │       └── App.jsx      # Main application component
│   │
│   ├── README.md            # Project documentation
│   ├── setup.md             # Setup instructions
│   └── .gitignore          # Git ignore rules
│
└── README.md                # Main project README
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB instance)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shara111/ExpenseTracker.git
cd Capstone-Public/Group_21
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=8000
```

**Generating JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**MongoDB Connection:**
- Sign up for MongoDB Atlas (free tier available)
- Create a cluster and get your connection string
- Replace `<password>` with your database password
- Example format: `mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority`

### Frontend Environment Variables

If your frontend needs API configuration, create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:8000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or the next available port)

### Production Build

Build the frontend for production:
```bash
cd frontend
npm run build
```

The production-ready files will be in the `dist` directory.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/verify` - Verify JWT token

### Expenses
- `GET /api/v1/expense` - Get all expenses
- `POST /api/v1/expense` - Create new expense
- `PUT /api/v1/expense/:id` - Update expense
- `DELETE /api/v1/expense/:id` - Delete expense

### Income
- `GET /api/v1/income` - Get all income records
- `POST /api/v1/income` - Create new income record
- `PUT /api/v1/income/:id` - Update income record
- `DELETE /api/v1/income/:id` - Delete income record

### Profile
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile
- `POST /api/v1/profile/upload` - Upload profile picture

### Accounts
- `GET /api/v1/accounts` - Get all user accounts
- `POST /api/v1/accounts` - Create new account
- `PUT /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Delete account

### Invitations
- `POST /api/v1/invitations` - Send account invitation
- `GET /api/v1/invitations` - Get user invitations
- `PUT /api/v1/invitations/:id` - Accept/decline invitation

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `PUT /api/v1/notifications/:id` - Mark notification as read

### Finance
- `GET /api/v1/finances` - Get financial summary and analytics

## Development

### Code Formatting

Both frontend and backend use Prettier for code formatting:

```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

### Linting

Frontend uses ESLint for code linting:

```bash
cd frontend
npm run lint
```

## Testing

### Backend Tests

Run backend tests using Jest:

```bash
cd backend
npm test
```

### Frontend Tests

Run frontend tests using Vitest:

```bash
cd frontend
npm test
```

Run tests in watch mode:
```bash
npm run test:ui
```

## Important Notes

### Security

- Never commit `.env` files or sensitive information
- Keep `node_modules` in `.gitignore`
- Use strong JWT secrets in production
- Validate and sanitize all user inputs

### File Uploads

Profile images are stored in `backend/backend/uploads/profile/` directory. Ensure this directory exists and has proper write permissions.

### Database Models

The application uses the following main models:
- **User**: User accounts and authentication
- **Account**: Financial accounts (personal and shared)
- **Expense**: Expense transactions
- **Income**: Income transactions
- **Invitation**: Account sharing invitations
- **Notification**: User notifications
- **Finance**: Financial summaries and calculations

## Contributors

| Name | Role | GitHub | Email |
|------|------|--------|-------|
| Sean Muniz | Back-End Developer | [seanMuniz](https://github.com/seanMuniz) | smuniz@myseneca.ca |
| Cris Huynh | Back-End Developer | [CrisH2307](https://github.com/CrisH2307) | xhuynh@myseneca.ca |
| Sukhman Hara | Front-End Developer | [shara111](https://github.com/shara111) | shara1@myseneca.ca |
| Kabir Narula | Front-End Developer | [Kabir-Narula](https://github.com/Kabir-Narula) | knarula9@myseneca.ca |

## License

This project is part of a capstone course at Seneca College.

## Support

For issues, questions, or contributions, please contact the development team or open an issue on the GitHub repository.

