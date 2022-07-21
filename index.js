// pemanggilan package express
const express = require('express')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')

//pemanggilan koneksi db
const db = require('./connection/db')
const upload = require('./middlewares/uploadFile')

// menggunakan package express
const app = express()

// atur template engine
app.set('view engine', 'hbs');

// static folder
app.use('/public', express.static('public'))
app.use('/uploads', express.static('uploads'))

app.use(flash())

app.use(
    session({
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 2
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: 'secretValue'
    })
)



//body parser
app.use(express.urlencoded({ extended: false }))

// request = client -> server
// response = server -> client 

let month = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
]

// const isLogin = true
// endpoint
app.get('/', function (req, res) {
    let title = "Project Blog"
    res.render('index', {
        title,
        isLogin: req.session.isLogin,
        user: req.session.user
    })
})

app.get('/blog', function (req, res) {

    let selectQuery = ''
    if (req.session.isLogin) {
        selectQuery = `SELECT blogs.*, name
                        FROM blogs
                        INNER JOIN users
                        ON blogs."authorId" = users.id
                        WHERE blogs."authorId" = ${req.session.user.id}
                        ORDER BY id DESC`
    } else {
        selectQuery = `SELECT blogs.*, name
                        FROM blogs
                        INNER JOIN users
                        ON blogs."authorId" = users.id
                        ORDER BY id DESC`
    }
    db.connect((err, client, done) => {
        if (err) throw err

        client.query(selectQuery, (err, result) => {
            done()
            if (err) throw err

            let dataBlogs = result.rows
            console.log(dataBlogs);

            dataBlogs = dataBlogs.map((blog) => {
                return {
                    ...blog,
                    postedAt: getFullTime(blog.postedAt),
                    isLogin: req.session.isLogin
                }
            })

            console.log(req.session.isLogin);
            res.render('blog', {
                isLogin: req.session.isLogin,
                user: req.session.user,
                blog: dataBlogs
            })
        })
    })

})

app.post('/blog', upload.single('image'), function (req, res) {
    let { title, content } = req.body

    let blog = {
        title,
        content,
        author: req.session.user.id,
        image: req.file.filename
    }

    db.connect((err, client, done) => {
        if (err) throw err

        let queryPost = `INSERT INTO blogs(title,content, "authorId", image) VALUES
                            ('${blog.title}','${blog.content}', '${blog.author}', '${blog.image}')`

        client.query(queryPost, (err, result) => {
            done()
            if (err) throw err
            res.redirect('/blog')
        })

    })
})


app.get('/blog/:id', function (req, res) {
    let id = req.params.id

    let queryDetail = `SELECT * FROM blogs WHERE id=${id}`

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(queryDetail, (err, result) => {
            done()
            if (err) throw err

            res.render('blog-detail', { data: result.rows[0] })
        })
    })
})

app.get('/contact', function (req, res) {
    res.render('contact')
})

app.get('/add-blog', function (req, res) {

    let isLogin = req.session.isLogin
    if (!isLogin) {
        return res.redirect('/')
    }

    res.render('form-blog', {
        isLogin
    })
})

app.get('/delete-blog/:id', function (req, res) {
    let isLogin = req.session.isLogin
    if (!isLogin) {
        return res.redirect('/')
    }

    let id = req.params.id

    db.connect((err, client, done) => {
        if (err) throw err

        let queryDelete = `DELETE FROM blogs WHERE id=${id}`

        client.query(queryDelete, (err, result) => {
            done()
            if (err) throw err

            res.redirect('/blog')
        })
    })
})

app.get('/edit-blog/:id', function (req, res) {
    let isLogin = req.session.isLogin
    if (!isLogin) {
        return res.redirect('/')
    }
    let id = req.params.id

    db.connect((err, client, done) => {
        if (err) throw err

        let queryDelete = `SELECT * FROM blogs WHERE id=${id}`

        client.query(queryDelete, (err, result) => {
            done()
            if (err) throw err

            res.render('update-blog', { data: result.rows[0] })
        })
    })
})

app.post('/edit-blog', function (req, res) {
    //dapetin id
    let { title, content, id } = req.body

    db.connect((err, client, done) => {
        if (err) throw err

        let queryUpdate = `UPDATE blogs SET title='${title}',content='${content}' WHERE id=${id}`

        client.query(queryUpdate, (err, result) => {
            // done()
            if (err) throw err

            res.redirect('/blog')
        })
    })
})

app.get('/register', function (req, res) {
    res.render('register')
})

app.post('/register', function (req, res) {
    let { name, email, password } = req.body

    password = bcrypt.hashSync(password, 10);

    let queryCheckEmail = `SELECT * FROM "users" WHERE email='${email}'`

    let query = `INSERT INTO users(name, email, password) VALUES
                    ('${name}', '${email}', '${password}')`

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(queryCheckEmail, (err, result) => {
            if (err) throw err

            if (result.rowCount != 0) {
                return res.redirect('/register')
            }

            client.query(query, (err, result) => {
                done()
                if (err) throw err

                res.redirect('/login')
            })
        })
    })
})

app.get('/login', function (req, res) {
    res.render('login')
})

app.post('/login', function (req, res) {
    let { email, password } = req.body

    db.connect((err, client, done) => {
        if (err) throw err

        let queryCheckEmail = `SELECT * FROM "users" WHERE email='${email}'`

        client.query(queryCheckEmail, (err, result) => {
            if (err) throw err

            if (result.rowCount == 0) {
                req.flash('danger', 'email not found')

                return res.redirect('/login')
            }

            let isMatch = bcrypt.compareSync(password, result.rows[0].password)

            if (isMatch) {
                req.session.isLogin = true
                req.session.user = {
                    id: result.rows[0].id,
                    name: result.rows[0].name,
                }
                req.flash('success', 'login success')
                res.redirect('/blog')
            } else {
                req.flash('danger', 'email and password doesnt match')

                res.redirect('/login')
            }

        })
    })
})

app.get('/logout', function (req, res) {
    req.session.destroy()
    res.redirect('/')
})


function getFullTime(time) {
    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hour = time.getHours()
    let minute = time.getMinutes()

    return `${date} ${month[monthIndex]} ${year} ${hour}:${minute} WIB`
}

function getDistanceTime(time) {
    // waktu posting = 08.30 => time
    // waktu aktual = 08.35 => new Date()
    // sudah berapa lama?
    // waktu aktual - waktu posting

    let distance = new Date() - new Date(time)

    let miliseconds = 1000
    let secondInMinutes = 60
    let minuteInHour = 60
    let secondInHour = secondInMinutes * minuteInHour // 3600
    let hourInDay = 23

    let dayDistance = distance / (miliseconds * secondInHour * hourInDay)

    if (dayDistance >= 1) {
        const dayDate = Math.floor(dayDistance) + ' day ago'
        return dayDate
    } else {
        let hourDistance = Math.floor(distance / (miliseconds * secondInHour))
        if (hourDistance > 0) {
            return hourDistance + ' hour ago'
        } else {
            let minuteDistance = Math.floor(distance / (miliseconds * secondInMinutes))
            return minuteDistance + ' minute ago'
        }
    }

}

// set port 
const port = 5000
app.listen(port, function () {
    console.log(`Server running on port : ${port}`);
})


