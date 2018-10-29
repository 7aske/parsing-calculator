window.innerHeight / window.innerWidth > 1
	? (document.querySelector('#main').style.marginTop = window.innerHeight * 0.05 + 'px')
	: (document.querySelector('#main').style.marginTop = window.innerHeight * 0.4 + 'px');

class Calculator {
	constructor() {
		this.input = '';
		//html fields
		this.inputField = document.querySelector('#input');
		this.outputField = document.querySelector('#output');
		this.errorOutput = document.querySelector('#errors');

		//Regular expressions
		this.number = new RegExp('[\\d.]');
		this.operation = new RegExp('[-+*/\\^√]');
		this.priorityOperation = new RegExp('[*/\\^√]');
		this.parenthesis = new RegExp('\\([-\\d+*/]+\\)', 'g');
		this.root = new RegExp('root');

		//input handling
		this.inputField.addEventListener('keyup', event => {
			this.input = event.target.value.replace(/\s/g, '');
			this.handleInput();
		});
		this.lenny = '( ͡☉ ͜ʖ ͡☉)';
	}
	handleInput() {
		if (this.input.match(this.root))
			this.input.match(this.root).forEach(s => {
				this.input = this.input.replace(s, '√');
			});
		this.inputField.value = this.input;
		this.errorOutput.innerHTML = '';
		let errors = this.checkErrors();
		if (!errors) {
			this.formated = this.input;
			this.formated = this.formatParenthesis(this.formated);
			let result = this.parse(this.formated.split(''));
			console.log('result', result);
			if (result == Infinity || isNaN(result)) {
				let error = document.createElement('div');
				error.classList.add('alert', 'alert-danger', 'animated', 'fadeIn');
				error.innerHTML = 'Cannot divide with by zero';
				this.errorOutput.appendChild(error);
				this.outputField.innerHTML = this.lenny;
			} else {
				this.outputField.innerHTML = result;
			}
		} else {
			errors.forEach(e => {
				let error = document.createElement('div');
				error.classList.add('alert', 'alert-danger', 'animated', 'fadeIn');
				error.innerHTML = e;
				this.errorOutput.appendChild(error);
				this.outputField.innerHTML = this.lenny;
			});
		}
	}
	checkErrors() {
		let errors = [];
		//Error checkers
		let openP = this.input.match(/\(/g);
		let closedP = this.input.match(/\)/g);
		let checkParenthesis = false;
		if (openP && closedP) {
			if (openP.length != closedP.length) checkParenthesis = true;
		}
		const checkDouble = this.input.match(/[-+.^/*][-+.^/*]+/g);
		const checkEnding = this.input.match(/[-+.^/*]+$/g);
		const checkLetters = this.input.match(/[^-\d.()^+*/√]/g);
		if (checkParenthesis) errors.push('Unclosed parenthesis');
		if (checkDouble) errors.push('Double operators');
		if (checkEnding) errors.push('String must end with a number');
		if (checkLetters) errors.push('Invalid characters. Use 0-9 and + - * / ^ √');
		if (errors.length != 0) return errors;
		return false;
	}
	formatParenthesis(string) {
		while (string.match(this.parenthesis)) {
			string.match(this.parenthesis).forEach(s => {
				string = string.replace(s, this.parse(s.split('')));
			});
		}
		return string;
	}
	calc(n1, n2, op) {
		console.log(n1, op, n2);
		n1 = isNaN(n1) ? Number(n1.join('')) : Number(n1);
		n2 = isNaN(n2) ? Number(n2.join('')) : Number(n2);
		console.log(n1, op, n2);
		switch (op) {
			case '+':
				return n1 + n2;
			case '-':
				return n1 - n2;
			case '*':
				return n1 * n2;
			case '/':
				return n1 / n2;
			case '^':
				return Math.pow(n1, n2);
			case '√':
				if (n1 == 0) {
					return Math.pow(n2, 1 / 2);
				} else {
					return Math.pow(n2, 1 / n1);
				}
			default:
				if (!n2) return (n1 = isNaN(n1) ? Number(n1.join('')) : Number(n1));
		}
	}
	parse(array) {
		let result = 0;
		let num1 = [];
		let num2 = [];
		let num3 = [];
		let isNum1 = true;
		let isNum2 = false;
		let isNum3 = false;
		let op1 = null;
		let op2 = null;
		array.forEach((e, i) => {
			if (e == '√' && op1 == null) {
				op1 = '√';
			} else if (e == '√' && op2 == null) {
				op2 = '√';
			}
			if (this.number.test(e)) {
				if (isNum1) {
					if (num1.length == 0 && array[i - 1] == '-' && (this.operation.test(array[i - 2]) || !array[i - 1])) {
						console.log('pushing - ');
						num1.push(-1 * e);
					} else {
						num1.push(e);
					}
				} else if (isNum2) {
					if (num2.length == 0 && array[i - 1] == '-' && this.operation.test(array[i - 2])) {
						num2.push(-1 * e);
					} else {
						num2.push(e);
					}
				} else {
					if (num3.length == 0 && array[i - 1] == '-' && this.operation.test(array[i - 2])) {
						num3.push(-1 * e);
					} else {
						num3.push(e);
					}
				}
			}
			if (i == array.length - 1) {
				//handle end of input
				if (isNum2) {
					result = this.calc(num1, num2, op1);
				} else if (isNum3) {
					isNum1 = false;
					isNum2 = true;
					isNum3 = false;
					num2 = this.calc(num2, num3, op2);
					num1 = this.calc(num1, num2, op1);
					result = num1;
				} else {
					console.log(num1);
					// result = num1 instanceof Array ? Number(num1.join('')) : num1;
					result = this.calc(num1, num2 ? num2 : null, op1 ? op1 : op2);
				}
			} else if (!isNum1 && !isNum2 && isNum3 && this.operation.test(e)) {
				if (!e == '-' || !this.operation.test(array[i - 1])) {
					num2 = this.calc(num2, num3, op2);
					num3 = [];
					op2 = e;
				}
			} else if (!isNum1 && isNum2 && this.operation.test(e)) {
				if (!e == '-' || !this.operation.test(array[i - 1])) {
					//num1 is already done, num2 is still filling and we reach an operator
					if (this.priorityOperation.test(e) == this.priorityOperation.test(op1)) {
						//if operator priorities are the same
						num1 = this.calc(num1, num2, op1);
						isNum1 = false;
						isNum2 = true;
						num2 = []; //reset number two to prevoius state and fill it again
						op1 = e; //assign current operator to be primary
					} else if (!this.priorityOperation.test(e)) {
						//if the operator is not * or / calculate num1 and num2 with already set operator
						num1 = this.calc(num1, num2, op1);
						isNum1 = false;
						isNum2 = true;
						num2 = []; //reset number two to prevoius state and fill it again
						op1 = e; //assign current operator to be primary
					} else {
						//if its a priority operator start filling num3 and set it as op2
						op2 = e;
						isNum3 = true;
						isNum2 = false;
					}
				}
			} else if (this.operation.test(e)) {
				if ((e == '-' && this.operation.test(array[i - 1])) || (i == 0 && (e == '+' || e == '-'))) {
					num1.push(e);
				} else {
					isNum1 = false;
					isNum2 = true;
					op1 = e;
				}
			}
		});

		return result;
	}
}
const calc = new Calculator();
