const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const promptSpan = document.querySelector('.prompt');
const gameStatsDiv = document.getElementById('game-stats');
const playerRamSpan = document.getElementById('player-ram');
const enemyHealthSpan = document.getElementById('enemy-health');

let currentCommand = '';
let commandHistory = [];
let historyIndex = -1;
let currentState = 'login'; // 'login', 'menu', 'attack'
let currentTarget = ''; // Aquí será el "servidor" a atacar
let currentQuestionIndex = 0;

// === NUEVAS VARIABLES DE JUEGO ===
let playerRAM = 10; // Vida del jugador
let enemyHealth = 10; // Vida del servidor enemigo
const RAM_DAMAGE = 2; // Cuánta RAM pierdes por respuesta incorrecta
const SERVER_DAMAGE = 2; // Cuánto daño haces al servidor por respuesta correcta
const MAX_RAM = 10; // RAM máxima del jugador
const MAX_ENEMY_HEALTH = 10; // Salud máxima del servidor

// === VOCABULARIO DE HACKERS ===
const vocabulary = {
    'HACKER_TYPES': [
        { q: "A person who exploits computer security for malicious reasons, often for personal gain.", a: "Black Hat" },
        { q: "A security professional who uses their skills to identify vulnerabilities and improve security.", a: "White Hat" },
        { q: "Someone who operates in a grey area, sometimes breaking laws but not necessarily with malicious intent.", a: "Grey Hat" },
        { q: "An individual who uses hacking to promote a political or social cause.", a: "Hacktivist" },
        { q: "A novice who uses pre-existing tools or scripts to hack, lacking deep technical understanding.", a: "Script Kiddie" },
        { q: "A security expert hired to test a system for vulnerabilities before launch, often by trying to break it.", a: "Blue Hat" },
        { q: "Someone employed by a government to conduct cyber warfare or espionage.", a: "State-Sponsored Hacker" },
        { q: "An insider threat, often disgruntled, who uses their access for malicious purposes.", a: "Malicious Insider" }
    ]
    // Puedes añadir más categorías de vocabulario aquí en el futuro
};

// === FUNCIONES DE UI / ESTADO DEL JUEGO ===

function appendOutput(text, type = 'normal') {
    const p = document.createElement('span');
    p.textContent = text;
    if (type === 'error') p.style.color = '#ff0000';
    if (type === 'success') p.style.color = '#00ff00';
    if (type === 'system') p.style.color = '#00ffff'; // Cyan para mensajes del sistema
    if (type === 'warning') p.style.color = '#ffff00'; // Amarillo para advertencias
    terminalOutput.appendChild(p);
    terminalOutput.appendChild(document.createElement('br'));
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function typeWriterEffect(text, callback, delay = 50) {
    let i = 0;
    terminalInput.disabled = true;
    terminalOutput.appendChild(document.createElement('br')); // Añade un salto de línea antes del efecto
    const currentLine = document.createElement('span');
    terminalOutput.appendChild(currentLine);

    function type() {
        if (i < text.length) {
            currentLine.textContent += text.charAt(i);
            i++;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            setTimeout(type, delay);
        } else {
            terminalInput.disabled = false;
            terminalInput.focus();
            if (callback) callback();
        }
    }
    type();
}

// Actualiza las barras de vida/RAM en la interfaz
function updateGameStats() {
    gameStatsDiv.style.display = 'block'; // Asegúrate de que las estadísticas sean visibles

    const ramBar = Array(MAX_RAM).fill('-').map((char, i) => i < playerRAM ? '|' : char).join('');
    playerRamSpan.textContent = `RAM: [${ramBar}]`;

    const serverBar = Array(MAX_ENEMY_HEALTH).fill('-').map((char, i) => i < enemyHealth ? '#' : char).join('');
    enemyHealthSpan.textContent = `SERVER: [${serverBar}]`;

    // Si la RAM es baja, cambia el color de la barra (ej. amarillo)
    if (playerRAM <= MAX_RAM / 3) {
        playerRamSpan.style.color = '#ffff00'; // Amarillo
    } else {
        playerRamSpan.style.color = '#00ffff'; // Cian normal
    }

    // Si la salud del enemigo es baja, cambia el color de la barra (ej. rojo)
    if (enemyHealth <= MAX_ENEMY_HEALTH / 3) {
        enemyHealthSpan.style.color = '#ff0000'; // Rojo
    } else {
        enemyHealthSpan.style.color = '#00ffff'; // Cian normal
    }
}

function resetGame() {
    playerRAM = MAX_RAM;
    enemyHealth = MAX_ENEMY_HEALTH;
    currentQuestionIndex = 0;
    updateGameStats();
}

function displayLogin() {
    terminalOutput.innerHTML = '';
    gameStatsDiv.style.display = 'none'; // Ocultar estadísticas en el login
    appendOutput("C:\\> attempting secure login...");
    typeWriterEffect("C:\\> authentication required. enter credentials.", () => {
        appendOutput("USERNAME: guest");
        appendOutput("PASSWORD: ");
        terminalInput.placeholder = "type 'login'";
        currentState = 'login';
    });
}

function displayMenu() {
    terminalOutput.innerHTML = '';
    gameStatsDiv.style.display = 'none'; // Ocultar estadísticas en el menú
    appendOutput("C:\\> login successful. welcome, agent.");
    appendOutput("");
    appendOutput("CYBERDRILL: THE HACKER OFFENSIVE");
    appendOutput("--------------------------------");
    appendOutput("ENEMY SERVERS DETECTED:");
    appendOutput("1. HACKER_TYPES.exe (Threat Level: HIGH)");
    appendOutput("");
    appendOutput("C:\\> select target [1] or 'exit'");
    terminalInput.placeholder = "";
    currentState = 'menu';
}

function startAttack(target) {
    terminalOutput.innerHTML = '';
    currentTarget = target;
    resetGame(); // Reinicia el estado del juego al iniciar un ataque
    
    appendOutput(`C:\\> initiating attack on ${target}.exe ...`);
    typeWriterEffect("C:\\> breach protocol activated. respond swiftly to neutralize defense systems.", () => {
        displayQuestion();
        currentState = 'attack';
    });
}

function displayQuestion() {
    // Comprobar si el juego ha terminado
    if (playerRAM <= 0) {
        gameOver("C:\\> YOUR SYSTEM CRASHED! DEFEAT! GAME OVER!");
        return;
    }
    if (enemyHealth <= 0) {
        gameOver("C:\\> ENEMY SERVER COMPROMISED! VICTORY! RETURNING TO MENU...");
        return;
    }

    // Si hay más preguntas
    const questions = vocabulary[currentTarget];
    if (currentQuestionIndex < questions.length) {
        const qData = questions[currentQuestionIndex];
        appendOutput(`\nC:\\> ATTEMPTING PROTOCOL BREACH ${currentQuestionIndex + 1}/${questions.length}:`);
        appendOutput(qData.q);
        terminalInput.placeholder = "your answer...";
        promptSpan.textContent = `C:\\${currentTarget}>`;
    } else {
        // Si todas las preguntas de la categoría han sido respondidas pero el enemigo no ha muerto
        appendOutput("\nC:\\> ALL KNOWN VULNERABILITIES EXHAUSTED. ENEMY STILL ACTIVE.");
        appendOutput("C:\\> RE-SCANNING FOR NEW EXPLOITS...");
        currentQuestionIndex = 0; // Reinicia las preguntas para seguir atacando
        setTimeout(displayQuestion, 2000);
    }
    updateGameStats(); // Actualiza las estadísticas después de mostrar la pregunta
}

function gameOver(message) {
    terminalOutput.innerHTML = '';
    appendOutput(message, message.includes("VICTORY") ? 'success' : 'error');
    appendOutput("\nC:\\> REBOOTING SYSTEM...");
    terminalInput.disabled = true;
    promptSpan.textContent = "C:\\>";
    setTimeout(() => {
        displayLogin(); // O volver al menú principal directamente
        terminalInput.disabled = false;
        terminalInput.focus();
    }, 4000);
}


// === PROCESAMIENTO DE COMANDOS ===

function processCommand(command) {
    appendOutput(promptSpan.textContent + command);
    terminalInput.value = '';

    if (currentState === 'login') {
        if (command.toLowerCase() === 'login') {
            appendOutput("C:\\> authentication granted.");
            setTimeout(displayMenu, 1000);
        } else {
            appendOutput("C:\\> access denied. invalid credentials.", 'error');
            appendOutput("C:\\> re-attempting login...");
        }
    } else if (currentState === 'menu') {
        if (command.toLowerCase() === 'exit') {
            appendOutput("C:\\> disconnecting. goodbye, agent.");
            setTimeout(displayLogin, 1000);
        } else if (command === '1') { // Solo tenemos un objetivo por ahora
            startAttack('HACKER_TYPES');
        } else {
            appendOutput("C:\\> unknown command or invalid target ID. type '1' or 'exit'.", 'error');
        }
    } else if (currentState === 'attack') {
        const currentQ = vocabulary[currentTarget][currentQuestionIndex];
        if (command.toLowerCase() === currentQ.a.toLowerCase()) {
            appendOutput("C:\\> PROTOCOL BREACH SUCCESSFUL! ENEMY SYSTEM DAMAGED!", 'success');
            enemyHealth = Math.max(0, enemyHealth - SERVER_DAMAGE); // Reduce vida, no menos de 0
            currentQuestionIndex++;
            setTimeout(displayQuestion, 1500);
        } else {
            appendOutput("C:\\> BREACH ATTEMPT FAILED! ENEMY COUNTER-ATTACK! RAM COMPROMISED!", 'error');
            playerRAM = Math.max(0, playerRAM - RAM_DAMAGE); // Reduce RAM, no menos de 0
            // No incrementamos currentQuestionIndex para que el usuario pueda intentar de nuevo la misma pregunta
            setTimeout(displayQuestion, 2000); // Dar un momento para leer el mensaje de error
        }
    }
}


// === EVENT LISTENERS ===

terminalInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const command = terminalInput.value.trim();
        if (command) {
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            processCommand(command);
        }
    } else if (event.key === 'ArrowUp') {
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
            event.preventDefault();
        }
    } else if (event.key === 'ArrowDown') {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
            event.preventDefault();
        } else if (historyIndex === commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = '';
            event.preventDefault();
        }
    }
});

// Iniciar el simulador
displayLogin();
