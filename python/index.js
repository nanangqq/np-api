import fs from 'fs'
import path from 'path'
import child_process from 'child_process'

import Router from 'koa-router'
import { PythonShell } from 'python-shell'

const python = new Router()

const PYMODULES_DIR = './python/modules/'

const runPyModule = (moduleMainPath, params) => {
    console.log(moduleMainPath)
    const moduleDir = path.dirname(moduleMainPath)
    const pipFilePath = path.join(moduleDir, 'Pipfile')
    let venvPath
    try {
        fs.accessSync(pipFilePath)
        venvPath = child_process
            .execSync('pipenv --venv', {
                cwd: moduleDir,
                encoding: 'utf8'
            })
            .trim()
    } catch (err) {
        venvPath = undefined
    }
    const pythonPath = venvPath && path.join(venvPath, 'bin', 'python')
    // console.log(pythonPath)

    return new Promise((resolve, reject) => {
        const pyShell = new PythonShell(moduleMainPath, {
            // pythonPath: '/opt/conda/bin/python3.7', // 여기에 파이썬 실행파일 주소 입력_200611
            pythonPath,
            // mode: 'json',
            mode: 'text',
            args: [JSON.stringify(params)]
        })
        let result = []

        pyShell.on('message', message => {
            result = [...result, message]
        })

        pyShell.on('stderr', err => {
            console.log(err)
        })

        pyShell.end((err, code, signal) => {
            // console.log(err)
            resolve(result)
        })
    })
}

const genPythonModuleAPI = moduleName => {
    const moduleMainPath = path.join(PYMODULES_DIR, moduleName, 'main.py')
    // const errs = []
    try {
        fs.accessSync(moduleMainPath)
        const apiFunction = async ctx => {
            const { body } = ctx.request
            const params = {
                body,
                query: ctx.query
            }
            console.log(params)

            const res = await runPyModule(moduleMainPath, params)
            if (res.length === 1) {
                ctx.body = res[0]
            } else {
                console.log(res)
                ctx.body = 'too many messages comming from python'
            }
        }
        const apiName = '/' + moduleName.replace(/_/g, '-')
        // console.log(apiName)
        python.post(apiName, apiFunction)
    } catch (err) {
        // errs.push(err)
        return err
    }
}

const pyModules = fs.readdirSync(PYMODULES_DIR)
const errs = pyModules.map(genPythonModuleAPI).filter(e => e)
console.log(`${errs.length} pyModules with errors. 
${errs}`)

// console.log(python)

export default python
