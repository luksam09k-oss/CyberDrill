const vocabulary = [
    { q: "Software malicioso diseñado para replicarse y dañar archivos:", options: ["Firewall", "Virus", "VPN", "Cloud"], a: 1 },
    { q: "Barrera de seguridad que filtra el tráfico de red entrante/saliente:", options: ["Router", "Phishing", "Firewall", "Modem"], a: 2 },
    { q: "Hacker ético que busca vulnerabilidades para reportarlas:", options: ["Black Hat", "Grey Hat", "White Hat", "Script Kiddie"], a: 2 },
    { q: "Engaño mediante correos falsos para robar credenciales:", options: ["Phishing", "Spyware", "Trojan", "DDoS"], a: 0 },
    { q: "Malware que se disfraza de software legítimo:", options: ["Worm", "Trojan", "Ransomware", "Adware"], a: 1 },
    { q: "Secuestro de datos por los que se pide un rescate económico:", options: ["Spam", "Ransomware", "Keylogger", "Botnet"], a: 1 },
    { q: "Crea un túnel seguro y cifrado para la navegación:", options: ["DNS", "VPN", "HTTP", "FTP"], a: 1 },
    { q: "Novato que usa scripts hechos por otros sin entenderlos:", options: ["Hacktivist", "Blue Hat", "Script Kiddie", "SysAdmin"], a: 2 },
    { q: "Ataque masivo que satura un servidor con tráfico falso:", options: ["DDoS", "SQLi", "XSS", "Brute Force"], a: 0 },
    { q: "Persona que hackea por motivos políticos o sociales:", options: ["Phreaker", "Hacktivist", "Cracker", "Insider"], a: 1 }
];

let playerRAM = 100, enemyHP = 100, currentQ = {}, timer, timeLeft = 10;

function log(msg, color) {
    const out = document.getElementById('terminal-output');
    const line = document.createElement('div');
    line.style.color = color === 'err' ? 'var(--magenta)' : 'var(--cyan)';
    line.innerHTML = `> ${msg}`;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
}

function updateBars() {
    document.getElementById('player-hp').style.width = playerRAM + "%";
    document.getElementById('enemy-hp').style.width = enemyHP + "%";
}

function startTimer() {
    timeLeft = 10;
    document.getElementById('timer-ring').innerText = timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-ring').innerText = timeLeft;
        if (timeLeft <= 0) {
            handleDamage(20, "TIMEOUT: Sitema infectado por retraso.");
            loadQuestion();
        }
    }, 1000);
}

function handleDamage(dmg, msg) {
    playerRAM -= dmg;
    document.getElementById('game-screen').classList.add('shake');
    setTimeout(() => document.getElementById('game-screen').classList.remove('shake'), 500);
    log(msg, "err");
    updateBars();
    if (playerRAM <= 0) endGame("SISTEMA CRASHED. GAME OVER.");
}

function handleAttack(dmg, msg) {
    enemyHP -= dmg;
    log(msg, "ok");
    updateBars();
    if (enemyHP <= 0) endGame("SERVIDOR COMPROMETIDO. VICTORIA.");
}

function loadQuestion() {
    if (playerRAM <= 0 || enemyHP <= 0) return;
    currentQ = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    log(currentQ.q, "ok");
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    currentQ.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === currentQ.a) {
                handleAttack(25, "ATAQUE EXITOSO: Buffer overflow detectado.");
            } else {
                handleDamage(15, "ERROR: Firewall enemigo detectado.");
            }
            loadQuestion();
        };
        grid.appendChild(btn);
    });
    startTimer();
}

function endGame(msg) {
    clearInterval(timer);
    document.body.innerHTML = `<h1 style="color:var(--magenta); font-family:Orbitron; text-align:center; width:100%; mt-50">${msg}</h1>
                               <button onclick="location.reload()" style="background:none; border:1px solid var(--cyan); color:var(--cyan); padding:20px; font-family:VT323; cursor:pointer;">REBOOT SYSTEM</button>`;
}

// Inicializar
updateBars();
loadQuestion();
