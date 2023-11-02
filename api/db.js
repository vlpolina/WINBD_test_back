import sqlite3 from "sqlite3";

/** Файл для взаимодействия с БД SQLite3 */
const db = new sqlite3.Database("db.sqlite3");
/**
 * Инициализация БД - создание таблиц news, содержащей информацию о новостях, и users,
 * содержащей информацию о пользователях
 * */
db.serialize(() => {
  const sql1 = `
    CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            author TEXT,
            is_published BOOLEAN,
            date_published DATE
    )`;
  const sql2 = `
    CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`;
  db.run(sql1);
  db.run(sql2);
});
/** Класс, содержащий функции для реализации запросов к БД для API */
export class News {
  /**
   * SQL-запрос для получения всех записей из таблицы "Новости". Возвращает все записи из таблицы News. */
  static all(cb) {
    db.all(`SELECT * FROM news`, cb);
  }
  /** Запрос для установления факта публикации новости. Устанавливает параметр is_published в значение True (при создании новости дефолтное значение - False) и время публикации новости = настоящее время.
   * @param {number} id - ID новости, которую надо опубликовать, передаваемый в теле запроса через контроллер NewsController
   * @param {any} cb - callback*/
  static publicate(id, cb) {
    const date = new Date();
    const sql = `
        UPDATE news 
        SET is_published = True,
        date_published = ?
        WHERE id = ?`;
    db.run(sql, date, id, cb);
  }
  /** Запрос для создания новости. Добавляет строку с данными новости в таблицу news.
   * @param {any} data - набор данных, содержит data.title - заголовок, data.content - контент новости, data.author - автор новости
   * @param {any} cb - callback*/
  static create(data, cb) {
    const sql = `INSERT INTO news(title, content, author, is_published) VALUES (?, ?, ?, False)`;
    db.run(sql, data.title, data.content, data.author, cb);
  }
  /** Запрос для редактирования новости. Перезаписывает все данные, описанные в функции create на те, что указаны в теле post-запроса.
   * @param {number} id - ID новости, которую надо отредактировать, передаваемый через контроллер NewsController
   * @param {any} cb - callback*/
  static update(data, id, cb) {
    const sql = `
        UPDATE news 
        SET title = ?,
        content = ?,
        author = ?
        WHERE id = ?`;
    db.run(sql, data.title, data.content, data.author, id, cb);
  }
  /** Запрос для удаления новости.
   * @param {number} id - ID новости, которую надо удалить, передаваемый ссылке как параметр.
   * @param {any} cb - callback*/
  static delete(id, cb) {
    if (!id) return cb(new Error("id"));
    db.run(`DELETE FROM news WHERE id = ?`, id, cb);
  }
}
/** Класс, содержащий функции для реализации работы с пользователями в БД */
export class User {
  /** Запрос для поиска юзера по его имени пользователя.
   * @param {string} username - имя пользователя.
   * @param {any} cb - callback*/
  static findOne(username, cb) {
    try {
      const sql = `
                SELECT * FROM users 
                WHERE username = ?`;
      db.get(sql, username, cb);
    } catch (e) {
      return "Пользователь с таким именем уже существует";
    }
  }
  /** Запрос для создания пользователя в БД.
   * @param {string} username - имя пользователя
   * @param {string} password - хэшированный пароль
   * @param {any} cb - callback*/
  static create_user(username, password, cb) {
    const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(sql, username, password, cb);
  }
}
