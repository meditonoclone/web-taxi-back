const express = require('express');
const path = require('path');
const router = require('./routes');
const exphbs = require('express-handlebars');
const moment = require('moment');
const db = require('./config/db');

// conect to database



// Khởi tạo ứng dụng Express
const app = express();
const port = 3000;

// Cấu hình Handlebars
app.engine('hbs', exphbs.engine({
  helpers: {
    formatDate: (date) => {
      return moment(date).format('DD/MM/YYYY');
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
// Routes
router(app);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
