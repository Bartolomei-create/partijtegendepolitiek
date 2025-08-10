
// Minimal server for Verklaring page.
// Usage: npm init -y && npm i express body-parser fs path && node server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use('/', express.static(__dirname));

const DATA_PATH = path.join(__dirname, 'data', 'signatures.json');

function simpleHash(str){
  let h=0; for(let i=0;i<str.length;i++){ h=((h<<5)-h)+str.charCodeAt(i); h|=0; }
  return 'h'+Math.abs(h);
}

app.post('/api/sign', (req,res) => {
  const name = (req.body && req.body.name || '').trim();
  if(!name) return res.status(400).json({error:'name_required'});
  const now = Date.now();
  let db = {signatures:[]};
  try{ db = JSON.parse(fs.readFileSync(DATA_PATH,'utf8')); } catch(e){}
  const hash = simpleHash(name + '|' + new Date(now).toDateString());
  if(!db.signatures) db.signatures = [];
  if(db.signatures.find(s => s.hash===hash)){
    return res.json({ok:true, duplicate:true});
  }
  db.signatures.push({name, ts: now, hash});
  fs.writeFileSync(DATA_PATH, JSON.stringify(db,null,2));
  res.json({ok:true});
});

app.listen(PORT, () => console.log('Verklaring server running on http://localhost:'+PORT));
