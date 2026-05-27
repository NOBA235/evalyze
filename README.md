# ⚡ EVALYZE — AI-Powered Answer Sheet Evaluation Platform

> Automate grading, feedback generation, and classroom analytics using Google Gemini AI.  
> Built for the Devpost AI Hackathon.

---

## 🎯 What is Evalyze?

Evalyze is a full-stack SaaS platform that replaces manual answer sheet checking with AI. Teachers create classrooms and exams, students upload their answer sheets, and Gemini Vision AI evaluates everything — extracting handwritten/typed answers, comparing with model answers, assigning marks, and generating detailed feedback.

---

## 🧠 Core AI Features

| Feature | Description |
|---|---|
| **Semantic Evaluation** | AI understands *meaning*, not just keywords |
| **Partial Credit** | Detects partially correct answers intelligently |
| **Per-Question Feedback** | Specific feedback on every individual answer |
| **Weak Topic Analysis** | Identifies which topics each student struggles with |
| **Classroom Insights** | Common mistakes, grade distribution, pass/fail rates |
| **Teacher Override** | Teachers can adjust any AI-generated mark or feedback |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Recharts |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB + Mongoose |
| Auth | JWT (7-day tokens) |
| AI | Google Gemini 1.5 Flash (Vision + Text) |
| File Upload | Multer (images + PDFs, up to 20MB) |

---

## 📁 Project Structure

```
evalyze/
├── server/                     # Express API
│   ├── server.js               # Entry point
│   └── src/
│       ├── models/             # User, Classroom, Exam, Submission, Evaluation
│       ├── controllers/        # Auth, Classroom, Exam, Submission, Evaluation, Analytics
│       ├── routes/             # REST API routes
│       ├── middleware/         # JWT auth, Multer upload
│       ├── services/
│       │   └── geminiService.js    # All Gemini AI functions
│       └── prompts/
│           └── evaluationPrompts.js  # AI prompt templates
│
└── client/                     # React frontend
    └── src/
        ├── pages/
        │   ├── Landing.jsx         
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── TeacherDashboard.jsx
        │   ├── StudentDashboard.jsx
        │   ├── ClassroomView.jsx
        │   ├── ExamView.jsx       
        │   └── SubmissionView.jsx  
        ├── components/
        │   ├── Navbar.jsx
        │   └── StatusBadge.jsx
        ├── context/
        │   └── AuthContext.jsx
        └── services/
            └── api.js              # Axios API client
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key — [get one free at Google AI Studio](https://aistudio.google.com)

### 1. Clone & Install

```bash
# Install all dependencies
cd evalyze
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/evalyze
JWT_SECRET=your_super_secret_key_here_change_this
GEMINI_API_KEY=AIzaSy...your_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Start Development Servers

```bash
# From /evalyze root — starts both server + client
npm run dev
```

Or separately:
```bash
# Terminal 1 — API server on port 4000
cd server && npm run dev

# Terminal 2 — React client on port 5173
cd client && npm run dev
```

### 4. Open the App

- **App:** http://localhost:5173
- **API Health:** http://localhost:4000/api/health

---

## 📋 Full Workflow Demo

### As a Teacher:

1. **Register** → select "Teacher"
2. **Create a Classroom** → e.g., "Grade 12 Physics"
3. **Share the Join Code** → e.g., `AB3F9K2E` (shown on classroom page)
4. **Create an Exam**:
   - Enter title, subject, total marks, deadline
   - Optionally upload question paper (PDF/image)
   - Paste **Answer Key text** (important for AI evaluation quality)
   - Add marking rubric if needed
5. **Wait for student submissions**
6. Click **"Evaluate"** on any submission — AI runs in background
7. Or click **"Evaluate All"** for batch processing
8. **Review** AI marks and feedback → click **Override** to adjust
9. Click **Approve** to finalize grades
10. View **Analytics** for grade distribution and weak topics

### As a Student:

1. **Register** → select "Student"
2. **Join Classroom** → enter 8-character code from teacher
3. Go to the classroom → select an exam
4. Click **"Submit Answer Sheet"** from dashboard
5. Upload image(s) or PDF of your answer sheet
6. Track status: `Submitted → Evaluating → AI Checked → Approved`
7. Click on submission to view marks, feedback, weak areas, suggestions

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Classrooms
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/classrooms` | List my classrooms |
| POST | `/api/classrooms` | Create classroom (teacher) |
| GET | `/api/classrooms/:id` | Get classroom |
| POST | `/api/classrooms/join` | Join with code (student) |

### Exams
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/exams/classroom/:id` | List exams in classroom |
| POST | `/api/exams` | Create exam (multipart) |
| PATCH | `/api/exams/:id/answer-key` | Update answer key |

### Submissions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/submissions` | Upload answer sheets |
| GET | `/api/submissions/my` | Student's submissions |
| GET | `/api/submissions/exam/:id` | All submissions for exam |
| GET | `/api/submissions/:id` | Single submission + evaluation |

### Evaluations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/evaluations/:submissionId/evaluate` | Trigger AI evaluation |
| POST | `/api/evaluations/batch` | Batch evaluate |
| GET | `/api/evaluations/:submissionId` | Get evaluation result |
| PUT | `/api/evaluations/:submissionId/override` | Teacher override |
| PATCH | `/api/evaluations/:submissionId/approve` | Approve final grade |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/classroom/:id` | Classroom-wide analytics |
| GET | `/api/analytics/exam/:id` | Per-exam analytics |
| GET | `/api/analytics/student/me` | Student personal analytics |

---

## 🤖 AI Evaluation Pipeline

```
Student uploads answer sheet (image/PDF)
         ↓
[Step 1] Gemini Vision OCR
         extractAnswers() — reads handwriting/typed text
         ↓
[Step 2] Answer Comparison
         evaluateAnswers() — semantic matching vs model answers
         Returns: marks per question, feedback, weak topics
         ↓
[Step 3] Results stored in Evaluation document
         Status: ai_checked
         ↓
[Step 4] Teacher reviews → optional override → approves
         Status: teacher_approved
```

---

## 🎨 Design System

- **Background:** `#020409` (near black)
- **Primary:** Cyan `#22d3ee`
- **Secondary:** Violet `#8b5cf6`
- **Success:** Emerald `#34d399`
- **Glass:** `backdrop-blur-lg + rgba(12,26,46,0.6)`
- **Font Display:** Oxanium (headings, labels, badges)
- **Font Body:** DM Sans
- **Font Mono:** JetBrains Mono

---

## 🏆 Submission Status Flow

```
submitted → evaluating → ai_checked → teacher_approved
```

| Status | Meaning |
|---|---|
| `submitted` | Student uploaded answer sheet |
| `evaluating` | AI is processing (async) |
| `ai_checked` | AI evaluation complete, pending teacher review |
| `teacher_approved` | Teacher verified and approved final grade |

---

## 💡 Tips for Best Results

- **Answer Key Quality:** The more detailed your answer key text, the better the AI evaluation
- **Image Quality:** Well-lit, flat photos of answer sheets work best
- **Typed Answers:** PDFs with typed text give highest accuracy
- **Rubric:** Adding a rubric significantly improves partial mark accuracy

---

## 🔮 Bonus Features (Implemented)

- ✅ Batch evaluation (one click for all submissions)
- ✅ Teacher override with internal private notes
- ✅ Grade distribution charts (Recharts)
- ✅ Student score trend line chart
- ✅ Weak topic tagging per student
- ✅ Classroom join codes
- ✅ Real-time polling for evaluation status
- ✅ Multi-file upload (multi-page answer sheets)

---

Built with ❤️ for the Devpost AI Hackathon | Powered by Google Gemini
