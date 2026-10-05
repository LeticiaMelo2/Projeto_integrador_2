import { cadastrarPacienteRecepcao } from "./scripts_features/func_paciente.js" ;


import { cadastrarAtendimento } from "./scripts_features/func_atendimento.js" ;


import { banco } from "./banco_teste.js" ;


// ==========================================================
// 1. CADASTRAR UM PACIENTE
// ==========================================================

const paciente = cadastrarPacienteRecepcao(
    "João da Silva",
    "Maria da Silva",
    "15/08/1995",
    "12.345.678-9",
    "52998224725",
    "Brasileira",
    "Solteiro",
    "Rua das Flores, 100",
    "Centro",
    "Campinas",
    "SP",
    "13000-000",
    "(19) 99999-9999"
);


// ==========================================================
// 2. CRIAR DOIS ATENDIMENTOS PARA O MESMO PACIENTE
// ==========================================================

const atendimento1 = cadastrarAtendimento(paciente.id_paciente);


const atendimento2 = cadastrarAtendimento(paciente.id_paciente);


// ==========================================================
// 3. MOSTRAR PACIENTES
// ==========================================================

console.log("\n================ PACIENTES ================\n");

console.dir(banco.listarPacientes(), { depth: null });


// ==========================================================
// 4. MOSTRAR ATENDIMENTOS
// ==========================================================

console.log("\n================ ATENDIMENTOS ================\n");

console.dir(
    banco.listarAtendimentos(),
    { depth: null }
);


// ==========================================================
// 5. MOSTRAR RELACIONAMENTO
// ==========================================================

console.log("\n========== RELACIONAMENTO ===========\n");


console.log(`Paciente ${paciente.id_paciente} - ` + `${paciente.nome_completo}`);


const atendimentosDoPaciente = banco.buscarAtendimentosPorPaciente(paciente.id_paciente);


atendimentosDoPaciente.forEach(
    atendimento => {
        console.log(`  -> ${atendimento.num_atendimento}` +
            ` | id_atendimento: ` +
            `${atendimento.id_atendimento}` +
            ` | id_paciente: ` +
            `${atendimento.id_paciente}` +
            ` | status: ` +
            `${atendimento.status}`
        );
    }
);


console.log("\n========================================\n");