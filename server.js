const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const geocoder = require('geocoder');
const port = 3000;

// API Endoint URL & Default Parameters Object
const venueSearchUrl = 'https://api.foursquare.com/v2/venues/search?';
const venueSearchbyparams = {
   client_id: 'W033PDIYFI2TSAUO4L5ANUFOAUMZV32NUWNOF0NL0JS2E5W4',
   client_secret: 'SM1ZI11XOMPVMEGMBZXSN3LGTLOBQCVGIM1SN4QAO0QTCSM1',
   intent: 'browse',
   radius: '18000',
   v: '20180226',
   limit: 10
};

// Creates a Query String from a parameters object and URL
const createQueryString = (obj, url) => {
   const encodeURI = encodeURIComponent;
   const query = Object.keys(obj)
      .map(k => encodeURI(k) + '=' + encodeURI(obj[k]))
      .join('&');
   const newUrl = url + query;

   return newUrl
};

// Holds value of API URL + Query Strings
const venueSearchEndpoint = createQueryString(venueSearchbyparams, venueSearchUrl);

// Converts user zipcode into cordinates for Google Maps
const geo = (zip) => {
   return new Promise(resolve => {
      geocoder.geocode(zip, (err, data) => {
         let latLng = {};
         latLng.lat = data.results[0].geometry.location.lat;
         latLng.lng = data.results[0].geometry.location.lng;
         resolve(latLng);
      });
   })
};


// Fetches API data from an API endpoint and renders Pages.EJS
const getVenueApi = (url, zip, res) => {

   geo(zip).then(latLng => {

    console.log(latLng);

      fetch(url)
         .then(res => res.json())
         .then(data => res.render('pages/search', {
            userLat: latLng.lat,
            userLng: latLng.lng,
            venues: JSON.stringify(data.response)
         }))
         // .then(data => console.log(JSON.stringify(data.response.venues)))
         .catch(err => {
            console.log(err);
            res.sendStatus(500);
         })

   })
}

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({
   extended: false
}));

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
   res.render('pages/index');
});

app.post('/', (req, res, next) => {

   let zip = req.body.zipcode;

   venueSearchbyparams.query = req.body.options;
   venueSearchbyparams.near = zip;

   const newUrl = createQueryString(venueSearchbyparams, venueSearchUrl);
   getVenueApi(newUrl, zip, res);
});



app.listen(process.env.PORT || port);
