//registra os endpoints

const rotas = {
    "POST /pacientes":{} /*Cadastrar paciente*/,
    "GET /pacientes/:id":{} /*Consultar paciente*/,
    "PATCH /pacientes/:id":{} /*Alterar paciente*/,
    "GET /pacientes":{} /*Listar pacientes*/,

    "POST /atendimentos":{} /*Abrir atendimento*/,
    "GET /atendimentos/:id":{} /*Consultar atendimento*/,
    "PATCH /atendimentos/:id":{} /*Alterar atendimento*/,
    "GET /atendimentos":{} /*Listar atendimentos*/,
    "GET /atendimentos/:id/historico":{} /*Histórico do atendimento*/,
    "POST /atendimentos/:id/prontuarios":{} /*Criar prontuário*/,

    "GET /prontuarios/:id":{} /*Consultar prontuário*/,
    "PATCH /prontuarios/:id":{} /*Alterar prontuário*/,
    "GET /prontuarios":{} /*Listar prontuários*/,
    "GET /prontuarios/:id/historico":{} /*Histórico do prontuário*/,
};