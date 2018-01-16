# Memily

Javascript function [https://en.wikipedia.org/wiki/Memoization](memoization) library.

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Install `memily` to your project by running:

```bash
npm install --save memily
```

Or if you use Yarn:

```bash
yarn add memily
```

Then, import memily into your project like this:

```jsx
import memily from 'memily';
```

### Examples

#### Basic Usage

```jsx
import memily from 'memily';

function squareRoot(num) {
	console.log('Hello world!');
	return Math.sqrt(num);
}

const squareRootMemoized(squareRoot);

squareRootMemoized(4); // console.log: 'Hello world!'
squareRootMemoized(4); // ...
squareRootMemoized(4); // ...
squareRootMemoized(9); // console.log: 'Hello world!'
```

#### Caching for a finite time using `maxAge` option.

```jsx
import memily from 'memily';

function squareRoot(num) {
	console.log('Hello world!');
	return Math.sqrt(num);
}

const squareRootMemoized(squareRoot, { maxAge: 100 });

Promise.resolve()
	.then(() => squareRootMemoized(4)) // console.log: 'Hello world!'
	.then(() => squareRootMemoized(4)) // ...
	.then(() => new Promise(resolve => setTimeout(resolve, 200)))
	.then(() => squareRootMemoized(4)) // console.log: 'Hello world!'
```

#### Caching against a custom key.

```jsx
import memily from 'memily';

const steveHolt = {
	id: 1,
	firstName: 'Steve',
	surname: 'Holt',
};

const tobiasFunke = {
	id: 2,
	firstName: 'Tobias',
	surname: 'Funke',
};

function getFullNameString(user) {
	console.log('Hello world!');
	return `${user.firstName} ${user.surname}`;
}

const squareRootMemoized(squareRoot, { cacheKey: user => user.id });

getFullNameString(steveHolt);   // console.log: 'Hello world!'
getFullNameString(steveHolt);   // ...
getFullNameString(tobiasFunke); // console.log: 'Hello world!'
getFullNameString(tobiasFunke); // ...
```

#### Flushing the memoization cache

```jsx
import { flush } from 'memily';
```