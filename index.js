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
        // proses manipulasi
        return {
            ...data,
            isLogin: isLogin
        }
    })

    res.render('blog', {
        isLogin,
        blog: dataBlogs
    })
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

    // console.log(`Id params : ${id}`);
    // cara untuk get single data from AOO, menggunakan ID
    res.render('blog-detail', { data: blogs[id] })
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

    blogs.splice(id, 1);

    res.redirect("/blog")
})

app.get('/edit-blog/:id', function (req, res) {
    let id = req.params.id
    res.render('update-blog', { data: blogs[id] })
})

app.post('/edit-blog', function (req, res) {
    //dapetin id
    blogs.map(function (data) {
        //kondisi yang di manipulasi adalah yang id nya sama dengan yang didapatkan

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


