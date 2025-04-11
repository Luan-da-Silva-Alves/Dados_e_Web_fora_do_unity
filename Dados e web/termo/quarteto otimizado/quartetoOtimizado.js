// JavaScript source code
const height = 9; // número de tentativas
const width = 5; // número de letras da palavra

let row = 0; // linha e tentativa atual
let col = 0; // letra atual

// Controle de finalizar o jogo
let gameOver = false;
let gameOverStatus = Array(4).fill(false); // para 4 tabuleiros

// Lista de palavras
const wordList = [
    "termo", "suíte", "ávido", "festa", "bebia", "honra", "ouvir",
    "pesco", "fungo", "pagam", "ginga", "pinta", "poder", "útero", "pilha",
    "sarar", "fruta"
];

const wordListSemAcento = wordList.map(removerAcentos);

let words = [];
let wordsSemAcento = [];

window.onload = () => {
    selecionarPalavras();
    inicializarJogo();
};

function selecionarPalavras() {
    words = sortearPalavras(4, wordList).map(w => w.toUpperCase());
    wordsSemAcento = words.map(removerAcentos);
    console.log(...words);
}

function sortearPalavras(quantidade, lista) {
    const selecionadas = new Set();
    while (selecionadas.size < quantidade) {
        const palavra = lista[Math.floor(Math.random() * lista.length)];
        selecionadas.add(palavra);
    }
    return Array.from(selecionadas);
}

function removerAcentos(str) {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function inicializarJogo() {
    for (let jogo = 1; jogo <= 4; jogo++) {
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                let tile = document.createElement("span");
                tile.id = `jogo${jogo}-${r}-${c}`;
                tile.classList.add("tile");
                tile.innerText = "";
                document.getElementById(`jogo${jogo}`).appendChild(tile);
            }
        }
    }

    let keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", " "],
        ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
    ];

    for (let i = 0; i < keyboard.length; i++) {
        let currRow = keyboard[i];
        let keyboardRow = document.createElement("div");
        keyboardRow.classList.add("keyboard-row");

        for (let j = 0; j < currRow.length; j++) {
            let keyTile = document.createElement("div");
            let key = currRow[j];

            keyTile.innerText = key;
            if (key == "Enter") {
                keyTile.id = "Enter";
            } else if (key == "⌫") {
                keyTile.id = "Backspace";
            } else if ("A" <= key && key <= "Z") {
                keyTile.id = "Key" + key;
            }

            keyTile.addEventListener("click", processKey);

            keyTile.classList.add(key == "Enter" ? "enter-key-tile" : "key-tile");
            keyboardRow.appendChild(keyTile);
        }
        document.body.appendChild(keyboardRow);
    }

    document.addEventListener("keyup", (e) => {
        processInput(e);
    });
}

function processKey() {
    let e = { "code": this.id };
    processInput(e);
}

let tentativa = "";

function processInput(e) {
    if (gameOver) return;

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (col < width) {
            for (let i = 0; i < 4; i++) {
                if (!gameOverStatus[i]) {
                    let tile = document.getElementById(`jogo${i + 1}-${row}-${col}`);
                    if (tile.innerText == "") {
                        tile.innerText = e.code[3];
                    }
                }
            }
            tentativa += e.code[3];
            col++;
        }
    } else if (e.code == "Backspace") {
        if (col > 0) {
            col--;
            for (let i = 0; i < 4; i++) {
                if (!gameOverStatus[i]) {
                    let tile = document.getElementById(`jogo${i + 1}-${row}-${col}`);
                    tile.innerText = "";
                }
            }
            tentativa = tentativa.slice(0, -1);
        }
    } else if (e.code == "Enter") {
        if (tentativa.length === width) {
            update(tentativa);
            tentativa = "";
            col = 0;
            row++;
        }
    }

    if (!gameOver && row === height) {
        gameOver = true;
        document.getElementById("resposta").innerText = "Palavras: " + words.join(", ");
    }
}

function processarTabuleiro(index, tentativa) {
    if (gameOverStatus[index]) return;

    const palavra = wordsSemAcento[index];
    const prefixo = `jogo${index + 1}`;
    let correto = 0;
    let letterCount = {};

    for (let i = 0; i < palavra.length; i++) {
        let letra = palavra[i];
        letterCount[letra] = (letterCount[letra] || 0) + 1;
    }

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(`${prefixo}-${row}-${c}`);
        let letra = currTile.innerText;

        if (palavra[c] === letra) {
            currTile.classList.add("correto");
            correto++;
            letterCount[letra]--;

            let keyTile = document.getElementById("Key" + letra);
            keyTile.classList.remove("contem");
            keyTile.classList.add("correto");
        }
    }

    if (correto === width) gameOverStatus[index] = true;

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(`${prefixo}-${row}-${c}`);
        let letra = currTile.innerText;
        if (!currTile.classList.contains("correto")) {
            if (palavra.includes(letra) && letterCount[letra] > 0) {
                currTile.classList.add("contem");
                let keyTile = document.getElementById("Key" + letra);
                if (!keyTile.classList.contains("correto")) {
                    keyTile.classList.add("contem");
                }
                letterCount[letra]--;
            } else {
                currTile.classList.add("errado");
                let keyTile = document.getElementById("Key" + letra);
                keyTile.classList.add("errado");
            }
        }
    }

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(`${prefixo}-${row}-${c}`);
        currTile.innerText = tentativa[c].toUpperCase();
    }
}

function update(tentativa) {
    document.getElementById("resposta").innerText = "";

    tentativa = tentativa.toLowerCase();
    if (!wordListSemAcento.includes(tentativa)) {
        document.getElementById("resposta").innerText = "Palavra não aceita";
        return;
    }

    for (let i = 0; i < 4; i++) {
        processarTabuleiro(i, tentativa);
    }

    if (gameOverStatus.every(Boolean)) {
        gameOver = true;
        document.getElementById("resposta").innerText = "Palavras: " + words.join(", ");
    }
}
