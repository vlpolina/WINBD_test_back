import {User} from './db.js'
import bcrypt from 'bcryptjs'
import {validationResult} from 'express-validator'
import jwt from 'jsonwebtoken'
import {secret} from '../backend/config.js'
/**
 * Генерация токена
 * @param {any} id - jwt с id пользователя
 * @return {any} - возвращает jwt достпуный 24 часа
 * */
const generateAccessToken = (id) => {
    const payload = {
        id
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"})
}
/**
 * Контроллер, содержащий функции для регистрации и авторизации
 * */
class AuthController {
    /**
     * API-Регистрация. Выполняет проверку на уникальное имя пользователя, если пользователь не существует, то хэширует пароль
     * при помощи bcrypt и сохраняет данные пользователя в базу данных
     * @param {any} errors - ошибки при валидации
     * @param {string} username - имя пользователя
     * @param {string} password - пароль
     * @param {string} candidate - переменная для проверки существования пользователя с введенным username
     * @param {string} hashPassword - хэшированный пароль
     * @returns {any} - возвращают с сервера информацию о статусе регистрации (успех / нет)
     *
     * @example
     * передача данных в формате json:
     * {
     *     "username": "user",
     *     "password": "password"
     * }
     * // => "Пользователь был зарегистрирован"
     * */
    registration(req, res) {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка при регистрации", errors})
            }
            const {username, password} = req.body
            const candidate = User.findOne(username)
            if (candidate === "Пользователь с таким именем уже существует") {
                return res.status(400).json({message: 'Registration error1'})
            }
            const hashPassword = bcrypt.hashSync(password, 7)
            User.create_user(username, hashPassword)
            return res.json({message: "Пользователь был зарегистрирован"})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Registration error2'})
        }
    }
    /**
     * Авторизация. Выполяняет поиск пользователя по введенному имени пользователя, если пользователь найден, то проверяет валидность введенного пароля и пароля из БД для данного пользователя, в случае успеха пользователь получает токен, с помощью которого осуществляется доступ ко всем API работы с новостями.
     * @param {string} user - пользователь
     * @param {string} username - имя пользователя
     * @param {string} validPassword - переменная для проверки пароля
     * @param {string} token - токен
     * @returns {any} - возвращают с сервера информацию о статусе авторизации (успех / нет)
     *
     * @example
     * передача данных в формате json:
     * {
     *     "username": "user",
     *     "password": "password"
     * }
     * // => токен
     * */
    login(req, res) {
        try {
            const {username, password} = req.body
            const user = User.findOne(username)
            console.log(user)//функция для работы с БД выбрасывает undefined
            if (!user) {
                return res.status(400).json({message: `Пользователь ${username} не найден`})
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if(!validPassword) {
                return res.status(400).json({message: 'Пароль неверный'})
            }
            const token = generateAccessToken(user.id)
            return res.json({token})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Login error'})
        }
    }
}

export default new AuthController()