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
let config = { questions: 10, time: 10, enemyMult: 1 };
let usedQuestions = [];

window.onload = () => {
    const savedScore = localStorage.getItem('cyberdrill_score') || 0;
    document.getElementById('high-score-display').innerText = `RECORD_ACTUAL: ${savedScore}`;
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
    div.className = `log-entry ${type === 'ok' ? 'log-success' : type === 'err' ? 'log-error' : ''}`;
    div.innerText = `> ${msg}`;
    out.appendChild(div);
    
    // Auto-scroll al final
    wrapper.scrollTop = wrapper.scrollHeight;
}

function loadQuestion() {
    clearInterval(timer);
    
    // Resetear si se acaban las preguntas
    if (usedQuestions.length === vocabulary.length) usedQuestions = [];
    
    let qIdx;
    do {
        qIdx = Math.floor(Math.random() * vocabulary.length);
    } while (usedQuestions.includes(qIdx));
    
    usedQuestions.push(qIdx);
    const qData = vocabulary[qIdx];
    
    log(`NUEVO OBJETIVO: ${qData.q}`, 'sys');
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    qData.o.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === qData.a) {
                log("¡ACCESO CONCEDIDO! Paquete de datos enviado.", "ok");
                successEffect();
                enemyHP -= (25 / config.enemyMult);
                score += 100;
            } else {
                log("¡ERROR DE ENCRIPTACIÓN! Contraataque detectado.", "err");
                damageEffect();
                playerRAM -= 15;
            }
            checkGameState();
        };
        grid.appendChild(btn);
    });
    
    timeLeft = config.time;
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
            log("TIEMPO AGOTADO: El firewall te ha localizado.", "err");
            damageEffect();
            playerRAM -= 20;
            checkGameState();
        }
    }, 1000);
}

function checkGameState() {
    updateBars();
    document.getElementById('score-counter').innerText = `PTS: ${score}`;
    
    if (playerRAM <= 0) return endGame("CONEXIÓN PERDIDA: Tu sistema ha sido destruido.");
    if (enemyHP <= 0) return endGame("INFILTRACIÓN COMPLETA: El servidor es tuyo.");
    
    loadQuestion();
}

function updateBars() {
    const maxE = config.enemyMult === 2 ? 200 : 100;
    const maxP = config.enemyMult === 2 ? 50 : 100; // En hard empiezas con 50
    
    document.getElementById('enemy-hp').style.width = Math.max(0, (enemyHP / maxE) * 100) + "%";
    document.getElementById('player-hp').style.width = Math.max(0, (playerRAM / (config.enemyMult === 2 ? 50 : 100)) * 100) + "%";
}

function endGame(msg) {
    clearInterval(timer);
    const high = localStorage.getItem('cyberdrill_score') || 0;
    if (score > high) localStorage.setItem('cyberdrill_score', score);
    
    document.body.innerHTML = `
        <div id="difficulty-overlay">
            <div class="menu-content">
                <h1 class="log-error" style="font-size: 2rem;">${msg}</h1>
                <h2 style="color: var(--cyan)">PUNTUACIÓN FINAL: ${score}</h2>
                <button onclick="location.reload()">REINICIAR INTERFAZ</button>
            </div>
        </div>
    `;
}
