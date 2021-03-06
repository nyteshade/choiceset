# ChoiceSet

# NOTE: Docs are undergoing changes, as is the code; YMMV

## Overview
Being a long time pen and paper role player, I have always had a fascination with die rolling and computers. One particular problem, handled by those with mathmatics skills greater than mine, is the one around producing as truly a random number as possible given the artificial limitations of computing.

ChoiceSet is a class designed to solve for the similarity of random numbers generated by computers in a different manner. Namely, random numbers that are weighted, similar to loaded dice, for a given task at hand.

Unlike loaded dice, tailored to give you the best results in a real life, flesh and blood, dice toss, weighted randoms can be used to simulate a more accurate chance of success. When paired with tallied scores from sites like [AnyDice](https://www.anydice.com), we can more successfully *"roll dice"* in a manner that gives us results closer to doing the real thing.

Finally, sometimes we might want to intentionally skew results towards a given result based on circumstance or pre-existing logic. Back in the parlance of role-playing games, if we are generating a character class, we may wish to skew the randomly chosen class towards that of a fighter or barbarian should the previously rolled attribute of Strength be higher. For this type of problem, ChoiceSet can also help you achieve your desired outcome.

## Installation
In order to install `choiceset`, simply perform an npm install from the root of your particular project.

```sh
npm install choiceset --save
```

ChoiceSet also has a command line utility to allow the user to invoke its features from BASH or other shells. If this is how you wish to employ the tool, you may wish to install globally. This can be done by typing the following from the command line.

```sh
npm install choiceset --global
```

## Weighted Randoms, how do they work?
Weighted randoms work by assigning each possible choice 

## Usage

### From NodeJS (or comaptible environments)
To use ChoiceSet from Node or other compatible JavaScript environment, import or require the class to a place you can use it.

```javascript
const ChoiceSet = require('choiceset');

// The following bit of code will randomly choose,
// five times, a number from 1 to 6. It will do so
// each time, with equal weight.
// Output from this would be an array that might
// look like:
// [3, 5, 6, 4, 4]
ChoiceSet.of(1,2,3,4,5,6).chooseSome(5);

// The choices do not have to be numbers. They can 
// be strings as seen here. Example output might be
// something like:
// ['Sue', 'Tom']
ChoiceSet.of('Mary', 'Tom', 'Sue').chooseSome(2);

// You can also choose from a list of objects. 
let employee1 = {name:'Lisa', id:2323412}
let employee2 = {name:'Davis', id:123455}
ChoiceSet.of(employee1, employee2).chooseSome(1);
// or
ChoiceSet.of(employee1, employee2).chooseOne();

// This, however, may not have the results you
// were expecting. This has a lot to do with the
// fact that ChoiceSet converts the non object 
// choices you supply into objects. The above
// code would result in either ['Davis'] or 'Davis'
// if the Davis employee were chosen. Note the
// difference between chooseSome() and chooseOne()?
```

The above represents a glimpse into what ChoiceSet can do. It also brings up some interesting side
effects of the class. Since it works with objects but can take primitives like Strings or Numbers as choices, something else is going on underneath.

A choice of `{name:'Lisa', id:2323412}` is converted into an object of the form `{ name: 'Lisa', id: 2323412, weight: 100 }` internally. Picker methods like `chooseSome` or `chooseOne` also take another parameter wherein you could specify which property to return. The default is `name`. 

In the contrived example above you could see how things would seem to work but may not give you what you want. Furthermore it may even cause more problems by modifying or mutating your supplied objects. 

There are several ways to get around this. The easiest is to give pass in your objects wrapped in an object with your value as the `name` property. For those that care more about semantics, you could also pass the key to a object store as the name property. Here are a couple of examples.

**ObjectStore Example**

```javascript
const store = {
   'emp-101': {name:'Lisa', rank:26},
   'emp-102': {name:'Davis', rank:23},
   // ...
};

let employee = store[
    ChoiceSet.of(
        ...Object.keys(store)
    ).chooseOne()
];

// Possible result
// { name: 'Lisa', rank: 26 }
```

**Object As Name Example**...
*Semantically incorrect*

```javascript
const cars = [
   {name: {
      model: 'Firebird',
      year: 1970
   }},
   {name: {
      model: 'Trans-Am',
      year: 1976
   }}
];

ChoiceSet.of(...cars).chooseOne()

// Possible result
// { model: 'Trans-Am', year: 1976 }
```

I have a personal *TODO* to add a way to handle this more effectively. The easiest approach is to take an object without both a name and weight property and wrap it for you such that things work the way one suspects.

 - [ ] *Add support for Object values up front*

ChoiceSet has several other methods that one can use, including creating a traditional instance via `new` which is actually done by the shortcut method `of()`. 

It can also have its contents built up programmatically via other methods within. See the API section below.

### From the command line

- [ ] *TODO: Add this portion of the docs*

## Instance Properties
Every instance of a given ChoiceSet has the following properties.

```yaml
-choices: List of objects to choose from
-intervals: Cut points matching choices as to where they occur
-maxInterval: The maximum number that can be chosen and still select an item from the choices list.
-one: A getter that retrieves one random value in its entirety
-oneValue: A getter that retrieves the .value or ._obj or .name, in that order, of a single randomly chosen item
```

##### `choices`

This is an array of of the internal objects described above. Each choice entry or object has a few properties that have a reserved meaning. These are

 * `name`
  * This is the value returned by default whenever an entry is randomly chosen. Examples above show that neither type nor value are verified. 
 * `weight`
  * This is a number that is described in greater detail in the section **Weighted Randoms**. This is a value, integer or floating point, that denotes how much this entry is valued or weighed. If the number is higher than relative entries' weights then it has a higher chance of showing up. As logic would dictacte, should its value be smaller, then it has a lesser chance of occurring. 
 * `value` or `_obj`
  * This property serves as a way to store values in the ChoiceSet without worrying about property collision. In the examples above wherein `name` was semantically incorrect in its usage, it could have had its value stored in the `value` or `_obj` fields instead. Some methods will allow you to specify the property of the result instead of defaulting to `name`. Also, the getter `oneValue` will return a randomly chosen entry's `value`, `_obj` or `name` property; in that order.

##### `intervals`

This property is an array of weights from each choice in the choices array with each subsequent value summed. So if there were three choices, the first with a weight of 100, the second with 50 and the third with 100. The corresponding intervals array would be 

```javascript
['one', 'two', 'three'] // given these choices
[100, 150, 250]         // it would have these weights
```

This is of particular note since some simplistic math can make this work in our favor. The last number in the intervals list shows us the highest number in our range of random numbers we need to choose from. 

If we choose a random number between `0` and `250` and it comes up `87` then we have selected `'one'` or the first item in the `choices` array. If that number turned out to be `151`, we would have ended up with `'three'` instead. Simply by increasing the overall spread, we give `'one'` and `'three'` more chance of showing up than `'two'`. 

This solution requires far less memory than others that advocate creating huge arrays with individual indicies occupying one instance of a possible choice. Not to mention the logistics of copying, initializing and setting up the result.

  
