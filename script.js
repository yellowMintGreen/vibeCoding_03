class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
        this.history = [];
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '' && operation !== '√') return;
        
        // Single operand operations
        if (operation === '√') {
            const current = parseFloat(this.currentOperand);
            if (current < 0) {
                alert("음수의 제곱근은 계산할 수 없습니다.");
                return;
            }
            const result = Math.sqrt(current);
            this.addToHistory(`√${this.currentOperand}`, result);
            this.currentOperand = result.toString();
            this.updateDisplay();
            return;
        }

        if (operation === '%') {
            const current = parseFloat(this.currentOperand);
            const result = current / 100;
            this.addToHistory(`${this.currentOperand}%`, result);
            this.currentOperand = result.toString();
            this.updateDisplay();
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    alert("0으로 나눌 수 없습니다.");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            case '^':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }

        // Format to prevent precision issues (e.g., 0.1 + 0.2)
        computation = Math.round(computation * 10000000000) / 10000000000;
        
        let opSymbol = this.operation === '^' ? '^' : this.operation;
        // Add to history
        this.addToHistory(`${this.previousOperand} ${opSymbol} ${this.currentOperand}`, computation);
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        // dynamic font size based on length
        const currentLen = this.currentOperand.toString().length;
        if (currentLen > 12) {
            this.currentOperandTextElement.style.fontSize = '1.8rem';
        } else if (currentLen > 8) {
            this.currentOperandTextElement.style.fontSize = '2.2rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '3rem';
        }

        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            let opSymbol = this.operation === '^' ? '^' : this.operation;
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }

    addToHistory(expression, result) {
        this.history.unshift({ expression, result });
        // Keep max 20 items
        if (this.history.length > 20) this.history.pop();
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div style="text-align:center; color: var(--text-secondary); margin-top:20px;">기록이 없습니다.</div>';
            return;
        }

        this.history.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('history-item');
            div.style.animationDelay = `${index * 0.05}s`;
            div.innerHTML = `
                <div class="history-expr">${item.expression} =</div>
                <div class="history-res">${this.getDisplayNumber(item.result)}</div>
            `;
            
            // Allow clicking history to load result
            div.addEventListener('click', () => {
                this.currentOperand = item.result.toString();
                this.operation = undefined;
                this.previousOperand = '';
                this.updateDisplay();
                document.getElementById('history-panel').classList.remove('active');
            });
            
            historyList.appendChild(div);
        });
    }

    clearHistory() {
        this.history = [];
        this.renderHistory();
    }
}

// Select elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-action="equals"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);
calculator.renderHistory();

// Audio context for sound effects
const clickSound = new Audio('data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'); 
// (A simple tick sound could be generated here, but for simplicity, we'll just simulate with visual effect or add a soft beep with AudioContext)

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch for mechanical click feel
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}

// Wrap listeners to include sound
function addInteractiveEffect(element, action) {
    element.addEventListener('click', () => {
        playClickSound();
        action();
        element.style.transform = 'scale(0.9)';
        setTimeout(() => element.style.transform = '', 100);
    });
}

numberButtons.forEach(button => {
    addInteractiveEffect(button, () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    addInteractiveEffect(button, () => {
        calculator.chooseOperation(button.dataset.operation);
        calculator.updateDisplay();
    });
});

if (equalsButton) {
    addInteractiveEffect(equalsButton, () => {
        calculator.compute();
        calculator.updateDisplay();
    });
}

if (clearButton) {
    addInteractiveEffect(clearButton, () => {
        calculator.clear();
        calculator.updateDisplay();
    });
}

if (deleteButton) {
    addInteractiveEffect(deleteButton, () => {
        calculator.delete();
        calculator.updateDisplay();
    });
}

// History Panel Toggle
const historyToggleBtn = document.querySelector('[data-action="history-toggle"]');
const historyPanel = document.getElementById('history-panel');
const clearHistoryBtn = document.getElementById('clear-history');

if (historyToggleBtn) {
    addInteractiveEffect(historyToggleBtn, () => {
        historyPanel.classList.toggle('active');
    });
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        calculator.clearHistory();
    });
}

// Dark/Light Theme Toggle
const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement = document.documentElement;
let isDarkTheme = false;

themeToggleBtn.addEventListener('click', () => {
    playClickSound();
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        rootElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        rootElement.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
});

// Keyboard Support
document.addEventListener('keydown', e => {
    const key = e.key;
    
    // Ignore keyboard input if converter is active
    if (document.getElementById('converter-view').classList.contains('active-view')) return;

    if (/[0-9.]/.test(key)) {
        playClickSound();
        calculator.appendNumber(key);
        calculator.updateDisplay();
        highlightButton(`[data-number="${key}"]`);
    }
    
    if (key === '+' || key === '-') {
        playClickSound();
        calculator.chooseOperation(key);
        calculator.updateDisplay();
        highlightButton(`[data-operation="${key}"]`);
    }
    
    if (key === '*' || key === 'x') {
        playClickSound();
        calculator.chooseOperation('×');
        calculator.updateDisplay();
        highlightButton(`[data-operation="×"]`);
    }
    
    if (key === '/') {
        e.preventDefault();
        playClickSound();
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
        highlightButton(`[data-operation="÷"]`);
    }
    
    if (key === 'Enter' || key === '=') {
        e.preventDefault();
        playClickSound();
        calculator.compute();
        calculator.updateDisplay();
        highlightButton(`[data-action="equals"]`);
    }
    
    if (key === 'Backspace') {
        playClickSound();
        calculator.delete();
        calculator.updateDisplay();
        highlightButton(`[data-action="delete"]`);
    }
    
    if (key === 'Escape') {
        playClickSound();
        calculator.clear();
        calculator.updateDisplay();
        highlightButton(`[data-action="clear"]`);
    }
});

function highlightButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.style.transform = 'scale(0.9)';
        button.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            button.style.transform = '';
            button.style.filter = '';
        }, 100);
    }
}

// ----------------------------------------
// Tabs & Converter Logic
// ----------------------------------------

const tabs = document.querySelectorAll('.tab');
const views = document.querySelectorAll('.view-panel');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        playClickSound();
        
        // Remove active class from all tabs and views
        tabs.forEach(t => t.classList.remove('active'));
        views.forEach(v => v.classList.remove('active-view'));
        
        // Add active class to clicked tab and corresponding view
        tab.classList.add('active');
        const viewId = tab.dataset.tab + '-view';
        document.getElementById(viewId).classList.add('active-view');
    });
});

// Converter Units Data
const unitsData = {
    length: {
        m: { name: '미터 (m)', rate: 1 },
        cm: { name: '센티미터 (cm)', rate: 100 },
        km: { name: '킬로미터 (km)', rate: 0.001 },
        inch: { name: '인치 (inch)', rate: 39.3701 },
        ft: { name: '피트 (ft)', rate: 3.28084 }
    },
    weight: {
        kg: { name: '킬로그램 (kg)', rate: 1 },
        g: { name: '그램 (g)', rate: 1000 },
        lb: { name: '파운드 (lb)', rate: 2.20462 },
        oz: { name: '온스 (oz)', rate: 35.274 }
    },
    temperature: {
        c: { name: '섭씨 (℃)' },
        f: { name: '화씨 (℉)' },
        k: { name: '켈빈 (K)' }
    }
};

const typeSelector = document.getElementById('converter-type');
const unit1Selector = document.getElementById('conv-unit-1');
const unit2Selector = document.getElementById('conv-unit-2');
const input1 = document.getElementById('conv-input-1');
const input2 = document.getElementById('conv-input-2');

function populateUnits() {
    const type = typeSelector.value;
    const units = unitsData[type];
    
    unit1Selector.innerHTML = '';
    unit2Selector.innerHTML = '';
    
    for (const key in units) {
        unit1Selector.innerHTML += `<option value="${key}">${units[key].name}</option>`;
        unit2Selector.innerHTML += `<option value="${key}">${units[key].name}</option>`;
    }
    
    // Select different default units
    const keys = Object.keys(units);
    if (keys.length > 1) {
        unit2Selector.value = keys[1];
    }
    
    calculateConversion();
}

function calculateConversion() {
    const type = typeSelector.value;
    const val = parseFloat(input1.value);
    
    if (isNaN(val)) {
        input2.value = '';
        return;
    }
    
    const u1 = unit1Selector.value;
    const u2 = unit2Selector.value;
    
    let result = 0;
    
    if (type === 'temperature') {
        let celsius = 0;
        // Convert to Celsius first
        if (u1 === 'c') celsius = val;
        if (u1 === 'f') celsius = (val - 32) * 5/9;
        if (u1 === 'k') celsius = val - 273.15;
        
        // Convert from Celsius
        if (u2 === 'c') result = celsius;
        if (u2 === 'f') result = (celsius * 9/5) + 32;
        if (u2 === 'k') result = celsius + 273.15;
    } else {
        // Length and Weight
        const baseVal = val / unitsData[type][u1].rate;
        result = baseVal * unitsData[type][u2].rate;
    }
    
    // Round to 4 decimal places max
    result = Math.round(result * 10000) / 10000;
    input2.value = result;
}

typeSelector.addEventListener('change', populateUnits);
unit1Selector.addEventListener('change', calculateConversion);
unit2Selector.addEventListener('change', calculateConversion);
input1.addEventListener('input', calculateConversion);

// Initialize converter
populateUnits();
