# ZikhLearn
ZikhLearn is a full-stack e-learning platform designed to connect faculty and students through structured, practical, and engaging online courses.

ZikhLearn is a full-stack, premium E-learning platform designed to bridge the gap in specialized technical education for Engineering, Science, and Mathematics. Built with the MERN stack, the platform features a custom-built learning management system (LMS) with distinct portals for Students, Faculty, and Administrators. Key features include an integrated video/document lesson player, real-time course search and filtering, and a secure role-based authentication system powered by Clerk. Unlike generic platforms, ZikhLearn focuses on high-fidelity technical content delivery with a modern, responsive UI designed for deep focus.

** Features**


**Faculty Features**

Create and manage courses

Upload video & PDF lessons

Track enrollments and revenue

View analytics dashboard

Instructor profile & course insights

 **Student Features**

Enroll in courses

Watch video lessons & read PDFs

Resume learning from last lesson

Track course progress visually

Personal learning dashboard

**Authentication & Security**

Secure authentication using Clerk

Role-based access (Student / Faculty)

Protected routes & APIs

**Tech Stack**
Frontend

React.js

React Router

CSS (Modern UI / Responsive Design)

Axios

Backend

Node.js

Express.js

MongoDB

Mongoose

Authentication

Clerk (JWT-based authentication)

📂 Project Structure
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── styles
│   │   └── App.jsx
│   └── package.json
│
├── backend
│   ├── routes
│   ├── controllers
│   ├── models
│   ├── middleware
│   └── server.js
│
└── README.md

**Installation & Setup**
1️⃣ Clone the Repository
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME

2️⃣ Backend Setup
cd backend
npm install
npm run dev


Create a .env file:

MONGO_URI=your_mongodb_url
CLERK_SECRET_KEY=your_clerk_secret

3️⃣ Frontend Setup
cd frontend
npm install
npm start

**Application Flow**

User signs up / logs in via Clerk

Role assigned (Student or Faculty)

Faculty creates courses & lessons

Students enroll and start learning

Progress is tracked automatically

Faculty views analytics dashboard

**Key Highlights**

Clean & modern UI (SaaS-style)

Real e-learning player with sidebar

Instructor details section

Fully responsive design

Production-ready structure

Scalable backend architecture

 Future Enhancements

 Course ratings & reviews

 Quizzes & assignments

 Certificates on completion

 Payment gateway integration

 Mobile app version

Contributing

Contributions are welcome!
Feel free to fork this repository and submit a pull request.


 Author

Shaik Mahaboob Razikh

GitHub: https://github.com/razikh-1811

LinkedIn: https://www.linkedin.com/in/shaik-mahaboob-razikh-284930295/











