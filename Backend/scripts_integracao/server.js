// incialzação HTTP


import http from "http";

//criação de um servidor


//função auto
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

  res.write('<h1>Servidor Node,js Ativo!</h1>');
  res.end();



}).listen(3000, () =>{
  console.log('Servidor rodando na porta 300-. Acesse: https://localhost:3000');
  
});