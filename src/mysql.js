const expressapi = require("@borane/expressapi");
const config = require(`../config.json`);

const mysql = new expressapi.Mysql({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.db
})

mysql.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(128) NOT NULL,
    username VARCHAR(255) NOT NULL,
    resetId INT DEFAULT 0,
    accessLevel INT DEFAULT 0,
    createdTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    verifiedAt BOOLEAN NOT NULL,
    subscription INT DEFAULT 0,

    UNIQUE (email)
)`);

mysql.query(`CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie BOOLEAN NOT NULL,
    title VARCHAR(255) NOT NULL,
    overview TEXT DEFAULT NULL,
    smallPoster VARCHAR(255) NOT NULL,
    largePoster VARCHAR(255) NOT NULL,
    wallPoster VARCHAR(255) NOT NULL,
    lang VARCHAR(6) NOT NULL,
    ageLimit VARCHAR(255) NOT NULL,
    releaseDate VARCHAR(255) NOT NULL,
    duration VARCHAR(255) NOT NULL
)`);

mysql.query(`CREATE TABLE IF NOT EXISTS episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itemId INT NOT NULL,
    season INT NOT NULL,
    episode INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    overview TEXT DEFAULT NULL,
    poster VARCHAR(255) NOT NULL,

    FOREIGN KEY (itemId) REFERENCES items(id),

    UNIQUE (itemId, season, episode)
)`);

mysql.query(`CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie BOOLEAN NOT NULL,
    refId INT NOT NULL,
    link VARCHAR(255) NOT NULL,

    UNIQUE (link)
)`);

mysql.query(`CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
)`);

mysql.query(`INSERT IGNORE INTO categories (id, name) VALUES
    (1, "Action"),
    (2, "Aventure"),
    (3, "Animation"),
    (4, "Comédie"),
    (5, "Crime"),
    (6, "Documentaire"),
    (7, "Drame"),
    (8, "Familial"),
    (9, "Fantastique"),
    (10, "Histoire"),
    (11, "Horreur"),
    (12, "Musique"),
    (13, "Mystère"),
    (14, "Romance"),
    (15, "Science-Fiction"),
    (16, "Thriller"),
    (17, "TV Movie"),
    (18, "Guerre"),
    (19, "Western"),
    (20, "Realité"),
    (21, "Animation Japonaise"),
    (22, "Téléfilm")
`);

mysql.query(`CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) DEFAULT NULL
)`);

mysql.query(`INSERT IGNORE INTO companies (id, name, color) VALUES
    (1, "Marvel", "#da1921"),
    (2, "DC Comics Universe", "#1053aa"),
    (3, "One Piece", "#4872be"),
    (4, "Netflix", "#141414"),
    (5, "Harry Potter", "#bbb7b7"),
    (7, "Prime Video", "#1b212d"),
    (8, "FOX", "#e38e40"),
    (9, "Star Wars", "#2d2d33"),
    (10, "Studio Ghibli", "#199dd9"),
    (11, "Disney +", "#18285d"),
    (13, "HBO", "#163ae2"),
    (14, "Canal+", "#020303"),
    (15, "Paramount+", "#21324f"),
    (16, "Apple TV +", "#94a3b6")
`);

mysql.query(`CREATE TABLE IF NOT EXISTS category_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itemId INT NOT NULL,
    categoryId INT NOT NULL,

    FOREIGN KEY (itemId) REFERENCES items(id),
    FOREIGN KEY (categoryId) REFERENCES categories(id),

    UNIQUE (itemId, categoryId)
)`);

mysql.query(`CREATE TABLE IF NOT EXISTS company_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itemId INT NOT NULL,
    companyId INT NOT NULL,

    FOREIGN KEY (itemId) REFERENCES items(id),
    FOREIGN KEY (companyId) REFERENCES companies(id),

    UNIQUE (itemId, companyId)
)`);

mysql.query(`CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    itemId INT NOT NULL,
    up BOOLEAN NOT NULL,

    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (itemId) REFERENCES items(id),

    UNIQUE (userId, itemId)
)`);

mysql.query(`CREATE TABLE IF NOT EXISTS progressions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    videoId INT NOT NULL,
    progression INT NOT NULL,
    createdTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),

    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (videoId) REFERENCES videos(id),

    UNIQUE (userId, videoId)
)`);

module.exports = mysql;