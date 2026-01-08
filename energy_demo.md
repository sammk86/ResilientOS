# Rezilens Energy Sector Manual Demo Guide

## **Preparation**
1.  **Environment**: Ensure the application is running locally (`npm run dev`).
2.  **Database**: Ensure the database is clean of demo data but has ISO controls seeded.
    - Run: `export $(grep -v '^#' .env | xargs) && npx tsx lib/db/cleanup-energy.ts`
    - Run: `export $(grep -v '^#' .env | xargs) && npx tsx lib/db/seed-iso.ts`
3.  **Login**: Log in as a user with an Organization created.

## **Demo Script**

### **1. Governance (The Foundation)**
*   **Narrative**: "We start by establishing the rules of the game. For an Energy Utility, we need to comply with NERC CIP and ISO 22301."
*   **Action**: Navigate to **Governance**.
*   **Action**: Click **"New Policy"**.
    - **Title**: `Critical Infrastructure Protection Policy`
    - **Type**: `Regulatory`
    - **Description**: `Policy mandating compliance with NERC CIP standards for all critical cyber assets.`
    - Click **Create Policy**.
*   **Action**: Click on the new policy "Critical Infrastructure Protection Policy".
*   **Action**: Click **"Compliance Mapper"**.
*   **Action**: Show the ISO 22301 clauses.
*   **Action**: Click **"Link"** next to **Clause 8.1 (Operational planning and control)** to show how we map policy to standard.

### **2. Risk Management (Identifying Threats)**
*   **Narrative**: "Now we identify what threatens our grid operations. We'll add a cyber risk."
*   **Action**: Navigate to **Risk**.
*   **Action**: Click **"Add Risk"**.
    - **Description**: `Grid Cyber Attack (Ransomware on SCADA)`
    - **Likelihood**: `3` (Possible)
    - **Impact**: `5` (Catastrophic)
    - **Category**: `Cyber`
    - Click **Save Risk**.
*   **Narrative**: "Let's add a physical risk as well."
*   **Action**: Click **"Add Risk"**.
    - **Description**: `Extreme Weather (Hurricane/Flood) Impacting Grid`
    - **Likelihood**: `4` (Likely)
    - **Impact**: `4` (Major)
    - **Category**: `Physical`
    - Click **Save Risk**.
*   **Action**: Show the **Risk Heatmap** updating in real-time.

### **3. Business Impact Analysis (BIA) (Prioritizing Operations)**
*   **Narrative**: "We need to know what's most critical. Let's analyze our Power Generation process."
*   **Action**: Navigate to **BIA**.
*   **Action**: Click **"New Analysis"**.
    - **Process Name**: `Power Generation Operations`
    - **RTO (Recovery Time Objective)**: `1 hour`
    - **RPO (Recovery Point Objective)**: `15 minutes`
    - **Criticality**: `Critical`
    - Click **Create Analysis**.
*   **Narrative**: "And our Customer Billing."
*   **Action**: Click **"New Analysis"**.
    - **Process Name**: `Customer Billing & Metering`
    - **RTO**: `24 hours`
    - **RPO**: `4 hours`
    - **Criticality**: `High`
    - Click **Create Analysis**.
*   **Action**: Show the **Dependency Graph** (placeholder or static if not linked yet, but mention "AI will map these dependencies automatically in the future").

### **4. Planning & Runbooks (The Response)**
*   **Narrative**: "When the lights go out, we need a plan. Here is our 'Black Start' procedure."
*   **Action**: Navigate to **Plan**.
*   **Action**: Click **"New Runbook"**.
    - **Title**: `Black Start Procedure (Grid Restoration)`
    - **Type**: `Technical`
    - Click **Create Runbook**.
*   **Action**: Find "Black Start Procedure" in the list.
*   **Action**: Click **"Steps"** (the new feature!).
    - **Add Step 1**:
        - **Title**: `Isolate Transmission Lines`
        - **Est. Time**: `10m`
        - **Details**: `Open all breakers at the main substation.`
    - **Action**: Click **Add Step**.
    - **Add Step 2**:
        - **Title**: `Start Diesel Generators`
        - **Est. Time**: `15m`
        - **Details**: `Verify fuel levels and initiate cranking sequence.`
    - **Action**: Click **Add Step**.
    - **Add Step 3**:
        - **Title**: `Synchronize to Grid`
        - **Est. Time**: `20m`
        - **Details**: `Match frequency and phase angle before closing breaker.`
    - **Action**: Click **Add Step**.
    - Click **Close**.

### **5. Execution (The Crisis)**
*   **Narrative**: "Now, let's say an incident occurs. The operator logs in and sees their tasks."
*   **Action**: Stay on **Plan** page or go to **Dashboard**.
*   **Action**: Click on **"My Tasks"** tab (in Plan page).
*   **Action**: Show the tasks we just created ("Isolate Transmission Lines", etc.) assigned to the user.
*   **Action**: Click **"Mark Done"** on the first task.

## **Conclusion**
*   "In less than 5 minutes, we built a compliant governance structure, identified risks, prioritized processes, and created an actionable response plan."
