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
  }
};
