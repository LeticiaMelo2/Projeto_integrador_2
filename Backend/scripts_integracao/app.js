import express from 'express';
import router from './rotas.js';

const app = express();

app.use(express.json());
app.use(express.static('Frontend'));
app.use(router);

app.use((req, res) => {
    res.status(404).json({
        erro: {
            codigo: 'ROTA_NAO_ENCONTRADA',
            mensagem: 'Rota não encontrada.'
        }
    });
});

app.use((erro, req, res, next) => {
    console.error('Falha na operação:', erro.message);

    res.status(500).json({
        erro: {
            codigo: 'ERRO_INTERNO',
            mensagem: 'Não foi possível concluir a operação.'
        }
    });
});

export default app;