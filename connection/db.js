const { Pool } = require('pg')

// Setup connection
const dbPool = new Pool({
    database: 'blog_batch37',
    port: 5432,
    user: 'postgres',
    password: 'root'
})

module.exports = dbPool