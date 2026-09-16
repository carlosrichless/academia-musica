// --- SISTEMA CENTRALIZADO DE SENHAS E RASTREIO DA ACADEMIA ---

// 1. Senhas Principais (Você muda aqui e vale para o mundo todo na mesma hora)
const CONFIG_SENHAS = {
    geral: "1",               // Senha geral do site
    admin: "admin123"         // Senha do painel administrativo
};

// 2. Alunos VIP e seus módulos permitidos
const ALUNOS_VIP = [
    { usuario: "Padrão Bateria", senha: "bateria123", modulo: "Modulos Bateria" },
    { usuario: "Padrão Violão", senha: "violao123", modulo: "Modulos Violao" },
    { usuario: "rrr", senha: "1", modulo: "Modulos Bateria" } // O aluno que você criou
];

// 3. Sistema de Rastreio (Salva quem entrou, que horas e de qual aparelho)
function registrarAcesso(usuarioLogado) {
    let historicoAcessos = JSON.parse(localStorage.getItem("log_acessos_academia")) || [];
    
    const novoAcesso = {
        usuario: usuarioLogado,
        dataHora: new Date().toLocaleString("pt-BR"),
        dispositivo: navigator.userAgent // Identifica o tipo de navegador/aparelho
    };

    historicoAcessos.unshift(novoAcesso); // Coloca o mais recente no topo
    
    // Mantém apenas os últimos 50 registros para não pesar
    if (historicoAcessos.length > 50) {
        historicoAcessos.pop();
    }

    localStorage.setItem("log_acessos_academia", JSON.stringify(historicoAcessos));
}

// 4. Função para você visualizar o relatório de quem entrou (pode abrir no console ou painel)
function verRelatorioAcessos() {
    let historicoAcessos = JSON.parse(localStorage.getItem("log_acessos_academia")) || [];
    console.table(historicoAcessos);
    return historicoAcessos;
}