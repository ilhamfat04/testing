// pemanggilan package express
const express = require('express')

//pemanggilan koneksi db
const db = require('./connection/db')

// menggunakan package express
const app = express()

// atur template engine
app.set('view engine', 'hbs');

// static folder
app.use('/public', express.static('public'))

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

const isLogin = true
// endpoint
app.get('/', function (req, res) {
    let title = "Project Blog"
    res.render('index', { title })
})

app.get('/blog', function (req, res) {

    let selectQuery = 'SELECT * FROM blogs ORDER BY id DESC'

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(selectQuery, (err, result) => {
            done()
            if (err) throw err

            let dataBlogs = result.rows

            dataBlogs = dataBlogs.map((blog) => {
                return {
                    ...blog,
                    postedAt: getFullTime(blog.postedAt),
                    author: 'Ilham Fathullah'
                }
            })

            res.render('blog', {
                isLogin,
                blog: dataBlogs
            })
        })
    })

})

app.post('/blog', function (req, res) {
    let { title, content } = req.body

    let blog = {
        title,
        content,
        author: 1,
        image: 'image.png'
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

    if (!isLogin) {
        return res.redirect('/')
    }

    res.render('form-blog')
})

app.get('/delete-blog/:id', function (req, res) {
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


