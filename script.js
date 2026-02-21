const vocabulary = [
    { q: "Software que se replica y daña archivos:", o: ["Firewall", "Virus", "VPN", "Cloud"], a: 1 },
    { q: "Filtra el tráfico de red entrante:", o: ["Router", "Phishing", "Firewall", "Modem"], a: 2 },
    { q: "Hacker ético que ayuda a empresas:", o: ["Black Hat", "Grey Hat", "White Hat", "Script Kiddie"], a: 2 },
    { q: "Engaño por email para robar claves:", o: ["Phishing", "Spyware", "Trojan", "DDoS"], a: 0 },
    { q: "Malware disfrazado de programa útil:", o: ["Worm", "Trojan", "Ransomware", "Adware"], a: 1 },
    { q: "Secuestro de datos por rescate $$$:", o: ["Spam", "Ransomware", "Keylogger", "Botnet"], a: 1 },
    { q: "Conexión cifrada punto a punto:", o: ["DNS", "VPN", "HTTP", "FTP"], a: 1 },
    { q: "Ataque que satura un servidor:", o: ["DDoS", "SQLi", "XSS", "Brute Force"], a: 0 },
    { q: "Usa scripts de otros sin saber programar:", o: ["Pro", "Blue Hat", "Script Kiddie", "Admin"], a: 2 },
    { q: "Hackea por ideología política:", o: ["Spy", "Hacktivist", "Cracker", "Insider"], a: 1 },
    { q: "Registra cada pulsación de tecla:", o: ["Adware", "Keylogger", "Cookies", "Rootkit"], a: 1 },
    { q: "Red de dispositivos infectados (Zombies):", o: ["Botnet", "Mainframe", "Cluster", "Switch"], a: 0 },
    { q: "Malware que se oculta en el inicio del SO:", o: ["BIOS", "Rootkit", "Firmware", "Kernel"], a: 1 },
    { q: "Intento de adivinar claves probando todo:", o: ["SQLi", "Fuzzing", "Brute Force", "Spoofing"], a: 2 },
    { q: "Suplantación de identidad (IP/DNS):", o: ["Spoofing", "Sniffing", "Cracking", "Dumping"], a: 0 },
    { q: "Captura paquetes de datos en la red:", o: ["Sniffer", "Scanner", "Proxy", "Bridge"], a: 0 },
    { q: "Pequeño archivo de rastreo web:", o: ["Script", "Cookie", "Pop-up", "Plugin"], a: 1 },
    { q: "Vulnerabilidad no descubierta por el autor:", o: ["Zero-Day", "Patch", "Bug", "Exploit"], a: 0 },
    { q: "Validación por dos métodos (SMS/App):", o: ["2FA", "HTTPS", "SSL", "SSO"], a: 0 },
    { q: "Inyección de código malicioso en BD:", o: ["XSS", "SQLi", "CSRF", "MITM"], a: 1 }
];

let playerRAM = 100, enemyHP = 100, score = 0, timer, timeLeft = 10;
let config = { time: 10, enemyMult: 1 };
let usedQuestions = [];
let isOverload = false; // Estado del Boss Final

window.onload = () => {
    const savedScore = localStorage.getItem('cyberdrill_score') || 0;
    document.getElementById('high-score-display').innerText = `RECORD_HISTÓRICO: ${savedScore}`;
};

function startGame(mode) {
    document.getElementById('difficulty-overlay').style.display = 'none';
    document.getElementById('game-screen').style.display = 'grid';
    
    if (mode === 'easy') config = { time: 12, enemyMult: 1 };
    else if (mode === 'normal') config = { time: 10, enemyMult: 1 };
    else if (mode === 'hard') {
        config = { time: 8, enemyMult: 2 };
        playerRAM = 50;
        enemyHP = 200;
    }
    
    updateBars();
    loadQuestion();
}

function log(msg, type) {
    const wrapper = document.getElementById('terminal-wrapper');
    const out = document.getElementById('terminal-output');
    const div = document.createElement('div');
    div.className = `log-entry ${type === 'ok' ? 'log-success' : type === 'err' ? 'log-error' : type === 'warn' ? 'log-warning' : ''}`;
    div.innerText = `> ${msg}`;
    out.appendChild(div);
    wrapper.scrollTop = wrapper.scrollHeight;
}

function loadQuestion() {
    clearInterval(timer);
    
    if (usedQuestions.length === vocabulary.length) usedQuestions = [];
    
    let qIdx;
    do {
        qIdx = Math.floor(Math.random() * vocabulary.length);
    } while (usedQuestions.includes(qIdx));
    
    usedQuestions.push(qIdx);
    const qData = vocabulary[qIdx];
    
    log(`${isOverload ? '[!] EMERGENCIA: ' : 'NUEVO_RETO: '}${qData.q}`, 'sys');
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    qData.o.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === qData.a) {
                log("ATAQUE EFECTIVO. Bypass confirmado.", "ok");
                successEffect();
                enemyHP -= (25 / config.enemyMult);
                score += (isOverload ? 200 : 100);
            } else {
                log("FALLO CRÍTICO. Contraataque en curso.", "err");
                damageEffect();
                playerRAM -= (isOverload ? 25 : 15);
            }
            checkGameState();
        };
        grid.appendChild(btn);
    });
    
    timeLeft = isOverload ? 6 : config.time;
    startTimer();
}

function successEffect() {
    const flash = document.getElementById('flash-effect');
    flash.classList.add('flash-active');
    setTimeout(() => flash.classList.remove('flash-active'), 300);
}

function damageEffect() {
    const screen = document.getElementById('game-screen');
    screen.classList.add('shake');
    setTimeout(() => screen.classList.remove('shake'), 400);
}

function startTimer() {
    document.getElementById('timer-ring').innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-ring').innerText = timeLeft;
        if (timeLeft <= 0) {
            log("TIMEOUT. El sistema te ha detectado.", "err");
            damageEffect();
            playerRAM -= (isOverload ? 30 : 20);
            checkGameState();
        }
    }, 1000);
}

function activateOverload() {
    isOverload = true;
    enemyHP = 100; // Revive al 100%
    config.enemyMult = 1.5; // Un poco más duro de bajar
    
    // Cambios visuales
    document.getElementById('main-body').classList.add('blood-mode');
    document.getElementById('enemy-sprite').src = 'final.png';
    document.getElementById('enemy-sprite').onerror = () => {
        document.getElementById('enemy-sprite').src = 'https://via.placeholder.com/150/1a0005/ff0033?text=BOSS_CORE';
    };
    document.getElementById('enemy-status').innerText = "SISTEMA: SOBRECARGADO / MODO_BERSERKER";
    document.getElementById('enemy-label').innerText = "NÚCLEO_CORRUPTO";
    
    log("!!! ADVERTENCIA: PROTOCOLO DE AUTODESTRUCCIÓN ACTIVADO !!!", "warn");
    log("EL SERVIDOR ESTÁ INTENTANDO RECONECTARSE...", "warn");
    
    setTimeout(() => {
        log("SISTEMA ENEMIGO REVIVIDO. TIEMPO DE RESPUESTA REDUCIDO.", "err");
        updateBars();
        loadQuestion();
    }, 1500);
}

function checkGameState() {
    updateBars();
    document.getElementById('score-counter').innerText = `PTS: ${score}`;
    
    if (playerRAM <= 0) return endGame("CONEXIÓN_CORTADA: Sistema local destruido.");
    
    if (enemyHP <= 0) {
        if (!isOverload && Math.random() < 0.4) {
            clearInterval(timer); // Pausamos para la transformación
            activateOverload();
        } else {
            endGame(isOverload ? "NÚCLEO_EXTERMINADO: Eres una leyenda del hacking." : "SERVIDOR_CONQUISTADO: Acceso total garantizado.");
        }
    } else {
        loadQuestion();
    }
}

function updateBars() {
    const maxE = config.enemyMult === 2 ? 200 : (isOverload ? 100 : 100);
    const maxP = 100; // Referencia base
    
    document.getElementById('enemy-hp').style.width = Math.max(0, (enemyHP / maxE) * 100) + "%";
    document.getElementById('player-hp').style.width = Math.max(0, (playerRAM / (config.enemyMult === 2 ? 50 : 100)) * 100) + "%";
}

function endGame(msg) {
    clearInterval(timer);
    const high = localStorage.getItem('cyberdrill_score') || 0;
    if (score > high) localStorage.setItem('cyberdrill_score', score);
    
    document.body.innerHTML = `
        <div id="difficulty-overlay">
            <div class="menu-content" style="border-color: ${isOverload ? 'var(--red)' : 'var(--cyan)'}">
                <h1 class="${playerRAM <= 0 ? 'log-error' : 'log-success'}" style="font-size: 2rem;">${msg}</h1>
                <h2 style="color: var(--cyan)">PUNTUACIÓN FINAL: ${score}</h2>
                <button onclick="location.reload()">REINICIAR SISTEMA</button>
            </div>
        </div>
    `;
}
