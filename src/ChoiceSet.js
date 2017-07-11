/**
 * ChoiceSet is a weighted random solution that allows the each of the
 * items that are being chosen to have simply a name or full suite of
 * values other than their weights and names.
 *
 * Once the items have been setup with a name and weight, the system works
 * by creating a one to one array. Each item in the new array is a sum of
 * all the subsequent and current weights. The final weight, being the
 * maximum total weight, is also stored.
 *
 * Finally, in order to choose a choice, in a weighted fashion, a random
 * number between 0 and the maximum is chosen. The new intervals array is
 * looped through and if the random number appears less than the interval
 * its index is used to select the actual choice from the set. Voila.
 *
 * @author Brielle Harrison <nyteshade@gmail.com>
 */
class ChoiceSet
{
  /**
   * Creates a new set of choices. There is no validation in this
   * constructor, however, the values supplied should be an object
   * with at least two properties; name and weight. The weight can
   * be any arbitrary number, floating point or integer, and the
   * name should be the default String value to chosen.
   *
   * If a non String value is desired, an additional value property
   * or any other property may be added to the choice and retrieved
   * later via direct reference of the return value from .choose or
   * via .chooseProp(propName)
   *
   * @param {Array<Object>} n-number of Objects as described above
   */
  constructor(...values)
  {
    const OBJ = '[object Object]';
    const choices = [];
    const meta = [];

    values = values.map((v) => {
      v = ({}).toString.apply(v) === OBJ ? v : {name: v};
      v.weight = v.weight || 100;
      return v;
    });


    this.choices = values || [];
    if (this.choices.length) {
      this.calcIntervals();
    }
  }

  /**
   * Short hand for <code>new ChoiceSet(...)</code>. This approach
   * makes reading the code written elsewhere, easier. If the supplied
   *
   * @param {Array<Object>} n-number of Objects as described in the
   * constructor reference. There should be at least a name property
   * and a value property.
   */
  static of(...values)
  {
    let array =
        values.length === 1 &&
        values[0] instanceof Array &&
        values[0] || values;

    console.log(array);
    return new ChoiceSet(...array);
  }

  /**
   * Instantiates a ChoiceSet with numeric choices ranging from
   * the supplied from value to the supplied to value. All values
   * are returned with an equal weight by default.
   *
   * @param {Number} from a number indicating the start range
   * @param {Number} to a number indicating the end range, inclusive
   * @return {ChoiceSet} an instance of ChoiceSet
   */
  static weightedRange(from, to, weights = null)
  {
    let set = new ChoiceSet();
    for (let i = from; i < (to + 1); i++) {
      set.choices.push({
        name: i,
        weight: 100
      });
    }

    if (weights)
    {
      set.setWeights(weights);
    }
    else {
      set.calcIntervals();
    }

    return set;
  }

  /**
   * An easy way to instantiate a ChoiceSet of names and values. The
   * function takes an even number of parameters with the first being
   * the name and the second being the weight.
   *
   * @param {String} name the name of the choice
   * @param {Number} weight the weight of the choice
   * @return {ChoiceSet} an instance of ChoiceSet
   */
  static weightedSet(...values)
  {
    let set = new ChoiceSet();

    if (values.length % 2 != 0) {
      throw new Error("WeightedChoice must be instantiated with pairs");
    }

    set.choices = [];
    for (let i = 0; i < values.length; i+=2)
    {
      let name = values[i];
      let weight = values[i + 1];
      set.choices.push({name: name, weight:weight});
    }

    set.calcIntervals();

    return set;
  }

  /**
   * An easy way to instantiate a ChoiceSet of names and values. The
   * function takes an even number of parameters with the first being
   * the name and the second being the weight.
   *
   * @param {String} name the name of the choice
   * @param {Number} weight the weight of the choice
   * @param {Object} value the value of the choice
   * @return {ChoiceSet} an instance of ChoiceSet
   */
  static weightedValuedSet(...values)
  {
    let set = new ChoiceSet();

    if (values.length % 3 != 0) {
      throw new Error("weightedValuedSet must be instantiated with triplets");
    }

    set.choices = [];
    for (let i = 0; i < values.length; i+=3)
    {
      let name = values[i];
      let weight = values[i + 1];
      let value = values[i + 2];
      set.choices.push({name: name, weight:weight, value: value});
    }

    set.calcIntervals();

    return set;
  }

  /**
   * An easy way to instantiate a ChoiceSet of names, weights and values. The
   * function takes parameters in multiples of three. The first parameter is
   * the name of the choice and the second is the weight. The third object is a
   * collection of keys and values that will be applied to the choice in
   * question.
   *
   * @param {String} name the name of the choice
   * @param {Number} weight the weight of the choice
   * @param {Object} object to be merged with the resulting choice
   * @return {ChoiceSet} an instance of ChoiceSet
   */
  static weightedObjectSet(...values)
  {
    let set = new ChoiceSet();

    if (values.length % 3 != 0) {
      throw new Error("weightedObjectSet must be instantiated with triplets");
    }

    set.choices = [];
    for (let i = 0; i < values.length; i+=3)
    {
      let name = values[i];
      let weight = values[i + 1];
      let object = values[i + 2];
      set.choices.push({name: name, weight: weight, _obj: object});
    }

    set.calcIntervals();

    return set;
  }

  /**
   * Calculates the intervals of the weights of the choices in the set. It
   * also determines the maximum total weight in the set.
   */
  calcIntervals()
  {
    let intervals = [];

    this.choices.reduce(
      function(p, c) {
        intervals.push(
          ((p && p.weight) || 0) +
          ((c && c.weight) || 0)
        );
      },
      null
    );

    intervals = intervals.map(function(cur, idx, array) {
      return cur + array.slice(0,idx).reduce((p, c) => p + c, 0);
    });

    this.intervals = intervals;
    this.maxInterval = intervals[intervals.length - 1];
  }

  /**
   * Allows easy adjustment of a weight for a given index. The weight is
   * modified and then calcIntervals() is called to realign things for
   * the next choosing.
   *
   * NOTE see if this is the optimal setting for adjusting the weights
   *
   * @param {Number} index the index of the choice to modify
   * @param {Number} weight the weight of the choice in general
   */
  setWeightFor(index, weight)
  {
    if (this.choices[index]) {
      this.choices[index].weight = weight || 100;
      this.calcIntervals();
    }
  }

  /**
   * This allows weights to be set in bulk. The code will attempt
   * to apply a weight for a given choice at equivalent indices.
   *
   * @param {Array} arrayOfWeights an array of Numberered weights.
   */
  setWeights(arrayOfWeights)
  {
    if (this.choices.length !== arrayOfWeights.length)
    {
      console.warn('Array length mismatch; applying what is present');
    }
    for (let i = 0; i < this.choices.length; i++)
    {
      let choice = this.choices[i];
      let weight = arrayOfWeights[i];
      if (!choice || !weight || isNaN(weight)) {
        continue;
      }
      choice.weight = weight;
    }
    this.calcIntervals();
  }

  /**
   * It randomly choose one item from the set. It does so based on a
   * randomly chosen number within the given weight set.
   *
   * @param {String} prop the property of the randomly chosen item
   * @return {Mixed} the property value specified for the chosen item. This
   * defaults to 'name'.
   */
  chooseOne(prop = 'name')
  {
    return this.chooseProp(prop);
  }

  /**
   * Returns an array of results equivalent to those returned by
   * chooseOne.
   *
   * @param {Number} count an integer denoting the number of choices to pick
   * @param {String} prop the property of the randomly chosen item
   * @return {Mixed} the property value specified for the chosen item. This
   * defaults to 'name'.
   */
  chooseSome(count, prop = 'name') {
    let choices = [];
    for (let i = 0; i < count; i++) {
      choices.push(this.chooseProp(prop))
    }
    return choices;
  }

  /**
   * Simulates rolling dice with n-number of sides. In pen and paper
   * role-playing games, 3d6 means to roll three six sided dice together
   * and sum their results. Calling ChoiceSet.rollDice(3, 6) will simulate
   * the same effect.
   *
   * Optionally, if repeat is set to a number greater than 1, an array of
   * values is returned with the repeated results numbering the supplied
   * repeat count.
   *
   * @param {Number} times the number of times the die should be rolled
   * @param {Number} sides the number of sides the die should have
   * @param {Number} repeat the number of times the whole process should be
   * repeated
   * @return {Mixed} either an array of Numbers or a single Number resulting
   * in the sum of a die with sides rolled times times.
   */
  static rollDice(times, sides, repeat = 1, dropLowest = 0) {
    let count = [];
    let die = ChoiceSet.weightedRange(1, sides);

    for (let i = 0; i < repeat; i++) {
      let rolls = die.chooseSome(times);

      rolls.sort();
      if (dropLowest) {
        rolls = rolls.slice(dropLowest);
      }

      count.push(rolls.reduce((p,c) => p + c, 0));
    }

    return repeat === 1 ? count[0] : count;
  }

  /**
   * Randomly chooses a value from the set and returns the specified property
   * from the chosen object.
   *
   * @return {String} key the property value specified for the chosen item.
   * This defaults to 'name'.
   */
  chooseProp(key = 'name')
  {
    let choice = this.one;
    return (choice._obj && choice._obj[key]) || choice[key];
  }

  /**
   * Chooses a value via .one and then retrieves the value property of
   * the choice.
   *
   * @return {Mixed} the value of the chosen item from the set
   */
  get oneValue()
  {
    let choice = this.one;
    return choice.value || choice._obj || choice.name;
  }

  /**
   * Randomly chooses a value from the set and returns it in its entirety.
   *
   * @return {Mixed} an object from the ChoiceSet.
   */
  get one()
  {
    let roll = Math.random() * this.maxInterval;
    let item = null;
    let index = -1;

    for (let i = 0; i < this.intervals.length; i++) {
      if (roll < this.intervals[i]) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      console.log('ERROR');
      console.log(roll, index);
    }

    return this.choices[index];
  }

  /**
   * Using the probability counts on http://www.anydice.com in
   * conjunction with rolling 3 six sided dice and adding their
   * results, you can achieve a more realistically weighted
   * random for your use. Simply use the following:
   *
   * <code>
   *   let dice = ChoiceSet.weightedRange(
   *     3, 18,
   *     ChoiceSet.ANY_DICE_WEIGHTS_3D6
   *   );
   *   let roll = dice.chooseSome(6);
   * </code>
   *
   * @return {Array} an arry of 15 values indicating probability
   * weights for values 3 to 18, simulating rolling 3 six sided dice
   * and adding their results.
   */
  static get ANY_DICE_WEIGHTS_3D6()
  {
    let weights = [
      0.46, 1.39, 2.78, 4.63, 6.94, 9.72, 11.57, 12.50,
      12.50, 11.57, 9.72, 6.94, 4.63, 2.78, 1.39, 0.46
    ];

    return weights;
  }

  /**
   * Using the probability counts on http://www.anydice.com in
   * conjunction with rolling 4 six sided dice, dropping the lowest
   * and adding their results, you can achieve a more realistically
   * weighted random for your use. Simply use the following:
   *
   * <code>
   *   let dice = ChoiceSet.weightedRange(
   *     3, 18,
   *     ChoiceSet.ANY_DICE_WEIGHTS_4D6_DROP_LOWEST
   *   );
   *   let roll = dice.chooseSome(6);
   * </code>
   *
   * @return {Array} an arry of 15 values indicating probability
   * weights for values 3 to 18, simulating rolling 4 six sided dice,
   * dropping the lowest value, and adding their results.
   */
  static get ANY_DICE_WEIGHTS_4D6_DROP_LOWEST()
  {
    let weights = [
      0.08, 0.31, 0.77, 1.62, 2.93, 4.78, 7.02, 9.41, 11.42,
      12.89, 13.27, 12.35, 10.11, 7.25, 4.17, 1.62
    ];

    return weights;
  }

  /**
   * Given an object, make a determination if that object is a wrapper object
   * in the old style wherein `name` is the object to return and `weight` is
   * the actual weight of the object for randomness calculation. If so, or
   * either way, return two separate objects. One with meta, which contains
   * the weight and any other properties and the object itself to add to the
   * choices array.
   *
   * @param  {Object} obj an object to pick apart as above
   * @return {Object} an object with a `meta` and `choice` properties
   */
  static asMetaAndChoice(obj) {
    let result = {
      meta: null,
      choice: null
    };

    if (isFinite(obj.weight)) {
      result.choice = obj.value || obj._obj || obj.name;
      result.meta = obj;

      delete obj.name;
      delete obj.value;
      delete obj._obj;

      return result;
    }
    else {
      result.choice = obj;
      result.meta = {
        weight: 100
      }
    }

    return result;
  }
}

module.exports = ChoiceSet;
