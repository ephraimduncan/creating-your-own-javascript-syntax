// tokenizer
const tokenizer = (input) => {
  let tokens = [];
  let current = 0;

  if (input[input.length - 1] === ';') {
    input += ' ';
  } else {
    input = input + '; ';
  }

  while (current < length - 1) {
    const currentChar = input[current];

    const WHITESPACE = /\s+/;
    if (WHITESPACE.test(currentChar)) {
      current++;
      continue;
    }

    if (currentChar === ';') {
      let token = {
        type: 'semi',
        value: ';',
      };
      tokens.push(token);
      current++;
      continue;
    }

    const NUMBER = /^[0-9]+$/;
    if (NUMBER.test(currentChar)) {
      let number = '';
      while (NUMBER.test(input[current++])) {
        number += input[current - 1];
      }
      let token = {
        type: 'number',
        value: parseInt(number),
      };
      tokens.push(token);
      continue;
    }

    if (currentChar === '"') {
      let string = '';
      while (input[++current] !== '"') {
        string += input[current];
      }
      let token = {
        type: 'string',
        value: string,
      };
      tokens.push(token);
      current++;
      continue;
    }
  }
};
