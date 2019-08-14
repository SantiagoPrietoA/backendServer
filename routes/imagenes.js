var express = require('express');


var app = express();

var path = require('path');
var fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImg = path.resolve(__dirname, `../upload/${ tipo }/${ img }`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        var pathNoImg = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImg);
    }

    // res.status(200).json({
    //     ok: true,
    //     pathImg
    // })
})

module.exports = app;