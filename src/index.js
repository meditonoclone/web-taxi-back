const express = require('express');
const path = require('path');
const router = require('./routes');
const exphbs = require('express-handlebars');
const moment = require('moment');
const db = require('./config/db');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

// conect to database
const { setLocals } = require('./middleware');

// Khởi tạo ứng dụng Express
const app = express();
const port = 3000;


// cấu hình session

app.use(session({
  secret: 'secret', // Khóa bí mật dùng để ký session ID
  resave: false, // Không lưu session nếu không có thay đổi
  saveUninitialized: false,
  cookie: {
    secure: false, // Chỉ gửi cookie qua HTTPS
    httpOnly: true, // Không cho phép truy cập cookie bằng JavaScript
    maxAge: 60 * 180 * 1000 // Thời gian hết hạn của session là 30 phút (tính bằng mili giây)
  }
}));

app.use(helmet()); // Sử dụng helmet để bảo vệ ứng dụng bằng cách thiết lập các HTTP headers

app.use(cookieParser()); // Sử dụng cookie-parser để phân tích cú pháp cookie

// app.use(csurf({ cookie: true })); // Sử dụng csurf để bảo vệ chống lại các cuộc tấn công CSRF, sử dụng cookie để lưu trữ CSRF token

// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken(); // Tạo CSRF token và gắn vào biến cục bộ res.locals
//   next(); // Chuyển tiếp yêu cầu tới middleware tiếp theo
// });

// Cấu hình Handlebars
app.engine('hbs', exphbs.engine({
  helpers: {
    formatDate: (date) => moment(date).format('DD/MM/YYYY'),
    // user: () => {
    //   if (session.user)
    //     return session.user.name; 
    //   return 'ĐĂNG NHẬP';
    // },
    
  },
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'resource', 'views', 'layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resource', 'views'));

// Middleware

// Cấu hình thư mục chứa các tệp tĩnh (CSS, JS, hình ảnh)
app.use(express.static(path.join(__dirname, 'public')));


app.use(
  express.urlencoded({
    extended: true,
  }),
);


app.use((req, res, next)=>{
  res.locals.user = req.session.user;
  next();
})
// Routes
router(app);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
