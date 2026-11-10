import 'dotenv/config';
import app from "./app.js";

const porta = Number(process.env.PORT) || 3001;

app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}. Acesse: http://localhost:${porta}/src/cadastro.html`);
});


