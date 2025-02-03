import {
    Pool
} from 'pg'
import 'dotenv/config'

const pool = new Pool({
    connectionString: "postgres://postgres:postgres@localhost:5432/postgres",
})

export { pool }