# GameLog: A Node.js Game Review Aggregator

GameLog is a full-stack web application built for a university project. It allows users to search for video games, add them to a personal library, and write reviews. The project demonstrates a comprehensive understanding of modern web development concepts including REST APIs, database management, user authentication, and advanced server-side techniques.

## Features

- **User Authentication**: Secure user registration, login, and logout functionality with password hashing (bcryptjs).
- **Session Management**: Persistent user sessions using `express-session`.
- **External API Integration**: Fetches real-time game data from the [RAWG.io Video Games Database API](https://rawg.io/apidocs).
- **Internal API Provision**: Exposes user library data via a custom RESTful API endpoint.
- **Full CRUD for Reviews**: Users can create, read, update, and delete their own game reviews.
- **Advanced SQL**: Calculates and displays a "Community Average Rating" for games using SQL aggregate functions.
- **Robust Validation**: Implements server-side validation and sanitization using `express-validator`.
- **Flash Messaging**: Provides stateful user feedback for actions like saving or deleting data.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: EJS (Embedded JavaScript templates)
- **Libraries**: `mysql2`, `axios`, `bcryptjs`, `express-session`, `connect-flash`, `express-validator`, `dotenv`

## Setup and Installation

Follow these steps to set up and run the project locally.

### 1. Prerequisites

- Node.js (v16 or higher recommended)
- MySQL Server

### 2. Clone the Repository

```bash
git clone https://github.com/HassanTMadani/gamelog-project
cd gamelog-project
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

Access your MySQL instance.

Create the database and a dedicated user (replace 'your_password' with a secure password):

```sql
CREATE DATABASE gamelog_db;
CREATE USER 'gamelog_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON gamelog_db.* TO 'gamelog_user'@'localhost';
FLUSH PRIVILEGES;
```

Switch to the new database and run the table creation script:

```sql
USE gamelog_db;
```

Copy and paste the entire contents of the database_schema.sql file (provided below) into your MySQL client and execute it.

### 5. Environment Variables

Create a file named `.env` in the root of the project.

Get a free API key from [RAWG.io](https://rawg.io/apidocs).

Copy the content of `.env.example` (provided below) into your new `.env` file and fill in your details.

### 6. Run the Application

```bash
# For development with automatic restarts
npm run dev

# For production
npm start
```

The application will be available at http://localhost:3000.

## Appendix: File Contents for Setup

### .env.example

```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=gamelog_user
DB_PASSWORD=your_password
DB_NAME=gamelog_db

# Session Configuration
SESSION_SECRET=a_very_strong_and_long_secret_key_for_gamelog

# External API Configuration
RAWG_API_KEY=your_rawg_api_key_here
```

### database_schema.sql

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB;

CREATE TABLE `games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rawg_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `released` date DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rawg_id` (`rawg_id`)
) ENGINE=InnoDB;

CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  `rating` int NOT NULL,
  `review_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_game_unique` (`user_id`,`game_id`),
  KEY `user_id` (`user_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rating_check` CHECK ((`rating` >= 1) AND (`rating` <= 5))
) ENGINE=InnoDB;
```
