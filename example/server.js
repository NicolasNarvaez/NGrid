var cfg = require('./cfg.js'),
  express = require('express'),
  app = express();

app.use('/lib', express.static("../lib"))
app.use('/dist', express.static("../dist"))
app.use('/',  express.static("./full"))


app.listen(cfg.port)
console.log("running in "+cfg.port)
