var cfg = require('./cfg.js'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express();


app.use(bodyParser.json())

app.use(function(req, res, next) {
	console.log('processing a request')
	//console.dir(req, {depth:1})
	next()
})

app.use('/lib', express.static("../lib"))
app.use('/dist', express.static("../dist"))
app.use('/',  express.static("./full"))


app.listen(cfg.port)
console.log("running in "+cfg.port)
