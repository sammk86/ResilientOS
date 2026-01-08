# ResilientOS: The Intelligent Core for Operational Resilience

ResilientOS is an advanced Business Continuity Management (BCM) orchestration platform. It replaces static documents with a dynamic, intelligent core that unifies Governance, Risk, Analysis, and Strategy.

**Highlights:**
- **Governance**: Policy management and Compliance Mapping (ISO 22301, SOC 2).
- **Risk**: Dynamic Risk Heat Maps and automated risk scoring.
- **BIA**: Visual dependency graphs and RTO/RPO calculator.
- **Strategy**: Digital, role-based runbooks for crisis response.
- **AI Core**: Powered by **Groq** for real-time risk analysis and scenario generation.

## Features

### 1. Unified Governance
- Centralized Policy Repository.
- **Compliance Mapper**: Map controls to standards like ISO 22301.

### 2. Dynamic Risk Management
- **Risk Universe**: Standardized library of risks mapped to industry frameworks (ISO, NIST).
- **Heat Map Engine**: Visualize risks by Likelihood vs Impact in real-time.
- **Risk Register**: Active tracking with lifecycle management (Create, Edit, Delete).
- **AI Risk Analysis**: Automatically generate risk scenarios based on asset type.

### 3. User Experience
- **Dark Mode**: Fully supported light/dark themes for all BCM interfaces.
- **Mobile Responsive**: Accessible on all devices for crisis response.

### 3. Business Impact Analysis (BIA)
- **Dependency Graph**: Visual mapping of upstream (vendors, systems) and downstream (revenue, reputation) dependencies.
- **RTO/RPO Tracking**: Define and monitor recovery objectives.

### 4. Actionable Continuity Plans
- **Digital Runbooks**: Step-by-step crisis response guides.
- **Role-Based Views**: Filters tasks customized for the logged-in user (e.g., "System Admin").

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **AI/LLM**: [Groq](https://groq.com/) (Llama 3)
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons

## Getting Started

### Prerequisites
- Node.js & npm/pnpm
- PostgreSQL Database
- Groq API Key (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd ResilientOS
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Setup Environment Variables:**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   *Update `POSTGRES_URL` and `GROQ_API_KEY` in `.env`.*

4. **Initialize Database:**
   ```bash
   pnpm db:setup
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Run Development Server:**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## AI Configuration (Groq)

ResilientOS uses Groq for high-speed AI inference.
1. Get an API key from [console.groq.com](https://console.groq.com).
2. Set `GROQ_API_KEY` in your `.env` file.
3. The AI features (like "Add Risk" analysis) will now function.

## License

[MIT](LICENSE)
