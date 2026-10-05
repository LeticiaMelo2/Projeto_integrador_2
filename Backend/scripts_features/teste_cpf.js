const { validarCPF } = require("./func_cpf.js");

console.log("=== TESTE DE CPF ===");

const cpf = "139.996.429-12";

const resultado = validarCPF(cpf);

console.log("Resultado:", resultado);