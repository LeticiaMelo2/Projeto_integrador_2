import express from 'express';
import {
    incluirPaciente,
    consultarPaciente,
    alterarPaciente,
    listarPacientes
} from '../scripts_features/funcPaciente.js';
import {
    incluirAtendimento,
    consultarAtendimento,
    alterarAtendimento,
    listarAtendimentos,
    consultarHistoricoAtendimento
} from '../scripts_features/funcAtendimento.js';
import {
    incluirProntuario,
    consultarProntuario,
    alterarProntuario,
    listarProntuarios,
    consultarHistoricoProntuario
} from '../scripts_features/funcProntuario.js';
const router = express.Router();


//rotas para pacientes
router.post('/pacientes', async (req, res) => {
    const paciente = await incluirPaciente(req.body);

    if (!paciente) {
        return res.status(404).json({ mensagem: 'Paciente não encontrado.'});
    }

    res.json(paciente);
});

router.get('/pacientes/:id', async (req, res) => {
    /*Consultar paciente*/
    const paciente = await consultarPaciente(req.params.id);

    if (!paciente) {
        return res.status(404).json({ mensagem: 'Paciente não encontrado.'});
    }

    res.json(paciente);
});

router.patch('/pacientes/:id', async (req, res) => {
    /*Alterar paciente*/
    const paciente = await alterarPaciente(req.params.id, req.body);

    if (!paciente) {
        return res.status(404).json({ mensagem: 'Paciente não encontrado.'});
    }

    res.json(paciente);
});

router.get('/pacientes', async (req, res) => {
    /*Listar pacientes*/
    const pacientes = await listarPacientes();
    res.json(pacientes);
});

//-------------------------------------------------

//rotas para atendimentos
router.post('/atendimentos', async (req, res) => {
    /*Abrir atendimento*/
    const atendimento = await incluirAtendimento(req.body);
    res.json(atendimento);
});

router.get('/atendimentos/:id', async (req, res) => {
    /*Consultar atendimento*/
    const atendimento = await consultarAtendimento(req.params.id);

    if (!atendimento) {
        return res.status(404).json({ mensagem: 'Atendimento não encontrado.'});
    }

    res.json(atendimento);
});

router.patch('/atendimentos/:id', async (req, res) => {
    /*Alterar atendimento*/
    const atendimento = await alterarAtendimento(req.params.id, req.body);

    if (!atendimento) {
        return res.status(404).json({ mensagem: 'Atendimento não encontrado.'});
    }

    res.json(atendimento);
});

router.get('/atendimentos', async (req, res) => {
    /*Listar atendimentos*/
    const atendimentos = await listarAtendimentos();
    res.json(atendimentos);
});

router.get('/atendimentos/:id/historico', async (req, res) => {
    /*Histórico do atendimento*/
    const historico = await consultarHistoricoAtendimento(req.params.id);
    res.json(historico);
});

router.post('/atendimentos/:id/prontuarios', async (req, res) => {
    /*Criar prontuário*/
    const prontuario = await incluirProntuario(req.params.id, req.body);
    res.json(prontuario);
});

//-------------------------------------------------

//rotas para prontuários
router.get('/prontuarios/:id', async (req, res) => {
    /*Consultar prontuário*/
    const prontuario = await consultarProntuario(req.params.id);
    res.json(prontuario);
});

router.patch('/prontuarios/:id', async (req, res) => {
    /*Alterar prontuário*/
    const prontuario = await alterarProntuario(req.params.id, req.body);
    res.json(prontuario);
});

router.get('/prontuarios', async (req, res) => {
    /*Listar prontuários*/
    const prontuarios = await listarProntuarios();
    res.json(prontuarios);
});

router.get('/prontuarios/:id/historico', async (req, res) => {
    /*Histórico do prontuário*/
    const historico = await consultarHistoricoProntuario(req.params.id);
    res.json(historico);
});

router.get('/teste', (req, res) => {
    res.status(200).json({ mensagem: 'Rotas funcionando!' });
});


export default router;

