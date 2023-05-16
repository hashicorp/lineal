---
title: Dev Log 06
order: 6
manualDemoInsertion: true
---

# Dev Log 06: Stacks

To talk about stacks we first have to talk about data. Well, first let's look at a couple stacked charts. Here's a stacked area chart plotting the number of car models manufactured by region and by cylinder count.

[[demo:intro-area]]

This looks a bit goofy with an area chart. First, the continuity of lines gives the impression of continuous data, which it isn't. Also, the values for 3 and 5 cylinders shrink to nearly nothing because of the sloping nature.

Let's try again with the other kind of mark that is commonly stacked: bars.

[[demo:intro-bars]]


Stacked charts are great for showing the trend of a collection of data series as well as the trend of the individual series and the proportions among them all. Like all charts, they have their shortcomings, such as how only one (or two if you're clever) slices of data get the baseline.

When this shortcoming is allowable for the greater good of the chart is a design choice I'm not going to get into, but it sets the stage for the technical challenge with stacks: if some of the marks aren't computed from the baseline, then how do we compute our x and y values?

The short answer is we stack all of preceding computed values. The long answer is it depends on how you want to stack things.

## D3 Stacks

D3's answer to stacking is a utility in the `d3-shape` (foreshadow) package aptly named [`stack`](https://github.com/d3/d3-shape#stack). The `stack` function itself is a stack generator (meaning it returns a function that computes a stack from data).

The generator takes a set of keys (which become the slices of a stack), optional an order function (which will determine the order of the slices based on the complete dataset (also foreshadow)), and an optional offset function that can affect the computed upper and lower values of a stacked segment.

Invoking it looks like this, modified from the D3 docs:

```js
const data = [
  {month: new Date(2015, 0, 1), apples: 3840, bananas: 1920, cherries: 960, durians: 400},
  {month: new Date(2015, 1, 1), apples: 1600, bananas: 1440, cherries: 960, durians: 400},
  {month: new Date(2015, 2, 1), apples:  640, bananas:  960, cherries: 640, durians: 400},
];

const stack = d3.stack()
    .keys(["apples", "bananas", "cherries", "durians"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

const series = stack(data);

console.log(series);
// [
//   [[   0, 3840], [   0, 1600], [   0,  640]], // apples
//   [[3840, 5760], [1600, 3040], [ 640, 1600]], // bananas
//   [[5760, 6720], [3040, 4000], [1600, 2240]], // cherries
//   [[6720, 7120], [4000, 4400], [2240, 2640]], // durians
// ]
```

Yep. That's it. Data goes in, different data comes out. Notably, the data that goes in has 3 elements, each objects with keys and values, and the data that comes out has 4 elements, each another array which all have 3 elements...which area also arrays that each have two elements.

Let's dig into the output data first, I think that'll be quicker. From the inside out:

1. The inner-most elements are values in data-space. The first pair of values we see is `[0, 3840]`. The `0` and the `3840` are expected to pass through a scale function before rendered somewhere.
2. Each tuple of values represents a data point, except the relevant value is now the difference between `d[1]` and `d[0]`. For `[0, 3840]`, the value is `3840` and it represents the value for `apples` in the the first record in the input data. This gets more interested when looking at other fruit. Two lines down, the first tuple is `[5760,6720]`. Here `5760` is the sum of all previous fruits (`3840` and `1920`) and `6720` is the sum of all previous fruits plus the value for this fruit, which is cherries. In this way, the data gets stacked.
3. Each array of tuples represents all computed stacked values for a key in the stack generator. There are 4 arrays of tuples because there are four fruits. Each array has 3 tuples because there are 3 records in the original dataset.
4. All the arrays are once more wrapped in an array, with the expectation that the whole stack would be iterated over when rendering a stacked area or stacked line chart.

The shape of this data is a little awkward for use with Ember. We expect our data to end with named keys on objects so we can do things like `{{datum.x}}` rather than `{{datum.[0]}}` which just feels funny. This is one of the reasons why it makes sense to create a Lineal stack class, but the other reason is the shape of the input data.

Explaining the input data will take a little longer.

## Time to talk about data

The data that goes into the stack generator function is a table. What does that mean? Isn't it just an array of objects? Yes, it is also that, but specifically those objects have matching keys! In this way, we can construct a perfect table of data:

```hbs preview-template
{{#let (array
  (hash month='January'  apples=3840 bananas=1920 cherries=960 durians=400)
  (hash month='February' apples=1600 bananas=1440 cherries=960 durians=400)
  (hash month='March'     apples=640  bananas=960 cherries=640 durians=400)
) as |data|}}
  <table>
    <thead>
      <th>Month</th>
      <th>Apples</th>
      <th>Bananas</th>
      <th>Cherries</th>
      <th>Durians</th>
    </thead>
    <tbody>
      {{#each data as |row|}}
        <tr>
          <td>{{row.month}}</td>
          <td>{{row.apples}}</td>
          <td>{{row.bananas}}</td>
          <td>{{row.cherries}}</td>
          <td>{{row.durians}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
{{/let}}
```

Compare this to the data that Mark components accept, which is record formatted. What does that mean? Isn't that data also just an array of objects? Yes, it is also that, but specifically each record represents a single datum. It has not been tabulated! Furthermore, it may not be possible to tabulate. Consider:

```hbs preview-template
{{#let (array
  (hash month='January' fruit='apples' value=3840)
  (hash month='January' fruit='bananas' value=1920)
  (hash month='January' fruit='cherries' value=960)
  (hash month='January' fruit='durians' value=400)

  (hash month='February' fruit='apples' value=1600)
  (hash month='February' fruit='bananas' value=1440)
  (hash month='February' fruit='cherries' value=960)
  (hash month='February' fruit='durians' value=400)

  (hash month='March' fruit='apples' value=640)
  (hash month='March' fruit='bananas' value=960)
  (hash month='April' fruit='cherries' value=640)
  (hash month='March' fruit='durians' value=400)
) as |data|}}
  <table>
    <thead>
      <th>Month</th>
      <th>Fruit</th>
      <th>Value</th>
    </thead>
    <tbody>
      {{#each data as |row|}}
        <tr class={{if (eq row.month 'April') 'accent'}}>
          <td>{{row.month}}</td>
          <td>{{row.fruit}}</td>
          <td>{{row.value}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
{{/let}}
```

This data is well-formatted, and you can see how it would be converted into a table, but there's some goofiness going on. This record for `cherries` where the month is `April` might make things funky when we do a group-by. If you recall from SQL, when we group data, we must have an aggregate function for all properties we group by. Let's just assume something like an array aggregate for now, and let's see what happens when we group by month:

```js
const { group } from 'd3-array';

const data = [
  { month: 'January', fruit: 'apples', value: 3840 }
  { month: 'January', fruit: 'bananas', value: 1920 }
  { month: 'January', fruit: 'cherries', value: 960 }
  { month: 'January', fruit: 'durians', value: 400 }

  { month: 'February', fruit: 'apples', value: 1600 }
  { month: 'February', fruit: 'bananas', value: 1440 }
  { month: 'February', fruit: 'cherries', value: 960 }
  { month: 'February', fruit: 'durians', value: 400 }

  { month: 'March', fruit: 'apples', value: 640 }
  { month: 'March', fruit: 'bananas', value: 960 }
  { month: 'April', fruit: 'cherries', value: 640 }
  { month: 'March', fruit: 'durians', value: 400 }
];

console.log(group(data, d => d.month));

// Simplified to fit in the code snippet
// {
//   'January':  [ Array of 4 ],
//   'February': [ Array of 4 ],
//   'March':    [ Array of 3 ],
//   'April':    [ Array of 1 ],
// }
```

Suddenly our neatly formatted record data is showing some problems for when we go to tabulate it. But lets tabulate it just for fun. It'll end up looking like this:

```hbs preview-template
{{#let (array
  (hash month='January'  apples=3840 bananas=1920 cherries=960 durians=400)
  (hash month='February' apples=1600 bananas=1440 cherries=960 durians=400)
  (hash month='March'     apples=640  bananas=960 durians=400)
  (hash month='April'     cherries=640)
) as |data|}}
  <table>
    <thead>
      <th>Month</th>
      <th>Apples</th>
      <th>Bananas</th>
      <th>Cherries</th>
      <th>Durians</th>
    </thead>
    <tbody>
      {{#each data as |row|}}
        <tr>
          <td>{{row.month}}</td>
          <td>{{row.apples}}</td>
          <td>{{row.bananas}}</td>
          <td>{{row.cherries}}</td>
          <td>{{row.durians}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
{{/let}}
```

There are holes in out table! :o How could we possibly stack holes? The answser is we can't. D3 does. not. like. holes.

Hopefully this has sufficiently described why the problem is complicated enough to justify its own release and also the very first transform in Lineal.

Before moving on to stacks in action, here are some further reading resources:

1. [An interactive look at grouping and stacking data](https://observablehq.com/d/c6ab6dc6c4e5e7de)
2. [The Pandas docs for reshaping and pivot tables](http://pandas.pydata.org/pandas-docs/stable/user_guide/reshaping.html#)
3. [The Observable Plot docs for stacks](https://observablehq.com/plot/transforms/stack)

I especially recommend spending some time with sample datasets and Pandas if you are feeling a little lost on working with data. The columnar approach to managing data will break your brain, and you'll be a better wiser person once you piece it all back together again.

## Stacks in Action

First and foremost, let's go back to that stacked bar chart example from the top. I never showed you the underlying data.

[[demo:deep-bars]]

Here the underlying data is in a record format like you would expect from a data object provided to a Mark component. If you look at the backing class, you'll see that there is still processing occurring to the initial dataset that is being fetched, but that processing is an initial aggregation to sum by cylinders and region. If you want to see the unprocessed data, by all means, check out the network tab.

The neat thing that `Lineal::Area` and the new `Lineal::VBars` and `Lineal::HBars` will do is take a `@color` encoding and automatically group data by this encoding and internally create a stack. To do this, assumptions have to be made. For instance, stack order is equal to the data order and the stack offset is none. But! This is a reasonable default. It makes it nice and easy to quickly stack data with a couple lines of code.

And then, when you're ready to finesse and add interactivity, you can drop down a level of abstraction and create the stack transform on your own.

Here's a troubling dataset: energy mix per capita for all G20 regions in 2021.

What we want to do is simultaneously compare total energy per capita by region as well as contrast fossil fuels and renewables. To do this we want to plot bars where x = value and y = region (this gets us the energy mix per capita comparison) and stack bars by source (this gives us the mix breakdown). To truly contrast fossil fuels and renewables we want to finesse our stack. We want to use the diverging `stackOffset` strategy to align our baseline between fossil fuel sources (coal, oil, and gas) and renewable sources (nuclear, hydro, wind, solar, and other).

[[demo:energy-mix-svg]]

What's happening here is the `stack-h` helper is being used to create a stack data structure where data is stacked horizontally and the offset is diverging.  The `z` argument is what we were calling `color` before, except since this is a stack in the abstract, calling the pivot field "color" feels a bit leading.

What gets returned from the helper is a Stack, which is a stateful thing that tabulates and stacks record data. Then, when we want to render a mark, we provide `stacked.data` to the `@data` arg. Mark components are stack aware and know when data has already been stacked. We also don't need to provide `@x` and `@y` encodings, because stacks have known fields.

## Interop with Interactors

Another benefit of this stateful `Stack` thing is it helps us use existing interactor modifiers. Consider the `cartesian-horizontal-interactor`, which takes `x` and `y` encodings just like a mark would. However, we can't give it the unstacked data and expect it to just work. Our x or y coordinates will be unstacked and result in rendering bugs. But also it wouldn't make sense for the interactor to restack the data that the mark component already stacked.

So instead, we stack once using the `stack-v` or `stack-h` helper (or the `Stack` class directly in a backing class or wherever) and then use the `Stack#stack` method as a helper to stack a single slice of data that we get back from an interactor.

Here's a closer look at Japan's energy mix over time in another popular stacked visualization: the streamgraph.

[[demo:japan]]

Streamgraphs are good at capturing vibes. Here we don't have a y-axis, but a touch of interactivity helps a user get specifics if they wish to. However, the chart is impactful even at a glance: we can see how nuclear power in Japan is halted almost immediately after the Fukushima Daiichi disaster in 2011.

## Stacking without Stacks

> A note on accessibility and DOM order. A recreation of the diverging stack chart with HTML and CSS

