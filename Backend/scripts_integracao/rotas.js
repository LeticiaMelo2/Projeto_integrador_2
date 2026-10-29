import express from 'express';
const router = express.Router();

router.post('/pacientes', (req, res) => {/*Cadastrar paciente*/});
router.get('/pacientes/:id', (req, res) => {/*Consultar paciente*/});
router.patch('/pacientes/:id', (req, res) => {/*Alterar paciente*/});
router.get('/pacientes', (req, res) => {/*Listar pacientes*/});

router.post('/atendimentos', (req, res) => {/*Abrir atendimento*/});
router.get('/atendimentos/:id', (req, res) => {/*Consultar atendimento*/});
router.patch('/atendimentos/:id', (req, res) => {/*Alterar atendimento*/});
router.get('/atendimentos', (req, res) => {/*Listar atendimentos*/});
router.get('/atendimentos/:id/historico', (req, res) => {/*Histórico do atendimento*/});
router.post('/atendimentos/:id/prontuarios', (req, res) => {/*Criar prontuário*/});

router.get('/prontuarios/:id', (req, res) => {/*Consultar prontuário*/});
router.patch('/prontuarios/:id', (req, res) => {/*Alterar prontuário*/});
router.get('/prontuarios', (req, res) => {/*Listar prontuários*/});
router.get('/prontuarios/:id/historico', (req, res) => {/*Histórico do prontuário*/});


router.get('/teste', (req, res) => {
    res.status(200).json({ mensagem: 'Rotas funcionando!' });
});


export default router;

