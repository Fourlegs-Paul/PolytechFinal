const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const port = Number(process.env.PORT || 4173);
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};

const server = http.createServer((req,res)=>{
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const target = clean === '/' ? '/index.html' : clean;
  const file = path.normalize(path.join(root, target));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(file,(err,stat)=>{
    if(err || !stat.isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Not found');}
    res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(port,'127.0.0.1',()=>{
  const url=`http://localhost:${port}`;
  console.log(`\nPolytechFinal running at ${url}`);
  if(process.argv.includes('--open')){
    const cmd=process.platform==='win32'?'cmd':process.platform==='darwin'?'open':'xdg-open';
    const args=process.platform==='win32'?['/c','start','',url]:[url];
    const child=spawn(cmd,args,{detached:true,stdio:'ignore'});child.unref();
  }
});
