const express = require('express');
const path = require('path');
// const fs = require('fs');
const { XMLParser, XMLValidator } = require('fast-xml-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const promisePool = require('./mysql');

const app = express();
const port = 3000;
const host = 'localhost';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/inc', express.static('includes'));


app.get('/', async (req, res) => {
    try {
        const response = await fetch('http://localhost:5000/blogitJulkaistu');
        if (!response.ok) {
            throw new Error(`Failed to fetch blog data: ${response.status} ${response.statusText}`)
        }
        const dataBlog = await response.json();

        const saa = await fetch('http://localhost:5005/saa/1');
        if (!saa.ok) {
            throw new Error(`Failed to fetch weather data: ${saa.status} ${saa.statusText}`);
        }


        const saaText = await saa.text()
        console.log(saaText);
        const parser = new XMLParser();
        const dataSaa = parser.parse(saaText);
        console.log(dataSaa);

        const htmlBlog = dataBlog.map(item => {
            const date = new Date(item.julkaisuaika);
            const paiva = ('0' + date.getDate()).slice(-2);
            const kuukausi = ('0' + (date.getMonth() + 1)).slice(-2);
            const vuosi = date.getFullYear()
            const julkaisupav = `${paiva}.${kuukausi}.${vuosi}`

            return `<div class="blogiKirjoitus">
                <div class="blogi">${item.blogin_nimi}</div>
                <div class="blogi">${item.otsikko}</div>
                <p class="blogi">${julkaisupav}</p>
            </div><hr>`


        }).join('');

        const [otsikot] = await promisePool.query('SELECT otsikko FROM uutiset');
        const [sisalto] = await promisePool.query('SELECT sisalto, otsikko FROM uutiset LIMIT 2;');


        res.render('index', { otsikot, sisalto, htmlBlog, dataSaa });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/uutiset', async (req, res) => {
    try {
        const otsikko = await promisePool.query('select otsikko from uutiset');
        res.json(otsikko);
    } catch (err) {
        res.status(500).json({ err: 'virhe' })
    }

})


app.listen(port, host, () => console.log(`${host}:${port} kuuntelee...`));
