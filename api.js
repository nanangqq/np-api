import Router from 'koa-router'
import { executeQ } from './util'
import Axios from 'axios'

const api = new Router()

api.get('/test', ctx => {
    ctx.body = 'test ok'
})

export default api
