const score = {
    Red: 0,
    Blue: 0
};

let playerColors = {
    red: "#ff0000",
    blue: "#0000ff"
};

boardSettings = {
    layer: 3,
    edges: 6
};

const { layer, edges } = boardSettings;

let overallTime = 600;
let moveTime = 10;
let intervalId = null;
let currentMove = "red";
let isMobile = window.innerWidth <= 768;
let titan = [4, 4];
const data = Array(19).fill(0);
let moveHistory = [];
let removedItems = [];
let lastMove = "";
let scoredEdges = {};
const weight = [9, 8, 8, 9, 8, 8, 4, 5, 6, 4, 5, 6, 3, 2, 1, 2, 1, 1];
const turn = [1, 0];
const move = [0, 0];
const unlock = [0, 0, 1, 0];
const alreadyClicked = [0, 0];
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

    requestAnimationFrame(updateBoard);
});

document.addEventListener('DOMContentLoaded', () => {
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
    titan[0] = 4 - data.filter(item => item === 1).length;
    titan[1] = 4 - data.filter(item => item === 2).length;
    redTitans.innerHTML = `Titans-${titan[0]}`;
    blueTitans.innerHTML = `Titans-${titan[1]}`;
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

function updateTimer(currentMove, time) {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    document.querySelector(".overall-timer").innerHTML = `${mins}:${secs}`;
    const moveTimeEle = document.querySelector(".move-timer");
    moveTimeEle.style.backgroundColor = playerColors[`${currentMove}`];
    moveTimeEle.innerHTML = moveTime;
    if (mins === 0 && secs === 0) {
        if (score.Red > score.Blue) {
            alert("Red won!");
        } else if (score.Red < score.Blue) {
            alert("Blue won!");
        } else {
            alert("Match drawn");
        }
        location.reload();
    } else if (moveTime === 0 && currentMove === "red") {
        alert("Blue won!");
        location.reload();
    } else if (moveTime === 0 && currentMove === "blue") {
        alert("Red won!");
        location.reload();
    }
}

function startTimer() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        if (currentMove === "red") {
            moveTime--;
            overallTime--;
            updateTimer("red", overallTime);
        } else if (currentMove === "blue") {
            moveTime--;
            overallTime--;
            updateTimer("blue", overallTime);
        }
    }, 1000);
}

function undo() {
    if (moveHistory.length === 0) return;
    lastMove = moveHistory.pop();
    removedItems.push(lastMove);
    const [player, a, b] = lastMove;
    data[b] = 0;
    if (a === 0) {
        if (player === "R") titan[0]++;
        else titan[1]++;
    } else {
        data[a] = player === "R" ? 1 : 2;
        moveHighlight(Node[b], Node[a], player === "R" ? "red" : "blue", () => {
            colorender();
        });
    }

    if (player === "R") {
        turn[0] = 1;
        turn[1] = 0;
        currentMove = "red";
        moveTime = 10;
    } else {
        turn[0] = 0;
        turn[1] = 1;
        currentMove = "blue";
        moveTime = 10;
    }

    alreadyClicked[0] = 0;
    alreadyClicked[1] = 0;
    Unlock();
    console.log(lastMove);
    console.log(unlock);
    updateScore();
    renderScore();
    titanCounter();
    round--;
    if (a === 0) colorender();
    startTimer();
}

function redo() {
    if (removedItems.length === 0) return;
    const moveToRedo = removedItems.pop();
    moveHistory.push(moveToRedo);
    const player = moveToRedo[0].toUpperCase();
    const a = moveToRedo[1];
    const b = moveToRedo[2];

    if (a === 0) {
        data[b] = player === "R" ? 1 : 2;
        if (player === "R") titan[0]--;
        else titan[1]--;
    } else {
        data[a] = 0;
        data[b] = player === "R" ? 1 : 2;
        moveHighlight(Node[a], Node[b], player === "R" ? "red" : "blue", () => {
            colorender();
        });
    }

    if (player === "R") {
        turn[0] = 0;
        turn[1] = 1;
        currentMove = "blue";
        moveTime = 10;
    } else {
        turn[0] = 1;
        turn[1] = 0;
        currentMove = "red";
        moveTime = 10;
    }
    Unlock();
    updateScore();
    renderScore();
    titanCounter();
    round++;
    if (a === 0) colorender();
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
    const baseRadius = Math.min(containerWidth, containerHeight) * 0.4;
    const r = [baseRadius * 0.3, baseRadius * 0.6, baseRadius * 0.9];
    const yCentre = containerHeight / 2;
    const xCentre = containerWidth / 2;
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
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI / 180) * 60 * j;
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
    for (let i = 1; i <= 18; i++) {
        if (i % 6 === 0) {
            const xa = (Node[i][0] + Node[i - 5][0]) / 2;
            const ya = (Node[i][1] + Node[i - 5][1]) / 2;
            if (labelIndex < labels.length) {
                labels[labelIndex].style.left = `${(xa / containerWidth) * 100}%`;
                labels[labelIndex].style.top = `${(ya / containerHeight) * 100}%`;
            } else {
                const p = document.createElement('p');
                p.className = "p";
                p.style.left = `${(xa / containerWidth) * 100}%`;
                p.style.top = `${(ya / containerHeight) * 100}%`;
                p.style.fontSize = "16px";
                p.innerText = weight[i - 1];
                hex.appendChild(p);
            }
            labelIndex++;
        }
        if ([1, 5, 3, 12, 10, 8].includes(i)) {
            const xa = (Node[i][0] + Node[i + 6][0]) / 2;
            const ya = (Node[i][1] + Node[i + 6][1]) / 2;
            if (labelIndex < labels.length) {
                labels[labelIndex].style.left = `${(xa / containerWidth) * 100}%`;
                labels[labelIndex].style.top = `${(ya / containerHeight) * 100}%`;
            } else {
                const p = document.createElement('p');
                p.className = "p";
                p.style.fontSize = "16px";
                p.style.left = `${(xa / containerWidth) * 100}%`;
                p.style.top = `${(ya / containerHeight) * 100}%`;
                p.innerText = "1";
                hex.appendChild(p);
            }
            labelIndex++;
        }
        if (i % 6 !== 0) {
            const xa = (Node[i][0] + Node[i + 1][0]) / 2;
            const ya = (Node[i][1] + Node[i + 1][1]) / 2;
            if (labelIndex < labels.length) {
                labels[labelIndex].style.left = `${(xa / containerWidth) * 100}%`;
                labels[labelIndex].style.top = `${(ya / containerHeight) * 100}%`;
            } else {
                const p = document.createElement('p');
                p.className = "p";
                p.style.left = `${(xa / containerWidth) * 100}%`;
                p.style.top = `${(ya / containerHeight) * 100}%`;
                p.style.fontSize = "16px";
                p.innerText = weight[i - 1];
                hex.appendChild(p);
            }
            labelIndex++;
        }

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
                line.style.height = "4px";
                line.style.backgroundColor = "rgb(37, 31, 31)";
                line.style.transform = `rotate(${angle}deg)`;
                line.style.transformOrigin = "0 0";
                line.style.filter = "drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))";
                hex.appendChild(line);
            }
            lineIndex++;
        }
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
                line.style.height = "4px";
                line.style.backgroundColor = "rgb(37, 31, 31)";
                line.style.filter = "drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))";
                line.style.transform = `rotate(${angle}deg)`;
                line.style.transformOrigin = "0 0";
                hex.appendChild(line);
            }
            lineIndex++;
        }
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
                line.style.height = "4px";
                line.style.backgroundColor = "rgb(37, 31, 31)";
                line.style.filter = "drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))";
                line.style.transform = `rotate(${angle}deg)`;
                line.style.transformOrigin = "0 0";
                hex.appendChild(line);
            }
            lineIndex++;
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
        if (data[i] !== 0 && data[i + 1] !== 0 && data[i] === data[i + 1] && i % 6 !== 0) {
            const key = `${i}-${i + 1}`;
            if (!scoredEdges[key]) {
                data[i] === 1 ? scoreRed += weight[i - 1] : scoreBlue += weight[i - 1];
                scoredEdges[key] = true;
            }
        }
        if ([1, 5, 3, 12, 10, 8].includes(i) && data[i] !== 0 && data[i + 6] !== 0 && data[i] === data[i + 6]) {
            const key = `${i}-${i + 6}`;
            if (!scoredEdges[key]) {
                data[i] === 1 ? scoreRed += 1 : scoreBlue += 1;
                scoredEdges[key] = true;
            }
        }
        if (i % 6 === 0 && data[i] !== 0 && data[i - 5] !== 0 && data[i] === data[i - 5]) {
            const key = `${i}-${i - 5}`;
            if (!scoredEdges[key]) {
                data[i] === 1 ? scoreRed += weight[i - 1] : scoreBlue += weight[i - 1];
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
    if (!data.slice(13, 19).includes(0) || !data.slice(7, 13).includes(0)) {
        unlock[1] = 1;
    } else if (lastMove[1] === 0 && lastMove[2] >= 13 && !data.slice(7, 13).includes(0)) {
        unlock[1] = 0;
    }
    if (!data.slice(7, 13).includes(0) || !data.slice(1, 7).includes(0)) {
        unlock[0] = 1;
    }
    if (!data.slice(1, 7).includes(0)) {
        unlock[3] = 1;
    }
}

function nodeAssign() {
    let empNodeList = [];
    for (let i = 18; i >= 13; i--) {
        if (data[i] == 0) {
            empNodeList.push(i);
        }
    }
    const randomNode = empNodeList[Math.floor(Math.random() * empNodeList.length)];
    return randomNode;
}

function titanEliminate() {
    for (let j = 1; j <= 12; j++) {
        if ([10, 8, 5, 3].includes(j)) {
            if (data[j] == 1 && data[j + 1] == 2 && data[j - 1] == 2 && data[j + 6] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (data[j] == 2 && data[j + 1] == 1 && data[j - 1] == 1 && data[j + 6] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if ([11, 6].includes(j)) {
            if (data[j] == 1 && data[j + 1] == 2 && data[j - 1] == 2 && data[j - 6] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (data[j] == 2 && data[j + 1] == 1 && data[j - 1] == 1 && data[j - 6] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if (j === 12) {
            if (data[j] == 1 && data[j + 6] == 2 && data[j - 1] == 2 && data[j - 5] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (data[j] == 2 && data[j + 6] == 1 && data[j - 1] == 1 && data[j - 5] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if ([2, 4].includes(j)) {
            if (data[j] == 1 && data[j + 1] == 2 && data[j - 1] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (data[j] == 2 && data[j + 1] == 1 && data[j - 1] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if (j === 6) {
            if (data[j] == 1 && data[j - 5] == 2 && data[j - 1] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (data[j] == 2 && data[j - 5] == 1 && data[j - 1] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if (j === 1) {
            if (data[j] == 1 && data[j + 6] == 2 && data[j + 1] == 2 && data[j + 5] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (data[j] == 2 && data[j + 6] == 1 && data[j + 1] == 1 && data[j + 5] == 1) {
                performMove(j, nodeAssign(), true);
            }
        } else if (j === 7) {
            if (data[j] == 1 && data[j - 6] == 2 && data[j + 1] == 2 && data[j + 5] == 2) {
                performMove(j, nodeAssign(), true);
            } else if (data[j] == 2 && data[j - 6] == 1 && data[j + 1] == 1 && data[j + 5] == 1) {
                performMove(j, nodeAssign(), true);
            }
        }
    }
}

function performMove(a, b, isElim) {
    if (!isElim) {
        if (data[b] === 0) {
            data[b] = data[a];
            data[a] = 0;
            playMoveAudio();
            lastMove = [data[b] === 1 ? "R" : "B", a, b];
            removedItems = [];
            moveHistory.push(lastMove);
            moveHighlight(Node[a], Node[b], data[b] === 1 ? "red" : "blue");
            if (data[b] === 1) {
                turn[0] = 0;
                turn[1] = 1;
                currentMove = "blue";
                moveTime = 10;
            } else {
                turn[0] = 1;
                turn[1] = 0;
                currentMove = "red";
                moveTime = 10;
            }
            round++;
            titanEliminate();
            return true;
        } else {
            playIllegalAudio();
            return false;
        }
    } else {
        if (data[b] === 0) {
            data[b] = data[a];
            data[a] = 0;
            playCaptureAudio();
            lastMove = [data[b] === 1 ? "xR" : "xB", a, b];
            removedItems = [];
            moveHistory.push(lastMove);
            moveHighlight(Node[a], Node[b], data[b] === 1 ? "red" : "blue");
            if (data[b] === 1) {
                turn[0] = 0;
                turn[1] = 1;
                currentMove = "blue";
                moveTime = 10;
            } else {
                turn[0] = 1;
                turn[1] = 0;
                currentMove = "red";
                moveTime = 10;
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

function Move(a, b) {
    let o = 0;
    a = Number(a);
    b = Number(b);
    console.log(`Moving from Node[${a}] = ${JSON.stringify(Node[a])} to Node[${b}] = ${JSON.stringify(Node[b])}`);

    if ((a === 12 && b === 18) || (a === 18 && b === 12)) {
        o = performMove(a, b, false) ? 1 : 0;
    } else if (b % 6 === 0) {
        if (a === b - 5 || a === b - 1) {
            o = performMove(a, b, false) ? 1 : 0;
        }
    } else if (a % 6 === 0) {
        if (a === b + 1 || a === b + 5) {
            o = performMove(a, b, false) ? 1 : 0;
        }
    } else if ([1, 3, 5, 8, 10, 12].includes(a)) {
        if (a === b + 1 || a === b - 1 || a === b - 6) {
            o = performMove(a, b, false) ? 1 : 0;
        }
    } else if ([1, 3, 5, 8, 10, 12].includes(b)) {
        if (a === b + 1 || a === b - 1 || a === b + 6) {
            o = performMove(a, b, false) ? 1 : 0;
        }
    } else if (a === b + 1 || a === b - 1) {
        o = performMove(a, b, false) ? 1 : 0;
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
    button.style.backgroundColor = playerColors[currentMove];
    if (currentMove === 'red') {
        data[id] = 1;
        lastMove = ["R", 0, id];
        titan[0]--;
        playCreateAudio();
    }
    if (currentMove === 'blue') {
        data[id] = 2;
        lastMove = ["B", 0, id];
        titan[1]--;
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
        if (alreadyClicked[0] === 0) {
            if (data[id] === 0 && unlocked) {
                if (titan[0] <= 0) playIllegalAudio();
                else if (id >= 1 && id <= 6 && unlock[3] === 1) playIllegalAudio();
                else {
                    createTitan(id);
                    turn[0] = 0;
                    turn[1] = 1;
                    currentMove = "blue";
                    moveTime = 10;
                    alreadyClicked[0] = 0;
                    startTimer();
                    Change();
                }
            } else if (data[id] === 1) {
                alreadyClicked[0] = id;
            } else playIllegalAudio();
        } else {
            if (unlocked && Move(alreadyClicked[0], id)) {
                alreadyClicked[0] = 0;
            } else {
                alreadyClicked[0] = 0;
                if (!unlocked) playIllegalAudio();
            }
        }
    } else if (isBlueTurn) {
        if (alreadyClicked[1] === 0) {
            if (data[id] === 0 && unlocked) {
                if (titan[1] <= 0) playIllegalAudio();
                else if (id >= 1 && id <= 6 && unlock[3] === 1) playIllegalAudio();
                else {
                    createTitan(id);
                    turn[0] = 1;
                    turn[1] = 0;
                    currentMove = "red";
                    moveTime = 10;
                    alreadyClicked[1] = 0;
                    startTimer();
                    Change();
                }
            } else if (data[id] === 2) {
                alreadyClicked[1] = id;
            } else playIllegalAudio();
        } else {
            if (unlocked && Move(alreadyClicked[1], id)) {
                alreadyClicked[1] = 0;
            } else {
                alreadyClicked[1] = 0;
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
        if (data[i] !== 0) {
            button.style.backgroundColor = data[i] === 1 ? playerColors['red'] : playerColors['blue'];
        } else {
            button.style.backgroundColor = '';
        }
    }
}