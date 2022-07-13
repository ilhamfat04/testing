// pemanggilan package express
const express = require('express')

// menggunakan package express
const app = express()

// atur template engine
app.set('view engine', 'hbs');

// static folder
app.use('/public', express.static('public'))

// request = client -> server
// response = server -> client

const isLogin = false
// endpoint
app.get('/', function (req, res) {
    let title = "Project Blog"
    res.render('index', { title })
})

app.get('/blog', function (req, res) {

    res.render('blog', { isLogin })
})

app.get('/blog/:id', function (req, res) {
    let id = req.params.id
    let data = ['ilham', 'jody', 'dandi', 'egi']
    console.log(`Id params : ${id}`);
    res.render('blog-detail', { author: data[id] })
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


const port = 5000
app.listen(port, function () {
    console.log(`Server running on port : ${port}`);
})


