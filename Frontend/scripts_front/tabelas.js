//======================================
// buscar pacientes (aguardando triagem)
//======================================

app.get('/api/pacientes/situacao/1', async (req, res) => {
    let conexao;

    try {
        conexao = await conectar();

        //cnsulta SQL com JOIN para buscar pacientes com atendimento ativo na situação 1
        const sql = `
            SELECT 
                a.id AS numero_atendimento,
                p.nome AS paciente_nome
            FROM atendimento a
            INNER JOIN pacientes p ON a.paciente_id = p.id
            WHERE a.situacao_id = 1
            ORDER BY a.id ASC
        `;

        const [pacientesEmEspera] = await conexao.query(sql);

        //retorna a lista de pacientes em formato JSON
        return res.json(pacientesEmEspera);

    } catch (erro) {
        console.error('Erro ao buscar pacientes:', erro);
        return res.status(500).json({ 
            erro: 'Erro interno ao carregar a lista de pacientes.',
            detalhe: erro.message 
        });
    } finally {
        if (conexao) {
            await conexao.end();
        }
    }
});