# Creating Your Own JavaScript Syntax

So today we are going to create our own syntax in JavaScript. For simplicity sake and easy understanding, we will stick to a single javascript structure. Variable Declaration. We are going to implement a new syntax for declaring variables in JavaScript. The new syntax definition will be below.

```js
// `set` and `define` to replace `let` and `const`

set name as "Duncan";
// let name = "Duncan";

define k as 1024;
// const k = 1024;
```

With the syntax, we could `split` the input and replace `set` and `define` with `let` and `const` respectively but everyone can do that. Let's try something else.

A compiler.

Don't get too scared, it will be a very small and tiny one. For simplicity, our compiler will only support `numbers`, `strings`, `boolean` and `null`.

### The Compiler

Different compilers work in different ways but break down to the three primary stages:

- **`Parsing`** : takes the raw code and turning it into an abstract representation known as an Abstract Syntax Tree (AST)
- **`Transformation`** : takes the abstract representation and transforms and modifies it into another abstract representation of the target language.
- **`Code Generation`** : takes the transformed abstract representation and generates the new code based on the given abstract representation.

### Parsing

Parsing also gets broken down into two stages. `Lexical Analysis` (lexing/ tokenizing) and `Syntactic Analysis`. `Lexical Analysis` takes the raw code and turn each character it into a `token` with the lexer/tokenizer. The tokenizer returns an array of all the tokens for a given syntax.

```js
// Given the code
set age as 18;
```

The `tokenizer` will return the array below.

```js
[
  { type: 'keyword', value: 'set' },
  { type: 'name', value: 'age' },
  { type: 'ident', value: 'as' },
  { type: 'number', value: '18' },
];
```

> _Tokens are an array of tiny little objects that describe an isolated piece of the syntax_.

Each token is an object with a `type` and `value` property. The `type` holds the type of the current character or set of characters being passed. `value` property stores the value of the character being passed.  
`Syntactic Analysis` then takes the tokens and transforms them with a parser function to an abstract representation of the tokens in relation to each other. Usually, we would have two ASTs where one is from our language and the other is for the target language, but for simplicity again, we will build a single AST modify the same one to produce a different AST.

The parser will return the object below.

```js
// Abstract Syntax Tree for `set age as 18;`
{
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      kind: "set",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "age" },
          init: { type: "NumberLiteral", value: 18 },
        },
      ],
    },
  ],
}
```

### Transformation

The next stage for our compiler is transformation. Taking the AST and transforming it into a totally new AST for any programming language or just modifying the same one. We won't generate a new AST, we will just modify it.
On our AST, we have at each level an object with a `type` property. These are known as AST Node. These nodes have defined properties on them that describe one isolated part of the tree.

```js
// We have a Node for a "NumberLiteral"
{
  type: "NumberLiteral",
  value: 18,
}

// A Node for a "VariableDeclarator"
{
  type: "VariableDeclarator",
  id: { ...object },
  init: { ...object },
}
```

Fortunately for us, we are doing only one thing with our AST, that is Variable Declaration. Let's see how we will modify our AST.

At the `VariableDeclaration` node, we have a `kind` property that contains the current keyword being used. So we will `traverse` the tree and `visit` each node until have a Node with `type` of `VariableDeclaration` and set the `kind` property to what keyword we want. `let` or `const`

```js
// AST for `set age as 18;`
{
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      kind: "set", // <- `kind` will be changed to `let` or `const`
      declarations: [ [Object] ],
    },
  ],
}

// AST after transforming it
{
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      kind: "let", // <<<<<<<: Changed from `set`
      declarations: [ [Object] ],
    },
  ],
}
```

### Code Generation

Now that we have our new AST, we can now generate our code. Our new AST has everything we need. The keyword, the variable name and the value assigned to the variable. The name and value can be found in the `VariableDeclarator` node.

Now that's it. A general idea of compilers and how they work. Not all compilers work like this but most certainly do. That's backbone and skeleton of our compiler. If our compiler was a website, all the above will be the HTML.

Let's write some code. 😋

> _We won't use any external libraries, we will write everything from scratch😺. Also, you must have [Node.js](https://nodejs.org) installed on your local system. Use any text editor or IDE of your choice._

Create a new directory and run `npm init -y` and create a new javascript file with any filename of your choice.

In general, we will have 5 main functions in our code
// Photoshop of stages with their functions

- Compiler
  - Parsing
    - `tokenizer`
    - `parser`
  - Transformation
    - `traverser`
    - `transformer`
  - Code Generation
    - `generator`

### `tokenizer`

We will first declare a `tokenizer` function with a parameter of `input`, the inital code we are going to pass to our compiler as a string. Then initialize a `current` and `tokens` variable. `current` for the current location in the input and `tokens` will be an array that will hold the tokens for each individual `token`. Then we will add a`;`and a`whitespace` character to the end.

```js
const tokenizer = (input) => {
  let tokens = [];
  let current = 0;

  // Add the semicolon to the end of the input if one was not provided
  // Then add whitespace to the end of the input to indicate the end of the code
  if (input[input.length - 1] === ';') {
    input += ' ';
  } else {
    input = input + '; ';
  }
};
```

After the initial declarations in the `tokenizer`, we come to the main part. We will have a `while` loop that will loop over all the characters in the `input` and while there is a character available, we will check for the type of the character and add it to a `token` and add the `token` to the `tokens` array.

```js
const tokenizer = (input) => {
  // ...
  while (current < length - 1) {
    // We get the current character first
    const currentChar = input[current];

    // Now, we test for the types of each character.
    // We check for Whitespaces first
    // Regex to check for whitespace
    const WHITESPACE = /\s+/;
    if (WHITESPACE.test(currentChar)) {
      // If the current character is a whitespace, we skip over it.
      current++; // Go to the next character
      continue; // Skip everything and go to the next iteration
    }

    // We need semicolons They tell us that we are at the end.
    // We check for semicolons now and also if the semicolon is at the last position
    // We only need the semicolons at the end. Any other position means there
    // An error
    if (currentChar === ';' && currentChar === input[input.length - 1]) {
      // If the current character is a semicolon, we create a `token`
      let token = {
        type: 'semi',
        value: ';',
      };

      // then add it to the `tokens` array
      tokens.push(token);
      current++; // Go to the next character
      continue; // Skip everything and go to the next iteration
    }
  }
};
```

We now have check in place for semicolons and whitespaces but there are four more to go. Our compiler supports `strings`, `numbers`, `booleans` and `null`. We will now check for the following types. Remmember we are dealing with single characters so we willl need to put some checks in place else we will be pushing single characters as `tokens`
Still in the while loop

```js
const tokenizer = (input) => {
  // ...
  while (current < length - 1) {
    const currentChar = input[current];
    //...

    // Now we will check for Numbers
    const NUMBER = /^[0-9]+$/; // Regex to check if character is a number
    // If we use the same method above for the semicolons,
    // We create a number `token` and add it to `tokens`, we end up with a token for
    // each single number character instead of the number as a whole.
    // For example, if we have a number value of `123`, then our tokens will be
    //
    // [
    //   { type: 'number', value: 1 },
    //   { type: 'number', value: 2 },
    //   { type: 'number', value: 3 },
    // ]
    //
    // Instead of
    //
    // [
    //   { type: 'number', value: 123 },
    // ]
    // which we don't want.
    // So we create a `number` variable and check if the next character is a number.
    // If the next character is a number, we add it to the `number` variable
    // Then add the `number` variable's value as the value in our `token`
    // The add the `token` to our `tokens` array
    if (NUMBER.test(currentChar)) {
      let number = '';

      // Check if the next character is a number
      while (NUMBER.test(input[current++])) {
        number += input[current - 1]; // Add the character to `number`
      }

      // Create a token with type number
      let token = {
        type: 'number',
        value: parseInt(number), // `number` is a string to we convert it to an integer
      };

      tokens.push(token); // Add the `token` to `tokens` array
      continue;
    }
  }
};
```
