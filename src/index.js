const express = require('express');
const path = require('path');
const router = require('./routes');
const exphbs = require('express-handlebars');
const moment = require('moment');
const db = require('./config/db');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const socketHandler = require('./socket')
const csurf = require('csurf');
const flash = require('connect-flash');
const https = require('https');
const { Server } = require('socket.io');
const cookieSignature = require('cookie-signature');
const clients = require('./socket/clientsList');
const fs = require('fs')

// Khởi tạo ứng dụng Express
const app = express();
const port = 3000;
const options = {
  key: fs.readFileSync(path.join(__dirname, "certs", "localhost.key")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "localhost.crt")),
};

const server = https.createServer(options, app);
const io = new Server(server);


socketHandler(io);
app.set('io', io);
io.sockets.setMaxListeners(0);




// conect to database
const { setLocals } = require('./middleware');


app.use(express.json());

app.use(flash());

const secretKey = 'secret';
// cấu hình session

app.use(session({
  secret: secretKey, // Khóa bí mật dùng để ký session ID
  resave: false, // Không lưu session nếu không có thay đổi
  saveUninitialized: false,
  cookie: {
    secure: false, // Chỉ gửi cookie qua HTTPS
    httpOnly: true, // Không cho phép truy cập cookie bằng JavaScript
    maxAge: 60 * 180 * 1000 // Thời gian hết hạn của session là 30 phút (tính bằng mili giây)
  }
}));

// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       imgSrc: ["'self'", 'https://images.unsplash.com', '127.0.0.1:3000', ],
//       scriptSrc: ["'self'", 'https://trusted-scripts.com'],
//       frameSrc: ['https://www.google.com']
//       // Thêm các nguồn ảnh khác mà bạn tin tưởng
//     },
//   },
// }));// Sử dụng helmet để bảo vệ ứng dụng bằng cách thiết lập các HTTP headers

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
    dateToDatetime: (date) => date?moment(date).format('HH:mm DD/MM/YYYY'):null,
    minToHour: (min) => (min/60).toFixed(2),
    transStatus: (status) => {
      const statusMap = {
        "en route": "Đang đón",
        "in transit": "Đang di chuyển",
        "waiting": "Đang chờ",
        "completed": "Đã hoàn thành",
        "booking": "Đang đặt",

      }
      return statusMap[status]
    }

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
// lưu thông tin socket cho từng user

//kiểm tra thông tin đăng nhập
app.use((req, res, next) => {
  if (req.cookies.userId && req.session.user) {
    if (cookieSignature.unsign(req.cookies.userId, secretKey) === req.session.user.userId) {
      res.locals.user = req.session.user;
    }
  }
  res.locals.loginError = req.flash('loginError')[0];
  next();
})
// Routes
router(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`App listening at https://localhost:${port}`);
});
