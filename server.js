//index.js
const express = require('express'), app = express(), opn = require('opn');
app.use(express.static('examples'));
app.listen(3000, function () {
  console.log('http://localhost:3000');
  opn('https://docs.google.com/presentation/d/1y5cj-HFZSiaWTGs7NEpBw6qEdglzTvMkYkT0m4Ul2ts/edit?usp=sharing');  //opn('http://localhost:3000');
});