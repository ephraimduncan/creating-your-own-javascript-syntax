// tokenizer
const tokenizer = (input) => {
  const current = 0;
  const currentChar = input[current];

  if (input[input.length - 1] === ';') {
    input += ' ';
  } else {
    input = input + '; ';
  }
};
