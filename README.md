This project implements a multi-step questionnaire where users are required to answer a series of questions. The data is collected step-by-step, and user progress is saved using Supabase for temporary storage. MongoDB is used for final data storage after completing the questionnaire.

The application is built using Next.js (for the frontend), Tailwind CSS (for styling), Supabase (for temporary storage), Node.js/Express.js (for backend integration), and MongoDB (for final data storage). The goal is to collect user responses in an organized and efficient way while keeping track of their progress.

Features
Multi-step questionnaire: The user answers questions step by step, with each step saving data progressively.
Progress tracking: User responses are saved at each step, allowing users to pick up where they left off.
Frontend UI: A mobile-responsive design with a sleek and modern UI built with Tailwind CSS.
Supabase integration: Temporary storage for incomplete responses until the user completes the questionnaire.
MongoDB integration: Final storage of data after the questionnaire is completed.
Email tracking: The user's email is used to track their progress across steps and is stored in Supabase.


Tech Stack
Frontend:
Next.js: React framework for building the frontend with server-side rendering (SSR) and static site generation (SSG).
Tailwind CSS: Utility-first CSS framework for styling the application.
Backend:
Node.js/Express.js: Backend server to handle API requests for final data storage in MongoDB.
Database:
Supabase: Used for storing incomplete responses and user progress.
MongoDB: Used for final data storage once the questionnaire is completed.# questionnaire-app
