var Db_Manager = require('../business/db_business');


let url = require('url');  
let dealFn = require('./dealfn.js');

function sendDataFn(req, res, filename, needcity) {
    let query = url.parse(req.url, true).query,
        name = query.name || '',
        city = query.city,
        readFileName = '',
        sendData = {
            errno: 0,
            city: city,
            msg: 'ok',
            data: {}
        };
    if (needcity) {
        readFileName = city + filename;
    } else {
        readFileName = filename;
    }
    dealFn.readFileData(name + readFileName).then((data) => {
        sendData.data = data;
        res.send(JSON.stringify(sendData));
    }, (msg) => {
        sendData.errno = -1;
        sendData.msg = '暂时没有数据';
        res.send(JSON.stringify(sendData));
    })
}




exports.swiper = (req, res) => {
    sendDataFn(req, res, 'swiper.json', false);
}

exports.city = (req, res) => {
    sendDataFn(req, res, 'city.json', false);
}

exports.cinema_detail = (req, res) => {
    sendDataFn(req, res, 'cinema_detail.json', false);
}

exports.getConnection = (req, res) => {
    let dbinfo = Db_Manager.selectConnections();
    res.send(dbinfo);
}
