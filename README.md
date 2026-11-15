# Google Gemini Student Ambassador Portal & Participant Hub

A role-based static web application designed for the **Google Gemini Student Ambassador Program**. It supports two distinct operational modes:
1. **Ambassador Mode**: Full portal matching [portal.geministudentambassador.com](https://portal.geministudentambassador.com/) (Home, Tasks, Task Proof Completion, About, Resources, My Score, Leaderboard).
2. **Student Participant Mode**: Locked hub for workshop attendees (Resource Page, Product Trial Survey links, 1-click copy-paste ambassador details, creative text prompt, and certificate issuance).

---

## 👥 Role-Based Architecture

Switch seamlessly between roles using the toggle in the top header:

### 1. Ambassador View
- **Home Dashboard**: Replicates the official portal layout with ambassador name, GID, current milestone tier badge, and 2×2 tasks grid.
- **Task Completion Modal**: Log authenticated metrics, participants count, reel views, drive links, and survey spreadsheets.
- **Reward Structure & Tiers**: Full 8-tier matrix (Starter to The Legend) with physical prizes, vouchers, and badges.
- **My Score & Leaderboard**: Real-time points breakdown and standings.

### 2. Student Participant View
Participants are locked strictly to the **Product Trial & Certificate Hub**:
- **Ambassador Details for Forms**: 1-click **Copy** buttons for Ambassador Name, Google ID (GID), Campus, and Workshop Theme to paste directly into Google Forms.
- **Gemini Creative Prompt**: Ready-to-test text prompt for the workshop with 1-click copy.
- **Product Trial Surveys**:
  - **Step 1**: [Product Trial Pre-Survey Form](https://producttrialsurvey.geministudentambassador.com/)
  - **Step 2**: Hands-on Gemini Prompt Testing
  - **Step 3**: [Product Trial Participant Feedback Form](https://producttrialfeedback.geministudentambassador.com/)
- **Certificate Verification & Issuance**:
  - Certificate generation is strictly locked until students confirm completing the **Product Trial** surveys (Pre-Survey and Feedback form) and enter their full name.
  - Generates a 1600×1000 print-quality **Official Certificate of Participation** with the official Google Gemini Sparkle seal and ambassador endorsement, downloadable as high-resolution PNG or printable.

---

## 🚀 How to Run Locally

Open `index.html` in any web browser:
```powershell
python -m http.server 8000
```
Then visit `http://localhost:8000`.
