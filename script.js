const vocabulary = [
    { q: "Software que daña archivos:", o: ["Firewall", "Virus", "VPN", "Cloud"], a: 1 },
    { q: "Filtro de tráfico de red:", o: ["Router", "Phishing", "Firewall", "Modem"], a: 2 },
    { q: "Hacker ético:", o: ["Black Hat", "Grey Hat", "White Hat", "Script Kiddie"], a: 2 },
    { q: "Engaño por email:", o: ["Phishing", "Spyware", "Trojan", "DDoS"], a: 0 },
    { q: "Malware disfrazado:", o: ["Worm", "Trojan", "Ransomware", "Adware"], a: 1 },
    { q: "Secuestro de datos:", o: ["Spam", "Ransomware", "Keylogger", "Botnet"], a: 1 },
    { q: "Túnel cifrado:", o: ["DNS", "VPN", "HTTP", "FTP"], a: 1 },
    { q: "Novato usa scripts:", o: ["Hacktivist", "Blue Hat", "Script Kiddie", "SysAdmin"], a: 2 },
    { q: "Saturación de tráfico:", o: ["DDoS", "SQLi", "XSS", "Brute Force"], a: 0 },
    { q: "Hacker activista:", o: ["Phreaker", "Hacktivist", "Cracker", "Insider"], a: 1 }
];

let playerRAM = 100, enemyHP = 100, score = 0, timer, timeLeft = 10;
let config = { questions: 10, time: 10, enemyMult: 1 };

// Cargar High Score de memoria temporal (LocalStorage)
window.onload = () => {
    const savedScore = localStorage.getItem('cyberdrill_score') || 0;
    document.getElementById('high-score-display').innerText = `HIGH_SCORE: ${savedScore}`;
};

function startGame(mode) {
    document.getElementById('difficulty-overlay').style.display = 'none';
    document.getElementById('game-screen').style.display = 'grid';
    
    if (mode === 'easy') {
        config = { questions: 5, time: 10, enemyMult: 1 };
    } else if (mode === 'normal') {
        config = { questions: 10, time: 10, enemyMult: 1 };
    } else if (mode === 'hard') {
        config = { questions: 20, time: 8, enemyMult: 2 };
        playerRAM = 50; // Vida actual / 2
        enemyHP = 200;  // Doble de vida para el servidor
    }
    
    updateBars();
    loadQuestion();
}

function successFlash() {
    const flash = document.getElementById('flash-effect');
    flash.classList.add('flash-active');
    setTimeout(() => flash.classList.remove('flash-active'), 400);
}

function handleAttack(dmg) {
    successFlash();
    enemyHP -= dmg;
    score += 100;
    document.getElementById('score-counter').innerText = `PTS: ${score}`;
    log("BREACH_SUCCESS: Data compromised.", "ok");
    updateBars();
    
    if (enemyHP <= 0) {
        saveHighScore();
        endGame("SERVER_DEFEATED: System Owned.");
    } else {
        loadQuestion();
    }
}

function handleDamage(dmg, msg) {
    playerRAM -= dmg;
    document.getElementById('game-screen').classList.add('shake');
    setTimeout(() => document.getElementById('game-screen').classList.remove('shake'), 500);
    log(`ALERT: ${msg}`, "err");
    updateBars();
    if (playerRAM <= 0) endGame("SYSTEM_CRASHED: Connection Lost.");
}

function saveHighScore() {
    const currentHigh = localStorage.getItem('cyberdrill_score') || 0;
    if (score > currentHigh) {
        localStorage.setItem('cyberdrill_score', score);
    }
}

function loadQuestion() {
    clearInterval(timer);
    const qData = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    const out = document.getElementById('terminal-output');
    out.innerHTML += `<div style="color:var(--cyan); margin-top:10px;">> ${qData.q}</div>`;
    out.scrollTop = out.scrollHeight;

    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    qData.o.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === qData.a) handleAttack(20 / config.enemyMult);
            else {
                handleDamage(15, "Security Countermeasure Active.");
                loadQuestion();
            }
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
        if (timeLeft <= 0) {
            handleDamage(20, "TIMER_EXPIRED: Tracer found you.");
            loadQuestion();
        }
    }, 1000);
}

function updateBars() {
    // Escalamiento visual para vida del enemigo en HARD (200hp)
    const eWidth = (enemyHP / (config.enemyMult === 2 ? 200 : 100)) * 100;
    document.getElementById('enemy-hp').style.width = eWidth + "%";
    document.getElementById('player-hp').style.width = playerRAM + "%";
}

function log(msg, type) {
    const out = document.getElementById('terminal-output');
    out.innerHTML += `<div style="color:${type === 'err' ? 'var(--magenta)' : 'var(--green)'}">> ${msg}</div>`;
    out.scrollTop = out.scrollHeight;
}

function endGame(msg) {
    clearInterval(timer);
    saveHighScore();
    document.body.innerHTML = `<div class="menu-content"><h1 style="color:var(--cyan)">${msg}</h1>
    <h2>FINAL_SCORE: ${score}</h2>
    <button onclick="location.reload()">REBOOT_INTERFACE</button></div>`;
}
