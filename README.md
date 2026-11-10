# Projeto_integrador_2

## Iniciar localmente

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e preencha `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.
3. Inicie a API e o servidor de arquivos com `npm start`.
4. Acesse `http://localhost:3001/src/cadastro.html` (ou a porta configurada em `PORT`).

O frontend e a API são servidos pela mesma origem. Não abra o HTML com `file://`. O backend depende de uma tabela `PACIENTES` cujo identificador e colunas precisam corresponder às consultas SQL em `Backend/scripts_features/funcPaciente.js`.

## Documentação

- [Fluxo de execução e contratos da API](docs/fluxo-execucao.md)
- [Plano de conclusão da API](docs/plano-conclusao-api.md)
