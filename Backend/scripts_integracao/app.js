import express from 'express';
import router from './rotas.js';

const app = express();

app.use(express.json());
app.use(router);

//tratamento de erros para padrão de todas as rotas
app.use((erro, req, res, next) => {
    console.error('Falha na operação:', erro.message);

    res.status(500).json({
        mensagem: 'Não foi possível concluir a operação.'
    });
});

export default app;