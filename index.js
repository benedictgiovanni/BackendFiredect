//import modul yang diperlukan
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 1997
const bodyParser = require('body-parser')
const { router : routerWorker } = require('./controller/app')

//menggunakan modul cors
app.use(cors())
app.use(bodyParser.json({
    extended: true,
    limit: '50mb'
}))
app.use(bodyParser.json({
    extended: true,
    limit: '50mb'
}))
app.use(express.static('static'))
app.use('Worker', routerWorker)
app.listen(port, function(){
    console.log('Server berjalan di ' + port)
})