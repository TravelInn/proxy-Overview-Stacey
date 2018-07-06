const express = require('express');
const morgan = require('morgan');
const path = require('path');
const React = require('react');
const fs = require('fs');

const { renderToString } = require('react-dom/server');
const { ServerStyleSheet } = require('styled-components');

const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

window = {};

let Booking;

const port = process.env.PORT || 3000;

const renderHTML = (props) => {
  const sheet = new ServerStyleSheet();
  const body = renderToString(sheet.collectStyles(React.createElement(Booking, props)));
  const styles = sheet.getStyleTags();
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous">
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous">
      <link href="https://fonts.googleapis.com/css?family=Noto+Sans" rel="stylesheet">
      <title>RUinn Demo</title>
      ${styles}
    </head>
    <body>
      <div id="header"></div>
      <div id="Overview"></div>
      <div id="booking">${body}</div>
      <div id="reviews"></div>
      <script src="/lib/react.development.js"></script>
      <script src="/lib/react-dom.development.js"></script>
      <script></script>
      <script src="https://s3-us-west-1.amazonaws.com/travelinn-booking/booking.js"></script>
      <script>
        ReactDOM.hydrate(React.createElement(Booking, ${JSON.stringify(props)}), document.getElementById('booking'));
      </script>
    </body>
  </html>
  `;
};

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.get('/:id', (req, res) => {
  const { id } = req.params;
  if (id !== 'favicon.ico') {
    res.type('html');
    axios
      .get(`http://localhost:3003/api/hostels/${id}/reservations?start=2018-06-25&end=2018-06-27`)
      .then(response => res.send(renderHTML({data: response.data})));
  } else {
    res.status = 404;
    res.end();
  }
});

app.use(express.static(path.join(__dirname, 'public')));
// app.use('/:id', express.static(path.join(__dirname, 'public')));

//HEADER
app.get('/api/locations/hostels/:id/info', (req, res) => {
  const { id } = req.params;
  axios
    .get(`http://18.191.246.21/api/locations/hostels/${id}/info`)
    .then(response => res.send(response.data))
    .catch(err => res.status(404).json({ Error: err }));
});
  
app.get('/api/locations/:id/info', (req, res) => {
  const { id } = req.params;
  axios
    .get(`http://18.191.246.21/api/locations/${id}/info`)
    .then(response => res.send(response.data))
    .catch(err => res.json({ message: 'Cannot GET /api/locations/:id/info' }));
});
  
app.get('/api/locations/hostels', (req, res) => {
  const { id } = req.params;
  axios
    .get(`http://18.191.246.21/api/locations/${id}/hostels`)
    .then(response => res.send(response.data))
    .catch(err => res.json({ message: 'Cannot GET /locations/hostels' }));
});

// OVERVIEW
app.get('/api/overview/:id', (req, res) => {
  const { id } = req.params;
  axios
    .get(`http://54.237.214.214/api/overview/${id}`)
    .then(response => res.send(response.data))
    .catch(err => res.send(`Cannot get /api/overview/:id, ${err}`));
});

app.get('/api/hostels', (req, res) => {
  axios
    .get('http://54.237.214.214/api/hostels')
    .then(response => res.send(response.data))
    .catch(err => res.send(`Cannot get /api/hostels ${err}`));
});

app.get('/api/hostels/:id/info', (req, res) => {
  const { id } = req.params;
  axios
    .get(`http://54.237.214.214/api/hostels/${id}/info`)
    .then(response => res.send(response.data))
    .catch(err => res.send(`Cannot get /api/hostels/:id/info ${err}`));
});


//BOOKING
app.get('/api/hostels/:id/reservations', (req, res) => {
  const { id } = req.params;
  axios
    .get(`http://localhost:3003/api/hostels/${id}/reservations?start=${req.query.start}&end=${req.query.end}`)
    .then(response => res.send(response.data))
    .catch(err => res.json({ message: 'Cannot GET /api/hostels/:id/reservations' }));
});

//REVIEWS
app.get('/api/reviews/:id/all', (req, res) => {
  const { id } = req.params;
  axios
    .get(`http://54.172.255.74/api/reviews/${id}/all`)
    .then(response => res.send(response.data))
    .catch(err => res.status(404).json({ message: 'Cannot GET /api/reviews/id/all' }));
});

app.get('/api/reviews/overview/:id', (req, res) => {
  const { id } = req.params;
  axios
    .get(`http://54.172.255.74/api/reviews/overview/${id}`)
    .then(response => res.send(response.data))
    .catch(err => res.json({ message: 'Cannot GET /api/reviews/overview/id' }));
});

axios
  // .get('https://s3-us-west-1.amazonaws.com/travelinn-booking/booking.js')
  .get('http://localhost:3003/1/booking.js')
  .then((response) => {
    fs.writeFile('./public/booking.js', response.data, (err) => {
      if (err) console.error(err);
      Booking = require('./public/booking').default;
      app.listen(port, () => {
        console.log(`server running at: http://localhost:${port}`);
      });
    });
  })
  .catch(err => console.error(err));
