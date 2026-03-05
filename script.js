/* =========================================
   MOTORISTA PREMIUM — Script Principal
   ========================================= */


/* ---- Scroll Spy: Link Ativo no Menu ---- */

const navLinks     = document.querySelectorAll('.nav-link');
const scrollSections = document.querySelectorAll('section.scroll-section[id]');

const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const activeId = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle(
                    'active',
                    link.getAttribute('href') === `#${activeId}`
                );
            });
        }
    });
}, {
    rootMargin: '-20% 0px -75% 0px',
    threshold: 0
});

scrollSections.forEach(section => scrollSpyObserver.observe(section));


/* =========================================
   EFEITO VISUAL — Trânsito vs. Fluidez
   ========================================= */

const TOTAL_CARROS_LENTOS = 40;
const RAIO_FUGA = 120;

const transitoContainer  = document.getElementById('transito-background');
const carroMouse         = document.getElementById('carro-mouse');
const carrosLentosEls    = [];

(function criarCongestionamento() {
    for (let i = 0; i < TOTAL_CARROS_LENTOS; i++) {
        const carro = document.createElement('div');
        carro.className = 'carro-lento';
        carro.style.left     = Math.random() * 100 + 'vw';
        carro.style.animation = `moverTransito ${15 + Math.random() * 20}s linear -${Math.random() * 20}s infinite`;
        transitoContainer.appendChild(carro);
        carrosLentosEls.push(carro);
    }
})();

document.addEventListener('mousemove', (e) => {
    carroMouse.style.display = 'block';

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    carroMouse.style.left = (mouseX - 20) + 'px';
    carroMouse.style.top  = (mouseY - 40) + 'px';

    carrosLentosEls.forEach(carro => {
        const rect   = carro.getBoundingClientRect();
        const carroX = rect.left + rect.width  / 2;
        const carroY = rect.top  + rect.height / 2;
        const distX  = mouseX - carroX;
        const distY  = mouseY - carroY;
        const dist   = Math.sqrt(distX * distX + distY * distY);

        if (dist < RAIO_FUGA) {
            const direcao = carroX < mouseX ? -1 : 1;
            const forca   = (RAIO_FUGA - dist) * 0.8;
            carro.style.transform       = `translateX(${direcao * forca}px)`;
            carro.style.backgroundColor = '#8B0000';
        } else {
            carro.style.transform       = 'translateX(0px)';
            carro.style.backgroundColor = '#333';
        }
    });
});

document.addEventListener('mouseout', () => {
    carroMouse.style.display = 'none';
});


/* =========================================
   AGENDAMENTO PRIVATIVO — Calendário Premium
   ========================================= */

const MESES_NOMES = [
    'Janeiro', 'Fevereiro', 'Março',    'Abril',
    'Maio',    'Junho',     'Julho',    'Agosto',
    'Setembro','Outubro',   'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const agendamento = {
    ano:      null,
    mes:      null,
    dia:      null,
    horario:  null
};

/* Inicialização ao carregar a página */
document.addEventListener('DOMContentLoaded', initAgendamento);

function initAgendamento() {
    const hoje    = new Date();
    const mesHoje = hoje.getMonth();
    const anoHoje = hoje.getFullYear();

    const grid = document.querySelector('.meses-grid');
    if (!grid) return;

    grid.innerHTML = '';

    for (let m = mesHoje; m <= 11; m++) {
        const btn = document.createElement('button');
        btn.className   = 'btn-mes';
        btn.textContent = MESES_NOMES[m];
        btn.addEventListener('click', () => selecionarMes(m, anoHoje));
        grid.appendChild(btn);
    }
}

/* --- Passo 1 → Passo 2: selecionar mês --- */
function selecionarMes(mes, ano) {
    agendamento.mes     = mes;
    agendamento.ano     = ano;
    agendamento.dia     = null;
    agendamento.horario = null;

    renderCalendario(mes, ano);
    mostrarStep('step-calendario');
}

function renderCalendario(mes, ano) {
    const container = document.getElementById('calendario-grid');
    if (!container) return;

    container.innerHTML = '';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    /* Título */
    const titulo = document.createElement('div');
    titulo.className   = 'calendario-titulo';
    titulo.textContent = `${MESES_NOMES[mes]} ${ano}`;
    container.appendChild(titulo);

    /* Rótulos dos dias da semana */
    const semanRow = document.createElement('div');
    semanRow.className = 'calendario-dias-semana';
    DIAS_SEMANA.forEach(d => {
        const label = document.createElement('div');
        label.className   = 'dia-semana-label';
        label.textContent = d;
        semanRow.appendChild(label);
    });
    container.appendChild(semanRow);

    /* Grade de dias */
    const grid        = document.createElement('div');
    grid.className    = 'calendario-grid';
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia   = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDia; i++) {
        const vazio = document.createElement('div');
        vazio.className = 'btn-dia dia-vazio';
        grid.appendChild(vazio);
    }

    for (let d = 1; d <= ultimoDia; d++) {
        const dataDia = new Date(ano, mes, d);
        const btn     = document.createElement('button');
        btn.className   = 'btn-dia';
        btn.textContent = d;

        if (dataDia < hoje) {
            btn.classList.add('dia-passado');
        } else {
            if (dataDia.getTime() === hoje.getTime()) {
                btn.classList.add('dia-hoje');
            }
            btn.addEventListener('click', () => selecionarDia(d));
        }

        grid.appendChild(btn);
    }

    container.appendChild(grid);
}

/* --- Passo 2 → Passo 3: selecionar dia --- */
function selecionarDia(dia) {
    agendamento.dia     = dia;
    agendamento.horario = null;

    renderHorarios();
    mostrarStep('step-horarios');
}

function renderHorarios() {
    const container = document.getElementById('horarios-lista');
    if (!container) return;

    container.innerHTML = '';

    /* Grade de slots de 1 em 1 hora: 08:00 → 18:00 */
    const grid = document.createElement('div');
    grid.className = 'horarios-grid';

    for (let h = 8; h <= 18; h++) {
        const label = h.toString().padStart(2, '0') + ':00';
        const btn   = document.createElement('button');
        btn.className   = 'btn-horario';
        btn.textContent = label;
        btn.addEventListener('click', () => selecionarHorario(label));
        grid.appendChild(btn);
    }

    container.appendChild(grid);

    /* Botões especiais */
    const especiais = document.createElement('div');
    especiais.className = 'horarios-especiais';

    const btnDiaInteiro = document.createElement('button');
    btnDiaInteiro.className = 'btn-horario-especial';
    btnDiaInteiro.innerHTML = '🌅 O dia inteiro<small>Horário Comercial</small>';
    btnDiaInteiro.addEventListener('click', () => selecionarHorario('o dia inteiro (horário comercial)'));

    const btnOutro = document.createElement('button');
    btnOutro.className = 'btn-horario-especial';
    btnOutro.innerHTML = '🕐 Outro horário<small>A combinar</small>';
    btnOutro.addEventListener('click', () => selecionarHorario('outro horário (a combinar)'));

    especiais.appendChild(btnDiaInteiro);
    especiais.appendChild(btnOutro);
    container.appendChild(especiais);
}

/* --- Passo 3 → Passo 4: selecionar horário --- */
function selecionarHorario(horario) {
    agendamento.horario = horario;

    const diaFormatado  = `${agendamento.dia}/${(agendamento.mes + 1).toString().padStart(2, '0')}`;
    const mesNome       = MESES_NOMES[agendamento.mes];

    /* Atualiza resumo visual */
    const resumo = document.getElementById('confirmacao-resumo-texto');
    if (resumo) {
        resumo.innerHTML =
            `Data: <strong>${agendamento.dia} de ${mesNome} de ${agendamento.ano}</strong><br>` +
            `Horário: <strong>${horario}</strong>`;
    }

    /* Monta link do WhatsApp com mensagem dinâmica */
    const mensagem = encodeURIComponent(
        `Olá Luiz! Gostaria de verificar a disponibilidade para um atendimento premium no dia ${diaFormatado} às ${horario}.`
    );
    const btnWpp = document.getElementById('btn-whatsapp-agendamento');
    if (btnWpp) {
        btnWpp.href = `https://wa.me/5511954566078?text=${mensagem}`;
    }

    mostrarStep('step-confirmacao');
}

/* --- Utilitários de Navegação entre Steps --- */

function mostrarStep(stepId) {
    document.querySelectorAll('.agendamento-step').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
}

function voltarStep(numeroStep) {
    const steps = ['step-meses', 'step-calendario', 'step-horarios', 'step-confirmacao'];
    mostrarStep(steps[numeroStep - 1]);
}
