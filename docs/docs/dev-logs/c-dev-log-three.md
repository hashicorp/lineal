---
title: Dev Log 03
---

# Dev Log 03: Let's talk about interactivity

Since the last dev log, one major feature has shipped and then I did some super informative implementation services.

The feature that shipped is the `interactor-cartesian-horizontal` modifier, but I'm getting ahead of myself. Let's start with the basics.

## The Basics

-Talk about binding events and the `on` modifier-
-Mention how Lineal wants to be in this business as little as possible-
-Highlight how "just events" means we can control other parts of the page in idiomatic ways-
-Hammer home that this is the whole goal of Lineal: to make data viz feel like "just ember"

If you open up the latest Ember guide on events, you'll see the `on` modifier. Something like

```hbs preview-template
<p>Did the thing? {{this.didTheThing}}</p>
<button type='button' {{on 'click' (fn (mut this.didTheThing) 'Yep')}}>
  Yep
</button>
```

With SVG support in Glimmer, this doesn't have to change.


```hbs preview-template
<svg width='500' height='200'>
  <rect width='200' height='50' fill='white' {{on 'click' (fn (mut this.didTheThing) 'Yep')}}/>
  <text x='100' y='25' text-anchor='middle' alignment-baseline='middle'>Yep</text>
  <text y='110' x='100' font-size='40' stroke='black' fill='red' transform='rotate(-10)'>
    Did the thing? {{this.didTheThing}}
  </text>
</svg>
```

So extending this (with a smattering of splattributes) we can do things like this with Lineal.

```hbs preview-template
<p>Did the thing? {{this.didTheThing}}</p>
<svg width='400' height='200' style='background:var(--c-base-0);'>
  <g transform='translate(200 175)'>
    <Lineal::Arcs
      @data={{array
        (hash v=1 theThing='barely')
        (hash v=10 theThing='absolutely')
        (hash v=4 theThing='yep')
      }}
      @theta='v'
      @startAngle='270d'
      @endAngle='450d'
      @colorScale='nominal'
      as |pie|
    >
      {{#each pie as |slice|}}
        <Lineal::Arc
          @startAngle={{slice.startAngle}}
          @endAngle={{slice.endAngle}}
          @outerRadius={{150}}
          @innerRadius={{100}}
          stroke-width='2'
          style='stroke:var(--c-base-0)'
          class={{slice.cssClass}}
          opacity={{if
            this.activeDatum
            (if (eq slice.data this.activeDatum) 1 0.3)
            1
          }}
          {{on 'mouseover' (fn (mut this.activeDatum) slice.data)}}
          {{on 'mouseout' (fn (mut this.activeDatum) null)}}
          {{on 'click' (fn (mut this.didTheThing) slice.data.theThing)}}
        />
      {{/each}}
    </Lineal::Arcs>
  </g>
</svg>
```

And for the most part this is it and also the dream. Lineal doesn't want to be in the business of having interactivity solutions because Ember already has those. Lineal wants to facilitate in the creation of template-first ember-idiomatic data visualizations. So when possible, this is what interactivity should look like.

However, sometimes things are more complicated than this. Sometimes interactivity in data viz is decoupled from the DOM for performance, usability, or utilitarian reasons.

## When The Basics Aren't Enough

The canonical example of needing something more than simple DOM events is a line chart. The line mark is actually a single `path` element with all data encoded in the `d` attribute. So if we wanted to make a tooltip that shows details for the datum under the cursor, what are we to do?

If we _must_ use DOM events with no extra spice, we can try adding `circle` elements as points.

```hbs preview-template
<div class='flex'>
  <div class='min-col'>
    {{#let (generate-sine 51) as |data|}}
      <div class='demo-two-fluid-chart'>
        <Lineal::Fluid class='demo-two-fluid-chart__plot' as |width height|>
          <svg class='demo-two-line-chart demo-two-fluid-chart__svg'>
            <title>A sine wave with an increasing magnitude</title>
            <desc>
              A sine wave with the function f(x) = sin(x) * x/5 plotted with x values
              ranging from 0 to 50.
            </desc>
            {{#let
              (scale-linear range=(array 0 width))
              (scale-linear range=(array height 0))
              as |xScale yScale|
            }}
              {{#if (and xScale.isValid yScale.isValid)}}
                <Lineal::Gridlines
                  @scale={{yScale}}
                  @direction='horizontal'
                  @length={{width}}
                />
                <Lineal::Gridlines
                  @scale={{xScale}}
                  @direction='vertical'
                  @length={{height}}
                  @lineValues={{array 5 11 17 23.5 30 36 42 48.5}}
                />
                <Lineal::Axis
                  @scale={{yScale}}
                  @orientation='left'
                  aria-hidden='true'
                />
                <Lineal::Axis
                  @scale={{xScale}}
                  @orientation='bottom'
                  @tickValues={{array 2 8 14 20.5 27 33 39 45.5 50}}
                  transform='translate(0,{{yScale.compute 0}})'
                  aria-hidden='true'
                />
              {{/if}}
              <Lineal::Line
                @data={{data}}
                @xScale={{xScale}}
                @yScale={{yScale}}
                @x='x'
                @y='y'
                @curve='natural'
                class='line'
              />
              {{#if (and xScale.isValid yScale.isValid)}}
                {{#each data as |d|}}
                  <circle
                    class='point'
                    cx={{xScale.compute d.x}}
                    cy={{yScale.compute d.y}}
                    r='5'
                    {{on 'mouseover' (fn (mut this.activeDatum) d)}}
                    {{on 'mouseout' (fn (mut this.activeDatum) null)}}
                  />
                {{/each}}
              {{/if}}
            {{/let}}
          </svg>
        </Lineal::Fluid>
      </div>

      <details>
        <summary>Plotted sine curve dataset</summary>
        <table>
          <thead>
            <tr>
              <th>x</th>
              <th>sin(x) * x/5</th>
            </tr>
          </thead>
          <tbody>
            {{#each data as |row|}}
              <tr>
                <td>{{row.x}}</td>
                <td>{{row.y}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </details>
    {{/let}}
  </div>

  <div class='sidebar'>
    <h4>Active Datum</h4>
    {{#if this.activeDatum}}
      <dl>
        <dt>x:</dt>
        <dd>{{this.activeDatum.x}}</dd>
        <dt>y:</dt>
        <dd>{{this.activeDatum.y}}</dd>
      </dl>
    {{else}}
      <em>Nothing selected.</em>
    {{/if}}
  </div>
</div>
```

This technically works, but it's plain as day why this isn't acceptable. The majority of the canvas is non-interactive, the active datum sidebar flickers as you mouse around, and the circles are really small interactive areas. We could try making the interactive areas bigger, but that would obscure the the underlying visualization and potentially cause overlapping. In addition to being a violation of [WCAG 2.5.5 (Target Area)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) this just generally sucks for everyone.

We can imagine for a second something better. Something that maximizes interactive area, results in always having an active datum, is forgiving to low precision (or even lazy) input, and still optimizes for accuracy.

To do this for our line chart, we'll want to:

1. Make a rectangle the size of the canvas observe the `mousemove` event.
2. Based on the x position of the mouse, do a reverse lookup on the dataset.
3. When there is no datum with a matching x value (the common case) bisect to find the nearest match.

This would still use a DOM event (everything does eventually) but it's evident that the logic in the event listener goes beyond what the platform offers.

## Introducing Interactors

Lineal's answer to encapsulating this interaction complexity is a new concept called Interactors. These are implemented as Ember modifiers and follow the pattern of binding N native events and exposing M new events.

An interactor for the above already exists, and it's called `interactor-cartesian-horizontal`. A bit of a mouthful, but a good naming scheme goes a long way.

This interactors adds `mousemove`, `click`, and `mouseleave` events and exposes `onSeek` and `onSelect` new handlers.

Since this is a modifier, simply adding it somewhere isn't going to result in what we expect. Even though the batteries aren't included, the wiring is.

Let's update the previous example to use an interactor.

## Real application of the horizontal cartesian interactor

-Making the tooltip
-Positioning the tooltip with css vars

## Accessibility

-We're off the beaten path, we shouldn't expect a11y to come for free
-Try using an above chart with keyboard arrow keys
-Interactors are an opportunity to also encapsulate some a11y best practices and conventions
-But that's not everything. We still need to get screen reader support

## Embracing Pluralism

-A11y helps remind us that not everyone is interacting with what we build in the same way
-This is true because every person is different, but it's also true because hardware is different.
-There has been a lot of tooltip talk, but "hover" and "mousemove" aren't good mobile experiences.
-This is compounded if we design tooltips that are themselves loaded with links or an abundance of info.
-Lineal dodges this problem by not giving you tooltips, but it's top of mind while designing these abstractions

- There will be more interactors
- There will likely be multiple keyboard traversal strategies

## M1 is almost complete!

## Where things have been bad

- Bounds class
- Fluid and resize observer
- Brutal tooling thing

## What's next

- Finish M1
- Patterns
- Too many arguments? Me too, foreshadow
