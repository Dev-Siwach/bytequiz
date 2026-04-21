# ByteQuiz: Project Technical Overview

**Objective:** College Project Presentation  
**Presenter:** Dev Siwach (Project Lead)  
**Tech Stack:** React (Frontend), Node.js (Backend), SQLite (Database), Ollama (Local AI)

---

## Slide 1: Project Title
*   **Headline:** ByteQuiz: Helping Students Learn with Private AI.
*   **Our Mission:** To turn stressful tests into a helpful learning experience that feels like working with a personal tutor.
*   **The Vision:** Giving every student a safe, private space to learn from their mistakes.

---

## Slide 2: Learning Without Judgment (Student Focus)
*   **Headline:** Supporting the Student Journey.
*   **Instant Guidance:** Instead of just seeing a "Wrong" mark, students get a friendly explanation immediately while the question is still fresh in their minds.
*   **Safe Space:** Since the AI is private and local, students can make mistakes without feeling embarrassed or judged by anyone.
*   **Encouraging Feedback:** The AI is programmed to be a supportive tutor, helping build student confidence instead of just highlighting what they don't know.

---

## Slide 3: Ending "Blank Page" Syndrome (Teacher Focus)
*   **Headline:** Instant Inspiration for Teachers.
*   **Rapid Brainstorming:** When teachers are stuck for ideas, they can simply type a topic, and the AI suggests a full set of questions instantly.
*   **Saving Time:** No more hours spent staring at a blank screen. Teachers can go from "no idea" to a "full draft" in less than 5 seconds.
*   **Teacher in Control:** The AI does the heavy lifting of brainstorming, while the teacher does the final review and editing to ensure quality.

---

## Slide 4: How the System is Built (Architecture)
*   **Headline:** 4-Layer System Design.
*   **Frontend (React):** The user interface where students take quizzes.
*   **Backend (Node.js):** The brain that manages logins and talks to the AI.
*   **AI Engine (Ollama):** Serves the AI model (Gemma) locally on the machine.
*   **Database (SQLite):** Stores users, questions, and scores using Prisma.

---

## Slide 5: Frontend Details (React + Vite)
*   **Headline:** Building a Fast User Interface.
*   **State Management:** Uses React Context to store user login data across pages.
*   **Speed:** Uses Vite to make the app load and update instantly.
*   **Responsive Design:** Simple CSS makes the app work on both phones and laptops.

---

## Slide 6: Backend & AI Setup
*   **Headline:** Connecting the Server to the AI.
*   **Server:** Node.js and Express manage all the API requests.
*   **AI Model:** Uses "Gemma 4b," a smart but small model that runs on normal PCs.
*   **Connection:** The backend sends "prompts" to the local AI service and gets text back.

---

## Slide 7: AI Prompting and Data Safety
*   **Headline:** How we control the AI output.
*   **JSON Format:** We tell the AI to only reply in a specific data format (JSON).
*   **Validation:** The backend checks the AI's reply to make sure it isn't "hallucinating" or broken.
*   **Tutor Mode:** We program the AI to act like a helpful teacher when explaining mistakes.

---

## Slide 8: Database and Security
*   **Headline:** Storing Data and User Roles.
*   **Tables:** Relational database setup for Users, Quizzes, Questions, and Results.
*   **Login Security:** Uses JWT (JSON Web Tokens) to identify users.
*   **User Roles:** Different access levels for Admin (Manager), Teacher, and Student.

---

## Slide 9: Teacher Features
*   **Headline:** Tools for Creating Quizzes.
*   **Auto-Create:** Teachers type a topic, and the AI generates multiple-choice questions automatically (using structured JSON enforcement).
*   **Management:** Teachers can save quizzes as "Drafts" or "Publish" them for students.
*   **Analytics:** Teachers can see student rankings and scores in a leaderboard.

---

## Slide 10: Student Features
*   **Headline:** Taking the Quiz and Getting Help.
*   **Algorithmic Shuffling:** Questions and options are randomized so every attempt feels unique.
*   **Instant Help:** If a student picks the wrong answer, the AI explains the concept immediately using a specialized "Tutor Prompt."
*   **Tracking:** Shows the final score and how long the student took to finish.

---

## Slide 11: Performance and Hardware
*   **Headline:** System Speed and Requirements.
*   **Speed:** AI generates a quiz in less than a minute on a standard computer.
*   **Offline Mode:** The entire system works offline once installed (no cloud APIs needed).
*   **Hardware:** Optimized to run on machines with at least 8GB of VRAM.


---

## Slide 12: Final Summary
*   **Headline:** Conclusion.
*   **Result:** We built a fully working, private AI quiz tool.
*   **Success:** Proved that AI can be used in schools safely without expensive cloud costs.
*   **Final Word:** ByteQuiz makes learning faster and more private.
