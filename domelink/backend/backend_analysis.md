# DomeLink Backend Analysis

This document provides an overview of the current backend architecture and components of the DomeLink project.

## Directory Structure
The backend is primarily structured within the `domelink/backend/src` directory, using a standard Express.js / TypeScript architecture.

### Core Configuration & Entry Points
- `src/server.ts`: Entry point for the server.
- `src/app.ts`: Express application setup and middleware configuration.
- `src/socket.ts`: Socket.io implementation for real-time communication.
- `src/config/db.ts`: MongoDB connection configuration.
- `src/config/env.ts`: Environment variable management.

### Controllers (`src/controllers/`)
Controllers handle the incoming requests and interact with models/services.
- `admin.controller.ts`: Administrative operations.
- `ai.controller.ts`: AI-related features.
- `analytics.controller.ts`: User and platform analytics.
- `architect.controller.ts`: Architect profile and management logic.
- `auth.controller.ts`: User authentication (Login, Register, etc.).
- `blog.controller.ts`: Blog post CRUD operations.
- `budget.controller.ts`: Project budgeting tools.
- `chat.controller.ts`: Real-time chat functionality.
- `consultation.controller.ts`: Consultation scheduling and management.
- `file.controller.ts`: File upload and management.
- `notification.controller.ts`: In-app and push notifications.
- `payment.controller.ts`: Payment processing.
- `portfolio.controller.ts`: Portfolio management for architects.
- `project-brief.controller.ts`: Project briefing logic.
- `recommendation.controller.ts`: AI-driven architect recommendations.
- `review.controller.ts`: User reviews and ratings.
- `saved.controller.ts`: Saved architects/projects.
- `styleQuiz.controller.ts`: Style quiz logic.
- `support.controller.ts`: Customer support tickets.
- `team.controller.ts`: Team management for architects.
- `user.controller.ts`: User profile management.

### Routes (`src/routes/`)
Routes define the API endpoints.
- `index.ts`: Main router that aggregates all other routes.
- Routes for each controller: `admin.routes.ts`, `ai.routes.ts`, `auth.routes.ts`, `user.routes.ts`, etc.

### Models (`src/models/`)
Mongoose schemas defining the data structure.
- `User.ts`: User accounts and roles.
- `Architect.ts`: Architect profiles.
- `Project.ts`: Project details.
- `ChatMessage.ts`: Chat history.
- `AnalyticsEvent.ts`: Tracking data.
- ...and others for Blogs, Consultations, Files, Payments, etc.

### Middleware (`src/middleware/`)
Custom middleware for request processing.
- `auth.ts`: Authentication and authorization checks.
- `errorHandler.ts`: Global error handling.
- `rateLimit.ts`: API rate limiting.
- `validate.ts`: Request validation logic.

### Utilities (`src/utils/`)
Helper functions and logic.
- `jwt.ts`: JWT signing and verification.
- `logger.ts`: Logging utility.
- `matchingEngine.ts`: Logic for matching users with architects.
- `seed.ts` & `seedDemo.ts`: Database seeding scripts.
- `styleMatcher.ts`: Style comparison logic.
- `AppError.ts`: Custom error class.
- `asyncHandler.ts`: Wrapper for async route handlers.

### Services (`services/`)
- `ai.service.ts`: External AI API integrations (likely OpenAI or similar).

### Legacy/Duplicate Files (To be reviewed)
There are some files at the top level of `backend/` that seem to be duplicates or older versions:
- `backend/controllers/authController.ts`
- `backend/routes/auth.ts`
- `backend/models/User.ts`
- `backend/middleware/auth.ts`
- `backend/utils/jwt.ts`

These should likely be consolidated into the `src/` directory if they aren't already.
