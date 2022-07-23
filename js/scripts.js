let chessboardElement = document.getElementById('main-chessboard');
let populationElement = document.getElementById('population');
let generationCountElement = document.getElementById('generation-count');
let stateStatusElement = document.getElementById('state-status');
let actionButton = document.getElementById('action');
let running = false;
let cancelFlag = false;
let chessboardSize = 8;
let usingWebKit = false;

if (typeof window.webkitConvertPointFromNodeToPage === 'function') {
    usingWebKit = true;
}


createChessBoard(chessboardElement, 8);
actionButton.onclick = actionButtonClicked;

function createChessBoard(parent, size=8) {
    for (let i = 0; i < size; i++) {
        let chessboardRow = document.createElement('div');
        chessboardRow.classList.add('chessboard-row');
        for (let j = 0; j < size; j++) {
            let chessboardBlock = document.createElement('div');
            chessboardBlock.classList.add('chessboard-block');
            if ((i + j) % 2 != 0) {
                chessboardBlock.classList.add('offset-background');
            }
            chessboardRow.appendChild(chessboardBlock);
        }
        parent.appendChild(chessboardRow);
    }
    return parent;
}

function clearBoard() {
    let chessboardBlocks = document.getElementsByClassName('chessboard-block');
    for (let i = 0; i < chessboardBlocks.length; i++) {
        chessboardBlocks[i].textContent = '';
    }
}

function generateRandomState(size=8) {
    let state = [];
    for (let i = 0; i < size; i++) {
        state.push(i);
    }
    
    for (let i = state.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [state[i], state[j]] = [state[j], state[i]];
    }
    return state;
}

function generateRandomPopulation(populationSize=5, stateSize=8) {
    let population = [];
    for (let i = 0; i < populationSize; i++) {
        population.push(generateRandomState(stateSize));        
    }
    return population;
}

async function actionButtonClicked() {
    if (!running) {
        actionButton.textContent = 'Stop';
        let [populationSize, mRate, iterations] = getInputs();
        let correct = checkInputs(populationSize, mRate, iterations);
        if (correct) {
            running = true;
            let initialPopulation = generateRandomPopulation(populationSize, chessboardSize);
            let result = await geneticAlgorithm(initialPopulation, mRate, iterations);
            visualizeState(result[0]);
            updateGeneration(result[1])
            running = false;
            cancelFlag = false;
            actionButton.textContent = 'Start'
        }
    }
    else {
        cancelFlag = true;
    }
}

function getInputs() {
    let populationSize = Number(document.getElementById('population-field').value) ?? 0;
    let mRate = Number(document.getElementById('mutation-field').value) ?? 0;
    let iterations = Number(document.getElementById('iterations-field').value) ?? 0;
    return [populationSize, mRate, iterations];
}

function checkInputs(populationSize, mRate, iterations) {
    if (populationSize <= 0) {
        alert("Population size cannot be less than or equal to 0.");
        return false;
    }
    else if (populationSize > 1000) {
        alert("Population size should not be greater than 1000 due to slow runtime.");
        return false;
    }
    else if (mRate < 0 || mRate > 1) {
        alert("Mutation rate should be between 0 and 1, inclusive.");
        return false;
    }
    else if (iterations <= 0) {
        alert("Number of generations should be greater than zero.");
        return false;
    }
    else {
        return true;
    }
}

function visualizeState(state) {
    clearBoard();
    let chessboardRows = chessboardElement.getElementsByClassName('chessboard-row');
    for (let i = 0; i < state.length; i++) {
        let svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('viewBox', '0 0 15 15');
        let textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', '50%');
        if (usingWebKit){
            textElement.setAttribute('y', '70%');
        }
        else {
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            textElement.setAttribute('y', '50%');
        }
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'middle');
        textElement.textContent = 'Q';
        svgElement.appendChild(textElement);
        chessboardRows[state[i]].children[i].appendChild(svgElement);
    }
    updateStatus(state);
}

function updateGeneration(number) {
    generationCountElement.textContent = 'Generation: ' + number;
}

function updateStatus(state) {
    if (isGoal(state)) {
        stateStatusElement.textContent = 'Correct';
        stateStatusElement.style.color = 'green';
    }
    else {
        stateStatusElement.textContent = 'Incorrect';
        stateStatusElement.style.color = 'red';
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateChessboard() {
    if (!running) {
        generationCountElement.textContent = 'Generation: N/A';
        stateStatusElement.textContent = 'N/A';
        stateStatusElement.style.color = '#444444';
        chessboardSize = Number(document.getElementById('chessboard-field').value);
        chessboardElement.innerHTML = "";
        createChessBoard(chessboardElement, chessboardSize);
    }
}