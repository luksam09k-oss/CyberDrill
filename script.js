const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const promptSpan = document.querySelector('.prompt');

let currentCommand = '';
let commandHistory = [];
let historyIndex = -1;
let currentState = 'login'; // 'login', 'menu', 'quiz'
let currentCategory = '';
let currentQuestionIndex = 0;

// Definición de preguntas y respuestas
const vocabulary = {
    'NETWORK_PROTOCOLS': [
        { q: "What is the acronym for HyperText Transfer Protocol?", a: "HTTP" },
        { q: "Which protocol is used to send email?", a: "SMTP" },
        { q: "What does TCP stand for?", a: "Transmission Control Protocol" },
        { q: "What is the secure version of HTTP?", a: "HTTPS" },
        { q: "Which protocol resolves domain names to IP addresses?", a: "DNS" }
    ],
    'DATA_STRUCTURES': [
        { q: "A collection of elements where items are added and removed from the same end (Last-In, First-Out).", a: "Stack" },
        { q: "A linear collection of elements where items are added at one end and removed from the other (First-In, First-Out).", a: "Queue" },
        { q: "What is a node with no children called in a tree structure?", a: "Leaf" },
        { q: "A data structure that maps keys to values.", a: "Hash Map" },
        { q: "A collection of nodes connected by edges.", a: "Graph" }
    ],
    'OPERATING_SYSTEMS': [
        { q: "What is the core part of an operating system?", a: "Kernel" },
        { q: "What is the process of loading the OS into memory called?", a: "Booting" },
        { q: "What does GUI stand for?", a: "Graphical User Interface" },
        { q: "A small program that allows communication between hardware and the OS.", a: "Driver" },
        { q: "The management of computer memory, which involves allocating and deallocating memory space.", a: "Memory Management" }
    ]
};

function appendOutput(text, type = 'normal') {
    const p = document.createElement('span');
    p.textContent = text;
    if (type === 'error') p.style.color = '#ff0000'; // Rojo para errores
    if (type === 'success') p.style.color = '#00ff00'; // Verde más brillante para éxito
    if (type === 'system') p.style.color = '#00ffff'; // Cyan para mensajes del sistema
    terminalOutput.appendChild(p);
    terminalOutput.appendChild(document.createElement('br'));
    terminalOutput.scrollTop = terminalOutput.scrollHeight; // Auto-scroll
}

function typeWriterEffect(text, callback, delay = 50) {
    let i = 0;
    terminalInput.disabled = true;
    function type() {
        if (i < text.length) {
            appendOutput(text.charAt(i), 'system');
            i++;
            setTimeout(type, delay);
        } else {
            terminalInput.disabled = false;
            terminalInput.focus();
            if (callback) callback();
        }
    }
    type();
}

function displayLogin() {
    terminalOutput.innerHTML = ''; // Limpiar la pantalla
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
    appendOutput("C:\\> login successful. welcome, agent.");
    appendOutput("");
    appendOutput("CYBERDRILL: TERMINAL LEXICON");
    appendOutput("----------------------------");
    appendOutput("TARGETS AVAILABLE:");
    let i = 1;
    for (const category in vocabulary) {
        appendOutput(`${i}. ${category}.exe`);
        i++;
    }
    appendOutput("");
    appendOutput("C:\\> select a target [1-${Object.keys(vocabulary).length}] or 'exit'");
    terminalInput.placeholder = "";
    currentState = 'menu';
}

function startQuiz(category) {
    terminalOutput.innerHTML = '';
    currentCategory = category;
    currentQuestionIndex = 0;
    appendOutput(`C:\\> accessing ${category}.exe ...`);
    appendOutput("C:\\> system compromise initiated. answer the following:");
    displayQuestion();
    currentState = 'quiz';
}

function displayQuestion() {
    if (currentQuestionIndex < vocabulary[currentCategory].length) {
        const qData = vocabulary[currentCategory][currentQuestionIndex];
        appendOutput(`\nQUESTION ${currentQuestionIndex + 1}/${vocabulary[currentCategory].length}:`);
        appendOutput(qData.q);
        terminalInput.placeholder = "your answer...";
        promptSpan.textContent = `C:\\${currentCategory}>`;
    } else {
        appendOutput("\nC:\\> TARGET COMPROMISED! CATEGORY CLEARED!");
        appendOutput("C:\\> returning to main menu in 3 seconds...");
        promptSpan.textContent = "C:\\>";
        setTimeout(displayMenu, 3000);
    }
}

function processCommand(command) {
    appendOutput(promptSpan.textContent + command); // Muestra el comando del usuario
    terminalInput.value = ''; // Limpia el input

    if (currentState === 'login') {
        if (command.toLowerCase() === 'login') {
            appendOutput("C:\\> authentication granted.");
            setTimeout(displayMenu, 1000);
        } else {
            appendOutput("C:\\> access denied. invalid credentials.", 'error');
            appendOutput("C:\\> re-attempting login...");
        }
    } else if (currentState === 'menu') {
        const categoryKeys = Object.keys(vocabulary);
        if (command.toLowerCase() === 'exit') {
            appendOutput("C:\\> disconnecting. goodbye, agent.");
            setTimeout(displayLogin, 1000);
        } else if (!isNaN(command) && parseInt(command) > 0 && parseInt(command) <= categoryKeys.length) {
            const selectedCategory = categoryKeys[parseInt(command) - 1];
            startQuiz(selectedCategory);
        } else {
            appendOutput("C:\\> unknown command or invalid target ID. type a number or 'exit'.", 'error');
        }
    } else if (currentState === 'quiz') {
        const currentQ = vocabulary[currentCategory][currentQuestionIndex];
        if (command.toLowerCase() === currentQ.a.toLowerCase()) {
            appendOutput("C:\\> ACCESS GRANTED! Correct!", 'success');
            currentQuestionIndex++;
            setTimeout(displayQuestion, 1000);
        } else {
            appendOutput("C:\\> DENIED. Incorrect answer. Try again.", 'error');
            appendOutput(`HINT: The answer was "${currentQ.a}".`, 'error'); // Opcional: dar la respuesta para aprender
            // Podríamos reiniciar la pregunta o dar una pista, por ahora solo le damos la respuesta.
            setTimeout(displayQuestion, 1500); // Dar un momento para leer la pista
        }
    }
}

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
            event.preventDefault(); // Previene que el cursor se mueva al inicio
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
