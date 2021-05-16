import Koa from 'koa'
import os from 'os'
import { exec } from 'child_process'
import Router from 'koa-router'
import mount from 'koa-mount'
import serve from 'koa-static'

import api from './api'

const startServer = async () => {
    const app = new Koa()
    const router = new Router()
    router.use('/api', api.routes())

    const PORT = process.env.PORT || 4000

    let HOSTNAME
    if (os.platform() == 'linux') {
        HOSTNAME = await exec('hostname -i', (error, stdout, stderr) => {
            if (!error & !stderr) {
                console.log('host: %s', stdout)
            } else {
                console.log(error, stderr)
            }
        })
    } else {
        HOSTNAME = 'localhost'
    }

    const static_pages = new Koa()
    static_pages.use(serve('static'))
    app.use(mount('/', static_pages)).use(router.routes())

    app.listen(PORT, HOSTNAME, () => {
        console.log('==> 🌎  Listening on port %s.', PORT)
    })
}

startServer()
