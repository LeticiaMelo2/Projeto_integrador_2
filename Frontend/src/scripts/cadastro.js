//exibição do campo de Convênio Médico
function verificarAtendimento() {
    const tipoAtendimento = document.getElementById('atendimento').value;
    const grupoConvenio = document.getElementById('grupo-convenio');

    if (tipoAtendimento === 1) {
        //torna o campo de convênio visível na tela
        grupoConvenio.style.display = 'block';
    } else {
        //esconde o campo de convênio da tela
        grupoConvenio.style.display = 'none';
        document.getElementById('plano').value = '';
    }
}

//avançar para a Etapa 2
function proximaEtapa() {
    const form1 = document.getElementById('form1');
    //procura dentro da etapa 1 os campos que têm o atributo 'required'
    const inputsObrigatorios = form1.querySelectorAll('input[required], select[required]');
    
    //assume que tds os campos estão válidos
    let camposValidos = true;

    //percorre cada um dos campos obrigatórios encontrados
    inputsObrigatorios.forEach(input => {
        // caso algum campo 'required' esteja vazio
        if (!input.checkValidity()) {
            //dispara o alerta visual do navegador informando o erro
            input.reportValidity();
            camposValidos = false;
            return;
        }
    });

    //se a validação encontrar qualquer erro (camposValidos = false), interrompe e sai da função imediatamente
    if (!camposValidos) return;

    //alterna a exibição dos formulários
    document.getElementById('form1').style.display = 'none';
    document.getElementById('form2').style.display = 'block';

    //atualiza os indicadores visuais das etapas 1->2
    document.getElementById('step-1-indicator').classList.remove('etapa-ativa');
    document.getElementById('step-2-indicator').classList.add('etapa-ativa');
}

//voltar para a etapa 1
function etapaAnterior() {
    //alterna a exibição dos formulários
    document.getElementById('form2').style.display = 'none';
    document.getElementById('form1').style.display = 'block';

    //atualiza os indicadores visuais das etapas 2->1
    document.getElementById('step-2-indicator').classList.remove('etapa-ativa');
    document.getElementById('step-1-indicator').classList.add('etapa-ativa');
}

//enviar formulário para o back
document.getElementById('formCadastro').addEventListener('submit', async function(event) {
    event.preventDefault(); //trava o recarregamento automático da página

    const pacienteData = {
        nome: document.getElementById('name').value,
        data_nascimento: document.getElementById('dataNascimento').value,
        rg: document.getElementById('rg').value,
        cpf: document.getElementById('cpf').value,
        nome_mae: document.getElementById('nome-mae').value,
        nome_pai: document.getElementById('nome-pai').value || null,
        sexo: document.getElementById('sexo').value,
        cep: document.getElementById('CEP').value,
        logradouro: document.getElementById('Logradouro').value,
        numero: document.getElementById('numero').value,
        bairro: document.getElementById('Bairro').value,
        cidade: document.getElementById('cidade').value,
        uf: document.getElementById('uf').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value || null,
        tipo_atendimento_id: document.getElementById('atendimento').value,
        convenio: document.getElementById('plano').value || null
    };

    try {
        //envia os dados para a API
        const response = await fetch('http://localhost:3000/api/pacientes/cadastrar', {
            method: 'POST',
            //avisa o servidor Express de que o formato do conteúdo enviado no corpo da mensagem é texto JSON
            headers: {
                'Content-Type': 'application/json'
            },
            //converte o objeto JavaScript em texto JSON 
            body: JSON.stringify(pacienteData)
        });

        //pega o texto JSON retornado pelo servidor e converte de volta num objeto JavaScript
        const data = await response.json();

        //verifica se a resposta do servidor indica sucesso ou não
        if (response.ok) {
            alert(`Paciente registado com sucesso!\nNúmero de Atendimento: #${data.numero_atendimento}`);
            document.getElementById('formCadastro').reset();
            carregarPacientesSituacao1(); // Atualiza a tabela na hora após cadastrar
        } else {
            alert(`Erro ao registar: ${data.mensagem || 'Verifique os dados informados.'}`);
        }
    } catch (error) {
        //trata erro no back 
        console.error('Erro na requisição:', error);
        alert('Não foi possível conectar ao servidor. Verifique se o backend está a rodar.');
    }
});

async function carregarPacientesSituacao1() {
    const tbody = document.getElementById('tabelaPacientesBody');

    try {
        //envia uma requisição HTTP GET ao servidor
        const response = await fetch('http://localhost:3000/api/pacientes/situacao/1');
        
        // verifica se o servidor respondeu com status de erro
        if (!response.ok) {
            throw new Error('Falha ao buscar pacientes.');
        }

        //converte os dados em texto JSON para um array JavaScript
        const pacientes = await response.json();

        //se a lista estiver vazia
        if (pacientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #777;">
                        Nenhum paciente aguardando triagem no momento.
                    </td>
                </tr>
            `;
            return;
        }

        //percorre cada objeto paciente do array retornado e o transforma em uma string HTML
        tbody.innerHTML = pacientes.map(paciente => `
            <tr>
                <td><strong>#${paciente.numero_atendimento}</strong></td>
                <td>${paciente.paciente_nome}</td>
                <td><span class="badge badge-warning">Aguardando Triagem</span></td>
                <td>
                    <button class="botao-icone" title="Editar" onclick="editarPaciente(${paciente.numero_atendimento})">
                        <i class="bx bx-edit-alt"></i>
                    </button>
                    <button class="botao-icone" title="Ver Detalhes" onclick="verDetalhes(${paciente.numero_atendimento})">
                        <i class="bx bx-show"></i>
                    </button>
                    <button class="botao-icone" title="Cancelar" onclick="cancelarAtendimento(${paciente.numero_atendimento})">
                        <i class="bx bx-x"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (erro) {
        console.error('Erro ao preencher tabela:', erro);
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: red;">
                    Erro ao carregar a lista de pacientes.
                </td>
            </tr>
        `;
    }
}

//editar paciente
async function editarPaciente(numeroAtendimento) {
    try {
        const response = await fetch(`http://localhost:3000/api/pacientes/${numeroAtendimento}`);
        if (!response.ok) throw new Error('Erro ao carregar dados para edição.');

        //converte o texto JSON enviado pelo backend em um objeto JavaScript
        const paciente = await response.json();

        //preenche automaticamente os campos do seu formulário da Etapa 1
        document.getElementById('name').value = paciente.nome || '';
        // Formata a data do MySQL 
        if (paciente.data_nascimento) {
            document.getElementById('dataNascimento').value = paciente.data_nascimento.split('T')[0];
        } else {
            document.getElementById('dataNascimento').value = '';
        }
        document.getElementById('cpf').value = paciente.cpf || '';
        document.getElementById('rg').value = paciente.rg || '';
        document.getElementById('nome-mae').value = paciente.nome_mae || '';
        document.getElementById('nome-pai').value = paciente.nome_pai || '';
        document.getElementById('sexo').value = paciente.sexo || '';
        
        //preenche os campos da Etapa 2
        document.getElementById('CEP').value = paciente.cep || '';
        document.getElementById('Logradouro').value = paciente.logradouro || '';
        document.getElementById('numero').value = paciente.numero || '';
        document.getElementById('Bairro').value = paciente.bairro || '';
        document.getElementById('cidade').value = paciente.cidade || '';
        document.getElementById('uf').value = paciente.uf || '';
        document.getElementById('telefone').value = paciente.telefone || '';
        document.getElementById('email').value = paciente.email || '';

        //cria uma variável global no navegador guardando o número do atendimento que está sendo alterado
        window.atendimentoEmEdicao = numeroAtendimento;
        alert(`Dados de ${paciente.nome} carregados no formulário para edição!`);
    } catch (erro) {
        console.error(erro);
        alert('Erro ao carregar dados para edição.');
    }
}

//ver detalhes
async function verDetalhes(numeroAtendimento) {
    try {
        const response = await fetch(`http://localhost:3000/api/pacientes/${numeroAtendimento}`);
        if (!response.ok) throw new Error('Erro ao buscar detalhes do paciente.');
        
        const paciente = await response.json();
        alert(
            `Atendimento: #${paciente.numero_atendimento}\n` +
            `Nome: ${paciente.nome}\n` +
            `CPF: ${paciente.cpf}\n` +
            `Telefone: ${paciente.telefone || 'Não informado'}\n` +
            `Alergias: ${paciente.alergias || 'Nenhuma'}`
        );
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível carregar os detalhes do paciente.');
    }
}

//cancelar atendimento
async function cancelarAtendimento(numeroAtendimento) {
    const confirmar = confirm(`Deseja realmente cancelar o atendimento #${numeroAtendimento}?`);
    if (!confirmar) return;

    try {
        const response = await fetch(`http://localhost:3000/api/pacientes/${numeroAtendimento}/cancelar`, {
            // usa o método PATCH porque estamos alterando apenas um campo específico (situacao_id) e não o registro inteiro
            method: 'PATCH',
            //informa ao servidor Express que a comunicação segue o padrão JSON
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Falha ao cancelar atendimento.');

        alert('Atendimento cancelado com sucesso!');
        carregarPacientesSituacao1(); // Recarrega a tabela na hora
    } catch (erro) {
        console.error('Erro ao cancelar:', erro);
        alert('Não foi possível cancelar o atendimento.');
    }
}

// Dispara o carregamento da tabela assim que a página abre
document.addEventListener('DOMContentLoaded', () => {
    carregarPacientesSituacao1();
});



