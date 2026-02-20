const vocabulary = [
    { q: "Software malicioso que se replica:", o: ["Firewall", "Virus", "VPN", "Cloud"], a: 1 },
    { q: "Filtra tráfico de red entrante/saliente:", o: ["Router", "Phishing", "Firewall", "Modem"], a: 2 },
    { q: "Hacker ético que reporta fallos:", o: ["Black Hat", "Grey Hat", "White Hat", "Script Kiddie"], a: 2 },
    { q: "Robo de identidad por correo:", o: ["Phishing", "Spyware", "Trojan", "DDoS"], a: 0 },
    { q: "Malware disfrazado de programa útil:", o: ["Worm", "Trojan", "Ransomware", "Adware"], a: 1 },
    { q: "Secuestro de datos por dinero:", o: ["Spam", "Ransomware", "Keylogger", "Botnet"], a: 1 },
    { q: "Conexión cifrada de punto a punto:", o: ["DNS", "VPN", "HTTP", "FTP"], a: 1 },
    { q: "Ataca por ideología política/social:", o: ["Phreaker", "Hacktivist", "Cracker", "Insider"], a: 1 },
    { q: "Ataque que satura un servidor:", o: ["DDoS", "SQLi", "XSS", "Brute Force"], a: 0 },
    { q: "Persona que usa scripts de otros:", o: ["CISO", "Blue Hat", "Script Kiddie", "DevOps"], a: 2 }
];

let playerRAM = 100, enemyHP = 100, score = 0, timer, timeLeft = 10;
let config = { time: 10, enemyMult: 1 };

window.onload = () => {
    const savedScore = localStorage.getItem('cyberdrill_score') || 0;
    document.getElementById('high-score-display').innerText = `HIGH_SCORE: ${savedScore}`;
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

function successFlash() {
    const f = document.getElementById('flash-effect');
    f.classList.add('flash-active');
    setTimeout(() => f.classList.remove('flash-active'), 300);
}

function handleAttack(dmg) {
    successFlash();
    enemyHP -= dmg;
    score += 100;
    document.getElementById('score-counter').innerText = `PTS: ${score}`;
    updateBars();
    if (enemyHP <= 0) endGame("ACCESS_GRANTED: Server Compromised");
    else loadQuestion();
}

function handleDamage(dmg) {
    playerRAM -= dmg;
    document.getElementById('game-screen').classList.add('shake');
    setTimeout(() => document.getElementById('game-screen').classList.remove('shake'), 400);
    updateBars();
    if (playerRAM <= 0) endGame("CRITICAL_ERROR: RAM Corrupted");
}

function loadQuestion() {
    clearInterval(timer);
    const qData = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    const out = document.getElementById('terminal-output');
    out.innerHTML += `<div style="color:var(--cyan); margin-top:10px;">> QUESTION: ${qData.q}</div>`;
    out.scrollTop = out.scrollHeight;

    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    qData.o.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === qData.a) handleAttack(25 / config.enemyMult);
            else { handleDamage(15); loadQuestion(); }
        };
        grid.appendChild(btn);
    });
    timeLeft = config.time;
    startTimer();
}

function startTimer() {
    document.getElementById('timer-ring').innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-ring').innerText = timeLeft;
        if (timeLeft <= 0) { handleDamage(20); loadQuestion(); }
    }, 1000);
}

function updateBars() {
    const maxEnemy = config.enemyMult === 2 ? 200 : 100;
    document.getElementById('enemy-hp').style.width = (enemyHP / maxEnemy * 100) + "%";
    document.getElementById('player-hp').style.width = playerRAM + "%";
}

function endGame(msg) {
    clearInterval(timer);
    const currentHigh = localStorage.getItem('cyberdrill_score') || 0;
    if (score > currentHigh) localStorage.setItem('cyberdrill_score', score);
    document.body.innerHTML = `<div class="menu-content"><h1>${msg}</h1><h2>FINAL_PTS: ${score}</h2><button onclick="location.reload()">RELOAD_SYSTEM</button></div>`;
}
