require("dotenv").config(); // import env variables
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const http = require("http").createServer(app);

const authRoutes = require("./api/auth/auth.routes");
const mondayRoutes = require("./api/monday/monday.routes");
const mondayWebHookRoutes = require("./api/monday/monday.webhook.routes");
const config = require("./config");

app.use(cookieParser());
app.use(bodyParser.json()); //  content type appliaction/Json (header)
app.use(bodyParser.urlencoded({ extended: true })); // for some other content type by tranzilla (middleware for parsing bodys from url)

/*ORIGINAL START*/

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'https://testing-apps.monday.com');
//     res.header('Access-Control-Allow-Origin', 'https://af570353096f.ngrok.io');
//     res.header('Access-Control-Allow-Origin', 'https://api-gw.monday.com');
//     res.header('Access-Control-Allow-Origin', 'https://88983808e60cae26.cdn.monday.app');

//     res.header('Access-Control-Allow-Origin', 'https://aee9351f6c6a5634.cdn2.monday.app');

//     res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE');
//     // res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
//     // res.header('Access-Control-Allow-Headers', 'Content-Type');
//     // res.header('Access-Control-Allow-Headers', 'x-pulse-pusher-socketid');
//     res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token, x-pulse-pusher-socketid');
//     next();
// });
/*ORIGINAL END*/

var corsOptions;
if (!config.env.isDevelopment) {
  corsOptions = {
    origin: [
      "https://testing-apps.monday.com",
      "https://api-gw.monday.com",
      "https://88983808e60cae26.cdn.monday.app",
      "https://aee9351f6c6a5634.cdn2.monday.app",
      "https://3e0db1da1d10557d.cdn2.monday.app",
    ],
    methods: ["GET", "PUT", "POST", "HEAD", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "Content-Type",
      "X-Auth-Token",
      "x-pulse-pusher-socketid",
    ],
    credentials: true,
  };
} else {
  corsOptions = {
    origin: [
      "http://127.0.0.1:8080",
      "http://localhost:8080",
      "http://127.0.0.1:3000",
      "https://localhost:3000",
      "https://3d9b7dff44f5.ngrok.io",
      "https://88983808e60cae26.cdn.monday.app",
      "https://testing-apps.monday.com",
      "https://api-gw.monday.com",
      "https://aee9351f6c6a5634.cdn2.monday.app",
    ],
    credentials: true,
  };
}
app.use(cors(corsOptions));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/monday", mondayRoutes);
app.use("/", mondayWebHookRoutes);

const logger = require("./services/logger.service");
const port = process.env.PORT || 3030;
http.listen(port, () => {
  logger.info("Server is running on port: " + port);
});
