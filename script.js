// script.js - Atualizado para Projeto Vincular
class SistemaFila {
    constructor() {
        this.filaBanho = [];
        this.filaAtendimentoPsicologico = [];
        this.filaJuridico = [];
        this.ultimasSenhasChamadas = [];
        this.contadores = {
            banho: 0,
            atendimentoPsicologico: 0,
            juridico: 0
        };
        this.carregarDados();
        this.atualizarEstatisticas();
    }

    gerarSenha(tipo) {
        this.contadores[tipo]++;
        const numero = this.contadores[tipo];
        let prefixo;
        let nomeServico;
        
        switch(tipo) {
            case 'banho':
                prefixo = 'B';
                nomeServico = 'Banho';
                break;
            case 'atendimentoPsicologico':
                prefixo = 'P';
                nomeServico = 'Psicológico';
                break;
            case 'juridico':
                prefixo = 'J';
                nomeServico = 'Jurídico';
                break;
            default:
                prefixo = 'G';
                nomeServico = 'Geral';
        }
        
        const senha = `${prefixo}${numero.toString().padStart(3, '0')}`;
        const senhaCompleta = {
            codigo: senha,
            tipo: tipo,
            servico: nomeServico,
            timestamp: new Date()
        };
        
        // Adiciona à fila correspondente
        this[`fila${this.capitalizeFirst(tipo)}`].push(senhaCompleta);
        
        this.salvarDados();
        this.atualizarEstatisticas();
        
        return senhaCompleta;
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    chamarProximo() {
        let senhaChamada;
        
        // Sistema de prioridades: Psicológico > Jurídico > Banho
        if (this.filaAtendimentoPsicologico.length > 0) {
            senhaChamada = this.filaAtendimentoPsicologico.shift();
        } else if (this.filaJuridico.length > 0) {
            senhaChamada = this.filaJuridico.shift();
        } else if (this.filaBanho.length > 0) {
            senhaChamada = this.filaBanho.shift();
        } else {
            this.mostrarMensagem('Não há senhas na fila!', 'info');
            return null;
        }
        
        // Adiciona às últimas senhas chamadas
        this.ultimasSenhasChamadas.unshift(senhaChamada);
        if (this.ultimasSenhasChamadas.length > 5) {
            this.ultimasSenhasChamadas = this.ultimasSenhasChamadas.slice(0, 5);
        }
        
        this.salvarDados();
        this.atualizarDisplay(senhaChamada);
        this.atualizarUltimasSenhas();
        this.atualizarEstatisticas();
        
        return senhaChamada;
    }

    atualizarDisplay(senha) {
        const displaySenha = document.getElementById('displaySenha');
        const senhaAtual = document.getElementById('senhaAtual');
        const displayContent = document.getElementById('displayContent');
        const displayInfo = document.querySelector('.display-info p');
        
        // Animação
        displayContent.classList.remove('pulse');
        void displayContent.offsetWidth; // Trigger reflow
        displayContent.classList.add('pulse');
        
        displaySenha.textContent = senha.codigo;
        senhaAtual.textContent = senha.codigo;
        displayInfo.textContent = `Atendimento ${senha.servico} - Guichê 1`;
        
        // Efeito sonoro
        this.tocarSomChamada();
        
        // Mostrar notificação visual
        this.mostrarNotificacao(`Senha ${senha.codigo} - ${senha.servico}`);
    }

    tocarSomChamada() {
        // Em um sistema real, aqui seria implementado com a Web Audio API
        console.log('🔊 Som de chamada de senha');
        
        // Exemplo simples com beep
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 1);
        } catch (e) {
            console.log('Áudio não suportado ou bloqueado pelo navegador');
        }
    }

    mostrarNotificacao(mensagem) {
        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.className = 'notificacao';
        notificacao.innerHTML = `
            <div class="notificacao-conteudo">
                <span class="notificacao-icon">📢</span>
                <span class="notificacao-texto">${mensagem}</span>
            </div>
        `;
        
        // Estilos da notificação
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notificacao);
        
        // Animação de entrada
        setTimeout(() => {
            notificacao.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notificacao.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        }, 3000);
    }

    atualizarUltimasSenhas() {
        const container = document.getElementById('ultimasSenhas');
        
        if (this.ultimasSenhasChamadas.length === 0) {
            container.innerHTML = '<p>Nenhuma senha chamada ainda</p>';
            return;
        }
        
        container.innerHTML = this.ultimasSenhasChamadas
            .map(senha => `
                <div class="senha-item">
                    <strong>${senha.codigo}</strong> - ${senha.servico}
                    <small>${this.formatarTempo(senha.timestamp)}</small>
                </div>
            `)
            .join('');
    }

    formatarTempo(timestamp) {
        const agora = new Date();
        const dataSenha = new Date(timestamp);
        const diffMs = agora - dataSenha;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins === 1) return 'Há 1 minuto';
        if (diffMins < 60) return `Há ${diffMins} minutos`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return 'Há 1 hora';
        return `Há ${diffHours} horas`;
    }

    atualizarEstatisticas() {
        document.getElementById('countBanho').textContent = this.filaBanho.length;
        document.getElementById('countAtendimentoPsicologico').textContent = this.filaAtendimentoPsicologico.length;
        document.getElementById('countJuridico').textContent = this.filaJuridico.length;
        document.getElementById('countTotal').textContent = 
            this.filaBanho.length + this.filaAtendimentoPsicologico.length + this.filaJuridico.length;
    }

    mostrarMensagem(mensagem, tipo = 'info') {
        // Em um sistema real, poderia usar um toast notification mais elaborado
        const tipos = {
            info: { cor: '#3b82f6', icone: 'ℹ️' },
            success: { cor: '#10b981', icone: '✅' },
            warning: { cor: '#f59e0b', icone: '⚠️' },
            error: { cor: '#ef4444', icone: '❌' }
        };
        
        const config = tipos[tipo] || tipos.info;
        
        // Notificação simples
        this.mostrarNotificacao(`${config.icone} ${mensagem}`);
    }

    salvarDados() {
        const dados = {
            contadores: this.contadores,
            filas: {
                banho: this.filaBanho,
                atendimentoPsicologico: this.filaAtendimentoPsicologico,
                juridico: this.filaJuridico
            },
            ultimasSenhas: this.ultimasSenhasChamadas
        };
        
        localStorage.setItem('sistemaFilaVincular', JSON.stringify(dados));
    }

    carregarDados() {
        const dadosSalvos = localStorage.getItem('sistemaFilaVincular');
        
        if (dadosSalvos) {
            try {
                const dados = JSON.parse(dadosSalvos);
                this.contadores = dados.contadores || this.contadores;
                this.filaBanho = dados.filas?.banho || [];
                this.filaAtendimentoPsicologico = dados.filas?.atendimentoPsicologico || [];
                this.filaJuridico = dados.filas?.juridico || [];
                this.ultimasSenhasChamadas = dados.ultimasSenhas || [];
            } catch (e) {
                console.error('Erro ao carregar dados salvos:', e);
                this.reiniciarSistema(true);
            }
        }
    }

    reiniciarSistema(silencioso = false) {
        if (silencioso || confirm('Tem certeza que deseja reiniciar o sistema? Todas as filas serão limpas.')) {
            this.filaBanho = [];
            this.filaAtendimentoPsicologico = [];
            this.filaJuridico = [];
            this.ultimasSenhasChamadas = [];
            this.contadores = {
                banho: 0,
                atendimentoPsicologico: 0,
                juridico: 0
            };
            
            this.salvarDados();
            this.atualizarEstatisticas();
            this.atualizarUltimasSenhas();
            
            document.getElementById('senhaAtual').textContent = '---';
            document.getElementById('displaySenha').textContent = '---';
            document.querySelector('.display-info p').textContent = 'Aguardando próxima senha...';
            document.getElementById('senhaContent').innerHTML = 
                '<p>Clique em um tipo de atendimento para retirar sua senha</p>';
            
            if (!silencioso) {
                this.mostrarMensagem('Sistema reiniciado com sucesso!', 'success');
            }
        }
    }

    // Método para debug - mostrar estado atual das filas
    debugFila() {
        console.log('=== DEBUG FILA ===');
        console.log('Banho:', this.filaBanho);
        console.log('Psicológico:', this.filaAtendimentoPsicologico);
        console.log('Jurídico:', this.filaJuridico);
        console.log('Contadores:', this.contadores);
        console.log('Últimas chamadas:', this.ultimasSenhasChamadas);
        console.log('==================');
    }
}

// Instância global do sistema
const sistemaFila = new SistemaFila();

// Funções globais para os botões HTML
function retirarSenha(tipo) {
    const senha = sistemaFila.gerarSenha(tipo);
    const senhaContent = document.getElementById('senhaContent');
    
    let icone, cor;
    switch(tipo) {
        case 'banho':
            icone = '🚿';
            cor = '#6366f1';
            break;
        case 'atendimentoPsicologico':
            icone = '⭐';
            cor = '#10b981';
            break;
        case 'juridico':
            icone = '💼';
            cor = '#f59e0b';
            break;
    }
    
    senhaContent.innerHTML = `
        <div class="fade-in" style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">${icone}</div>
            <h3 style="color: ${cor}; margin-bottom: 10px;">Sua Senha</h3>
            <div class="senha-gerada-display" style="color: ${cor};">${senha.codigo}</div>
            <p style="margin: 10px 0;">Atendimento: ${senha.servico}</p>
            <small style="color: #6b7280;">${new Date().toLocaleString('pt-BR')}</small>
        </div>
    `;
    
    sistemaFila.mostrarMensagem(`Senha ${senha.codigo} gerada com sucesso!`, 'success');
}

function chamarProximo() {
    sistemaFila.chamarProximo();
}

function reiniciarSistema() {
    sistemaFila.reiniciarSistema();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    sistemaFila.atualizarUltimasSenhas();
    
    // Efeitos visuais para os botões de serviço
    const serviceButtons = document.querySelectorAll('.service-btn');
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('pulse');
            setTimeout(() => {
                this.classList.remove('pulse');
            }, 500);
        });
    });
    
    // Teclas de atalho para desenvolvimento
    console.log('=== Sistema de Fila - Projeto Vincular ===');
    console.log('Teclas de atalho disponíveis:');
    console.log('F1 - Senha Banho');
    console.log('F2 - Senha Atendimento Psicológico');
    console.log('F3 - Senha Jurídico');
    console.log('F12 - Chamar Próximo');
    console.log('Ctrl+D - Debug (ver console)');
});

// Teclas de atalho
document.addEventListener('keydown', function(e) {
    // F1 - Senha Banho
    if (e.key === 'F1') {
        e.preventDefault();
        retirarSenha('banho');
    }
    // F2 - Senha Atendimento Psicológico
    else if (e.key === 'F2') {
        e.preventDefault();
        retirarSenha('atendimentoPsicologico');
    }
    // F3 - Senha Jurídico
    else if (e.key === 'F3') {
        e.preventDefault();
        retirarSenha('juridico');
    }
    // F12 - Chamar Próximo
    else if (e.key === 'F12') {
        e.preventDefault();
        chamarProximo();
    }
    // Ctrl+D - Debug
    else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        sistemaFila.debugFila();
    }
});

// CSS adicional para as notificações
const style = document.createElement('style');
style.textContent = `
    .notificacao-conteudo {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notificacao-icon {
        font-size: 1.2em;
    }
    
    .notificacao-texto {
        flex: 1;
    }
    
    .senha-item small {
        display: block;
        color: #6b7280;
        font-size: 0.8em;
        margin-top: 4px;
    }
`;
document.head.appendChild(style);