# DomeLink Architecture & Systems Design

This document details the underlying mechanics, workflows, and logical separation of concerns within the DomeLink ecosystem.

## 1. High-Level Request Flow
The architecture relies on an Express-based Node.js backend mediating secure connections to PostgreSQL while delegating active eventing to Socket.io. The React frontend interacts with these services via strongly typed endpoints.

```mermaid
flowchart LR
    Browser[Client Browser] <--> |HTTPS / WSS| Nginx[Load Balancer / Nginx]
    
    subgraph Infrastructure
        Nginx --> |API Routes| Express[Express Server API]
        Nginx --> |Sockets| Socket[Socket.IO Gateway]
        
        Express --> |Strict Typing| Zod[Zod Validation]
        Zod --> |Prisma Client| Postgres[(PostgreSQL)]
        Socket --> Postgres
    
        Express --> Logger[Structured Logging]
        Express --> Security[Rate Limits & CSP]
    end
    
    subgraph Observability
        Express -.-> SentryN[Sentry Node]
        Browser -.-> SentryR[Sentry React Replay]
    end
```

## 2. Avora AI Orchestration Workflow
To prevent architectural hallucinations and maintain budget accuracy, the Avora AI service utilizes a "Cache-First, Fallback-Secure" methodology.

```mermaid
sequenceDiagram
    participant User as Homeowner (Client)
    participant API as Express API
    participant Cache as Memory Cache
    participant Groq as Groq LLM (Avora)
    participant DB as Prisma (DB)

    User->>API: Submits Budget Requirements
    API->>Cache: Check for previous identical parameters
    alt Cache Hit
        Cache-->>API: Returning Cached Feasibility
    else Cache Miss
        API->>Groq: Generate Feasibility Report (Strict JSON)
        alt API Success
            Groq-->>API: AI Generated Budget (JSON)
        else Provider Failure / Timeout
            Groq--XAPI: Error 503
            Note over API: Falls back to deterministic regional templates
            API-->>API: Generate Deterministic Budget
        end
        API->>DB: Log Avora Analytics Event
        API->>Cache: Store result for 10 minutes
    end
    API-->>User: Present Architectural Intel
```

## 3. The Trust & Security Layer
Because DomeLink acts as a high-value marketplace, enterprise-grade protection is baked into the request cycle before any controller logic executes.

```mermaid
graph TD
    Request(Incoming Request) --> RL{Rate Limiter}
    RL -->|Pass| Helmet[Helmet CSP/Headers]
    RL -->|Fail| 429[429 Too Many Requests]
    
    Helmet --> SRD{Suspicious Request Detector}
    SRD -->|XSS/SQLi Detected| Drop[Drop Request & Log IP]
    SRD -->|Clean| Auth{JWT Middleware}
    
    Auth -->|Valid| Zod[Zod Body/Query Validator]
    Auth -->|Missing/Expired| 401[401 Unauthorized]
    
    Zod -->|Valid Types| Controller[Route Controller Logic]
    Zod -->|Invalid Types| 400[400 Bad Request]
```

## 4. Webhook Resilience Pipeline
Payment reconciliation relies on webhooks that can occasionally fail due to race conditions or database locks. DomeLink utilizes a passive-recovery chron worker.

```mermaid
stateDiagram-v2
    [*] --> WebhookReceived
    
    WebhookReceived --> PaymentSignatureValidated
    PaymentSignatureValidated --> Processing
    
    Processing --> Handled: Success
    Processing --> Dropped: Exception Thrown
    
    Dropped --> RetryQueue: Saved to DB (processed: false)
    
    state RetryQueue {
        [*] --> Waiting
        Waiting --> ChronWorker: 1 Hour Interval
        ChronWorker --> ReplayAttempt
        ReplayAttempt --> Handled: Success
        ReplayAttempt --> Waiting: Failure
    }
```
