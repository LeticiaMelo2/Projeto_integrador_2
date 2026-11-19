async function carregarFilaAtendimento() {
    const tbody = document.getElementById('tabelaFila');

    try {
        const response = await fetch('http://localhost:3000/api/atendimentos/aguardando');
        
        if (!response.ok) {
            throw new Error('Erro ao buscar pacientes do servidor.');
        }

        const lista = await response.json();
        tbody.innerHTML = '';

        if (lista.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="texto-centralizado texto-suave py-4">
                        Nenhum paciente aguardando atendimento no momento.
                    </td>
                </tr>
            `;
            return;
        }

        lista.forEach(paciente => {
    let horaChegada = '--:--';
    if (paciente.chegada) {
        const data = new Date(paciente.chegada);
        horaChegada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    const risco = (paciente.classificacao_risco || '').toLowerCase();
    let classeCor = 'badge-azul';
    let textoEtiqueta = 'Não Urgente';

    if (risco.includes('vermelho')) {
        classeCor = 'badge-vermelho';
        textoEtiqueta = 'Emergência';
    } else if (risco.includes('laranja')) {
        classeCor = 'badge-laranja';
        textoEtiqueta = 'Muito Urgente';
    } else if (risco.includes('amarelo')) {
        classeCor = 'badge-amarelo';
        textoEtiqueta = 'Urgente';
    } else if (risco.includes('verde')) {
        classeCor = 'badge-verde';
        textoEtiqueta = 'Pouco Urgente';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><strong>#${paciente.id_atendimento}</strong></td>
        <td>${paciente.nome_paciente}</td>
        <td><span class="badge-manchester ${classeCor}">${textoEtiqueta}</span></td>
        <td>${horaChegada}</td>
        <td class="texto-centralizado">
            <button type="button" class="botao-chamar-tabela">
                <i class="fa-solid fa-user-check"></i> Chamar
            </button>
        </td>
    `;

    tbody.appendChild(tr);
});

    } catch (erro) {
        console.error('Erro ao carregar fila:', erro);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="texto-centralizado texto-perigo py-4">
                    Erro ao carregar fila de atendimento.
                </td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', carregarFilaAtendimento);

let filaPacientes = [];

async function carregarFilaAtendimento() {
    const tbody = document.getElementById('tabelaFila');

    try {
        const response = await fetch('http://localhost:3000/api/atendimentos/aguardando');
        
        if (!response.ok) {
            throw new Error('Erro ao buscar pacientes do servidor.');
        }

        filaPacientes = await response.json();
        tbody.innerHTML = '';

        if (filaPacientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="texto-centralizado texto-suave py-4">
                        Nenhum paciente aguardando atendimento no momento.
                    </td>
                </tr>
            `;
            return;
        }

        filaPacientes.forEach(paciente => {
            let horaChegada = '--:--';
            if (paciente.chegada) {
                const data = new Date(paciente.chegada);
                horaChegada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }

            const risco = (paciente.classificacao_risco || '').toLowerCase();
            let classeCor = 'badge-azul';
            let textoEtiqueta = 'Não Urgente';

            if (risco.includes('vermelho')) {
                classeCor = 'badge-vermelho';
                textoEtiqueta = 'Emergência';
            } else if (risco.includes('laranja')) {
                classeCor = 'badge-laranja';
                textoEtiqueta = 'Muito Urgente';
            } else if (risco.includes('amarelo')) {
                classeCor = 'badge-amarelo';
                textoEtiqueta = 'Urgente';
            } else if (risco.includes('verde')) {
                classeCor = 'badge-verde';
                textoEtiqueta = 'Pouco Urgente';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${paciente.id_atendimento}</strong></td>
                <td>${paciente.nome_paciente}</td>
                <td><span class="badge-manchester ${classeCor}">${textoEtiqueta}</span></td>
                <td>${horaChegada}</td>
                <td class="texto-centralizado">
                    <button type="button" class="botao-chamar-tabela" onclick="chamarPaciente(${paciente.id_atendimento})">
                        <i class="fa-solid fa-user-check"></i> Chamar
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error('Erro ao carregar fila:', erro);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="texto-centralizado texto-perigo py-4">
                    Erro ao carregar fila de atendimento.
                </td>
            </tr>
        `;
    }
}

async function chamarPaciente(idAtendimento) {
    try {
        // Já busca os detalhes E muda o status para "Em Atendimento" no banco
        const response = await fetch(`http://localhost:3000/api/atendimentos/${idAtendimento}`);
        if (!response.ok) throw new Error('Erro ao buscar dados do paciente.');

        const paciente = await response.json();

        // Calcula idade
        let idadeTexto = 'Idade não informada';
        if (paciente.data_nascimento) {
            const nascimento = new Date(paciente.data_nascimento);
            const hoje = new Date();
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                idade--;
            }
            idadeTexto = `${idade} anos`;
        }

        // Preenche os campos da parte 2 (#secaoAtendimento)
        document.getElementById('atendimentoId').value = paciente.id_atendimento;
        document.getElementById('pNumAtendimento').textContent = `#${paciente.id_atendimento}`;
        document.getElementById('pNome').textContent = paciente.nome_paciente;
        document.getElementById('pIdade').textContent = idadeTexto;
        document.getElementById('pAlergia').textContent = (paciente.alergias && paciente.alergias.trim() !== '') ? paciente.alergias : 'Nenhuma';

        document.getElementById('pSinais').textContent = `PA: ${paciente.pressao_arterial} | Temp: ${paciente.temp_corporal}°C | BPM: ${paciente.batimentos_cardiacos}`;
        document.getElementById('pQueixas').textContent = paciente.principais_queixas || 'Nenhuma queixa registrada';

        // Abre a seção da parte 2
        const secao = document.getElementById('secaoAtendimento');
        secao.classList.remove('oculto');
        secao.scrollIntoView({ behavior: 'smooth' });

        // Atualiza a tabela da fila de espera lá em cima (o paciente sai da fila)
        carregarFilaAtendimento();

    } catch (erro) {
        console.error('Erro ao chamar paciente:', erro);
        alert('Não foi possível iniciar o atendimento deste paciente.');
    }
}

async function finalizarAtendimento(event) {
    event.preventDefault(); // Evita que a página recarregue sozinha

    const atendimentoId = document.getElementById('atendimentoId').value;
    const diagnostico = document.getElementById('diagnostico').value;
    const prescricao = document.getElementById('prescricao').value;
    const observacoes = document.getElementById('observacoes').value;

    if (!atendimentoId) {
        alert('Nenhum paciente selecionado para atendimento.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/atendimentos/${atendimentoId}/finalizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                diagnostico,
                prescricao,
                observacoes
            })
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.erro || 'Erro ao finalizar atendimento.');
        }

        // Mensagem final de paciente atendido
        alert('Paciente atendido com sucesso!');

        // Limpa o formulário, esconde a parte 2 e atualiza a fila lá em cima
        event.target.reset();
        document.getElementById('atendimentoId').value = '';
        document.getElementById('secaoAtendimento').classList.add('oculto');
        carregarFilaAtendimento();

    } catch (erro) {
        console.error('Erro ao finalizar consulta:', erro);
        alert('Não foi possível finalizar o atendimento.');
    }
}

// Liga o envio do formulário à função (troque 'formAtendimento' pelo ID do seu <form>)
document.addEventListener('DOMContentLoaded', () => {
    carregarFilaAtendimento();

    const formAtendimento = document.getElementById('formAtendimento');
    if (formAtendimento) {
        formAtendimento.addEventListener('submit', finalizarAtendimento);
    }
});