import Router from 'express'
import NewsController from './NewsController.js'
import AuthController from './AuthController.js'
import {check} from "express-validator"
//import authMiddleware from './middleware/authMiddleware.js'
/** Роутер, содержащий адреса для вызова API */
const router = new Router()

router.get('/newsNotice', /*authMiddleware,*/ NewsController.newsNotice)
router.get('/newsAll', /*authMiddleware,*/ NewsController.newsAll)
router.post('/create', /*authMiddleware,*/ NewsController.create)
router.post('/publicate', /*authMiddleware,*/ NewsController.publicate)
router.post('/publicate_on_time', /*authMiddleware,*/ NewsController.publicate_on_time)
router.post('/update', /*authMiddleware,*/ NewsController.update)
router.delete('/delete/:id', /*authMiddleware,*/ NewsController.delete)

router.post('/registration', [
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль должен быть больше 4 и меньше 10 символов').isLength({min:4, max:10})
],AuthController.registration)
//не работает...
router.post('/login', AuthController.login)

export default router;