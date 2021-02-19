const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const app = express().use(bodyParser.json());

//Settings
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", ".html");
//Static files
app.use(express.static(path.join(__dirname, "public")));

// TOKEN DE ACCESO DESDE azure
const PAGE_ACCES_TOKEN = process.env.PAGE_ACCES_TOKEN;

// Métodos de los webhook
app.post('/webhook', (req,res)=>{
    const body=req.body;
    console.log('Post: webhook');
    if(body.object === 'page'){
        body.entry.forEach(entry=>{
            // Aquí se reciben y procesan los mensajes
            const webhookEvent = entry.messaging[0];
            console.log(webhookEvent);

            res.status(200).send('Evento recibido');
        });
    }else{
        res.sendStatus(404);
    }
});

app.get('/webhook', (req,res)=>{
    console.log('Get: webhook');
    // Acá le podemos poner lo que queramos
    const VERIFY_TOKEN='stringUnico';
    // Parámetros que nos envía facebook
    const mode= req.query['hub.mode'];
    const token= req.query['hub.verify_token'];
    const challenge=req.query['hub.challenge'];

    if(mode && token){
        if( mode === 'subscribe' && token === VERIFY_TOKEN){
            console.log('WebHook verificado');
            res.status(200).send(challenge);
        }else{
            res.sendStatus(404);
        }
    }else{
        res.sendStatus(404);
    }

    // La ruta sería esta 
    // http://localhost:4000/webhook?hub.verify_token=stringUnico&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe
});

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname,'views/index.html'));
    //res.render("index")
})

module.exports = app;