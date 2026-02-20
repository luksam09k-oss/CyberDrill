const vocabulary = [
    { q: "Hacker que trabaja para gobiernos en ciberguerra:", options: ["White Hat", "State-Sponsored", "Script Kiddie", "Blue Hat"], a: 1 },
    { q: "Usa herramientas de otros porque no sabe programar:", options: ["Hacktivist", "Grey Hat", "Script Kiddie", "Black Hat"], a: 2 },
    { q: "Ataca por motivos políticos o sociales:", options: ["Hacktivist", "Spy", "White Hat", "Insider"], a: 0 },
    { q: "Experto contratado para buscar fallos antes de un lanzamiento:", options: ["Black Hat", "Blue Hat", "Grey Hat", "Red Hat"], a: 1 }
];

let pLife = 100, eLife = 100, timeLeft = 10, timerInterval, currentQ = 0;

function updateUI() {
    document.getElementById('player-bar').style.width = pLife + "%";
    document.getElementById('enemy-bar').style.width = eLife + "%";
    if(pLife <= 0) alert("CRITICAL FAILURE: System Offline");
    if(eLife <= 0) alert("BREACH SUCCESSFUL: Server Compromised");
}

function startTimer() {
    timeLeft = 10;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft + "s";
        if (timeLeft <= 0) {
            takeDamage(20, "TIME EXPIRED: Virus Injected!");
            nextQuestion();
        }
    }, 1000);
}

function takeDamage(amount, msg) {
    pLife -= amount;
    log(msg, "error");
    updateUI();
}

function doDamage(amount, msg) {
    eLife -= amount;
    log(msg, "success");
    updateUI();
}

function log(msg, type) {
    const div = document.createElement('div');
    div.innerText = `> ${msg}`;
    div.className = type;
    const output = document.getElementById('terminal-output');
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

function nextQuestion() {
    currentQ = Math.floor(Math.random() * vocabulary.length);
    const qData = vocabulary[currentQ];
    log(qData.q, "system");
    
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    qData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = `${idx + 1}. ${opt}`;
        btn.onclick = () => checkAnswer(idx);
        container.appendChild(btn);
    });
    startTimer();
}

function checkAnswer(idx) {
    if (idx === vocabulary[currentQ].a) {
        doDamage(25, "CORRECT: Data packet sent!");
    } else {
        takeDamage(15, "WRONG: Firewall backfire!");
    }
    nextQuestion();
}

function log(msg, type) {
    const out = document.getElementById('terminal-output');
    out.innerHTML += `<div style="color:${type === 'error' ? '#ff00ff' : '#00f2ff'}">> ${msg}</div>`;
    out.scrollTop = out.scrollHeight;
}

// Iniciar
updateUI();
nextQuestion();
