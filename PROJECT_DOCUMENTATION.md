# VISIONIX Project Documentation

## 1. Project Overview

VISIONIX is an AI Decision Intelligence Platform built for small business owners.

Its core idea is:

`Upload data -> Get decisions + reasoning + actions`

Unlike traditional BI tools that focus on charts and dashboards first, VISIONIX is designed as an AI business advisor. It helps users understand:

- What is going wrong
- Why it is happening
- What action should be taken next
- How confident the system is in that recommendation
- Structured data creation from Voice and Images

The platform is especially aimed at users who:

- Feel overwhelmed by raw data
- Cannot comfortably analyze spreadsheets
- Often make decisions based on guesswork
- Need simple and practical business guidance

## 2. Product Vision

VISIONIX is positioned as a decision-first product, not a reporting-first product.

### Traditional analytics mindset

- Here is your data
- Here is your dashboard
- Here is your chart

### VISIONIX mindset

- Here is your problem
- Here is why it happened
- Here is what you should do next

This makes the product more useful for real-world retail and small business operations such as:

- Textile stores
- Local retail shops
- Inventory-driven businesses
- Sales-led businesses

## 3. Key Product Features

### 3.1 Decision Feed

The main product experience is a decision feed instead of a chart-first dashboard.

Each decision card contains:

- `problem`
- `reason`
- `action`
- `confidence`
- explanation metadata
- impact labels

### 3.2 AI Advisor Chat

The system includes an AI chat advisor that answers user questions in simple language.

The chatbot is context-aware and uses:

- uploaded dataset context
- decision feed context
- recommendation context
- latest analysis context

### 3.3 Daily Recommendations

The app extracts short daily actions for business owners, such as:

- restock fast-selling items
- pause low-performing inventory
- review pricing of weak categories

### 3.4 Smart Alerts

The system produces alerts for:

- underperforming segments
- momentum changes
- inventory imbalance
- risk/opportunity signals

### 3.5 Supporting Evidence

Charts are still included, but they are secondary.

They exist only to support decisions, not replace them.

### 3.6 Data Creation Layer

- **Voice Input**: Speak orders directly to the advisor (e.g., "2 tea and 3 coffee").
- **OCR Image Parsing**: Take photos of handwritten or printed sales records to convert them into data.

### 3.7 Multilingual Support

The application includes a multilingual foundation with support for:

- English
- Hindi
- Telugu

Language selection is available across the product, and the selected language is shared across pages using a global language context.

### 3.7 Google Sign-In

The login page includes Google sign-in support using the Google Identity Services client-side integration.

### 3.8 Core Team Section

The homepage includes a startup-style Core Team section showing:

- S Abhinav Rishi
- D Ram Sai
- Shlok Karn

## 4. Technology Stack

## 4.1 Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Radix UI
- Lucide React icons
- Recharts
- next-themes

## 4.2 Backend

- Python 3.12+
- FastAPI
- Pandas
- NumPy
- HTTPX
- SQLAlchemy (SQLite)
- python-dotenv
- python-multipart

## 4.3 AI / LLM Integration

- Groq API
- fallback remote LLM support

## 4.4 Authentication

- Local-storage based auth state
- Google login support on frontend

## 5. High-Level Architecture

The system is split into two major parts:

### Frontend

Located in the Next.js application under:

- `app/`
- `components/`
- `lib/`
- `hooks/`

### Backend

Located in:

- `backend/main.py`

### Runtime architecture

1. User uploads a CSV file from the frontend.
2. Frontend sends file to FastAPI backend.
3. Backend parses the dataset using Pandas.
4. Backend computes business metrics and generates structured decisions.
5. Frontend renders:
   - decision feed
   - alerts
   - recommendations
   - supporting charts
6. User can ask follow-up questions in AI chat.
7. Backend sends contextual prompts to Groq and returns advisor responses.

## 6. Folder Structure

```text
abcdef/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   ├── setup/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── ai_service.py
│   ├── data_parser.py
│   ├── decision_engine.py
│   ├── chat_service.py
│   └── pyproject.toml
├── components/
│   ├── dashboard/
│   ├── ui/
│   ├── language-switcher.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── auth-context.tsx
│   ├── language-context.tsx
│   └── utils.ts
├── public/
│   ├── visionix-logo.png
│   ├── team-abhinav.jpeg
│   ├── team-ramsai.jpeg
│   └── team-shlok.jpeg
├── package.json
└── PROJECT_DOCUMENTATION.md
```

## 7. Frontend Architecture

## 7.1 App Router Pages

### `app/page.tsx`

Landing page for VISIONIX.

Contains:

- hero section
- product story
- experience section
- demo section
- core team section
- language switcher
- theme switcher

### `app/dashboard/page.tsx`

Main product workspace.

Contains:

- overview page
- decision feed
- advisor chat
- reports page
- upload section
- supporting evidence
- multilingual decision refresh flow

### `app/auth/login/page.tsx`

Contains:

- email/password login
- Google sign-in
- language switcher

### `app/auth/signup/page.tsx`

Contains:

- signup form
- language switcher

### `app/setup/page.tsx`

Collects profile and business context information:

- company name
- role
- preferred data type

## 7.2 Important Components

### `components/dashboard/sidebar.tsx`

Sidebar navigation for:

- overview
- decision feed
- advisor chat
- reports

Also includes:

- user card
- language switcher
- theme control
- logout

### `components/dashboard/query-input.tsx`

Decision prompt input with:

- localized placeholder text
- localized suggestions
- loading state

### `components/dashboard/insights-panel.tsx`

AI advisor chat panel with localized copy.

### `components/language-switcher.tsx`

Reusable language selector available on multiple pages.

## 7.3 UI Design System

The UI uses:

- glassmorphism cards
- premium blue-dark color direction
- distinct light and dark themes
- large rounded containers
- motion-based transitions

Animations are handled with:

- Framer Motion
- Tailwind transitions
- scroll and reveal transitions

## 8. Backend Architecture

Backend entry point:

- `backend/main.py`

The backend is responsible for:

- receiving uploads
- parsing CSV files
- computing metrics
- generating decisions
- generating alerts
- generating recommendations
- generating supporting chart data
- answering AI advisor chat questions
- translating AI response payloads for multilingual support

## 8.1 Main API Models

Defined in `backend/main.py`:

- `QueryRequest`
- `ChatRequest`
- `UploadResponse`
- `ChartItem`
- `DecisionItem`
- `AlertItem`
- `QueryResponse`
- `ChatResponse`

## 8.2 Core Backend Endpoints

### `GET /health`

Health check endpoint.

### `POST /upload`

Accepts CSV file upload.

Returns:

- file upload message
- detected columns
- preview rows

### `POST /query`

Main decision engine endpoint.

Input:

- query
- history
- language

Output:

- dataset summary
- KPIs
- decision cards
- alerts
- recommendations
- charts
- raw preview

### `POST /chat`

AI advisor endpoint.

Input:

- user message
- history
- context
- language

Output:

- advisor reply
- metadata

## 9. Decision Engine Logic

The backend uses deterministic data analysis first and AI second.

This is important because it improves trust and reliability.

### Step 1: Parse Data

Uploaded CSV is loaded into a Pandas DataFrame.

### Step 2: Detect Useful Columns

The backend tries to identify:

- revenue columns
- order columns
- price columns
- inventory columns
- margin/profit columns
- product/category columns
- date columns

### Step 3: Compute Metrics

The system computes:

- total revenue
- total orders
- average order value
- margin total

### Step 4: Build Decision Signals

The engine looks for:

- weakest segment
- strongest segment
- monthly momentum shift
- inventory imbalance
- performance volatility

### Step 5: Convert Into Decisions

Each signal becomes a structured decision item with:

- title
- priority
- kind
- problem
- reason
- action
- confidence
- explanation
- impact label
- metric value

### Step 6: Generate Alerts and Recommendations

The engine creates:

- smart alert cards
- WhatsApp-style message previews
- top 3 daily actions

## 10. AI Chat System

The chatbot is not a generic assistant. It acts as a business advisor.

### Current chat behavior

The system sends:

- dataset summary
- decisions
- recommendations
- recent message history

to the Groq model.

### Chat design rules

The system asks the model to:

- use simple language
- be decision-first
- avoid unnecessary jargon
- respond in the selected language

### Fallback behavior

If the Groq call fails:

- the system falls back to a basic contextual answer

## 11. Multilingual System

The project includes a shared global language system.

### Language state

Implemented in:

- `lib/language-context.tsx`

Responsibilities:

- store current language
- persist language to local storage
- expose `useLanguage()`

### Frontend localization

Localized UI now exists across:

- landing page
- login page
- signup page
- setup page
- dashboard
- sidebar
- query input
- advisor chat

### Backend localization

The selected language is passed to:

- `POST /query`
- `POST /chat`

The backend then:

- translates decision payloads
- requests chat responses in the selected language

### Current supported languages

- English
- Hindi
- Telugu

## 12. Authentication Flow

Auth logic lives in:

- `lib/auth-context.tsx`

### Supported methods

- email/password signup
- email/password login
- Google sign-in

### Storage approach

User state is currently stored in:

- `localStorage`

This is suitable for prototype/demo use, but not secure enough for production-grade backend auth.

## 13. Google Login

Google login is integrated on the login page through Google Identity Services.

### Flow

1. Google script loads in the browser
2. User chooses Google account
3. JWT credential is returned
4. JWT payload is decoded client-side
5. User profile is saved into local storage auth system

### Important note

This is a frontend-side integration for demo/product experience.

For full production auth, the app should later add:

- backend token verification
- secure sessions
- database persistence

## 14. Theme System

The app supports both:

- light theme
- dark theme

### Theme characteristics

#### Light theme

- white and blue palette
- softer glassmorphism
- stronger background illumination

#### Dark theme

- deep navy and electric blue palette
- stronger glass cards
- startup-style premium appearance

Theme state is handled using:

- `next-themes`

## 15. Core Team Section

Homepage includes a dedicated Core Team section.

### Team members shown

1. S Abhinav Rishi
   - Founder & Main Developer

2. D Ram Sai
   - Co-founder Backend Developer

3. Shlok Karn
   - Frontend Developer, Tester

### Images used

Stored in `public/`:

- `team-abhinav.jpeg`
- `team-ramsai.jpeg`
- `team-shlok.jpeg`

## 16. Environment Variables

The project uses a `.env` file.

Important environment variables include:

- `PORT`
- `APIFREELLM_KEY`
- `APIFREELLM_BASE`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Security note

Do not expose real API keys in documentation, screenshots, or public repos.

If this project is pushed publicly, all exposed secrets should be rotated immediately.

## 17. Setup Instructions

## 17.1 Prerequisites

- Node.js
- npm
- Python 3.12+

## 17.2 Install Frontend Dependencies

```bash
npm install
```

## 17.3 Backend Dependencies

Backend dependencies are declared in:

- `backend/pyproject.toml`

Install them using your preferred Python environment tool.

## 17.4 Start Development Server

```bash
npm run dev
```

This starts:

- Next.js frontend
- FastAPI backend

## 17.5 Build for Production

```bash
npm run build
```

## 17.6 Backend Syntax Check

```bash
python -m py_compile backend/main.py
```

## 18. User Flow

### First-time user flow

1. Open landing page
2. Sign up or log in
3. Complete setup profile
4. Go to dashboard
5. Upload CSV
6. Get decision feed
7. Ask follow-up questions in advisor chat

### Returning user flow

1. Log in
2. Open dashboard
3. Upload new business data
4. Review updated decisions
5. Change language if needed
6. Export or discuss actions

## 19. Current Strengths

- Strong product positioning
- Decision-first user experience
- Premium UI direction
- Multilingual foundation
- AI chat integration with business context
- Google login integration
- Team presentation on homepage
- Supporting evidence hidden behind decisions

## 20. Current Limitations

The current version is strong as a prototype / startup demo, but there are still areas for production hardening.

### Limitations

- auth is local-storage based
- no real PDF export implementation yet
- no real WhatsApp API integration yet
- multilingual AI translation depends on model quality
- some page-level translations are still implemented inline rather than from one central dictionary file

## 21. Recommended Future Enhancements

### Product

- complete app-wide i18n system from centralized dictionaries
- role-based onboarding
- business-specific templates
- better sector-specific recommendations

### Backend

- database persistence
- user-level dataset storage
- history tracking
- scheduled analysis
- better translation reliability with structured per-field translation

### AI

- domain-specific prompt templates
- sector-specific recommendation modes
- memory of prior business decisions
- long-term trend intelligence

### Integrations

- WhatsApp Business API
- PDF report generation
- email alerts
- Google Sheets import
- Excel import

### Security / Production

- secure auth backend
- server-side Google token verification
- secret rotation
- rate limiting
- logging and monitoring
- deployment configuration

## 22. File Reference Summary

Key files in the project:

- [app/page.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/app/page.tsx)
- [app/dashboard/page.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/app/dashboard/page.tsx)
- [app/auth/login/page.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/app/auth/login/page.tsx)
- [app/auth/signup/page.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/app/auth/signup/page.tsx)
- [app/setup/page.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/app/setup/page.tsx)
- [app/layout.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/app/layout.tsx)
- [app/globals.css](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/app/globals.css)
- [backend/main.py](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/backend/main.py)
- [lib/auth-context.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/lib/auth-context.tsx)
- [lib/language-context.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/lib/language-context.tsx)
- [components/language-switcher.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/components/language-switcher.tsx)
- [components/dashboard/sidebar.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/components/dashboard/sidebar.tsx)
- [components/dashboard/query-input.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/components/dashboard/query-input.tsx)
- [components/dashboard/insights-panel.tsx](/c:/Users/ABHINAV%20RISHI/Downloads/abcdef/components/dashboard/insights-panel.tsx)

## 23. Conclusion

VISIONIX is not just a dashboard application. It is an AI-powered business decision platform designed to simplify analytics for small business owners.

Its strongest differentiator is that it does not stop at showing data. It converts data into:

- decisions
- reasoning
- actions

That makes it more approachable than traditional BI tools and more aligned with real business operations.

This project is already well-positioned as:

- a startup demo
- a hackathon product
- a capstone project
- an investor-facing prototype
- a strong portfolio project

If expanded with secure auth, persistent storage, stronger multilingual handling, and external integrations, it can evolve into a real production SaaS platform.
