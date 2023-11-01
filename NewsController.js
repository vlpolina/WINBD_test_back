import { News } from './db.js'
import { EventEmitter } from 'events';

const emitter = new EventEmitter();
/**
 * Контроллер с API для работы с новостями
 * */
class NewsController {
    /** API для получения уведолмений о создании, публикации, изменении и удалении новостей. Работает как event sourcing, поодерживает постоянное подключение и в реальном времени выводит сообщения о событиях. Get-запрос
     */
    newsNotice(req, res) {
        res.writeHead(200, {
            'Connection': 'keep-alive',
            'Content-type': 'text/event-stream',
            'Cache-Control': 'no-cache',
        })
        emitter.on('newsChanges', (message) => {
            res.write(`data: ${JSON.stringify(message)} \n\n`)
        })
    }
    /** API для получения всех новостей из БД (даже неопубликованных) через get-запрос.
     * */
    newsAll(req, res, next) {
        News.all((err, news) => {
            if (err) return next(err)
            res.send(news)
        })
    }
    /** API для создания новости через post-запрос.
     *
     * @example
     * передача данных в формате json:
     * {
     *     "title": "title",
     *     "content": "some content",
     *     "author": "author"
     * }
     * // => "ok"
     * */
    create (req, res, next) {
        const data = req.body;
        News.create(data, (err) => {
            if (err) return next(err);
            emitter.emit('newsChanges', "News were created")
            res.send('ok')
        })
    }
    /** API для публикации новости в настоящее время через post-запрос/
     *
     * @example
     * передача данных в формате json:
     * {
     *     "id": 1
     * }
     * // => "ok"
     * */
    publicate (req, res, next) {
        const data = req.body;
        News.publicate(data.id, (err) => {
            if (err) return next(err);
            emitter.emit('newsChanges', "News were publicated")
            res.send('ok')
        })
    }
    /** API для отложенной публикации новости. При вызове функции через post-запрос.
     *
     * @example
     * передача данных в формате json:
     * {
     *     "id": 1,
     *     "date_published": "2023-11-01T18:26:00"
     * }
     * // => "ok"
     * */
    publicate_on_time (req, res, next) {
        const data = req.body;
        const date_publicate = new Date(data.date_published)
        const date_now = new Date()
        const timeDiff = date_publicate.getTime() - date_now.getTime()
        if (timeDiff > 0) {
            setTimeout(function() {
                News.publicate(data.id, (err) => {
                    if (err) return next(err);
                    emitter.emit('newsChanges', `News were publicated on time ${data.date}`)
                    res.send('ok')
                })
            }, timeDiff)
        } else {
            res.send('Указанная дата уже прошла!')
        }
    }
    /** API для редактирования новости. При вызове функции через post-запрос.
     *
     * @example
     * передача данных в формате json:
     * {
     *     "title": "qqqq",
     *     "content": "qqqqqqqqqq",
     *     "author": "ddd"
     * }
     * // => "ok"
     * */
    update (req, res, next) {
        const id = req.body.id;
        const data = req.body;
        News.update(data, id, (err) => {
            if (err) return next(err);
            emitter.emit('newsChanges', "News were updated")
            res.send('ok')
        })
    }
    /** API для удаления новости. При вызове функции через delete-запрос.
     *
     * @example
     * передача данных в формате ссылке:
     * http://localhost:3011/delete/4
     * // => "Deleted"
     * */
    delete (req, res, next) {
        const id = req.params.id;
        News.delete(id, (err) => {
            if (err) return next(err)
            emitter.emit('newsChanges', "News were deleted")
            res.send({ message: 'Deleted' })
        })
    }
}

export default new NewsController()