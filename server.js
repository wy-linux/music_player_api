/*-CREATE SERVER-*/
const express = require('express'),
    app = express(),
    PORT = 9000;
app.listen(PORT, () => {
    console.log(`SERVICE IS OK ===> ${PORT}`);
});

/*-MIDDLE WARE-*/
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", false);
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,HEAD");
    req.method === 'OPTIONS' ? res.send('CURRENT SERVICES SUPPORT CROSS DOMAIN REQUESTS!') : next();
});

/*-QUERY DATA-*/
const {
    readFile
} = require('./promiseFS');
app.use(async(req, res, next) => {
    req.$MUSIC_DATA = JSON.parse(await readFile('./music.json'));
    next();
});

function suffix(option) {
    if (!Array.isArray(option)) {
        option.music = `${option.music}`;
        return option;
    }
    option = option.map(item => {
        item.music = `${item.music}`;
        return item;
    });
    return option;
}

/*-API-*/
app.get('/info', (req, res) => {
    let {
        id
    } = req.query;
    let data = req.$MUSIC_DATA.find(item => {
        return parseInt(item.id) === parseInt(id);
    });
    if (data) {
        res.send({
            code: 0,
            message: 'OK',
            data: suffix(data)
        });
        return;
    }
    res.send({
        code: 1,
        message: 'NO'
    });
});

app.get('/other', (req, res) => {
    let {
        id,
        lx = 'prev'
    } = req.query;
    let data = null,
        $MUSIC_DATA = req.$MUSIC_DATA;
    for (let i = 0; i < $MUSIC_DATA.length; i++) {
        let item = $MUSIC_DATA[i],
            prev = $MUSIC_DATA[i - 1],
            next = $MUSIC_DATA[i + 1];
        if (parseInt(item.id) === parseInt(id)) {
            if (lx === 'prev') {
                data = prev;
            } else {
                data = next;
            }
            break;
        }
    }
    if (data) {
        res.send({
            code: 0,
            message: 'OK',
            data: suffix(data)
        });
        return;
    }
    res.send({
        code: 1,
        message: 'NO'
    });
});

app.get('/hotList', (req, res) => {
    let data = [],
        $MUSIC_DATA = req.$MUSIC_DATA;
    for (let i = 0; i < 3; i++) {
        let item = $MUSIC_DATA[i];
        if (item) {
            data.push({
                id: item.id,
                title: item.title,
                author: item.author,
                pic: item.pic
            });
        }
    }
    if (data.length > 0) {
        res.send({
            code: 0,
            message: 'OK',
            data
        });
        return;
    }
    res.send({
        code: 1,
        message: 'NO'
    });
});

app.use(express.static(__dirname));
app.use((req, res) => {
    res.status(404);
    res.send('NOT FOUND!');
});