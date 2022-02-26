'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const START_SEARCH_NO = 'START_SEARCH_NO';
const START_SEARCH_YES = 'START_SEARCH_YES';
const GREETING = 'GREETING';
const AUSTRALIA_YES = 'AUSTRALIA_YES';
const PAGINAWEB_ECOMMERCE = 'PAGINAWEB_ECOMMERCE';
const PREFERENCE_PROVIDED = 'PREFERENCE_PROVIDED';
const PREF_CLEANUP = 'PREF_CLEANUP';
const PREF_REVEGETATION = 'PREF_REVEGETATION';
const PREF_BIO_SURVEY = 'PREF_BIO_SURVEY';
const PREF_CANVASSING = 'PREF_CANVASSING';
const MANDA_A_COTIZAR = 'MANDA_A_COTIZAR'
const AUSTRALIA_NO = 'AUSTRALIA_NO';
const PAGINAS_WEB= 'PAGINAS_WEB';
const TIENDA_ONLINE= 'TIENDA_ONLINE';
const OTHER_HELP_YES = 'OTHER_HELP_YES';
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';
const GOOGLE_GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
const EMAILER= require('./mailer');

const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  mongoose = require('mongoose'),
  app = express().use(body_parser.json()); // creates express http server

 var db = mongoose.connect(MONGODB_URI);
 var ChatStatus = require("./models/chatstatus");

// Sets server port and logs message on success
app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Return a '200 OK' response to all events
  res.status(200).send('EVENT_RECEIVED');

  const body = req.body;

  if (body.object === 'page') {
      // Iterate over each entry
      // There may be multiple if batched
      if (body.entry && body.entry.length <= 0){
        return;
      }
      body.entry.forEach((pageEntry) => {
        // Iterate over each messaging event and handle accordingly
        pageEntry.messaging.forEach((messagingEvent) => {
          console.log({messagingEvent});
          if (messagingEvent.postback) {
            handlePostback(messagingEvent.sender.id, messagingEvent.postback);
          } else if (messagingEvent.message) {
            if (messagingEvent.message.quick_reply){
              handlePostback(messagingEvent.sender.id, messagingEvent.message.quick_reply);
            } else{
              handleMessage(messagingEvent.sender.id, messagingEvent.message);
            }
          } else {
            console.log(
              'Webhook received unknown messagingEvent: ',
              messagingEvent
            );
          }
        });
      });
    }
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

//recibe el primer mensaje
function handleMessage(sender_psid, message) {
  // check if it is a location message
  console.log('handleMEssage message:', JSON.stringify(message));

  const locationAttachment = message && message.attachments && message.attachments.find(a => a.type === 'location');
  const coordinates = locationAttachment && locationAttachment.payload && locationAttachment.payload.coordinates;

  //manda a saludo
  if (message.nlp && message.nlp.entities && message.nlp.entities.greetings && message.nlp.entities.greetings.find(g => g.confidence > 0.8 && g.value === 'true')){
    handlePostback(sender_psid, {payload: GREETING});
    return;
  }
}





function detalles_desarrollo_web(sender_psid){
  /*const response = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "list",
        "top_element_style": "compact",
        "elements": [
          {
            "title": "Environmental Cleanup",
            "subtitle": "Clean environment",
            "image_url": "http://www.wwf.org.au/Images/UserUploadedImages/416/img-bait-reef-coral-bleaching-rubble-1000px.jpg",
            "buttons": [
              {
                type: "postback",
                title: "Go Environmental Cleanup",
                payload: PREF_CLEANUP
              }
            ]
          }, {
            "title": "Revegetation",
            "subtitle": "Revegetation",
            "image_url": "http://www.wwf.org.au//Images/UserUploadedImages/416/img-planet-globe-on-moss-forest-1000px.jpg",
            "buttons": [
              {
                type: "postback",
                title: "Go Revegetation",
                payload: PREF_REVEGETATION
              }
            ]
          }, {
            "title": "Bio Survey",
            "subtitle": "Bio Survey",
            "image_url": "http://www.wwf.org.au/Images/UserUploadedImages/416/img-koala-in-tree-1000px.jpg",
            "buttons": [
              {
                type: "postback",
                title: "Go Bio Survey",
                payload: PREF_BIO_SURVEY
              }
            ]
          }, {
            "title": "Canvassing",
            "subtitle": "Canvassing",
            "image_url": "http://www.wwf.org.au/Images/UserUploadedImages/416/img-hackathon-winners-2017-1000px.jpg",
            "buttons": [
              {
                type: "postback",
                title: "Go Canvassing",
                payload: PREF_CANVASSING
              }
            ]
          }
        ]
      }
    }
  };
  */

  const response_2 = {
    "text": "De cuanto es tu presupuesto para gastar en tu Pagina Web/Tienda e-commerce?",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Menos de 15 000 MXN",
        "payload": OTHER_HELP_YES
      },
      {
        "content_type":"text",
        "title":"Entre 16 000-25 000",
        "payload": MANDA_A_COTIZAR
      },
      {
        "content_type":"text",
        "title":"No lo se",
        "payload": MANDA_A_COTIZAR
      }
    ]
  };
  callSendAPI(sender_psid, response);
  callSendAPI(sender_psid, response_2);
}

function handleStartSearchYesPostback(sender_psid){
  const yesPayload = {
    "text": " Bare Technology es una empresa especializada en desarrollo de software. Seguramente haremos grandes cosas juntos. Estos son los servicios que realizamos",
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Que tipo de software es tu proyecto ?",
            "image_url":"https://raw.githubusercontent.com/pepsicroos/images/main/pagina-web.png",
            "buttons":[
              {
                "type":"postback",
                "payload": PAGINAWEB_ECOMMERCE,//PAGINAWEB-ECOMMERCE
                "title":"Seleccionar"
              }
            ]
          }
        ]
      }
    }
  };
  const yesPayload2 = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "image_url":"https://raw.githubusercontent.com/pepsicroos/images/main/desarrollo-apps.png",
            "buttons":[
              {
                "type":"postback",
                "payload": MANDA_A_COTIZAR,//desarrollo apps
                "title":"Seleccionar"
              }
            ]
          }
        ]
      }
    }
  };
  const yesPayload3 = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "image_url":"https://raw.githubusercontent.com/pepsicroos/images/main/software-empresas.png",
            "buttons":[
              {
                "type":"postback",
                "payload": MANDA_A_COTIZAR, //software empresa
                "title":"Seleccionar"
              }
            ]
          }
        ]
      }
    }
  };
  const yesPayload4 = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "image_url":"https://raw.githubusercontent.com/pepsicroos/images/main/marketing-digital.png",
            "buttons":[
              {
                "type":"postback",
                "payload": MANDA_A_COTIZAR, //marketing digital
                "title":"Seleccionar"
              }
            ]
          }
        ]
      }
    }
  };
  callSendAPI(sender_psid, yesPayload);
  callSendAPI(sender_psid, yesPayload2);
  callSendAPI(sender_psid, yesPayload3);
  callSendAPI(sender_psid, yesPayload4);
}

function handleStartSearchNoPostback(sender_psid){
  const noPayload = {
    "text": "That's ok my friend, do you want to find other ways to help WWF?",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Yes.",
        "payload": OTHER_HELP_YES
      }
    ]
  };
  callSendAPI(sender_psid, noPayload);
}

function oferta_Pagina_ecommerce(sender_psid){

  const desicion_pag_ecommerce = {
    "text": "Que tipo de proyecto necesitas",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Pagina web o Landing Page",
        "payload": PAGINAS_WEB
      },
      {
        "content_type":"text",
        "title":"Tienda en linea E-commerce",
        "payload": TIENDA_ONLINE
      },
      {
        "content_type":"text",
        "title":"Otro tipo",
        "payload": MANDA_A_COTIZAR
      }
    ]
  };

  callSendAPI(sender_psid, desicion_pag_ecommerce);
  
}

function oferta_pagina_web(sender_psid){
  const campaigns = {
    "text": " Tenemos una oferta especial para ti ",
    "attachment":{
      "type":"image", 
      "payload":{
        "url":"https://raw.githubusercontent.com/pepsicroos/images/main/oferta-pagina-web.jpg", 
        "is_reusable":true
      }
     }
  };

  const respuestaAceptar = {
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Me interesa¡",
        "payload": MANDA_A_COTIZAR
      }
    ]
  };
  callSendAPI(sender_psid, campaigns);
  callSendAPI(sender_psid, respuestaAceptar);
}

function oferta_tienda_online(sender_psid){
  const campaigns = {
    "text": " Tenemos una oferta especial para ti ",
    "attachment":{
      "type":"image", 
      "payload":{
        "url":"https://raw.githubusercontent.com/pepsicroos/images/main/oferta-e-commerce-01.jpg", 
        "is_reusable":true
      }
      
     },
     "message": {
      "text": "U+1F449 Paquete inicial: Tu Tienda Online \n U+1F4B2 Precio: $13 990 MXN \n INCLUYE: \n  U+2705 Diseño de tienda \n U+2705 Tienda Online \n U+2705 Hosting y dominio \n  U+2705 Panel del administración \n U+2705 Integrable con Instagram, Facebook \n U+2705 Integrable con WhatsApp Bussiness \n  U+2705 E-mail de empresa"
      }
  };

  const respuestaAceptar = {
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Me interesa¡",
        "payload": MANDA_A_COTIZAR
      }
    ]
  };
  callSendAPI(sender_psid, campaigns);
  callSendAPI(sender_psid, respuestaAceptar);
}

function mandaACotizacionPostBack(sender_psid){


  const email = {
    "message":{
      "text": "Cual es tu e-mail? :",
      "quick_replies":[
        {
          "content_type":"user_email",
         
          "payload":"<POSTBACK_PAYLOAD>",
          
        }
        //"mid": "m_AG5Hz2Uq7tuwNEhXfYYKj8mJEM_QPpz5jdCK48PnKAjSdjfipqxqMvK8ma6AC8fplwlqLP_5cgXIbu7I3rBN0P",
        //"text": "<EMAIL_ADDRESS>"
      ]
    }
  };

  const phoneNumber = {
    "message":{
      "text": "Cual es tu telefono? :",
      "quick_replies":[
        {
          "content_type":"user_phone_number",
         
          "payload":"<PHONE_NUMBER>"
          
        }
        //"mid": "m_AG5Hz2Uq7tuwNEhXfYYKj8mJEM_QPpz5jdCK48PnKAjSdjfipqxqMvK8ma6AC8fplwlqLP_5cgXIbu7I3rBN0P",
        //"text": "<EMAIL_ADDRESS>"
      ]
    }
  };

  const agradecimiento = {
    "text": " Bare Technology te agradece tu confianza y muy pronto estaremos en contacto. Saludos "
  };


  callSendAPI(sender_psid, email);
  callSendAPI(sender_psid, phoneNumber);
  callSendAPI(sender_psid, agradecimiento);
  EMAILER.sendEmail();
  
}



//primer mensaje
function handleGreetingPostback(sender_psid){
  request({
    url: `${FACEBOOK_GRAPH_API_BASE_URL}${sender_psid}`,
    qs: {
      access_token: process.env.PAGE_ACCESS_TOKEN,
      fields: "first_name"
    },
    method: "GET"
  }, function(error, response, body) {
    var greeting = "";
    if (error) {
      console.log("Error getting user's name: " +  error);
    } else {
      var bodyObj = JSON.parse(body);
      const name = bodyObj.first_name;
      greeting = "Hola " + name + ". ";
    }
    const message = greeting + " Mi nombre es Tony, soy un robot y te ayudare a darte la información necesaria para que puedas concretar tu proyecto ☺️ Da click en el botón para continuar.";
    const greetingPayload = {
      "text": message,
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Empezar!",
          "payload": START_SEARCH_YES
        }
      ]
    };
    callSendAPI(sender_psid, greetingPayload);
  });
}

function handleAustraliaYesPostback(sender_psid){
  const askForLocationPayload = {
    "text": "Where about do you live?",
    "quick_replies":[
      {
        "content_type":"location"
      }
    ]
  };
  callSendAPI(sender_psid, askForLocationPayload);
}

function handlePreferencePostback(sender_psid, chatStatus){
  console.log('handlePreferencePostback params: ', chatStatus);
  if (chatStatus && !isNaN(chatStatus.location.lat) && !isNaN(chatStatus.location.long)){
    request({
      "url": `${FACEBOOK_GRAPH_API_BASE_URL}search?type=page&q=NonProfit+Australia&fields=name,id,category,location,picture`,
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "GET"
    }, (err, res, body) => {
      if (err) {
        console.error("Unable to search Facebook API:" + err);
      } else {
          console.log("Facebook API result:", body);
          let bodyJson = JSON.parse(body);
          let elements = bodyJson.data.filter(d => {
            if (isNaN(d.location && d.location.latitude) || isNaN(d.location && d.location.longitude)){
              return false;
            }
            return d.location.latitude < chatStatus.location.lat + 0.1 && d.location.latitude > chatStatus.location.lat - 0.1
              && d.location.longitude < chatStatus.location.long + 0.1 && d.location.longitude > chatStatus.location.long - 0.1
          }).slice(0,3).map(org => {
              let element = {
                "title": org.name,
                "buttons":[{
                  "type": "web_url",
                  "url": `https://www.facebook.com/${org.id}`,
                  "title": org.name,
                }]
              };
              if (org.category){
                element["subtitle"] = org.category;
              }

              if (org.picture && org.picture.data && org.picture.data.url){
                element["image_url"] = org.picture.data.url;
              }
              console.log("Facebook API element:", element);
              return element;
          });
          console.log("Facebook API elements:", elements);
          const organizationPayload = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "list",
                "top_element_style": "compact",
                "elements": elements
              }
            }
          };
          callSendAPI(sender_psid, organizationPayload);
        }
    });
  }
}

function updateStatus(sender_psid, status, callback){
  const query = {user_id: sender_psid};
  const update = {status: status};
  const options = {upsert: status === GREETING};

  ChatStatus.findOneAndUpdate(query, update, options).exec((err, cs) => {
    console.log('update status to db: ', cs);
    callback(sender_psid);
  });
}

function updatePreference(sender_psid, perference, callback){
  const query = {user_id: sender_psid};
  const update = {status: 'PREFERENCE_PROVIDED', preference: perference};
  const options = {upsert: false, new: true};

  ChatStatus.findOneAndUpdate(query, update, options).exec((err, cs) => {
    console.log('update perference to db: ', cs);
    callback(sender_psid, cs);
  });
}


//funcion que recibe los mensajes y respuestas del usuario y las dirige a cada función correspondiente
function handlePostback(sender_psid, received_postback) {
  // Get the payload for the postback
  const payload = received_postback.payload;

  // Set the response and udpate db based on the postback payload
  switch (payload){
    case START_SEARCH_YES:
      updateStatus(sender_psid, payload, handleStartSearchYesPostback);
      break;
    case START_SEARCH_NO:
      updateStatus(sender_psid, payload, handleStartSearchNoPostback);
      break;
    case PAGINAWEB_ECOMMERCE:
      updateStatus(sender_psid, payload, oferta_Pagina_ecommerce);
      break;
    case PAGINAS_WEB:
      updateStatus(sender_psid, payload, oferta_pagina_web);
      break;
      case TIENDA_ONLINE:
        updateStatus(sender_psid, payload, oferta_tienda_online);
        break;
    case AU_LOC_PROVIDED:
      updateStatus(sender_psid, payload, detalles_desarrollo_web);
      break;
    case GREETING:
      updateStatus(sender_psid, payload, handleGreetingPostback);
      break;
    case MANDA_A_COTIZAR:
      updateStatus(sender_psid, payload, mandaACotizacionPostBack);
      break;

    case PREF_CLEANUP:
    case PREF_REVEGETATION:
    case PREF_BIO_SURVEY:
    case PREF_CANVASSING:
      updatePreference(sender_psid, payload, handlePreferencePostback);
      break;
    default:
      console.log('Cannot differentiate the payload type');
  }
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  console.log('message to be sent: ', response);
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "url": `${FACEBOOK_GRAPH_API_BASE_URL}me/messages`,
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    console.log("Tu mensaje enviado fue:", body);
    if (err) {
      console.error("Unable to send message:", err);
    }
  });
}

