// const fs = require('fs');
// const csvjson = require('csvjson')
// var dataRead = fs.readFileSync('data.csv', { encoding : 'utf8'});
// var dataWrite = fs.createWriteStream('data.csv', { 'flags' : 'a'});
//
// var id = csvjson.toColumnArray(dataRead).ID;
// var lastid = parseInt(id[id.length-1]);
// var nextid =  lastid + 1;
//
// for (i=nextid;i<lastid+10;i++) {
//   nextdata = i + ', test2\r\n';
//   dataWrite.write(nextdata)
// }
//
// console.log(nextid)
const varToString = varObj => Object.keys(varObj)[0];


chart3 = "test";
chart_name = varToString({ chart3 })
var numb = chart_name.match(/\d/g);
numb = parseInt(numb.join(""));
console.log(numb)
