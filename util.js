import { Pool } from 'pg'
import db from './db'

export const executeQ = async sql => {
    let pool, res
    try {
        pool = new Pool(db)
        res = await pool.query(sql)
        pool.end()
    } catch (err) {
        res = err
        console.log(err)
        if (pool) {
            pool.end()
        }
    }
    return res
}
