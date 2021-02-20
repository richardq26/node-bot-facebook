const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

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
app.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("Post: webhook");
  if (body.object === "page") {
    body.entry.forEach((entry) => {
      // Aquí se reciben y procesan los mensajes
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);
      // Le damos el id que nos llega
      const sender_psid = webhookEvent.sender.id;
      console.log(`Sender PSID: ${sender_psid}`);

      // Validar que estamos recibiendo un mensaje
      // webhookEvent es un json
      if(webhookEvent.message){
        handleMessage(sender_psid, webhookEvent.message);
      }else if(webhookEvent.postback){
        handlePostback(sender_psid, webhookEvent.postback);
      }
    });

    res.status(200).send("Evento recibido");
  } else {
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  console.log("Get: webhook");
  // Acá le podemos poner lo que queramos
  const VERIFY_TOKEN = "stringUnico";
  // Parámetros que nos envía facebook
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WebHook verificado");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);
  }

  // La ruta sería esta
  // http://localhost:4000/webhook?hub.verify_token=stringUnico&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
  //res.render("index")
});

// Función que nos permite la administración de los eventos que lleguen
handleMessage = (sender_psid, received_message) => {
  let response;

  // Si el mensaje recibido tiene texto
  if(received_message.text){
    response= {
      'text': `Tu mensaje fue ${received_message.text} :D`
    }
  }

  callSendApi(sender_psid, response);
};

// Funcionalidad del postback
handlePostback = (sender_psid, received_postback) => {};

// Nos permite responder mensajes
callSendApi = (sender_psid, response) => {

  // Esta es la estructura que fb nos acepta
  const requestBody ={
    'recipient': {
      'id': sender_psid
    },
    'message': response
  }

  request({
    'uri': 'https://graph.facebook.com/v2.6/me/messages', 'qs': {'access_token': PAGE_ACCES_TOKEN},'method': 'POST', 'json': requestBody
  },(err,res,body)=>{
    if(!err){
      console.log('Mensaje enviado de vuelta');
    }else{
      console.error('Imposible enviar el mensaje :(')
    }
  })
};

module.exports = app;
