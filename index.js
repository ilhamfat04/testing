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

const blogs = [
    {
        title: "Pasar Coding di Indonesia Dinilai Masih Menjanjikan",
        content: "Ketimpangan sumber daya manusia (SDM) di sektor digital masih menjadi isu yang belum terpecahkan. Berdasarkan penelitian ManpowerGroup, ketimpangan SDM global, termasuk Indonesia, meningkat dua kali lipat dalam satu dekade terakhir. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quam, molestiae numquam! Deleniti maiores expedita eaque deserunt quaerat! Dicta, eligendi debitis?",
        author: "Ichsan Emrald Alamsyah",
        posted_at: "12 Jul 2021 22:30 WIB"
    }
]

const isLogin = true
// endpoint
app.get('/', function (req, res) {
    let title = "Project Blog"
    res.render('index', { title })
})

app.get('/blog', function (req, res) {
    let dataBlogs = blogs.map(function (data) {
        console.log(data);

        // proses manipulasi
        return {
            ...data,
            isLogin: isLogin
        }
    })

    console.log(dataBlogs);

    // for(let i=0; i<10; i++){
    //     blogs[i]
    // }


    // console.log(dataBlogs);
    res.render('blog', { isLogin, blogs })
})

app.post('/blog', function (req, res) {
    let { title, content } = req.body
    let date = new Date()

    let blog = {
        title,
        content,
        author: "Ilham Fathullah",
        posted_at: getFullTime(date)
    }

    blogs.push(blog)

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

function getFullTime(time) {
    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hour = time.getHours()
    let minute = time.getMinutes()

    return `${date} ${month[monthIndex]} ${year} ${hour}:${minute} WIB`
}

// set port 
const port = 5000
app.listen(port, function () {
    console.log(`Server running on port : ${port}`);
})


