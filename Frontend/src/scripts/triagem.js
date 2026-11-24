async function carregarPacienteNaTriagem() {
    //pega o número do atendimento que veio na URL 
    const params = new URLSearchParams(window.location.search);
    const numeroAtendimento = params.get('atendimento');

    //se alguém abrir triagem.html direto sem clicar em "Atender" no painel
    if (!numeroAtendimento) {
        alert('Nenhum paciente selecionado. Voltando para o Painel de Triagem...');
        window.location.href = 'painel_triagem.html';
        return;
    }

    try {
        //busca os dados completos do atendimento e do paciente no backend
        const response = await fetch(`http://localhost:3000/api/pacientes/${numeroAtendimento}`);
        
        if (!response.ok) {
            throw new Error('Atendimento não encontrado no banco de dados.');
        }

        const paciente = await response.json();

        //calcula a idade a partir da data_nascimento
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


        //pega a hora atual da chamada (ex: 16:20)
        const agora = new Date();
        const horaChamada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        //preenche os IDs exatos do seu triagem.html
        document.getElementById('paciente-badge-id').textContent = `#${paciente.numero_atendimento}`;
        document.getElementById('paciente-nome').textContent = paciente.nome;
        document.getElementById('paciente-detalhes').textContent = `${idadeTexto} • ${paciente.sexo || 'Sexo não informado'} • CPF: ${paciente.cpf || '-'}`;
        document.getElementById('paciente-hora').textContent = horaChamada;
    

        //pinta a etiqueta de alergia de verde (sem alergia) ou vermelho (com alergia)
        const elAlergias = document.getElementById('paciente-alergias');
        if (paciente.alergias && paciente.alergias.trim() !== '') {
            elAlergias.textContent = paciente.alergias;
            elAlergias.className = 'etiqueta etiqueta-alergia';
        } else {
            elAlergias.textContent = 'Nenhuma';
            elAlergias.className = 'etiqueta etiqueta-segura';
        }

        // Guarda o número do atendimento na memória para usar quando clicar em "Finalizar Triagem"
        window.atendimentoAtual = paciente.numero_atendimento;

    } catch (erro) {
        console.error('Erro ao carregar dados do paciente na triagem:', erro);
        alert('Erro ao carregar as informações do paciente.');
    }
}

// Executa automaticamente assim que a tela de triagem abre
document.addEventListener('DOMContentLoaded', () => {
    carregarPacienteNaTriagem();
});

let classificacaoSelecionada = null;

function selecionarNivel(cor, descricao, tempo) {
    classificacaoSelecionada = { cor, descricao, tempo };

    //remove a borda ativo de todos os botões antes de marcar o novo
    document.querySelectorAll('.btn-manchester').forEach(btn => btn.classList.remove('ativo'));
    //adiciona a classe ativo apenas no botão da cor que foi clicada
    const btnClicado = document.querySelector(`.btn-manchester.${cor}`);
    if (btnClicado) btnClicado.classList.add('ativo');

    //mostra o painel colorido de confirmação
    const painel = document.getElementById('painelConfirmacao');
    const texto = document.getElementById('textoClassificacao');
    const badgeTempo = document.getElementById('tempoAtendimento');

    //aplica a cor correspondente ao painel e torna ele visível na tela
    painel.className = `painel-confirmacao selecionado-${cor}`;
    painel.style.display = 'flex';
    texto.textContent = `Prioridade: ${descricao} (${cor.toUpperCase()})`;
    badgeTempo.textContent = tempo;
}

//botão limpar
function resetar() {
    //esvazia a variável global para o sistema esquecer a cor anterior
    classificacaoSelecionada = null;
    document.querySelectorAll('.btn-manchester').forEach(btn => btn.classList.remove('ativo'));

    //esconde qualquer mensagem
    const painel = document.getElementById('painelConfirmacao');
    if (painel) painel.style.display = 'none';

    const alerta = document.getElementById('alertaForm');
    if (alerta) alerta.style.display = 'none';
}

//envia para o banco de dados
document.getElementById('formTriagem').addEventListener('submit', async function (event) {
    //impede o navegador de dar F5 sozinho ao enviar o formulário HTML
    event.preventDefault();

    const alerta = document.getElementById('alertaForm');

    //se nenhuma cor foi clicada, mostra aviso vermelho e interrompe o envio
    if (!classificacaoSelecionada) {
        alerta.textContent = 'Selecione uma classificação de risco antes de finalizar.';
        alerta.className = 'alerta-form erro';
        alerta.style.display = 'block';
        return;
    }

    //o Array.from transforma essa lista do navegador em um Array real do JavaScript
    const queixasMarcadas = Array.from(document.querySelectorAll('.queixa-check:checked'))
        //passa por cada checkbox marcado (cb) e extrai apenas o texto do seu value
        .map(cb => cb.value)
        //junta todos os textos extraídos em uma única frase separada por vírgula
        .join(', ');

    //monta o objeto JSON com os nomes exatos das colunas da tabela TRIAGENS
    const dadosTriagem = {
        //pega o ID do atendimento salvo lá no início quando a página carregou
        id_atendimento: window.atendimentoAtual,
        classificacao_risco: `${classificacaoSelecionada.descricao} (${classificacaoSelecionada.cor})`,
        principais_queixas: queixasMarcadas || null,
        //value.trim = pega o que foi digitado no input e remove espaços sobrando no começo ou no fim.
        pressao_arterial: document.getElementById('pa').value.trim(),
        //parseFloat= converte o texto da temperaturaem número decimal 
        temp_corporal: parseFloat(document.getElementById('temp').value),
        //parseInt = converte o texto dos batimentos em número inteiro 
        batimentos_cardiacos: parseInt(document.getElementById('bpm').value, 10),
        observacoes: document.getElementById('obs').value.trim() || null
    };

    try {
        const response = await fetch('http://localhost:3000/api/triagens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, //avisa o Express que o conteúdo enviado está no formato JSON.
            body: JSON.stringify(dadosTriagem) //converte o objeto JavaScript em texto JSON puro para poder trafegar na rede
        });

        //lê a resposta devolvida pelo servido
        const data = await response.json();

        if (response.ok) {
            alert(data.mensagem);
            window.location.href = 'painel_triagem.html';
        } else {
            alerta.textContent = data.erro || 'Erro ao salvar triagem.';
            alerta.className = 'alerta-form erro';
            alerta.style.display = 'block';
        }
    } catch (erro) {
        console.error('Erro ao enviar triagem:', erro);
        alert('Erro de conexão com o servidor.');
    }
});