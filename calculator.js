let display = document.getElementById('display');
let currentExpression = '';
let lastAnswer = 0;

function appendToDisplay(value) {
    currentExpression += value;
    display.value = currentExpression;
}

function clearDisplay() {
    currentExpression = '';
    display.value = '0';
}

function deleteLast() {
    currentExpression = currentExpression.slice(0, -1);
    display.value = currentExpression;
}

function calculate() {
    try {
        // Replace percentage symbol with division by 100
        let expression = currentExpression.replace(/%/g, '/100');
        lastAnswer = eval(expression);
        display.value = lastAnswer;
        currentExpression = lastAnswer.toString();
    } catch (error) {
        display.value = 'Error';
        currentExpression = '';
    }
}

function trig(func) {
    try {
        const value = eval(currentExpression);
        let result;
        switch (func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180); // Convert degrees to radians
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                break;
        }
        display.value = result;
        currentExpression = result.toString();
    } catch (error) {
        display.value = 'Error';
        currentExpression = '';
    }
}

function logarithm(func) {
    try {
        const value = eval(currentExpression);
        let result;
        if (func === 'log') {
            result = Math.log10(value);
        } else if (func === 'ln') {
            result = Math.log(value);
        }
        display.value = result;
        currentExpression = result.toString();
    } catch (error) {
        display.value = 'Error';
        currentExpression = '';
    }
}

function power(exponent) {
    try {
        const base = eval(currentExpression);
        const result = Math.pow(base, exponent);
        display.value = result;
        currentExpression = result.toString();
    } catch (error) {
        display.value = 'Error';
        currentExpression = '';
    }
}

function shift() {
    alert('Shift function not implemented in this version.');
}

function alpha() {
    alert('Alpha function not implemented in this version.');
}

function answer() {
    appendToDisplay(lastAnswer.toString());
}
