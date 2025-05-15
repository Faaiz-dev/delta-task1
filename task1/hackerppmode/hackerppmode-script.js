const score = {
    Red: 0,
    Blue: 0
};

let playerColors = {
    red: "#ff0000",
    blue: "#0000ff"
};

let boardSettings = {
    layers: 3,
    edges: 6
};

const { layers, edges } = boardSettings;

let overallTimer = 600;
let moveTimer = 10;
let intervalId = null;
let playerMove = "red";
let isMobile = window.innerWidth <= 768;
let titanCount = [edges - 2, edges - 2];
let totalNodes = edges * layers;
let gameState = Array(totalNodes + 1).fill(0);
let moveHistory = [];
let removedItems = [];
let lastMove = "";
let scoredEdges = {};
const weight = [9, 8, 8, 9, 8, 8, 4, 5, 6, 4, 5, 6, 3, 2, 1, 2, 1, 1];
const turn = [1, 0];
const move = [0, 0];
const selectedNode = [0, 0];
let round = 0;

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const centerContent = document.getElementById('center-content');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        sidebarToggle.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) {
            sidebarToggle.textContent = '▶';
        } else {
            sidebarToggle.textContent = '◀';
        }
    });

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-btn');
    const overlay = document.getElementById('overlay');
    const mainContainer = document.getElementById('main-container');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('show');
            overlay.classList.add('show');
            mainContainer.classList.add('blurred');
        });
    }

    document.getElementById('red-color').addEventListener('input', (e) => {
        playerColors.red = e.target.value;
        colorender();
    });

    document.getElementById('blue-color').addEventListener('input', (e) => {
        playerColors.blue = e.target.value;
        colorender();
    });

    document.getElementById("board-shape").addEventListener("change", (e) => {
        boardSettings.edges = parseInt(e.target.value);
        resetBoard();
    });

    document.getElementById("board-layers").addEventListener("input", (e) => {
        boardSettings.layers = parseInt(e.target.value);
        resetBoard();
    });

    function closeModal() {
        settingsModal.classList.remove('show');
        overlay.classList.remove('show');
        mainContainer.classList.remove('blurred');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', () => {
            const isSoundOn = soundToggle.checked;
            document.querySelectorAll('audio').forEach(audio => {
                audio.muted = !isSoundOn;
            });
        });
    }

    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            document.body.className = themeSelect.value;
        });
    }

    const timerToggle = document.getElementById('timer-toggle');
    if (timerToggle) {
        timerToggle.addEventListener('change', () => {
            const isTimerVisible = timerToggle.checked;
            const timers = document.querySelectorAll('.overall-timer, .move-timer');
            timers.forEach(timer => {
                timer.style.display = isTimerVisible ? 'block' : 'none';
            });
        });
    }

    requestAnimationFrame(() => {
        updateBoard();
        renderScore();
        console.log('Initial window width:', window.innerWidth);
    });
});

function isResume() {
    const pausebtn = document.getElementById("pause-button");
    if (pausebtn.classList.contains("pause")) {
        startTimer();
        pausebtn.classList.remove("pause");
        pausebtn.innerHTML = "Pause";
        Unlock();
    } else {
        clearInterval(intervalId);
        pausebtn.classList.add("pause");
        pausebtn.innerHTML = "Resume";
        Unlock();
    }
}

function renderScore() {
    const redMovesHis = document.querySelector(".red-move-history");
    const blueMovesHis = document.querySelector(".blue-move-history");
    document.querySelector(".display-score").innerHTML = `<p>Red: ${score.Red}  Blue: ${score.Blue}</p>`;
    const redMoves = moveHistory.filter(move => move[0] === "R" || move[0] === "xB");
    const blueMoves = moveHistory.filter(move => move[0] === "B" || move[0] === "xR");
    redMovesHis.innerHTML = isMobile ? redMoves.join(', ') : redMoves.map(move => `<div>${move}</div>`).join('');
    blueMovesHis.innerHTML = isMobile ? blueMoves.join(', ') : blueMoves.map(move => `<div>${move}</div>`).join('');
    redMovesHis.style.color = playerColors["red"];
    blueMovesHis.style.color = playerColors["blue"];
}
renderScore();
titanCounter();

function titanCounter() {
    const redTitans = document.querySelector(".red-titan-count");
    const blueTitans = document.querySelector(".blue-titan-count");
    redTitans.style.color = playerColors["red"];
    blueTitans.style.color = playerColors["blue"];
    if (!redTitans || !blueTitans) {
        return;
    }
    titanCount[0] = boardSettings.edges - 2 - gameState.filter(item => item === 1).length;
    titanCount[1] = boardSettings.edges - 2 - gameState.filter(item => item === 2).length;
    redTitans.innerHTML = `Titans-${titanCount[0]}`;
    blueTitans.innerHTML = `Titans-${titanCount[1]}`;
}

function playMoveAudio() {
    const audio1 = document.getElementById("move");
    audio1.play();
}

function playCreateAudio() {
    const audio2 = document.getElementById("create");
    audio2.play();
}

function playIllegalAudio() {
    const audio3 = document.getElementById("illegal");
    audio3.play();
}

function playCaptureAudio() {
    const audio4 = document.getElementById("eliminate");
    audio4.play();
}

function updateTimer(playerMove, time) {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    document.querySelector(".overall-timer").innerHTML = `${mins}:${secs}`;
    const moveTimeEle = document.querySelector(".move-timer");
    moveTimeEle.style.backgroundColor = playerColors[`${playerMove}`];
    moveTimeEle.innerHTML = moveTimer;
    if (mins === 0 && secs === 0) {
        if (score.Red > score.Blue) {
            alert("Red won!");
        } else if (score.Red < score.Blue) {
            alert("Blue won!");
        } else {
            alert("Match drawn");
        }
        location.reload();
    } else if (moveTimer === 0 && playerMove === "red") {
        alert("Blue won!");
        location.reload();
    } else if (moveTimer === 0 && playerMove === "blue") {
        alert("Red won!");
        location.reload();
    }
}

function startTimer() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        if (playerMove === "red") {
            moveTimer--;
            overallTimer--;
            updateTimer("red", overallTimer);
        } else if (playerMove === "blue") {
            moveTimer--;
            overallTimer--;
            updateTimer("blue", overallTimer);
        }
    }, 1000);
}

function undo() {
    if (moveHistory.length === 0) return;
    lastMove = moveHistory.pop();
    removedItems.push(lastMove);
    const [player, from, to] = lastMove;
    gameState[to] = 0;
    if (from === 0) {
        if (player === "R") titanCount[0]++;
        else titanCount[1]++;
    } else {
        gameState[from] = player === "R" ? 1 : 2;
        moveHighlight(Node[from], Node[to], player === "R" ? "red" : "blue", () => {
            colorender();
        });
    }

    if (player === "R") {
        turn[0] = 1;
        turn[1] = 0;
        playerMove = "red";
        moveTimer = 10;
    } else {
        turn[0] = 0;
        turn[1] = 1;
        playerMove = "blue";
        moveTimer = 10;
    }

    selectedNode[0] = 0;
    selectedNode[1] = 0;
    Unlock();
    console.log(lastMove);
    console.log(unlock);
    updateScore();
    renderScore();
    titanCounter();
    round--;
    if (from === 0) colorender();
    startTimer();
}

function redo() {
    if (removedItems.length === 0) return;
    const moveToRedo = removedItems.pop();
    moveHistory.push(moveToRedo);
    const player = moveToRedo[0].toUpperCase();
    const from = moveToRedo[1];
    const to = moveToRedo[2];

    if (from === 0) {
        gameState[to] = player === "R" ? 1 : 2;
        if (player === "R") titanCount[0]--;
        else titanCount[1]--;
    } else {
        gameState[from] = 0;
        gameState[to] = player === "R" ? 1 : 2;
        moveHighlight(Node[from], Node[to], player === "R" ? "red" : "blue", () => {
            colorender();
        });
    }

    if (player === "R") {
        turn[0] = 0;
        turn[1] = 1;
        playerMove = "blue";
        moveTimer = 10;
    } else {
        turn[0] = 1;
        turn[1] = 0;
        playerMove = "red";
        moveTimer = 10;
    }
    Unlock();
    updateScore();
    renderScore();
    titanCounter();
    round++;
    if (from === 0) colorender();
    startTimer();
}

const hex = document.getElementById("hex");
let k = 1;
let Node = [];

function updateBoard() {
    unlock = Array(layers + 1).fill(0);
    const hexContainer = hex.getBoundingClientRect();
    const containerWidth = hexContainer.width;
    const containerHeight = hexContainer.height;
    if (containerWidth <= 0 || containerHeight <= 0) {
        setTimeout(updateBoard, 10);
        return;
    }
    const baseRadius = Math.min(containerWidth, containerHeight) * 0.4;
    const r = Array.from({ length: boardSettings.layers }, (_, i) => baseRadius * 0.3 * (i + 1));
    const yCentre = containerHeight / 2;
    const xCentre = containerWidth / 2;
    const xOffset = 5;
    const yOffset = -35;
    const scaleOffset = isMobile ? 0.25 : 0.02;

    k = 1;
    Node = [];
    const nodes = document.querySelectorAll('.node');
    if (nodes.length === 0 || nodes.length !== boardSettings.layers * boardSettings.edges) {
        hex.innerHTML = '';
        const highlight = document.createElement('div');
        highlight.className = "highlight";
        hex.appendChild(highlight);
        for (let i = 0; i < boardSettings.layers; i++) {
            for (let j = 0; j < boardSettings.edges; j++) {
                const angle = (Math.PI / 180) * (360 / boardSettings.edges) * j;
                let x = xCentre + r[i] * Math.cos(angle) * (1 + scaleOffset) + xOffset;
                let y = yCentre + r[i] * Math.sin(angle) * (1 + scaleOffset) + yOffset;
                x = Math.round(x);
                y = Math.round(y);
                const node = document.createElement('button');
                node.className = "node";
                node.id = k;
                node.innerText = `${k}`;
                node.style.left = `${(x / containerWidth) * 100}%`;
                node.style.top = `${(y / containerHeight) * 100}%`;
                node.value = k;
                node.addEventListener("click", moveTrack);
                hex.appendChild(node);
                Node[k] = [x, y];
                k++;
            }
        }
    } else {
        k = 1;
        for (let i = 0; i < boardSettings.layers; i++) {
            for (let j = 0; j < boardSettings.edges; j++) {
                const angle = (Math.PI / 180) * (360 / boardSettings.edges) * j;
                let x = xCentre + r[i] * Math.cos(angle) * (1 + scaleOffset) + xOffset;
                let y = yCentre + r[i] * Math.sin(angle) * (1 + scaleOffset) + yOffset;
                x = Math.round(x);
                y = Math.round(y);
                nodes[k - 1].style.left = `${(x / containerWidth) * 100}%`;
                nodes[k - 1].style.top = `${(y / containerHeight) * 100}%`;
                Node[k] = [x, y];
                k++;
            }
        }
    }

    const lines = document.querySelectorAll('.hex-container > div:not(.highlight)');
    const labels = document.querySelectorAll('.p');
    let lineIndex = 0;
    let labelIndex = 0;
    for (let i = 0; i < boardSettings.layers; i++) {
        for (let j = 0; j < boardSettings.edges; j++) {
            const k = i * boardSettings.edges + j + 1;
            if (k % boardSettings.edges !== 0) {
                const x1 = Node[k][0] + 12;
                const y1 = Node[k][1] + 9;
                const x2 = Node[k + 1][0] + 12;
                const y2 = Node[k + 1][1] + 9;
                const xa = (x1 + x2) / 2;
                const ya = (y1 + y2) / 2;
                const offsetDistance = 15;
                const dxLabel = xCentre - xa;
                const dyLabel = yCentre - ya;
                const lengthLabel = Math.sqrt(dxLabel * dxLabel + dyLabel * dyLabel) || 1;
                const xLabelOffset = (dxLabel / lengthLabel) * offsetDistance;
                const yLabelOffset = (dyLabel / lengthLabel) * offsetDistance;

                if (labelIndex < labels.length) {
                    labels[labelIndex].style.left = `${((xa + xLabelOffset) / containerWidth) * 100}%`;
                    labels[labelIndex].style.top = `${((ya + yLabelOffset) / containerHeight) * 100}%`;
                } else {
                    const p = document.createElement('p');
                    p.className = "p";
                    p.style.left = `${((xa + xLabelOffset) / containerWidth) * 100}%`;
                    p.style.top = `${((ya + yLabelOffset) / containerHeight) * 100}%`;
                    p.style.fontSize = "16px";
                    p.style.color = "white";
                    p.style.margin = "0";
                    p.style.transform = "translate(-50%, -50%)";
                    p.style.textShadow = "0px 0px 2px rgba(0,0,0,0.8)";
                    p.innerText = weight[k - 1] || "1";
                    hex.appendChild(p);
                }
                labelIndex++;
                drawLine(x1, y1, x2, y2, lineIndex, lines, containerWidth, containerHeight, "3px");
                lineIndex++;
            }
            if (k % boardSettings.edges === 0) {
                const x1 = Node[k][0] + 12;
                const y1 = Node[k][1] + 9;
                const x2 = Node[k - boardSettings.edges + 1][0] + 12;
                const y2 = Node[k - boardSettings.edges + 1][1] + 9;
                const xa = (x1 + x2) / 2;
                const ya = (y1 + y2) / 2;
                const offsetDistance = 15;
                const dxLabel = xCentre - xa;
                const dyLabel = yCentre - ya;
                const lengthLabel = Math.sqrt(dxLabel * dxLabel + dyLabel * dyLabel) || 1;
                const xLabelOffset = (dxLabel / lengthLabel) * offsetDistance;
                const yLabelOffset = (dyLabel / lengthLabel) * offsetDistance;

                if (labelIndex < labels.length) {
                    labels[labelIndex].style.left = `${((xa + xLabelOffset) / containerWidth) * 100}%`;
                    labels[labelIndex].style.top = `${((ya + yLabelOffset) / containerHeight) * 100}%`;
                } else {
                    const p = document.createElement('p');
                    p.className = "p";
                    p.style.left = `${((xa + xLabelOffset) / containerWidth) * 100}%`;
                    p.style.top = `${((ya + yLabelOffset) / containerHeight) * 100}%`;
                    p.style.fontSize = "16px";
                    p.style.color = "white";
                    p.style.margin = "0";
                    p.style.transform = "translate(-50%, -50%)";
                    p.style.textShadow = "0px 0px 2px rgba(0,0,0,0.8)";
                    p.innerText = weight[k - 1] || "1";
                    hex.appendChild(p);
                }
                labelIndex++;
                drawLine(x1, y1, x2, y2, lineIndex, lines, containerWidth, containerHeight, "3px");
                lineIndex++;
            }
            
            if (i < boardSettings.layers - 1) {
                const nextLayerNode = k + boardSettings.edges;
                if (k % 2 !== (i % 2)) { 
                    const x1 = Node[k][0] + 12;
                    const y1 = Node[k][1] + 9;
                    const x2 = Node[nextLayerNode][0] + 12;
                    const y2 = Node[nextLayerNode][1] + 9;
                    const xa = (x1 + x2) / 2;
                    const ya = (y1 + y2) / 2;
                    const offsetDistance = 15;
                    const dxLabel = xCentre - xa;
                    const dyLabel = yCentre - ya;
                    const lengthLabel = Math.sqrt(dxLabel * dxLabel + dyLabel * dyLabel) || 1;
                    const xLabelOffset = (dxLabel / lengthLabel) * offsetDistance;
                    const yLabelOffset = (dyLabel / lengthLabel) * offsetDistance;

                    if (labelIndex < labels.length) {
                        labels[labelIndex].style.left = `${((xa + xLabelOffset) / containerWidth) * 100}%`;
                        labels[labelIndex].style.top = `${((ya + yLabelOffset + 10) / containerHeight) * 100}%`;
                    } else {
                        const p = document.createElement('p');
                        p.className = "p";
                        p.style.left = `${((xa + xLabelOffset) / containerWidth) * 100}%`;
                        p.style.top = `${((ya + yLabelOffset + 10) / containerHeight) * 100}%`;
                        p.style.fontSize = "16px";
                        p.style.color = "white";
                        p.style.margin = "0";
                        p.style.transform = "translate(-50%, -50%)";
                        p.style.textShadow = "0px 0px 2px rgba(0,0,0,0.8)";
                        p.innerText = "1";
                        hex.appendChild(p);
                    }
                    labelIndex++;
                    drawLine(x1, y1, x2, y2, lineIndex, lines, containerWidth, containerHeight, "2px");
                    lineIndex++;
                }
            }
        }
    }
}

function drawLine(x1, y1, x2, y2, index, lines, containerWidth, containerHeight, lineHeight) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (index < lines.length) {
        lines[index].style.left = `${(x1 / containerWidth) * 100}%`;
        lines[index].style.top = `${(y1 / containerHeight) * 100}%`;
        lines[index].style.width = `${(length / containerWidth) * 100}%`;
        lines[index].style.transform = `rotate(${angle}deg)`;
    } else {
        const line = document.createElement("div");
        line.style.position = "absolute";
        line.style.left = `${(x1 / containerWidth) * 100}%`;
        line.style.top = `${(y1 / containerHeight) * 100}%`;
        line.style.width = `${(length / containerWidth) * 100}%`;
        line.style.height = lineHeight;
        line.style.backgroundColor = "white";
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = "0 0";
        line.style.filter = "drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))";
        hex.appendChild(line);
    }
}

function resetBoard() {
    totalNodes = boardSettings.edges * boardSettings.layers;
    gameState = Array(totalNodes + 1).fill(0);
    console.log("gameState", gameState);
    score.Red = 0;
    score.Blue = 0;
    gameState.fill(0);
    moveHistory = [];
    removedItems = [];
    lastMove = "";
    scoredEdges = {};
    turn[0] = 1;
    turn[1] = 0;
    playerMove = "red";
    moveTimer = 10;
    overallTimer = 600;
    titanCount = [4, 4];
    unlock.fill(0);
    unlock[0] = 1;
    selectedNode.fill(0);
    round = 0;

    updateBoard();
    renderScore();
    titanCounter();
}

window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimeout);
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        renderScore();
    }
    window.resizeTimeout = setTimeout(() => {
        updateBoard();
        renderScore();
    }, 100);
});

function updateScore() {
    let scoreRed = 0;
    let scoreBlue = 0;
    scoredEdges = {};

    for (let layer = 0; layer < boardSettings.layers; layer++) {
        const layerStart = layer * boardSettings.edges + 1;
        const layerEnd = layerStart + boardSettings.edges - 1;
        for (let i = layerStart; i < layerEnd; i++) {
            if (gameState[i] !== 0 && gameState[i + 1] !== 0 && gameState[i] === gameState[i + 1]) {
                const key = `${i}-${i + 1}`;
                if (!scoredEdges[key]) {
                    gameState[i] === 1 ? scoreRed += weight[i - 1] : scoreBlue += weight[i - 1];
                    scoredEdges[key] = true;
                }
            }
        }
        if (gameState[layerEnd] !== 0 && gameState[layerStart] !== 0 && gameState[layerEnd] === gameState[layerStart]) {
            const key = `${layerEnd}-${layerStart}`;
            if (!scoredEdges[key]) {
                gameState[layerEnd] === 1 ? scoreRed += weight[layerEnd - 1] : scoreBlue += weight[layerEnd - 1];
                scoredEdges[key] = true;
            }
        }
    }

    for (let layer = 0; layer < boardSettings.layers - 1; layer++) {
        const currentLayerStart = layer * boardSettings.edges + 1;
        const nextLayerStart = (layer + 1) * boardSettings.edges + 1;
        for (let i = 0; i < boardSettings.edges; i++) {
            const currentNode = currentLayerStart + i;
            const nextNode = nextLayerStart + i;
            if ((currentNode % 2 !== (layer % 2)) && gameState[currentNode] !== 0 && gameState[nextNode] !== 0 && gameState[currentNode] === gameState[nextNode]) {
                const key = `${currentNode}-${nextNode}`;
                if (!scoredEdges[key]) {
                    gameState[currentNode] === 1 ? scoreRed += 1 : scoreBlue += 1;
                    scoredEdges[key] = true;
                }
            }
        }
    }

    score.Red = scoreRed;
    score.Blue = scoreBlue;
    renderScore();
    titanCounter();
}

function Unlock() {
    unlock[0] = 1;
    let edges = boardSettings.edges;
    let layers = boardSettings.layers;
    for (let i = 1; i <= layers; i++) {
        if (!gameState.slice((edges * layers - edges + 1) - edges * (i - 1), (edges * layers + 1) - edges * (i - 1)).includes(0)) {
            unlock[i] = 1;
        }
    }
    console.log(unlock);
}

function performMove(from, to, isElim) {
    if (!isElim) {
        if (gameState[to] === 0) {
            gameState[to] = gameState[from];
            gameState[from] = 0;
            playMoveAudio();
            lastMove = [gameState[to] === 1 ? "R" : "B", from, to];
            removedItems = [];
            moveHistory.push(lastMove);
            moveHighlight(Node[from], Node[to], gameState[to] === 1 ? "red" : "blue");
            if (gameState[to] === 1) {
                turn[0] = 0;
                turn[1] = 1;
                playerMove = "blue";
                moveTimer = 10;
            } else {
                turn[0] = 1;
                turn[1] = 0;
                playerMove = "red";
                moveTimer = 10;
            }
            round++;
            return true;
        } else {
            playIllegalAudio();
            return false;
        }
    } else {
        if (gameState[to] === 0) {
            gameState[to] = gameState[from];
            gameState[from] = 0;
            playCaptureAudio();
            lastMove = [gameState[to] === 1 ? "xR" : "xB", from, to];
            removedItems = [];
            moveHistory.push(lastMove);
            moveHighlight(Node[from], Node[to], gameState[to] === 1 ? "red" : "blue");
            if (gameState[to] === 1) {
                turn[0] = 0;
                turn[1] = 1;
                playerMove = "blue";
                moveTimer = 10;
            } else {
                turn[0] = 1;
                turn[1] = 0;
                playerMove = "red";
                moveTimer = 10;
            }
            round++;
            return true;
        } else {
            playIllegalAudio();
            return false;
        }
    }
}

function Move(from, to) {
    let o = 0;
    from = Number(from);
    to = Number(to);
    let edges = boardSettings.edges;
    let layers = boardSettings.layers;
    console.log(`Moving from Node[${from}] = ${JSON.stringify(Node[from])} to Node[${to}] = ${JSON.stringify(Node[to])}`);
    if (from % edges == 0) {
        if (edges % 2 == 0) {
            if ((from / edges) % 2 == 0) {
                if (from == to + edges - 1 || from == to + 1 || from == to - edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            } else {
                if (from == to + edges - 1 || from == to + 1 || from == to + edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            }
        } else {
            if (from == to + edges - 1 || from == to + 1 || from == to - edges || from == to + edges) {
                o = performMove(from, to, false) ? 1 : 0;
            }
        }
    } else if (from % edges != 0) {
        let layernumber = Math.floor(from / (edges + 0.1)) + 1;
        if (edges % 2 == 0) {
            if ((from - 1) % edges === 0 && ((from - 1) / edges) % 2 == 0) {
                if (to == from + edges - 1 || to == from + 1 || to == from + edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            } else if ((from - 1) % edges === 0 && ((from - 1) / edges) % 2 != 0) {
                if (to == from + edges - 1 || to == from + 1 || to == from - edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            } else if (layernumber % 2 != 0 && from % 2 != 0) {
                if (to == from - 1 || to == from + 1 || to == from + edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            } else if (layernumber % 2 == 0 && from % 2 != 0) {
                if (to == from - 1 || to == from + 1 || to == from - edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            } else if (layernumber % 2 == 0 && from % 2 == 0) {
                if (to == from - 1 || to == from + 1 || to == from + edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            } else if (layernumber % 2 != 0 && from % 2 == 0) {
                if (to == from - 1 || to == from + 1 || to == from - edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            }
        } else {
            if ((from - 1) % edges === 0) {
                if (to == from + edges - 1 || to == from + 1 || to == from + edges || to == from - edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            } else if (from % 2 != 0 && layernumber % 2 != 0) {
                if (to == from - 1 || to == from + 1 || to == from + edges || to == from - edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            } else if (from % 2 == 0 && layernumber % 2 == 0) {
                if (to == from - 1 || to == from + 1 || to == from + edges || to == from - edges) {
                    o = performMove(from, to, false) ? 1 : 0;
                }
            }
        }
    }
    if (o === 1) {
        Unlock();
        updateScore();
        renderScore();
        titanCounter();
        startTimer();
    } else {
        return false;
    }
}

const hexContainer = document.getElementById("hex");
const highlight = document.createElement('div');
highlight.className = "highlight";
hexContainer.appendChild(highlight);

function moveHighlight(p, q, color, callback) {
    const highlight = document.querySelector('.highlight');
    const hexContainer = hex.getBoundingClientRect();
    const containerWidth = hexContainer.width;
    const containerHeight = hexContainer.height;

    const nodeOffsetX = 12;
    const nodeOffsetY = 9;

    highlight.style.transition = 'none';
    highlight.style.left = `${((p[0] + nodeOffsetX) / containerWidth) * 100}%`;
    highlight.style.top = `${((p[1] + nodeOffsetY) / containerHeight) * 100}%`;
    highlight.style.opacity = '0';
    highlight.style.backgroundColor = playerColors[color];

    void highlight.offsetWidth;

    highlight.style.transition = 'left 0.5s ease-in-out, top 0.5s ease-in-out, opacity 0.5s ease-in-out';
    highlight.style.left = `${((q[0] + nodeOffsetX) / containerWidth) * 100}%`;
    highlight.style.top = `${((q[1] + nodeOffsetY) / containerHeight) * 100}%`;
    highlight.style.opacity = '0.8';

    setTimeout(() => {
        highlight.style.transition = 'opacity 0.2s ease-in-out';
        highlight.style.opacity = '0';
        if (callback) callback();
        Change();
        setTimeout(() => {
            highlight.style.transition = 'none';
            highlight.style.left = '0px';
            highlight.style.top = '0px';
        }, 200);
    }, 500);
}

function Change() {
    updateScore();
    colorender();
    Unlock();
    if (unlock[3] === 1) {
        if (score.Red > score.Blue) {
            alert("Red Wins");
            location.reload();
        } else if (score.Red === score.Blue) {
            alert("Match Drawn");
            location.reload();
        } else {
            alert("Blue Wins");
            location.reload();
        }
    }
}

function createTitan(id) {
    const button = document.getElementById(id);
    button.style.backgroundColor = playerColors[playerMove];
    if (playerMove === 'red') {
        gameState[id] = 1;
        lastMove = ["R", 0, id];
        titanCount[0]--;
        playCreateAudio();
    }
    if (playerMove === 'blue') {
        gameState[id] = 2;
        lastMove = ["B", 0, id];
        titanCount[1]--;
        playCreateAudio();
    }
    removedItems = [];
    moveHistory.push(lastMove);
    round++;
}

function moveTrack(event) {
    const pauseBtn = document.getElementById("pause-button");
    if (pauseBtn.classList.contains("pause")) {
        playIllegalAudio();
        return;
    }

    const id = Number(event.target.value);
    const isRedTurn = turn[0] === 1;
    const isBlueTurn = turn[1] === 1;
    const unlocked = unlock[Math.floor(boardSettings.layers - (event.target.value / (boardSettings.edges + 0.1)))] == 1;

    if (isRedTurn) {
        if (selectedNode[0] === 0) {
            if (gameState[id] === 0 && unlocked) {
                if (titanCount[0] <= 0) playIllegalAudio();
                else {
                    createTitan(id);
                    turn[0] = 0;
                    turn[1] = 1;
                    playerMove = "blue";
                    moveTimer = 10;
                    selectedNode[0] = 0;
                    startTimer();
                    Change();
                }
            } else if (gameState[id] === 1) {
                selectedNode[0] = id;
            } else playIllegalAudio();
        } else {
            if (unlocked && Move(selectedNode[0], id)) {
                selectedNode[0] = 0;
            } else {
                selectedNode[0] = 0;
                if (!unlocked) playIllegalAudio();
            }
        }
    } else if (isBlueTurn) {
        if (selectedNode[1] === 0) {
            if (gameState[id] === 0 && unlocked) {
                if (titanCount[1] <= 0) playIllegalAudio();
                else {
                    createTitan(id);
                    turn[0] = 1;
                    turn[1] = 0;
                    playerMove = "red";
                    moveTimer = 10;
                    selectedNode[1] = 0;
                    startTimer();
                    Change();
                }
            } else if (gameState[id] === 2) {
                selectedNode[1] = id;
            } else playIllegalAudio();
        } else {
            if (unlocked && Move(selectedNode[1], id)) {
                selectedNode[1] = 0;
            } else {
                selectedNode[1] = 0;
                if (!unlocked) playIllegalAudio();
            }
        }
    }
    renderScore();
    titanCounter();
}

function colorender() {
    for (let i = 1; i <= boardSettings.edges * boardSettings.layers; i++) {
        const button = document.getElementById(i);
        if (gameState[i] !== 0) {
            button.style.backgroundColor = gameState[i] === 1 ? playerColors['red'] : playerColors['blue'];
        } else {
            button.style.backgroundColor = '';
        }
    }
}