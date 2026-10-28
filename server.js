import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
http.createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(target,(err,data)=>{if(err){res.writeHead(404).end('Not found');return}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.md':'text/plain','.svg':'image/svg+xml'})[path.extname(target)]||'application/octet-stream');res.end(data)})}).listen(4173,'127.0.0.1',()=>console.log('Traffic Lab: http://127.0.0.1:4173'));
