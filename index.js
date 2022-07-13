// pemanggilan package express
const express = require('express')

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

const isLogin = true
// endpoint
app.get('/', function (req, res) {
    let title = "Project Blog"
    res.render('index', { title })
})

app.get('/blog', function (req, res) {
    res.render('blog', { isLogin })
})

app.post('/blog', function (req, res) {
    // let title = req.body.title
    // let content = req.body.content

    let { title, content: dataContent } = req.body

    console.log(req.body);
    console.log(title, dataContent);

    res.redirect('/blog')
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

// set port 
const port = 5000
app.listen(port, function () {
    console.log(`Server running on port : ${port}`);
})


