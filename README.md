# GameLog

A full-stack game review application that lets users search for games, create accounts, and maintain a personal library of reviewed games.

## Features

- **User Authentication** - Secure registration and login with password hashing
- **Game Search** - Find any game using the RAWG Video Games Database API
- **Personal Library** - Add games to your collection by writing reviews
- **Community Ratings** - See average ratings from all users
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS templates
- **Database:** MySQL
- **Authentication:** bcrypt, express-session
- **API:** RAWG Video Games Database

## Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL
- [RAWG API key](https://rawg.io/apidocs) (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HassanTMadani/gamelog-project
   cd gamelog-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```sql
   CREATE DATABASE gamelog_db;
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_USER=(username) root (dby default)
   DB_PASSWORD=your_mysql_password
   DB_NAME=gamelog_db
   DB_PORT=3306 (default)
   
   # Security
   SESSION_SECRET=your_long_random_secure_string
   
   # API
   RAWG_API_KEY=your_rawg_api_key_here
   
   # Deployment (optional)
   BASE_PATH=
   ```

5. **Create database tables**
   ```sql
   -- Users table
   CREATE TABLE `users` (
     `id` int NOT NULL AUTO_INCREMENT,
     `name` varchar(255) NOT NULL,
     `email` varchar(255) NOT NULL,
     `password` varchar(255) NOT NULL,
     PRIMARY KEY (`id`),
     UNIQUE KEY `email_UNIQUE` (`email`)
   ) ENGINE=InnoDB;
   
   -- Games table
   CREATE TABLE `games` (
     `id` int NOT NULL AUTO_INCREMENT,
     `api_id` int NOT NULL,
     `name` varchar(255) NOT NULL,
     `background_image` varchar(255) DEFAULT NULL,
     `released` date DEFAULT NULL,
     PRIMARY KEY (`id`),
     UNIQUE KEY `api_id_UNIQUE` (`api_id`)
   ) ENGINE=InnoDB;
   
   -- Reviews table
   CREATE TABLE `reviews` (
     `id` int NOT NULL AUTO_INCREMENT,
     `user_id` int NOT NULL,
     `game_id` int NOT NULL,
     `rating` int NOT NULL,
     `review_text` text,
     PRIMARY KEY (`id`),
     UNIQUE KEY `user_game_unique` (`user_id`,`game_id`),
     KEY `user_id_fk_idx` (`user_id`),
     KEY `game_id_fk_idx` (`game_id`),
     CONSTRAINT `game_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
     CONSTRAINT `user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
   ) ENGINE=InnoDB;
   ```

6. **Start the application**
   ```bash
   npm start
   ```

Visit `http://localhost:8000` to use the application.

## API

Get a user's game library:

```
GET /api/user/:userId/library
```

**Example Response:**
```json
[
  {
    "review_id": 1,
    "user_id": 1,
    "game_id": 1,
    "rating": 5,
    "review_text": "An absolute masterpiece.",
    "name": "The Witcher 3: Wild Hunt",
    "background_image": "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
    "community_rating": "4.8"
  }
]
```

## Project Structure

```
gamelog-project/
├── config/
│   └── database.js         # Database connection
├── controllers/
│   ├── authController.js   # Authentication logic
│   └── gameController.js   # Game and review logic
├── middleware/
│   └── isAuth.js          # Route protection
├── models/
│   ├── Game.js            # Game database queries
│   └── User.js            # User database queries
├── public/
│   ├── css/style.css      # Styles
│   └── images/            # Static assets
├── routes/
│   ├── api.js             # API routes
│   ├── auth.js            # Auth routes
│   └── index.js           # Main routes
├── views/
│   ├── auth/              # Login/register templates
│   ├── game/              # Game-related templates
│   └── partials/          # Reusable components
├── .env                   # Environment variables
├── app.js                 # Main application file
└── package.json           # Dependencies
```

