const score = {
    Red: 0,
    Blue: 0
};

let netTimer = 600;
let moveTimer = 10;
let intervalId = null;
let playerMove = "red";
let isMobile = window.innerWidth <= 768;
let titanCount = [4, 4]; 
const gameState = Array(19).fill(0);
let moveHistory = [];
let removedItems = [];
let lastMove = "";
let scoredEdges = {};
const weight = [9, 8, 8, 9, 8, 8, 4, 5, 6, 4, 5, 6, 3, 2, 1, 2, 1, 1];
const turn = [1, 0];
const move = [0, 0];
const unlock = [0, 0, 1, 0];
const selectedNode = [0, 0];
let round = 0;

// Leaderboard
let history = JSON.parse(localStorage.getItem("scoreHistory")) || [0, 0];
const tr = document.createElement('tr');
const tr1 = document.createElement('tr');
if (history[0] > history[1]) {
    tr.innerHTML = `<td>1</td><td>Red</td><td>${history[0]}</td>`;
    tr1.innerHTML = `<td>2</td><td>Blue</td><td>${history[1]}</td>`;
} else {
    tr.innerHTML = `<td>1</td><td>Blue</td><td>${history[1]}</td>`;
    tr1.innerHTML = `<td>2</td><td>Red</td><td>${history[0]}</td>`;
}
const tbody = document.querySelector('tbody');
tbody.appendChild(tr);
tbody.appendChild(tr1);

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

    const settingsBtn = document.getElementById('leaderboard-btn');
    const settingsModal = document.getElementById('leaderboard-modal');
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
    document.querySelector(".display-score").innerHTML = `<p>Red: ${score.Red}  Blue: ${score.Blue}</p>`;
    const redMoves = moveHistory.filter(move => move[0] === "R" || move[0] === "xB");
    const blueMoves = moveHistory.filter(move => move[0] === "B" || move[0] === "xR");
    const redMovesHis = document.querySelector(".red-move-history");
    const blueMovesHis = document.querySelector(".blue-move-history");
    redMovesHis.style.color = "red";
    blueMovesHis.style.color = "blue";
    redMovesHis.innerHTML = isMobile ? redMoves.join(', ') : redMoves.map(move => `<div>${move}</div>`).join('');
    blueMovesHis.innerHTML = isMobile ? blueMoves.join(', ') : blueMoves.map(move => `<div>${move}</div>`).join('');
}

renderScore();
titanCounter();

function titanCounter() {
    const redTitans = document.querySelector(".red-titan-count");
    const blueTitans = document.querySelector(".blue-titan-count");
    redTitans.style.color = "red";
    blueTitans.style.color = "#87CEEB";
    if (!redTitans || !blueTitans) {
        return;
    }
    titanCount[0] = 4 - gameState.filter(item => item === 1).length;
    titanCount[1] = 4 - gameState.filter(item => item === 2).length;
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
    moveTimeEle.style.backgroundColor = `${playerMove}`;
    moveTimeEle.innerHTML = moveTimer;
    if (mins === 0 && secs === 0) {
        if (score.Red > score.Blue) {
            history[0] += 1;
            localStorage.setItem("scoreHistory", JSON.stringify(history));
            alert("Red won");
            location.reload();
        } else if (score.Red < score.Blue) {
            history[1] += 1;
            localStorage.setItem("scoreHistory", JSON.stringify(history));
            alert("Blue won");
            location.reload();
        } else {
            history[0] += 0.5;
            history[1] += 0.5;
            localStorage.setItem("scoreHistory", JSON.stringify(history));
            alert("Match drawn");
            location.reload();
        }
        location.reload();
    } else if (moveTimer === 0 && playerMove === "red") {
        history[1] += 1;
        localStorage.setItem("scoreHistory", JSON.stringify(history));
        alert("Blue Wins");
        location.reload();
    } else if (moveTimer === 0 && playerMove === "blue") {
        history[0] += 1;
        localStorage.setItem("scoreHistory", JSON.stringify(history));
        alert("Red won");
        location.reload();
    }
}

function startTimer() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        if (playerMove === "red") {
            moveTimer--;
            netTimer--;
            updateTimer("red", netTimer);
        } else if (playerMove === "blue") {
            moveTimer--;
            netTimer--;
            updateTimer("blue", netTimer);
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
    const hexContainer = hex.getBoundingClientRect();
    const containerWidth = hexContainer.width;
    const containerHeight = hexContainer.height;
    if (containerWidth <= 0 || containerHeight <= 0) {
        setTimeout(updateBoard, 10); 
        return;
    }
    const mainRadius = Math.min(containerWidth, containerHeight) * 0.4;
    const ringRadii = [mainRadius * 0.3, mainRadius * 0.6, mainRadius * 0.9];
    const centerXPos = containerWidth / 2;
    const centerYPos = containerHeight / 2;
    const xOffset = 5;  
    const yOffset = -35; 
    const scaleOffset = isMobile ? 0.25 : 0.02;
    
    k = 1;
    Node = [];
    const nodes = document.querySelectorAll('.node');
    if (nodes.length === 0) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI / 180) * 60 * j;
                let x = centerXPos + ringRadii[i] * Math.cos(angle) * (1 + scaleOffset) + xOffset;
                let y = centerYPos + ringRadii[i] * Math.sin(angle) * (1 + scaleOffset) + yOffset;
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
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI / 180) * 60 * j;
                let x = centerXPos + ringRadii[i] * Math.cos(angle) * (1 + scaleOffset) + xOffset;
                let y = centerYPos + ringRadii[i] * Math.sin(angle) * (1 + scaleOffset) + yOffset;
                x = Math.round(x);
                y = Math.round(y);
                nodes[k - 1].style.left = `${(x / containerWidth) * 100}%`;
                nodes[k - 1].style.top = `${(y / containerHeight) * 100}%`;
                Node[k] = [x, y];
                k++;
            }
        }
    }

    const existingLabels = document.querySelectorAll('.p');
    existingLabels.forEach(label => label.remove());

    const lines = document.querySelectorAll('.hex-container > div:not(.highlight)');
    let lineIndex = 0;

    for (let i = 1; i <= 18; i++) {
        // Consecutive edges (i to i+1)
        if (i % 6 !== 0) {
            const x1 = Node[i][0] + 12;
            const y1 = Node[i][1] + 9;
            const x2 = Node[i + 1][0] + 12;
            const y2 = Node[i + 1][1] + 9;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (lineIndex < lines.length) {
                lines[lineIndex].style.left = `${(x1 / containerWidth) * 100}%`;
                lines[lineIndex].style.top = `${(y1 / containerHeight) * 100}%`;
                lines[lineIndex].style.width = `${(length / containerWidth) * 100}%`;
                lines[lineIndex].style.transform = `rotate(${angle}deg)`;
            } else {
                const line = document.createElement("div");
                line.style.position = "absolute";
                line.style.left = `${(x1 / containerWidth) * 100}%`;
                line.style.top = `${(y1 / containerHeight) * 100}%`;
                line.style.width = `${(length / containerWidth) * 100}%`;
                line.style.backgroundColor = "white";
                line.style.filter = "drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))";
                line.style.height = "3px";
                line.style.transform = `rotate(${angle}deg)`;
                line.style.transformOrigin = "0 0";
                hex.appendChild(line);
            }
            lineIndex++;

            // Label for consecutive edge
            const xa = (x1 + x2) / 2;
            const ya = (y1 + y2) / 2;
            const offsetDistance = 15;
            const dxLabel = centerXPos - xa;
            const dyLabel = centerYPos - ya;
            const lengthLabel = Math.sqrt(dxLabel * dxLabel + dyLabel * dyLabel) || 1;
            const xOffset = (dxLabel / lengthLabel) * offsetDistance;
            const yOffset = (dyLabel / lengthLabel) * offsetDistance;

            const label = document.createElement('div');
            label.className = "p";
            label.style.position = "absolute";
            label.style.left = `${((xa + xOffset) / containerWidth) * 100}%`;
            label.style.top = `${((ya + yOffset) / containerHeight) * 100}%`;
            label.style.fontSize = "16px";
            label.style.color = "white";
            label.style.margin = "0";
            label.style.transform = "translate(-50%, -50%)";
            label.style.textShadow = "0px 0px 2px rgba(0,0,0,0.8)";
            label.innerText = weight[i - 1];
            hex.appendChild(label);
        }

        // Radial edges (i to i+6)
        if ([1, 5, 3, 12, 10, 8].includes(i)) {
            const x1 = Node[i][0] + 12;
            const y1 = Node[i][1] + 9;
            const x2 = Node[i + 6][0] + 12;
            const y2 = Node[i + 6][1] + 9;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (lineIndex < lines.length) {
                lines[lineIndex].style.left = `${(x1 / containerWidth) * 100}%`;
                lines[lineIndex].style.top = `${(y1 / containerHeight) * 100}%`;
                lines[lineIndex].style.width = `${(length / containerWidth) * 100}%`;
                lines[lineIndex].style.transform = `rotate(${angle}deg)`;
            } else {
                const line = document.createElement("div");
                line.style.position = "absolute";
                line.style.left = `${(x1 / containerWidth) * 100}%`;
                line.style.top = `${(y1 / containerHeight) * 100}%`;
                line.style.width = `${(length / containerWidth) * 100}%`;
                line.style.filter = "drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))";
                line.style.height = "2px";
                line.style.backgroundColor = "white";
                line.style.transform = `rotate(${angle}deg)`;
                line.style.transformOrigin = "0 0";
                hex.appendChild(line);
            }
            lineIndex++;

            // Label for radial edge
            const xa = (x1 + x2) / 2;
            const ya = (y1 + y2) / 2;
            const offsetDistance = 15;
            const dxLabel = centerXPos - xa;
            const dyLabel = centerYPos - ya;
            const lengthLabel = Math.sqrt(dxLabel * dxLabel + dyLabel * dyLabel) || 1;
            const xOffset = (dxLabel / lengthLabel) * offsetDistance;
            const yOffset = (dyLabel / lengthLabel) * offsetDistance;
            const label = document.createElement('div');
            label.className = "p";
            label.style.position = "absolute";
            label.style.left = `${((xa + xOffset) / containerWidth) * 100}%`;
            label.style.top = `${((ya + yOffset + 10) / containerHeight) * 100}%`;
            label.style.fontSize = "16px";
            label.style.color = "white";
            label.style.margin = "0";
            label.style.transform = "translate(-50%, -50%)";
            label.style.textShadow = "0px 0px 2px rgba(0,0,0,0.8)";
            label.innerText = "1";
            hex.appendChild(label);
        }

        // Wrap-around edges (i to i-5)
        if (i % 6 === 0) {
            const x1 = Node[i][0] + 12;
            const y1 = Node[i][1] + 9;
            const x2 = Node[i - 5][0] + 12;
            const y2 = Node[i - 5][1] + 9;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (lineIndex < lines.length) {
                lines[lineIndex].style.left = `${(x1 / containerWidth) * 100}%`;
                lines[lineIndex].style.top = `${(y1 / containerHeight) * 100}%`;
                lines[lineIndex].style.width = `${(length / containerWidth) * 100}%`;
                lines[lineIndex].style.transform = `rotate(${angle}deg)`;
            } else {
                const line = document.createElement("div");
                line.style.position = "absolute";
                line.style.left = `${(x1 / containerWidth) * 100}%`;
                line.style.top = `${(y1 / containerHeight) * 100}%`;
                line.style.width = `${(length / containerWidth) * 100}%`;
                line.style.filter = "drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))";
                line.style.height = "3px";
                line.style.backgroundColor = "white";
                line.style.transform = `rotate(${angle}deg)`;
                line.style.transformOrigin = "0 0";
                hex.appendChild(line);
            }
            lineIndex++;

            // Label for wrap-around edge
            const xa = (x1 + x2) / 2;
            const ya = (y1 + y2) / 2;
            const offsetDistance = 15;
            const dxLabel = centerXPos - xa;
            const dyLabel = centerYPos - ya;
            const lengthLabel = Math.sqrt(dxLabel * dxLabel + dyLabel * dyLabel) || 1;
            const xOffset = (dxLabel / lengthLabel) * offsetDistance;
            const yOffset = (dyLabel / lengthLabel) * offsetDistance;

            const label = document.createElement('div');
            label.className = "p";
            label.style.position = "absolute";
            label.style.left = `${((xa + xOffset) / containerWidth) * 100}%`;
            label.style.top = `${((ya + yOffset) / containerHeight) * 100}%`;
            label.style.fontSize = "16px";
            label.style.color = "white";
            label.style.margin = "0";
            label.style.transform = "translate(-50%, -50%)";
            label.style.textShadow = "0px 0px 2px rgba(0,0,0,0.8)";
            label.innerText = weight[i - 1];
            hex.appendChild(label);
        }
    }
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

document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
        updateBoard();
        renderScore();
        console.log('Initial window width:', window.innerWidth); 
    });
});

function updateScore() {
    let scoreRed = 0;
    let scoreBlue = 0;
    for (let key in scoredEdges) {
        delete scoredEdges[key];
    }
    for (let i = 1; i <= 18; i++) {
        if (gameState[i] !== 0 && gameState[i + 1] !== 0 && gameState[i] === gameState[i + 1] && i % 6 !== 0) {
            const key = `${i}-${i + 1}`;
            if (!scoredEdges[key]) {
                gameState[i] === 1 ? scoreRed += weight[i - 1] : scoreBlue += weight[i - 1];
                scoredEdges[key] = true;
            }
        }
        if ([1, 5, 3, 12, 10, 8].includes(i) && gameState[i] !== 0 && gameState[i + 6] !== 0 && gameState[i] === gameState[i + 6]) {
            const key = `${i}-${i + 6}`;
            if (!scoredEdges[key]) {
                gameState[i] === 1 ? scoreRed += 1 : scoreBlue += 1;
                scoredEdges[key] = true;
            }
        }
        if (i % 6 === 0 && gameState[i] !== 0 && gameState[i - 5] !== 0 && gameState[i] === gameState[i - 5]) {
            const key = `${i}-${i - 5}`;
            if (!scoredEdges[key]) {
                gameState[i] === 1 ? scoreRed += weight[i - 1] : scoreBlue += weight[i - 1];
                scoredEdges[key] = true;
            }
        }
    }
    score.Red = scoreRed;
    score.Blue = scoreBlue;
    renderScore();
    titanCounter(); 
}

function Unlock() {
    if (!gameState.slice(13, 19).includes(0) || !gameState.slice(7, 13).includes(0)) {
        unlock[1] = 1;
    } else if (lastMove[1] === 0 && lastMove[2] >= 13 && !gameState.slice(7, 13).includes(0)) {
        unlock[1] = 0;
    }
    if (!gameState.slice(7, 13).includes(0) || !gameState.slice(1, 7).includes(0)) {
        unlock[0] = 1;
    }
    if (!gameState.slice(1, 7).includes(0)) {
        unlock[3] = 1;
    }
}

function nodeAssign() {
    let empNodeList = [];
    for (let i = 18; i >= 13; i--) {
        if (gameState[i] == 0) {
            empNodeList.push(i);
        }
    }
    const randomNode = empNodeList[Math.floor(Math.random() * empNodeList.length)];
    return randomNode;
}

function titanEliminate() {
    for (let j = 1; j <= 12; j++) {
        if ([10, 8, 5, 3].includes(j)) {
            if (gameState[j] == 1 && gameState[j + 1] == 2 && gameState[j - 1] == 2 && gameState[j + 6] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (gameState[j] == 2 && gameState[j + 1] == 1 && gameState[j - 1] == 1 && gameState[j + 6] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if ([11, 6].includes(j)) {
            if (gameState[j] == 1 && gameState[j + 1] == 2 && gameState[j - 1] == 2 && gameState[j - 6] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (gameState[j] == 2 && gameState[j + 1] == 1 && gameState[j - 1] == 1 && gameState[j - 6] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if (j === 12) {
            if (gameState[j] == 1 && gameState[j + 6] == 2 && gameState[j - 1] == 2 && gameState[j - 5] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (gameState[j] == 2 && gameState[j + 6] == 1 && gameState[j - 1] == 1 && gameState[j - 5] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if ([2, 4].includes(j)) {
            if (gameState[j] == 1 && gameState[j + 1] == 2 && gameState[j - 1] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (gameState[j] == 2 && gameState[j + 1] == 1 && gameState[j - 1] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if (j === 6) {
            if (gameState[j] == 1 && gameState[j - 5] == 2 && gameState[j - 1] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (gameState[j] == 2 && gameState[j - 5] == 1 && gameState[j - 1] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if (j === 1) {
            if (gameState[j] == 1 && gameState[j + 6] == 2 && gameState[j + 1] == 2 && gameState[j + 5] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (gameState[j] == 2 && gameState[j + 6] == 1 && gameState[j + 1] == 1 && gameState[j + 5] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if (j === 7) {
            if (gameState[j] == 1 && gameState[j - 6] == 2 && gameState[j + 1] == 2 && gameState[j + 5] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (gameState[j] == 2 && gameState[j - 6] == 1 && gameState[j + 1] == 1 && gameState[j + 5] == 1) {
                performMove(j, nodeAssign(), true);
            }
        }
    }
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
            titanEliminate();
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
            titanEliminate();
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
    console.log(`Moving from Node[${from}] = ${JSON.stringify(Node[from])} to Node[${to}] = ${JSON.stringify(Node[to])}`);

    if ((from === 12 && to === 18) || (from === 18 && to === 12)) {
        o = performMove(from, to, false) ? 1 : 0;
    } else if (to % 6 === 0) {
        if (from === to - 5 || from === to - 1) {
            o = performMove(from, to, false) ? 1 : 0;
        }
    } else if (from % 6 === 0) {
        if (from === to + 1 || from === to + 5) {
            o = performMove(from, to, false) ? 1 : 0;
        }
    } else if ([1, 3, 5, 8, 10, 12].includes(from)) {
        if (from === to + 1 || from === to - 1 || from === to - 6) {
            o = performMove(from, to, false) ? 1 : 0;
        }
    } else if ([1, 3, 5, 8, 10, 12].includes(to)) {
        if (from === to + 1 || from === to - 1 || from === to + 6) {
            o = performMove(from, to, false) ? 1 : 0;
        }
    } else if (from === to + 1 || from === to - 1) {
        o = performMove(from, to, false) ? 1 : 0;
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

function moveHighlight(p, q, color, callback) { // callback - function to call after animation
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
    highlight.style.backgroundColor = color;

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
            history[0] += 1;
            localStorage.setItem("scoreHistory", JSON.stringify(history));
            alert("Red won");
            location.reload();
        } else if (score.Red === score.Blue) {
            history[0] += 0.5;
            history[1] += 0.5;
            localStorage.setItem("scoreHistory", JSON.stringify(history));
            alert("Match drawn");
            location.reload();
        } else {
            history[1] += 1;
            localStorage.setItem("scoreHistory", JSON.stringify(history));
            alert("Blue Wins");
            location.reload();
        }
    } 
}

function createTitan(id) {
    const button = document.getElementById(id);
    button.style.backgroundColor = playerMove;
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
    titanEliminate();
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
    const unlocked = unlock[Math.floor(id / 6.1)] === 1;

    if (isRedTurn) {
        if (selectedNode[0] === 0) {
            if (gameState[id] === 0 && unlocked) {
                if (titanCount[0] <= 0) playIllegalAudio();
                else if (id >= 1 && id <= 6 && unlock[3] === 1) playIllegalAudio();
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
                else if (id >= 1 && id <= 6 && unlock[3] === 1) playIllegalAudio();
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
    for (let i = 1; i <= 18; i++) {
        const button = document.getElementById(i);
        if (gameState[i] !== 0) {
            button.style.backgroundColor = gameState[i] === 1 ? 'red' : 'blue';
        } else {
            button.style.backgroundColor = '';
        }
    }
}