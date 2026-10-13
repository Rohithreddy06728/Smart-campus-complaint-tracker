# 🏫 Smart Campus Complaint Tracker — CampusCare

A full-stack web application that helps students report campus issues and enables administrators to track, manage, and resolve complaints efficiently.

**CampusCare** provides separate dashboards for students and administrators, making campus issue reporting more organized, transparent, and accessible.

\<p align="center">
&#x20; \<strong>React · Spring Boot · MySQL · JWT · Render\</strong>
\</p>

---

## 🌐 Live Demo

- **Frontend:** [CampusCare Student Portal](https://smart-campus-complaint-frontend-ptgm.onrender.com)
- **Backend API:** [Spring Boot Backend](https://smart-campus-complaint-tracker.onrender.com)
- **Database:** MySQL hosted on Aiven

> **Note:** The backend runs on Render's free instance, which may take some time to wake up after a period of inactivity.

---

## ✨ Features

### 👨‍🎓 Student Dashboard

- Student registration and login
- Submit campus complaints with a title, description, category, and location
- View submitted complaints and their current status
- Track complaint progress
- Search and view complaint records
- Personalized student dashboard

### 🛡️ Admin Dashboard

- Separate administrator login and dashboard
- View and manage campus complaints
- Update complaint statuses
- Edit and delete complaints
- Monitor complaint statistics
- Track submitted, in-progress, and resolved complaints

### 🔐 Security

- Spring Security integration
- JWT-based authentication
- Password hashing using BCrypt
- Role-based access control for student and administrator operations
- Environment-based configuration for database credentials and application secrets

---

## 🧰 Tech Stack

| Layer           | Technologies                 |
| --------------- | ---------------------------- |
| Frontend        | React, CSS, Vite             |
| Backend         | Java 21, Spring Boot         |
| Security        | Spring Security, JWT, BCrypt |
| Database        | MySQL 8, Aiven               |
| Build Tool      | Maven                        |
| Deployment      | Render                       |
| Version Control | Git, GitHub                  |

---

## 🏗️ Architecture

```text
                 ┌─────────────────────────┐
                 │       Web Browser       │
                 │    React + CSS + Vite   │
                 └────────────┬────────────┘
                              │ HTTPS / REST API
                              ▼
                 ┌─────────────────────────┐
                 │      Spring Boot        │
                 │  REST API + Spring      │
                 │  Security + JWT         │
                 └────────────┬────────────┘
                              │ JDBC / SSL
                              ▼
                 ┌─────────────────────────┐
                 │      Aiven MySQL        │
                 │ Users + Complaints      │
                 └─────────────────────────┘
```

---

## 📂 Project Structure

```text
Smart-campus-complaint-tracker/
│
├── Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/campus/complainttracker/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── repository/
│   │   │   │   ├── security/
│   │   │   │   └── service/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Install the following before running the project locally:

- Java JDK 21 or later
- Node.js and npm
- MySQL 8 or compatible MySQL server
- Maven, or use the Maven Wrapper included in the backend
- Git

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Rohithreddy06728/Smart-campus-complaint-tracker.git
cd Smart-campus-complaint-tracker
```

### 2. Configure the MySQL database

Create a local database:

```sql
CREATE DATABASE campus_complaints;
```

The backend uses environment variables for its database configuration.

Configure the following values for local development:

```text
DB_URL=jdbc:mysql://localhost:3306/campus_complaints
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_jwt_secret
```

The application can use the local database defaults defined in `application.properties`, but setting environment variables explicitly is recommended.

**Never commit real passwords, JWT secrets, or database credentials to GitHub.**

### 3. Start the backend

Open a terminal:

```bash
cd Backend
```

On Windows, run:

```powershell
.\mvnw.cmd spring-boot:run
```

On Linux or macOS:

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

The backend should start at:

```text
http://localhost:8080
```

### 4. Start the frontend

Open a second terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file inside the `Frontend` folder:

```env
VITE_API_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

> Restart the Vite server after changing environment variables.

---

## 🌍 Deployment

The application is deployed using Render and Aiven.

### Frontend — Render

Deploy the `Frontend` directory as a Static Site.

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Environment variable:**

```env
VITE_API_URL=https://smart-campus-complaint-tracker.onrender.com
```

### Backend — Render

Deploy the `Backend` directory as a Docker-based Web Service using the included `Dockerfile`.

Configure the following environment variables in Render:

| Variable      | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `DB_URL`      | Aiven JDBC connection URL, including the required SSL settings |
| `DB_USERNAME` | Aiven MySQL username                                           |
| `DB_PASSWORD` | Aiven MySQL password                                           |
| `JWT_SECRET`  | Strong, securely generated JWT signing secret                  |
| `PORT`        | Port configured for the Render web service                     |

Use the port configuration expected by the deployed service and ensure the application listens on the assigned port.

### Database — Aiven

1. Create a MySQL service in Aiven.
2. Create or select the application database.
3. Configure the JDBC URL, username, and password in Render.
4. Enable the required SSL connection settings.
5. Keep database credentials private.

The deployed application uses the cloud database, which is separate from the local MySQL database.

---

## 📊 Complaint Status Workflow

A complaint can move through different stages as administrators manage it.

```text
Submitted → Under Review → In Progress → Resolved / Closed
```

The exact status options depend on the statuses implemented in the application.

---

## 🔑 User Roles

| Capability                     | Student |       Administrator       |
| ------------------------------ | :-----: | :-----------------------: |
| Register and log in            |    ✅    |  Depends on account setup |
| Submit complaints              |    ✅    | Depends on implementation |
| View own complaints            |    ✅    |             —             |
| View and manage all complaints |    ❌    |             ✅             |
| Update complaint status        |    ❌    |             ✅             |
| Edit or delete complaints      |    ❌    |             ✅             |

Access to sensitive operations should always be enforced by the backend, not only by hiding frontend buttons.

---

## 🔒 Security Notes

- Keep all production credentials in Render environment variables.
- Never commit `.env` files or passwords to GitHub.
- Use BCrypt password hashing for stored user passwords.
- Use a strong JWT signing secret and protect it.
- Keep the Aiven database connection secured with SSL.
- Remove temporary admin bootstrap variables after initial setup.
- Verify that Spring Security does not leave unintended default authentication enabled.
- Test student and administrator permissions before production use.
  
---

## 🎯 Project Objectives

- Digitize campus complaint registration and tracking.
- Improve communication between students and administrators.
- Centralize complaint records in a database.
- Provide role-specific dashboards and permissions.
- Improve visibility into complaint status and resolution progress.

---

## 🔮 Future Enhancements

- Email notifications when complaint statuses change
- Image attachments for complaints
- Complaint priority and deadline tracking
- Advanced search, filtering, and pagination
- Admin analytics and report export
- Mobile-responsive UI improvements
- Automated testing and CI/CD integration

---

## 👨‍💻 Author

**Rohith Reddy**

GitHub: [@Rohithreddy06728](https://github.com/Rohithreddy06728)

---

## 📄 License

This project is intended for educational and demonstration purposes. Add a `LICENSE` file to the repository if you want to distribute it under a specific open-source license.

---

\<p align="center">
&#x20; \<strong>CampusCare — Your campus. Your voice. Better together. 🏫\</strong>
\</p>
