const score = {
    Red: 0,
    Blue: 0
};

let redTime = 600;
let blueTime = 600;
let intervalId = null;
let currentMove = "red";
let status = true;

function isResume(stat){
    status = stat
    if (status){
        startTimer()
    }
    else{
        clearInterval(intervalId)
    };
}

let moveHistory = [];
let removedItems = [];
let lastMove = "";

function renderScore(){
    document.querySelector(".display-score").innerHTML = `<p>Red: ${score.Red}  Blue: ${score.Blue}</p>`;
    document.querySelector(".displayPlayerMove").innerHTML = `${currentMove} to play`
    document.querySelector(".move-history").innerHTML = moveHistory
}
renderScore();



function updateTimer(currentMove,time){
  const mins = Math.floor(time/60);
  const secs = Math.floor(time%60);
  document.querySelector(`.${currentMove}-timer`).innerHTML = `${currentMove}: ${mins}:${secs}`;
  if(mins==0 && secs ==0){
    currentMove === "red"? alert("Blue won!") : alert("Red won!")
    location.reload()
  }
}

function startTimer(){
  clearInterval(intervalId);
  intervalId = setInterval(() => {
  if(currentMove === "red" &&  status ){
    redTime--;
    updateTimer("red",redTime);
  }
  else if(currentMove === "blue" && status){
    blueTime--;
    updateTimer("blue",blueTime);
  }
},1000);
}

const unlock=[0,0,1,0]

function undo(){
    const removed = moveHistory.pop()
    removedItems.push(removed)
    if(removed[1] == 0){
        currentMove = data[removed[2]]==1?"Red":"Blue"
        data[removed[2]] = 0
    }
    else{
        move(removed[2],removed[1])
    }
    clearInterval(intervalId); 
    status = false;
    Unlock()
    renderScore()
    colorender()
    if (currentMove === "Red") {
        redTime--;
    } else {
        blueTime--; 
    }

    startTimer();
}
  
function redo(){
    const redoItem = removedItems.pop()
    if(redoItem[1]==0){
        if(redoItem[0]=="R"){
            currentMove = "red"
            createTitan(redoItem[2])
        }
        else{
            currentMove = "blue"
            createTitan(redoItem[2])
        }
    }
    else{
        move(redoItem[1],redoItem[2])
    }
    renderScore()
    colorender()
    Unlock()
}

//none-0
//red-1
//blue-2
const data=[0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]


const weight=[9,8,8,9,8,8,4,5,6,4,5,6,3,2,1,2,1,1]
const hex=document.getElementById("hex")
const xCentre=window.innerWidth/2;
const r=[100,200,300]
const yCentre=window.innerHeight/2;
let k=1;
let Node={}

for (let i=0;i<3;i++){
    for(let j=0;j<6;j++){
        const angle=(Math.PI/180)*60*j
        let x=xCentre+r[i]*Math.cos(angle)
        let y=yCentre+r[i]*Math.sin(angle)
        x=Math.round(x)
        y=Math.round(y)
        
        
        const node=document.createElement('button')
        node.className="node"
        node.id=k
            node.innerText=`${k}`
            node.style.left=`${x}px`
            node.style.top=`${y}px`
            node.value=k
            node.addEventListener("click",moveTrack)
            hex.appendChild(node)
            Node[k]=[]
            Node[k].push([x,y])
            k=k+1;
            
    }
}

for(i=1;i<=18;i++)
    {
    
    if(i%6==0){
        const xa=(Node[i][0][0]+Node[i-5][0][0])/2
    const ya=(Node[i][0][1]+Node[i-5][0][1])/2
    const p=document.createElement('p')
    p.className="p"
    p.style.left=`${xa+35}px`
    p.style.top=`${ya+75}px`
    p.innerText=weight[i-1]
    
    document.body.appendChild(p);
    
    }
    if([1,5,3,12,10,8].includes(i)){
        const xa=(Node[i][0][0]+Node[i+6][0][0])/2
        const ya=(Node[i][0][1]+Node[i+6][0][1])/2
        const p=document.createElement('p')
        p.className="p"
        p.style.left=`${xa+30}px`
        p.style.top=`${ya+80}px`
        p.innerText="1"
        
        document.body.appendChild(p);
    }
    if(i%6!=0){
        const xa=(Node[i][0][0]+Node[i+1][0][0])/2
        const ya=(Node[i][0][1]+Node[i+1][0][1])/2
        const p=document.createElement('p')
    p.className="p"
    p.style.left=`${xa+15}px`
    p.style.top=`${ya+75}px`
    p.innerText=weight[i-1]
    
    document.body.appendChild(p);
    
    }
    
}

for(let i=1;i<=18;i++){
    if(i%6!=0){
        lineCreate(Node[i][0][0],Node[i][0][1],Node[i+1][0][0],Node[i+1][0][1])
    }
    if([1,5,3,12,10,8].includes(i)){
        lineCreate(Node[i][0][0],Node[i][0][1],Node[i+6][0][0],Node[i+6][0][1])
    }
    if(i%6==0){
        lineCreate(Node[i][0][0],Node[i][0][1],Node[i-5][0][0],Node[i-5][0][1])
    }
}
function lineCreate(x1, y1, x2, y2) {
    const line = document.createElement("div");
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); 
    line.style.position = "absolute";
    line.style.left = `${x1+17}px`;
    line.style.top = `${y1+110}px`;
    line.style.width =` ${length}px`;
    line.style.height = "2px";
    line.style.backgroundColor = "black";
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = "0 0";

    document.body.appendChild(line);
}
let scoredEdges = {};

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
        else if (i % 6 === 0 && data[i] !== 0 && data[i - 5] !== 0 && data[i] === data[i - 5]) {
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
}


function Unlock(){
    if(!data.slice(13,19).includes(0)){
        unlock[1]=1;
    }
    if(!data.slice(7,13).includes(0)){
        unlock[0]=1;
    }
    if(!data.slice(1,7).includes(0)){
        unlock[3]=1;
    }
}
Unlock()
function Move(a,b){
    let o=0;
    a=Number(a)
    b=Number(b)
    if((a==12 && b==18) || (a==18 && b==12)){
      data[b]=data[a]
      data[a]=0
      o=1
      lastMove = [data[b]==1? "R":"B" ,a,b]
      moveHistory.push(lastMove)
    }
    else if(b%6==0){
        if(a==b-5||a==b-1){
            data[b]=data[a]
            data[a]=0
            o=1
            lastMove = [data[b]==1? "R":"B" ,a,b]
            moveHistory.push(lastMove)
        }
    }
    else if(a%6==0){
        if(a==b+1||a==b+5){
            data[b]=data[a]
            data[a]=0
            o=1
            lastMove = [data[b]==1? "R":"B" ,a,b]
            moveHistory.push(lastMove)
        }
    }
    else if([1,3,5,8,10,12].includes(a)){
        if(a==b+1||a==b-1||a==b-6){
            data[b]=data[a]
            data[a]=0
            o=1
            lastMove = [data[b]==1? "R":"B" ,a,b]
            moveHistory.push(lastMove)
        }
    }
    else if([1,3,5,8,10,12].includes(b)){
        if(a==b+1||a==b-1||a==b+6){
            data[b]=data[a]
            data[a]=0
            o=1
            lastMove = [data[b]==1? "R":"B" ,a,b]
            moveHistory.push(lastMove)
        }
    }
    else{
        if(a==b+1||a==b-1){
            data[b]=data[a]
            data[a]=0
            o=1
            lastMove = [data[b]==1? "R":"B" ,a,b]
            moveHistory.push(lastMove)
        }
    }
    Change()
    if(o==1){
        
        return true
    }
    else{
        return false
    }
    

}
function Change(){
    updateScore();
    colorender()
    Unlock()
    if(unlock[3]==1){
        if(score.Red>score.Blue){
            alert("Red Wins")
            location.reload()
        }
        else{
            alert("Blue Wins")
            location.reload()
        }
    }
}

const turn=[1,0]//red-0,blue-1
const move=[0,0]
const titan=[4,4]
function createTitan(id){
    const button=document.getElementById(id)
    button.style.backgroundColor=currentMove
    if(currentMove=='red'){
        data[id]=1
        lastMove = ["R",0,id]
    }
    if(currentMove=='blue'){
        data[id]=2
        lastMove = ["B",0,id]
    }
    moveHistory.push(lastMove)
}


const alreadyClicked=[0,0]
function moveTrack(event){
    if(turn[0]==1){//red turn
        if(data[event.target.value]==0&&unlock[Math.floor(event.target.value/6.1)]==1&&alreadyClicked[0]==0){
            
            if(titan[0]!=0){createTitan(event.target.value)
                turn[0]=0
            turn[1]=1
            titan[0]-=1
                currentMove = "blue";
                startTimer();
              }
            
        }
        else if(data[event.target.value]==1){
            if(alreadyClicked[0]==0){
                alreadyClicked[0]=event.target.value
                console.log(alreadyClicked[0])
            }
            

            
        }
        else if(data[event.target.value]==0&&unlock[Math.floor(event.target.value/6.1)]==1&&alreadyClicked[0]!=0){
            if( Move(alreadyClicked[0],event.target.value)){
                alreadyClicked[0]=0
            console.log(`b-${event.target.value}`)
                turn[0]=0
            turn[1]=1
            
            currentMove = "blue"
            startTimer();
        }
    else{
        alreadyClicked[0]=0;
        alreadyClicked[1]=0
    }}
        
        
    }
    else if(turn[1]==1){//blue turn 1
        if(data[event.target.value]==0&&unlock[Math.floor(event.target.value/6.1)]==1&&alreadyClicked[1]==0){
            if(titan[1]!=0){
                turn[0]=1
            turn[1]=0
            titan[1]-=1
            createTitan(event.target.value)
            currentMove = "red"
            startTimer();
            }
            
        }
        else if(data[event.target.value]==2){
            
            if(alreadyClicked[1]==0){
                alreadyClicked[1]=event.target.value
            
            }
            
        }
        else if(data[event.target.value]==0&&unlock[Math.floor(event.target.value/6.1)]==1&&alreadyClicked[1]!=0){
            if (Move(alreadyClicked[1],event.target.value)){
                alreadyClicked[1]=0
                turn[0]=1
            turn[1]=0
            
            currentMove = "red"
            startTimer();
        }
        else{
            alreadyClicked[0]=0;
            alreadyClicked[1]=0
        }}
        
    }
    else{
        alreadyClicked[0]=0;
        alreadyClicked[1]=0
    }
    Change()
}
function colorender(){
    for(i=1;i<=18;i++){
        const button=document.getElementById(i)
        if(data[i]!=0){
            if(data[i]==1){
                button.style.backgroundColor='red'
            }
            else{
                button.style.backgroundColor='blue'
            }
        }
        else{
            button.style.backgroundColor=''
        }
        console.log(button)
    }
  }

  
