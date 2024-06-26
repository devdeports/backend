require('dotenv').config();
const express = require("express");
const app = express();

app.set('port', process.env.PORT || 3000);

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Server
const server = app.listen(app.get('port'), () => {
    console.log(`Server Backend Port: ${app.get('port')}`);
});
 
// Routers
app.use("/api/index", require('./api/index.service'));
app.use("/api/auth", require('./api/authentication.service'));
app.use("/api/users", require('./api/users.service'));
app.use("/api/services", require('./api/services.service'));
app.use("/api/courses", require('./api/courses.service'));
