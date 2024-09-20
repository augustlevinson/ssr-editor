require('dotenv/config');

const port = process.env.PORT || 1337;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const documents = require('./docs.js');

const app = express();

app.use(cors());

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/add/:title?/:content?', async (req, res) => {
    const title = req.params.title;
    const content = req.params.content;
    
    if (title && content) {
        await documents.addOne(title, content);
    }
    
    if (!(title && content)) {
        await documents.addOne("Titel", "")
    }
    return res.redirect(`/`);
});

app.put("/edit", async (req, res) => {
    return res.json({doc: await documents.editOne(req.body)})
});

app.get('/docs/:id', async (req, res) => {
    return res.json({doc: await documents.getOne(req.params.id)});
});

app.get('/search/:string', async (req, res) => {
    console.log(req.params.string);
});

app.get('/', async (req, res) => {
    return res.json({docs: await documents.getAll()});
});

app.post("/delete", async (req, res) => {
    await documents.deleteOne(req.body.id);

    return res.redirect(`/`);
});

app.get("/reset", async (req, res) => {
    await documents.resetDb();
    return res.redirect(`/`);
})

const server = app.listen(port, () => {
    console.log(`SSR Editor running port ${port}`)
});

module.exports = { app, server };