// //importação da biblioteca de módulos
// var http = require('http');
// var fs = require('fs');
// var url = require('url');

import http from "http";
import fs from "fs";
import url from "url";

//criação de um servidor
//req: requisição | res: resposta
http
  .createServer(function (req, res) {
    console.log("URL acessada:", req.url);

    //fiz isso para procurar um arquivo que tenha exatamente o nome da chamada q o usuário digitar na url. E como não são arquivos em pastas, então para esse exerc funciona desse jeito
    var newUrl = req.url.replaceAll("/", "");
    console.log("URL corrigida:", newUrl);

    //essa verificação é para eliminar chamadas http que o navegador faz ao inicializar um .html, como o ícone que fica na aba do arquivo e outros
    if (req.url.includes(".html")) {
      fs.readFile(newUrl, function (err, data) {
        const dadosPaciente = req.body;

        console.log(`Recebido: ${nome} - ${email}`);

        // Resposta para o front-end
        res.json({ mensagem: "Dados recebidos com sucesso!", status: "OK" });

        if (err) {
          console.log("erro 404", err);
          console.log("erro num", err.errno);
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end("404 Not Found");

          //res.writeHead(err.errno, { 'Content-Type': 'text/html; charset=utf-8' });
          //res.end(${err.errno}, ${err.message});
        } else {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.write(data);
          res.end(`Você acessou a URL: ${req.url}`);
        }
      });
    } else {
      console.log("Error, não é um arquivo html: ", req.url);
    }
  })
  .listen(3001);
