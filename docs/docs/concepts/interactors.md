---
title: Interactors
order: 5
---

# Interactors

The world is full of static visualizations. Some make it into persuasive slide decks, others are printed and hung on walls, but the web has the tools to also make visualizations interactive.

Lineal, being a toolkit for Ember, first and foremost doesn't want to be responsible for interactivity. Ember already has a template-first eventing system that works with SVG elements.

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
          {{style cursor='pointer'}}
        />
      {{/each}}
    </Lineal::Arcs>
  </g>
</svg>
```

Whenever possible, this is the suggested approach to interactivity with Lineal: just use the `on` modifier to add events. However, sometimes interactivity is more complicated than this. Sometimes interactivity in data viz is decoupled from the DOM for performance, usability, or utilitarian reasons.

A common example of needing something more than simple DOM events is a line chart. The line mark for a line chart is a single `path` element with all the data encoded in the `d` attribute. So if you want to make a tooltip that shows the details for the datum under the cursor, using the `on` modifier won't be enough.

Instead, what's needed is:

1. A target element the size of the full line chart plotted area to observe the `mousemove` event.
2. Logic in the `mousemove` event handler that takes the x position of the mouse
3. Logic that converts the x position from visual space to data space.
4. More logic to lookup the nearest data point(s) to this data-space value.

This would still use a DOM event (everything does eventually) but it's evident that the logic in the event listener goes beyond what the platform offers. Furthermore, this is _just_ for the mouse interaction story. What about keyboard interactivity?

## Abstracting event handlers

Interactors are the answer to this dilemma. They are modifiers that Lineal includes that maps interactivity intentions to event handlers. Here is an example of the `interactor-cartesian-horizontal` modifier.

```hbs preview-template
<div class='flex'>
  <div class='min-col'>
    {{#let (generate-sine 51) as |data|}}
      <div class='demo-two-fluid-chart'>
        <Lineal::Fluid class='demo-two-fluid-chart__plot' as |width height|>
          {{#let
            (scale-linear range=(array 0 width))
            (scale-linear range=(array height 0))
            as |xScale yScale|
          }}
            <svg class='demo-two-line-chart demo-two-fluid-chart__svg'>
              <title>A sine wave with an increasing magnitude</title>
              <desc>
                A sine wave with the function f(x) = sin(x) * x/5 plotted with x values
                ranging from 0 to 50.
              </desc>
              {{#if (and xScale.isValid yScale.isValid)}}
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
              {{#if this.activeDatum}}
                {{#let
                  (xScale.compute this.activeDatum.x) (yScale.compute this.activeDatum.y)
                  as |dx dy|
                }}
                  <line class='guideline' x1='0' x2={{width}} y1={{dy}} y2={{dy}} />
                  <line class='guideline' y1='0' y2={{height}} x1={{dx}} x2={{dx}} />
                {{/let}}
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
                <rect
                  class='interactor-overlay'
                  tabindex='0'
                  fill='transparent'
                  x='0' y='0' width={{width}} height={{height}}
                  {{interactor-cartesian-horizontal
                    data=data
                    xScale=xScale
                    x='x'
                    y='y'
                    onSeek=(pick 'datum.datum' (fn (mut this.activeDatum)))
                  }}
                />
              {{/if}}
            </svg>
            {{#if this.activeDatum}}
              <div
                class='chart-tooltip'
                role='status'
                {{style
                  --x=(str (xScale.compute this.activeDatum.x))
                  --y=(str (yScale.compute this.activeDatum.y))
                }}
              >
                <h4>Active Datum</h4>
                <dl>
                  <dt>x:</dt>
                  <dd>{{this.activeDatum.x}}</dd>
                  <dt>y:</dt>
                  <dd>{{this.activeDatum.y}}</dd>
                </dl>
              </div>
            {{/if}}
          {{/let}}
        </Lineal::Fluid>
      </div>
    {{/let}}
  </div>
</div>
```

This interactor, as suggested by the name, assumes a cartesian plot where interactivity is only applicable along the x axis. With these guarantees, the modifier exposes the following interactivity intentions:

- `onSeek`: The event for when the data being inspected by the user changes.
- `onSelect`: The event for when the datum chosen by the user changes.

Within the implementation of the interactor, these intentions are expanded as:

- `mousemove`: Using the provided `xScale`, `x` encoding, and `y` encoding(s), calls `onSeek` with the data points nearest to the cursor.
- `click`: Calls `onSelect` with the datum nearest to the cursor.
- `mouseleave`: Clears the active datum and calls `onSeek` and `onSelect` with `null`
- `keydown` (left/right): Calls `onSeek` with the next/previous data visually nearest to the most recently seeked to datum.
- `keydown` (space/enter): Calls `onSelect` with the most recently seeked to datum.
- `keydown` (ESC): Clears the active datum and calls `onSeek` and `onSelect` with `null`.

## Interactors as a pattern

There are many ways to interact with a data visualization and it would be foolish to think Lineal could have an implementation for all ways. Frankly it would be tragic if Lineal had all the answers and users of Lineal never tried to invent a new and novel way to interact with data.

Instead, Lineal wants to instill the pattern of decoupling interactivity intentions from DOM events using Ember modifiers. Whenever Lineal _doesn't_ have an interactor and the interaction model you desire is more complex than simple DOM events can solve for, your instinct should be to make a custom modifier in the style of an interactor.
