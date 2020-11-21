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
  while (current < input.length - 1) {
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
  while (current < input.length - 1) {
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

Now that we have numbers underway, the next on our list is `strings`, `booleans` and `null` values. If we used the same approach for the semicolon and add a token for every character, we could face the same problem where we won't the full token value so we will a different approach similiar to the number check.

Strings will be easy to tackle with first. Each string starts and ends with a `"` so based on the same approach for numbers, we check if a character is a `"`, If it is, we will add every value that comes after the quote(`"`) until we meet another quote indicating the end of the string.

```js
const tokenizer = (input) => {
  // ...
  while (current < input.length - 1) {
    const currentChar = input[current];
    //...

    // Check if character is a string
    if (currentChar === '"') {
      // If the current character is a quote, that means we have a string
      // Initialize an empty strings variable
      let strings = '';

      // Check if the next character is not a quote
      while (input[++current] !== '"') {
        // If it is not a quote, it means we still have a string
        strings += input[current]; // Add it to the `strings` variable
      }

      // Create a token with property type string and a value with the `strings` value
      let token = {
        type: 'string',
        value: strings,
      };

      tokens.push(token); // Add the `token` to the `tokens` array
      current++;
      continue;
    }
  }
};
```

The last check and we are done with our `tokenizer`. The check for letters. `booleans`, `null` and the keywords, `set` and `define` all have characters that will test true for letters so we will use the same approach as the numbers. If the current character is a letter, we will add it to a new variable and check of the next character is also a letter until we meet a non-letter character then we will return.

```js
const tokenizer = (input) => {
  // ...
  while (current < input.length - 1) {
    const currentChar = input[current];
    //...

    // Check if the character is a letter
    const LETTER = /[a-zA-Z]/; // Regex to check if it is a letter
    if (LETTER.test(currentChar)) {
      // If the current character is a letter we add it to a `letters` variable
      let letters = currentChar;

      // Check if the next character is also a letter
      while (LETTER.test(input[++current])) {
        // We add it to the `letters` variable if it is
        letters += input[current];
      }

      // ...
      // See below..
    }
  }
};
```

At this point, we have our `letters` value but we cannot add it to the `tokens` array yet. Each token must have a `type` and a `value` but for letters, they could be different. Our letters could be `true` || `false` which will have a type of `boolean` or the letters could be `set` || `define` which could have a type of `keyword`, so we need another check to check the letters and assign thier token the respective type.

```js
const tokenizer = (input) => {
  // ...
  while (current < input.length - 1) {
    const currentChar = input[current];
    //...

    const LETTER = /[a-zA-Z]/;
    if (LETTER.test(currentChar)) {
      // ...
      //
      // Still in the letter check
      // At this point, we have a value for our `letters` so we check for thier types.
      //
      // We first check if the `letters` is `set` or `define` and we assign the `token` a type `keyword`
      if (letters === 'set' || letters === 'define') {
        // Add a `token` to the `tokens` array
        tokens.push({
          type: 'keyword',
          value: letters,
        });

        continue; // We are done. Start the loop all over again
      }

      // If the letter is `null`, assign the `token` a type `null`
      if (letters === 'null') {
        tokens.push({
          type: 'null',
          value: letters,
        });
        continue;
      }

      // If the letter is `null`, assign the `token` a type `ident`
      if (letters === 'as') {
        tokens.push({
          type: 'ident',
          value: letters,
        });
        continue;
      }

      // If the letter is `true` or `false`, assign the `token` a type `boolean`
      if (letters === 'true' || letters === 'false') {
        tokens.push({
          type: 'boolean',
          value: letters,
        });
        continue;
      }

      // If we don't know the `letters`, it may be a reference to another variable name or something else.
      // Assign the `token` a type `boolean`
      tokens.push({
        type: 'name',
        value: letters,
      });

      continue; // Start the loop again
    }
  }
};
```

At this point, we are done checking but if the character isn't recognized the our `while` loop will be stuck so we need some error checking in place and finally return the `tokens` from the tokenizer.

```js
const tokenizer = (input) => {
  // ...
  while (current < input.length - 1) {
    // ....
    //
    // If the character reaches this point, then its not valid so we throw a TypeError
    // with the character and location else we will be stuck in an infinite loop
    throw new TypeError('Unknown Character: ' + currentChar + ' ' + current);
  }

  // Return the `tokens` from the `tokenizer`
  return tokens;
};
```

We are done with the `tokenizer`. All the code at this point can be found [here](github.com/dephraiim).

```js
// You can test your tokenizer with
const tokens = tokenizer('set isEmployed as false');

// [
//   { type: 'keyword', value: 'set' },
//   { type: 'name', value: 'isEmployed' },
//   { type: 'ident', value: 'as' },
//   { type: 'boolean', value: 'false' },
//   { type: 'semi', value: ';' },
// ]
```
