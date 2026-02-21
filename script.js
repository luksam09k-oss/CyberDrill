const vocabulary = [
    { q: "Software that replicates and damages files:", o: ["Firewall", "Virus", "VPN", "Cloud"], a: 1 },
    { q: "Filters incoming network traffic:", o: ["Router", "Phishing", "Firewall", "Modem"], a: 2 },
    { q: "Ethical hacker who helps companies:", o: ["Black Hat", "Grey Hat", "White Hat", "Script Kiddie"], a: 2 },
    { q: "Email scam to steal credentials:", o: ["Phishing", "Spyware", "Trojan", "DDoS"], a: 0 },
    { q: "Malware disguised as useful software:", o: ["Worm", "Trojan", "Ransomware", "Adware"], a: 1 },
    { q: "Data hijacking for a ransom $$$:", o: ["Spam", "Ransomware", "Keylogger", "Botnet"], a: 1 },
    { q: "Encrypted point-to-point connection:", o: ["DNS", "VPN", "HTTP", "FTP"], a: 1 },
    { q: "Attack that saturates a server:", o: ["DDoS", "SQLi", "XSS", "Brute Force"], a: 0 },
    { q: "Uses others' scripts without knowing how to code:", o: ["Pro", "Blue Hat", "Script Kiddie", "Admin"], a: 2 },
    { q: "Hacks for political or social ideology:", o: ["Spy", "Hacktivist", "Cracker", "Insider"], a: 1 },
    { q: "Records every keystroke made by the user:", o: ["Adware", "Keylogger", "Cookies", "Rootkit"], a: 1 },
    { q: "Network of infected devices (Zombies):", o: ["Botnet", "Mainframe", "Cluster", "Switch"], a: 0 },
    { q: "Malware that hides in the OS boot process:", o: ["BIOS", "Rootkit", "Firmware", "Kernel"], a: 1 },
    { q: "Attempt to guess passwords by trying everything:", o: ["SQLi", "Fuzzing", "Brute Force", "Spoofing"], a: 2 },
    { q: "Identity theft (IP/DNS impersonation):", o: ["Spoofing", "Sniffing", "Cracking", "Dumping"], a: 0 },
    { q: "Captures data packets on the network:", o: ["Sniffer", "Scanner", "Proxy", "Bridge"], a: 0 },
    { q: "Small web tracking file:", o: ["Script", "Cookie", "Pop-up", "Plugin"], a: 1 },
    { q: "Vulnerability not yet discovered by the author:", o: ["Zero-Day", "Patch", "Bug", "Exploit"], a: 0 },
    { q: "Validation by two methods (SMS/App):", o: ["2FA", "HTTPS", "SSL", "SSO"], a: 0 },
    { q: "Injection of malicious code into a DB:", o: ["XSS", "SQLi", "CSRF", "MITM"], a: 1 }
];

// Gestión de Audio
const audio = {
    bg: new Audio('fondo.mp3'),
    berserker: new Audio('bersek.mp3'),
    void: new Audio('void.mp3'),
    correct: new Audio('correcto.mp3'),
    wrong: new Audio('incorrecto.mp3')
};

// Configuración de bucles
audio.bg.loop = true;
audio.berserker.loop = true;
audio.void.loop = true;

function stopAllMusic() {
    audio.bg.pause();
    audio.berserker.pause();
    audio.void.pause();
}

function playMusic(track) {
    stopAllMusic();
    audio[track].currentTime = 0;
    audio[track].play().catch(e => console.log("Audio play blocked by browser. Interaction needed."));
}

let playerRAM = 100, enemyHP = 100, score = 0, timer, timeLeft = 10;
let config = { mode: 'normal', time: 10, enemyMult: 1, overloadProb: 0.4 };
let usedQuestions = [];
let isOverload = false;
let isVoid = false;
let perfectBerserker = true;

window.onload = () => {
    const savedScore = localStorage.getItem('cyberdrill_score') || 0;
    document.getElementById('high-score-display').innerText = `HISTORICAL_RECORD: ${savedScore}`;
};

function startGame(mode) {
    document.getElementById('difficulty-overlay').style.display = 'none';
    document.getElementById('game-screen').style.display = 'grid';
    
    playMusic('bg');

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
    
    log(`${isVoid ? '[FATAL_ERR]: ' : (isOverload ? '[!] BERSERKER: ' : 'CHALLENGE: ')}${qData.q}`, 'sys');
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    qData.o.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === qData.a) {
                log("SUCCESSFUL INJECTION.", "ok");
                if (!isVoid) audio.correct.play().catch(() => {});
                successEffect();
                enemyHP -= (25 / config.enemyMult);
                score += (isVoid ? 500 : (isOverload ? 200 : 100));
            } else {
                log("ENEMY DEFENSE ACTIVE.", "err");
                if (!isVoid) audio.wrong.play().catch(() => {});
                damageEffect();
                playerRAM -= (isVoid ? 50 : (isOverload ? 25 : 15));
                if (isOverload) perfectBerserker = false;
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
            log("TIMEOUT. Tracking completed by enemy.", "err");
            if (!isVoid) audio.wrong.play().catch(() => {});
            damageEffect();
            playerRAM -= (isVoid ? 50 : (isOverload ? 30 : 20));
            if (isOverload) perfectBerserker = false;
            checkGameState();
        }
    }, 1000);
}

function activateOverload() {
    isOverload = true;
    perfectBerserker = true;
    enemyHP = 100;
    config.enemyMult = 1.5;
    
    playMusic('berserker');

    document.getElementById('main-body').classList.add('blood-mode');
    document.getElementById('enemy-sprite').src = 'final.png';
    document.getElementById('user-sprite').src = 'scared.png';
    
    log("!!! ERROR: CORE IN BERSERKER STATE !!!", "err");
    setTimeout(() => { updateBars(); loadQuestion(); }, 1500);
}

function activateVoid() {
    isVoid = true;
    isOverload = false;
    enemyHP = 300;
    config.enemyMult = 2;
    
    playMusic('void');

    document.getElementById('main-body').className = 'void-mode';
    document.getElementById('enemy-sprite').src = 'secret.jpg';
    document.getElementById('enemy-sprite').onerror = () => {
        document.getElementById('enemy-sprite').src = 'https://via.placeholder.com/150/000000/ffffff?text=THE_VOID';
    };
    
    document.getElementById('enemy-status').innerText = "SYSTEM_STATUS: [NULL]";
    document.getElementById('enemy-label').innerText = "VOID_ENTITY";
    document.getElementById('player-status').innerText = "BIOMETRICS: ???";
    
    log("... THE SILENCE IS ABSOLUTE ...", "ok");
    log("VOID PHASE INITIATED. NO TURNING BACK.", "err");
    
    setTimeout(() => { updateBars(); loadQuestion(); }, 2000);
}

function checkGameState() {
    updateBars();
    document.getElementById('score-counter').innerText = `PTS: ${score}`;
    
    if (playerRAM <= 0) return endGame("CONNECTION_TERMINATED: Nothing left of you.");
    
    if (enemyHP <= 0) {
        if (!isOverload && !isVoid && Math.random() < config.overloadProb) {
            clearInterval(timer);
            activateOverload();
        } else if (isOverload && perfectBerserker) {
            clearInterval(timer);
            activateVoid();
        } else {
            endGame(isVoid ? "DIVINITY_REACHED: You have hacked the void." : "TARGET_ELIMINATED: System compromised.");
        }
    } else {
        loadQuestion();
    }
}

function updateBars() {
    let maxE;
    if (isVoid) maxE = 300;
    else if (isOverload) maxE = 100;
    else maxE = (config.mode === 'hard') ? 200 : 100;
    
    const currentMaxP = (config.mode === 'hard') ? 50 : 100;
    
    document.getElementById('enemy-hp').style.width = Math.max(0, (enemyHP / maxE) * 100) + "%";
    document.getElementById('player-hp').style.width = Math.max(0, (playerRAM / currentMaxP) * 100) + "%";
}

function endGame(msg) {
    clearInterval(timer);
    stopAllMusic();
    const high = localStorage.getItem('cyberdrill_score') || 0;
    if (score > high) localStorage.setItem('cyberdrill_score', score);
    
    let color = isVoid ? '#ffffff' : (isOverload ? 'var(--red)' : 'var(--cyan)');
    document.body.innerHTML = `
        <div id="difficulty-overlay" style="background: #000">
            <div class="menu-content" style="border-color: ${color}; box-shadow: 0 0 30px ${color}">
                <h1 style="color: ${color}; font-size: 2.5rem;">${msg}</h1>
                <h2 style="color: #fff">SCORE: ${score}</h2>
                <button onclick="location.reload()" style="border-color: ${color}; color: ${color}">RESTART REALITY</button>
            </div>
        </div>
    `;
}
