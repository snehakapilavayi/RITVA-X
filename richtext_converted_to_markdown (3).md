\# 🏗️ RITVA X — System Design Document (SDD)

\## 🧠 Overview

RITVA X is designed as a lightweight personal system for task execution and reflection.

\---

\## 🏗️ Architecture

Client-Server Architecture:

Frontend (React + Vite)

↓

Backend (Node.js + Express)

↓

Database (Firestore / Local Storage)

↓

External APIs (Google Calendar)

\---

\## 🎨 Frontend Design

\### Tech Stack

\- React (Vite)

\- Tailwind CSS

\- tsparticles (Galaxy UI)

\---

\### Components

\- Task List

\- Task Card

\- Decision Buttons

\- Notes Page

\- Planner Page

\---

\## ⚙️ Backend Design

\### Tech Stack

\- Node.js

\- Express

\---

\### Responsibilities

\- Handle APIs

\- Manage tasks

\- Store notes

\- Process decisions

\---

\## 🗄️ Database Design

\### Tasks

\- id

\- title

\- startTime

\- status

\### Notes

\- id

\- content

\- createdAt

\- isLocked

\---

\## 🔌 API Design

\### Task APIs

\- POST /tasks

\- GET /tasks

\- PUT /tasks/:id

\---

\### Notes APIs

\- POST /notes

\- GET /notes

\---

\### Decision API

\- PUT /decision/:id

\---

\## 🔐 Security

\- Input validation

\- Optional authentication

\- Basic encryption for locked notes

\---

\## ⚡ Performance

\- Optimize re-renders

\- Reduce heavy animations

\- Efficient API usage

\---

\## ⚠️ Constraints

\- Depends on Google API

\- Internet required

\---

\## 🚀 Future Enhancements

\- AI system

\- Streak tracking

\- Mobile version

\---

\## 🔥 Summary

A minimal, execution-focused system designed for daily use and behavior improvement.