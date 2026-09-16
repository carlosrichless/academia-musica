// config-senhas.js - Central de Configurações e Senhas do Projeto Academia de Música

const CONFIG_SISTEMA = {
    // Senhas Principais
    senhaSiteGeral: "123456",
    senhaAdminSistema: "admin123",

    // Senhas VIP de Alunos (Módulos de Bateria e Violão)
    senhasVip: [
        { nome: "Padrão Bateria", senha: "bateria123", modulo: "bateria" },
        { nome: "Padrão Violão", senha: "violao123", modulo: "violao" }
    ],

    // Caminhos de Mídias / Lembretes
    midias: {
        imagem: "assets/foto.jpg",
        audio: "assets/audio.mp3",
        video: "assets/video.mp4"
    },

    // Mural de Avisos
    mural: {
        tempoDuracao: 4, // em segundos
        avisos: [
            { titulo: "🎵 Bem-vindo ao Projeto 2026!", texto: "Confira os recados importantes." }
        ]
    }
};
