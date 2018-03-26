let fs = require('fs');
let parse = require('csv-parse');
let geocoder = require('geocoder');
let config = require('./config/google');

let csvData = [];
let pathToRead = './datas/cimek_csv3.csv'; // copy the path of the readable csv.    eg.: let pathToRead = 'datas/cimek_csv.csv';
let pathToWrite = './datas/coordinates.txt';
let googleGeoCodingApiKey = config.geoCodingApiKey; // copy your GeoCoding API key to the config directory, google.json file, value of geoCodingApiKey
let addressCounter = 0;

fs.createReadStream(pathToRead)
  .pipe(parse({delimiter: ';'}))
  .on('data', (csvrow) => {
    let address = {
      id: csvrow[0],
      city: csvrow[1],
      natureName: csvrow[2],
      nature: csvrow[3],
      number: csvrow[4],
      rating: csvrow[5]
    };
    csvData.push(address);
  })
  .on('end', () => {
    csvData.splice(0, 1);
    var wstream = fs.createWriteStream(pathToWrite);
    csvData.forEach((rowData) => {
      console.log(rowData);
      let address = rowData.city + ', ' + rowData.natureName + ' ' + rowData.nature + ' ' + rowData.number;
      let latAndLng = {};
      latAndLng.id = rowData.id;
      geocoder.geocode(address, (err, data) => {
        timeout(2);
        console.log(data);
        if (err) {
          console.log(err);
          timeout(40);
        } else if (data.status == 'OK') {
          latAndLng.lat = data.results[0].geometry.location.lat;
          latAndLng.lng = data.results[0].geometry.location.lng;
          let writeableData = JSON.stringify(latAndLng);
          wstream.write(writeableData);
          wstream.write('\n');
        }
      }, {key: googleGeoCodingApiKey});
    });
    wstream.on('finish', () => {
      console.log('File has been written.');
    });
  });

function timeout (addToCounter) {
  addressCounter += addToCounter;
  if (addressCounter > 40) {
    addressCounter = 0;
    var waitTill = new Date(new Date().getTime() + 2000); // 1000 is 1 sec
    while (waitTill > new Date()) {}
  }
}
