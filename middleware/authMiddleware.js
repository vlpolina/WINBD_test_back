import jwt from "jsonwebtoken"
import {secret} from "../config.js";
/**
 *
 * middleware для проверки валидного токена, получаемого пользователем при авторизации
 * @param {string} token - валидный токен
 * @param {any} decodedData - jwt
 * @returns {any} - ответ сервера об ошибке, если пользователь не авторизован
 * @example
 *
 * router.post('/create', authMiddleware, NewsController.create)
 * // => отправка post-запроса create доступна только авторизованным пользователям
 * */
module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(403).json({message: "Пользователь не авторизован"})
        }
        const decodedData = jwt.verify(token, secret)
        req.user = decodedData
        next()
    } catch (e) {
        console.log(e)
        return res.status(403).json({message: "Пользователь не авторизован"})
    }
}