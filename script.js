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
let config = { mode: 'normal', time: 10, enemyMult: 1, overloadProb: 0.4 };
let usedQuestions = [];
let isOverload = false;
let isVoid = false;
let perfectBerserker = true; // Racha perfecta en modo Berserker

window.onload = () => {
    const savedScore = localStorage.getItem('cyberdrill_score') || 0;
    document.getElementById('high-score-display').innerText = `RECORD_HISTÓRICO: ${savedScore}`;
};

function startGame(mode) {
    document.getElementById('difficulty-overlay').style.display = 'none';
    document.getElementById('game-screen').style.display = 'grid';
    
    config.mode = mode;
    if (mode === 'easy') {
        config.time = 12; config.overloadProb = 0.1;
    } else if (mode === 'normal') {
        config.time = 10; config.overloadProb = 0.4;
    } else if (mode === 'hard') {
        config.time = 8; config.enemyMult = 2; config.overloadProb = 0.8;
        playerRAM = 50; enemyHP = 200;
    }
    
    updateBars();
    loadQuestion();
}

function log(msg, type) {
    const wrapper = document.getElementById('terminal-wrapper');
    const out = document.getElementById('terminal-output');
    const div = document.createElement('div');
    div.className = `log-entry ${type === 'ok' ? 'log-success' : type === 'err' ? 'log-error' : ''}`;
    div.innerText = `> ${msg}`;
    out.appendChild(div);
    wrapper.scrollTop = wrapper.scrollHeight;
}

function loadQuestion() {
    clearInterval(timer);
    if (usedQuestions.length === vocabulary.length) usedQuestions = [];
    
    let qIdx;
    do { qIdx = Math.floor(Math.random() * vocabulary.length); } while (usedQuestions.includes(qIdx));
    usedQuestions.push(qIdx);
    const qData = vocabulary[qIdx];
    
    log(`${isVoid ? '[FATAL_ERR]: ' : (isOverload ? '[!] BERSERKER: ' : 'RETO: ')}${qData.q}`, 'sys');
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    qData.o.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === qData.a) {
                log("INYECCIÓN EXITOSA.", "ok");
                successEffect();
                enemyHP -= (25 / config.enemyMult);
                score += (isVoid ? 500 : (isOverload ? 200 : 100));
            } else {
                log("DEFENSA ENEMIGA ACTIVA.", "err");
                damageEffect();
                playerRAM -= (isVoid ? 50 : (isOverload ? 25 : 15));
                if (isOverload) perfectBerserker = false; // Adiós racha perfecta
            }
            checkGameState();
        };
        grid.appendChild(btn);
    });
    
    timeLeft = isVoid ? 4 : (isOverload ? 6 : config.time);
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
            log("TIMEOUT. Rastreo completado por el enemigo.", "err");
            damageEffect();
            playerRAM -= (isVoid ? 50 : (isOverload ? 30 : 20));
            if (isOverload) perfectBerserker = false;
            checkGameState();
        }
    }, 1000);
}

function activateOverload() {
    isOverload = true;
    perfectBerserker = true; // Empezamos a contar
    enemyHP = 100;
    config.enemyMult = 1.5;
    
    document.getElementById('main-body').classList.add('blood-mode');
    document.getElementById('enemy-sprite').src = 'final.png';
    document.getElementById('user-sprite').src = 'scared.png';
    
    log("!!! ERROR: NÚCLEO EN ESTADO BERSERKER !!!", "err");
    setTimeout(() => { updateBars(); loadQuestion(); }, 1500);
}

function activateVoid() {
    isVoid = true;
    isOverload = false;
    enemyHP = 300; // Vida del modo secreto multiplicada por 2 (antes era 150)
    config.enemyMult = 2;
    
    document.getElementById('main-body').className = 'void-mode';
    document.getElementById('enemy-sprite').src = 'secret.jpg';
    document.getElementById('enemy-sprite').onerror = () => {
        document.getElementById('enemy-sprite').src = 'https://via.placeholder.com/150/000000/ffffff?text=THE_VOID';
    };
    
    document.getElementById('enemy-status').innerText = "SYSTEM_STATUS: [NULL]";
    document.getElementById('enemy-label').innerText = "VOID_ENTITY";
    document.getElementById('player-status').innerText = "BIOMETRICS: ???";
    
    log("... EL SILENCIO ES ABSOLUTO ...", "ok");
    log("FASE DE VACÍO INICIADA. NO HAY VUELTA ATRÁS.", "err");
    
    setTimeout(() => { updateBars(); loadQuestion(); }, 2000);
}

function checkGameState() {
    updateBars();
    document.getElementById('score-counter').innerText = `PTS: ${score}`;
    
    if (playerRAM <= 0) return endGame("CONEXIÓN_CORTADA: No queda nada de ti.");
    
    if (enemyHP <= 0) {
        if (!isOverload && !isVoid && Math.random() < config.overloadProb) {
            clearInterval(timer);
            activateOverload();
        } else if (isOverload && perfectBerserker) {
            clearInterval(timer);
            activateVoid();
        } else {
            endGame(isVoid ? "DIVINIDAD_ALCANZADA: Has hackeado el vacío." : "OBJETIVO_ELIMINADO: Sistema comprometido.");
        }
    } else {
        loadQuestion();
    }
}

function updateBars() {
    // Corregido el error de cálculo de porcentajes en las barras
    let maxE;
    if (isVoid) {
        maxE = 300;
    } else if (isOverload) {
        maxE = 100;
    } else {
        maxE = (config.mode === 'hard') ? 200 : 100;
    }
    
    const currentMaxP = (config.mode === 'hard') ? 50 : 100;
    
    document.getElementById('enemy-hp').style.width = Math.max(0, (enemyHP / maxE) * 100) + "%";
    document.getElementById('player-hp').style.width = Math.max(0, (playerRAM / currentMaxP) * 100) + "%";
}

function endGame(msg) {
    clearInterval(timer);
    const high = localStorage.getItem('cyberdrill_score') || 0;
    if (score > high) localStorage.setItem('cyberdrill_score', score);
    
    let color = isVoid ? '#ffffff' : (isOverload ? 'var(--red)' : 'var(--cyan)');
    document.body.innerHTML = `
        <div id="difficulty-overlay" style="background: #000">
            <div class="menu-content" style="border-color: ${color}; box-shadow: 0 0 30px ${color}">
                <h1 style="color: ${color}; font-size: 2.5rem;">${msg}</h1>
                <h2 style="color: #fff">SCORE: ${score}</h2>
                <button onclick="location.reload()" style="border-color: ${color}; color: ${color}">REINICIAR REALIDAD</button>
            </div>
        </div>
    `;
}
