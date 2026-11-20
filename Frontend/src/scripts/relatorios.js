let filtrosRelatorio;

async function carregarRelatorio() {
    const parametros = new URLSearchParams();
    Object.entries(filtrosRelatorio()).forEach(([chave, valor]) => {
        if (valor) parametros.append(chave, valor);
    });

    try {
        const response = await fetch(`http://localhost:3000/api/relatorios?${parametros}`);
        if (!response.ok) throw new Error('Erro ao buscar relatório.');
        const dados = await response.json();

        document.getElementById('totalPacientes').textContent = dados.resumo.quantidade_pacientes;
        document.getElementById('totalAtendimentos').textContent = dados.resumo.quantidade_atendimentos;
        renderizarContadores('listaSituacoes', dados.por_situacao);
        renderizarContadores('listaTipos', dados.por_tipo_atendimento);
        renderizarContadores('listaPrioridades', dados.por_prioridade);
    } catch (erro) {
        console.error('Erro ao carregar relatório:', erro);
        document.querySelectorAll('.lista-contadores').forEach(lista => lista.innerHTML = '<p class="texto-perigo">Erro ao carregar os dados.</p>');
    }
}

function renderizarContadores(id, itens) {
    document.getElementById(id).innerHTML = itens.length
        ? itens.map(item => `<div class="linha-contador"><span>${item.nome}</span><strong>${item.quantidade}</strong></div>`).join('')
        : '<p class="texto-suave">Nenhum registro encontrado.</p>';
}

async function carregarFiltros() {
    const resposta = await fetch('http://localhost:3000/api/relatorios/filtros');
    if (!resposta.ok) return;
    const dados = await resposta.json();
    dados.situacoes.forEach(item => document.getElementById('filtroStatus').insertAdjacentHTML('beforeend', `<option value="${item.id}">${item.nome}</option>`));
    dados.medicos.forEach(item => document.getElementById('filtroMedico').insertAdjacentHTML('beforeend', `<option value="${item.id}">${item.nome}</option>`));
}

document.addEventListener('DOMContentLoaded', () => {
    filtrosRelatorio = () => ({ status: filtroStatus.value, medico: filtroMedico.value, prioridade: filtroPrioridade.value, data: filtroData.value });
    document.querySelectorAll('.filtros_painel select, .filtros_painel input').forEach(filtro => filtro.addEventListener('change', carregarRelatorio));
    limparFiltros.addEventListener('click', () => { document.querySelectorAll('.filtros_painel select, .filtros_painel input').forEach(filtro => filtro.value = ''); carregarRelatorio(); });
    carregarFiltros().then(carregarRelatorio);
});
