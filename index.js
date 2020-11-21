// tokenizer
const tokenizer = (input) => {
  let tokens = [];
  let current = 0;

  if (input[input.length - 1] === ';') {
    input += ' ';
  } else {
    input = input + '; ';
  }

  while (current < input.length - 1) {
    const currentChar = input[current];

    const WHITESPACE = /\s+/;
    if (WHITESPACE.test(currentChar)) {
      current++;
      continue;
    }

    if (currentChar === ';' && currentChar === input[input.length - 2]) {
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

    const LETTER = /[a-zA-Z]/;
    if (LETTER.test(currentChar)) {
      let letters = currentChar;

      while (LETTER.test(input[++current])) {
        letters += input[current];
      }

      if (letters === 'set' || letters === 'define') {
        tokens.push({
          type: 'keyword',
          value: letters,
        });
        continue;
      }

      if (letters === 'null') {
        tokens.push({
          type: 'null',
          value: letters,
        });
        continue;
      }

      if (letters === 'as') {
        tokens.push({
          type: 'ident',
          value: letters,
        });
        continue;
      }

      if (letters === 'true' || letters === 'false') {
        tokens.push({
          type: 'boolean',
          value: letters,
        });
        continue;
      }

      tokens.push({
        type: 'name',
        value: letters,
      });

      continue;
    }

    throw new TypeError('Unknown Character: ' + currentChar + ' ' + current);
  }

  return tokens;
};

// parser
const parser = (tokens) => {
  let current = 0;

  const walk = () => {
    let token = tokens[current];
    if (token.type === 'number') {
      current++;
      let astNode = {
        type: 'NumberLiteral',
        value: token.value,
      };
      return astNode;
    }

    if (token.type === 'string') {
      current++;
      let astNode = {
        type: 'StringLiteral',
        value: token.value,
      };
      return astNode;
    }

    if (token.type === 'boolean') {
      current++;
      let astNode = {
        type: 'BooleanLiteral',
        value: JSON.parse(token.value),
      };
      return astNode;
    }

    if (token.type === 'null') {
      current++;
      let astNode = {
        type: 'NullLiteral',
        value: token.value,
      };
      return astNode;
    }

    if (token.type === 'keyword') {
      let node = {
        type: 'VariableDeclaration',
        kind: token.value,
        declarations: [],
      };
      token = tokens[++current];
      while (token && token.type !== 'semi') {
        node.declarations.push(walk());
        token = tokens[current];
      }

      if (token.type === 'semi') {
        tokens = tokens.filter((token) => token.type !== 'semi');
      }

      return node;
    }

    if (token.type === 'name') {
      current += 2;
      let astNode = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: token.value,
        },
        init: walk(),
      };
      return astNode;
    }

    throw new Error(token.type);
  };

  let ast = {
    type: 'Program',
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
};

const tokens = tokenizer('set isEmployed as false');
console.log(tokens);
console.dir(parser(tokens), { depth: null });
