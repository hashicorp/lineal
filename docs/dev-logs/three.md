---
title: Dev Log 03
order: 3
---

# Dev Log 03: Let's talk about interactivity

Since the last dev log, one major feature has shipped and then I did some super informative implementation services.

The feature that shipped is the `interactor-cartesian-horizontal` modifier, but I'm getting ahead of myself. Let's start with the basics.

## The Basics

If you open up the latest Ember guide on events, you'll see the `on` modifier. Something like

```gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

export default class ClickDemo extends Component {
  @tracked didTheThing = '';
  setDidTheThing = (val) => { this.didTheThing = val; };

  <template>
    <p>Did the thing? {{this.didTheThing}}</p>
    <button type='button' {{on 'click' (fn this.setDidTheThing 'Yep')}}>
      Yep
    </button>
  </template>
}
```

With SVG support in Glimmer, this doesn't have to change.

```gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

export default class SvgClickDemo extends Component {
  @tracked didTheThing = '';
  setDidTheThing = (val) => { this.didTheThing = val; };

  <template>
    <svg width='500' height='200'>
      <rect width='200' height='50' fill='var(--vp-c-bg-elv)' stroke='var(--vp-c-border)' rx='6' style='cursor:pointer' {{on 'click' (fn this.setDidTheThing 'Yep')}}/>
      <text x='100' y='30' text-anchor='middle' fill='currentColor'>Yep</text>
      <text y='110' x='100' font-size='40' fill='currentColor' transform='rotate(-10)'>
        Did the thing? {{this.didTheThing}}
      </text>
    </svg>
  </template>
}
```

So extending this (with a smattering of splattributes) we can do things like this with Lineal.

```gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Arcs, Arc } from '@lineal-viz/lineal/components';
import { array, hash, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { eq } from '~docs/helpers/truth-helpers';

export default class ArcsInteractiveDemo extends Component {
  @tracked didTheThing = '';
  @tracked activeDatum = null;

  setActiveDatum = (val) => { this.activeDatum = val; };
  setDidTheThing = (val) => { this.didTheThing = val; };

  <template>
    <p>Did the thing? {{this.didTheThing}}</p>
    <svg width='400' height='200' style='background:var(--c-base-0);'>
      <g transform='translate(200 175)'>
        <Arcs
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
            <Arc
              @startAngle={{slice.startAngle}}
              @endAngle={{slice.endAngle}}
              @outerRadius={{150}}
              @innerRadius={{100}}
              stroke-width='2'
              style='stroke:var(--c-base-0);cursor:pointer'
              class={{slice.cssClass}}
              opacity={{if
                this.activeDatum
                (if (eq slice.data this.activeDatum) 1 0.3)
                1
              }}
              {{on 'mouseover' (fn this.setActiveDatum slice.data)}}
              {{on 'mouseout' (fn this.setActiveDatum null)}}
              {{on 'click' (fn this.setDidTheThing slice.data.theThing)}}
            />
          {{/each}}
        </Arcs>
      </g>
    </svg>
  </template>
}
```

And for the most part this is it, and it's ideal. Lineal doesn't want to be in the business of having interactivity solutions because Ember already has those. Lineal wants to facilitate in the creation of template-first ember-idiomatic data visualizations. So when possible, this is what interactivity should look like.

However, sometimes things are more complicated than this. Sometimes interactivity in data viz is decoupled from the DOM for performance, usability, or utilitarian reasons.

## When The Basics Aren't Enough

The canonical example of needing something more than simple DOM events is a line chart. The line mark is actually a single `path` element with all data encoded in the `d` attribute. So if we wanted to make a tooltip that shows details for the datum under the cursor, what are we to do?

If we _must_ use DOM events with no extra spice, we can try adding `circle` elements as points.

```gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { scaleLinear } from '@lineal-viz/lineal/helpers';
import { Fluid, Axis, GridLines, Line } from '@lineal-viz/lineal/components';
import { array, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { and } from '~docs/helpers/truth-helpers';
import generateSine from '~docs/helpers/generate-sine';

export default class PointsInteractiveDemo extends Component {
  @tracked activeDatum = null;

  setActiveDatum = (val) => { this.activeDatum = val; };

  <template>
    <div class='flex'>
      <div class='min-col'>
        {{#let (generateSine 51) as |data|}}
          <div class='demo-two-fluid-chart'>
            <Fluid class='demo-two-fluid-chart__plot' as |width height|>
              <svg class='demo-two-line-chart demo-two-fluid-chart__svg'>
                <title>A sine wave with an increasing magnitude</title>
                <desc>
                  A sine wave with the function f(x) = sin(x) * x/5 plotted with x values
                  ranging from 0 to 50.
                </desc>
                {{#let
                  (scaleLinear range=(array 0 width))
                  (scaleLinear range=(array height 0))
                  as |xScale yScale|
                }}
                  {{#if (and xScale.isValid yScale.isValid)}}
                    <GridLines
                      @scale={{yScale}}
                      @direction='horizontal'
                      @length={{width}}
                    />
                    <GridLines
                      @scale={{xScale}}
                      @direction='vertical'
                      @length={{height}}
                      @lineValues={{array 5 11 17 23.5 30 36 42 48.5}}
                    />
                    <Axis
                      @scale={{yScale}}
                      @orientation='left'
                      aria-hidden='true'
                    />
                    <Axis
                      @scale={{xScale}}
                      @orientation='bottom'
                      @tickValues={{array 2 8 14 20.5 27 33 39 45.5 50}}
                      transform='translate(0,{{yScale.compute 0}})'
                      aria-hidden='true'
                    />
                  {{/if}}
                  <Line
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
                        {{on 'mouseover' (fn this.setActiveDatum d)}}
                        {{on 'mouseout' (fn this.setActiveDatum null)}}
                      />
                    {{/each}}
                  {{/if}}
                {{/let}}
              </svg>
            </Fluid>
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
  </template>
}
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

Let's update the previous example to use an interactor. First, the diff:

```diff
  {{#if (and xScale.isValid yScale.isValid)}}
    {{#each data as |d|}}
      <circle
-       class='point'
+       class='point {{if (eq d this.activeDatum) 'active'}}'
        cx={{xScale.compute d.x}}
        cy={{yScale.compute d.y}}
        r='5'
-       {{on 'mouseover' (fn (mut this.activeDatum) d)}}
-       {{on 'mouseout' (fn (mut this.activeDatum) null)}}
      />
    {{/each}}
+   <rect
+     tabindex='0'
+     fill='transparent'
+     x='0' y='0' width={{width}} height={{height}}
+     {{interactor-cartesian-horizontal
+       data=data
+       xScale=xScale
+       x='x'
+       y='y'
+       onSeek=(pick 'datum.datum' (fn (mut this.activeDatum)))
+     }}
+   />
  {{/if}}
```

```gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { scaleLinear } from '@lineal-viz/lineal/helpers';
import { Fluid, Axis, GridLines, Line } from '@lineal-viz/lineal/components';
import { interactorCartesianHorizontal } from '@lineal-viz/lineal/modifiers';
import { array } from '@ember/helper';
import { and, eq } from '~docs/helpers/truth-helpers';
import generateSine from '~docs/helpers/generate-sine';

export default class InteractorDemo extends Component {
  @tracked activeDatum = null;

  updateActiveDatum = (seekResult) => {
    this.activeDatum = seekResult?.datum?.datum ?? null;
  };

  <template>
    <div class='flex'>
      <div class='min-col'>
        {{#let (generateSine 51) as |data|}}
          <div class='demo-two-fluid-chart'>
            <Fluid class='demo-two-fluid-chart__plot' as |width height|>
              <svg class='demo-two-line-chart demo-two-fluid-chart__svg'>
                <title>A sine wave with an increasing magnitude</title>
                <desc>
                  A sine wave with the function f(x) = sin(x) * x/5 plotted with x values
                  ranging from 0 to 50.
                </desc>
                {{#let
                  (scaleLinear range=(array 0 width))
                  (scaleLinear range=(array height 0))
                  as |xScale yScale|
                }}
                  {{#if (and xScale.isValid yScale.isValid)}}
                    <GridLines
                      @scale={{yScale}}
                      @direction='horizontal'
                      @length={{width}}
                    />
                    <GridLines
                      @scale={{xScale}}
                      @direction='vertical'
                      @length={{height}}
                      @lineValues={{array 5 11 17 23.5 30 36 42 48.5}}
                    />
                    <Axis
                      @scale={{yScale}}
                      @orientation='left'
                      aria-hidden='true'
                    />
                    <Axis
                      @scale={{xScale}}
                      @orientation='bottom'
                      @tickValues={{array 2 8 14 20.5 27 33 39 45.5 50}}
                      transform='translate(0,{{yScale.compute 0}})'
                      aria-hidden='true'
                    />
                  {{/if}}
                  <Line
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
                        class='point {{if (eq d this.activeDatum) "active"}}'
                        cx={{xScale.compute d.x}}
                        cy={{yScale.compute d.y}}
                        r='5'
                      />
                    {{/each}}
                    <rect
                      class='interactor-overlay'
                      tabindex='0'
                      fill='transparent'
                      x='0' y='0' width={{width}} height={{height}}
                      {{interactorCartesianHorizontal
                        data=data
                        xScale=xScale
                        x='x'
                        y='y'
                        onSeek=this.updateActiveDatum
                      }}
                    />
                  {{/if}}
                {{/let}}
              </svg>
            </Fluid>
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
  </template>
}
```

## What about tooltips tho?

I'd be remiss to mention how to add interactivity without talking about tooltips. Sure, I said batteries aren't included, but this is such a comon pattern that it ought to be discussed.

Here's one way to make a tooltip using the existing scales and CSS vars.

Please ignore the part where the tooltip doesn't go away when you mouse out of the interactor `rect`. There's a runtime error from abusing `pick` in this way and it's not worth trying to workaround.

```gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { scaleLinear } from '@lineal-viz/lineal/helpers';
import { Fluid, Axis, GridLines, Line } from '@lineal-viz/lineal/components';
import { interactorCartesianHorizontal } from '@lineal-viz/lineal/modifiers';
import { array, concat } from '@ember/helper';
import { and } from '~docs/helpers/truth-helpers';
import generateSine from '~docs/helpers/generate-sine';
import str from '~docs/helpers/str';

export default class TooltipDemo extends Component {
  @tracked activeDatum = null;

  updateActiveDatum = (seekResult) => {
    this.activeDatum = seekResult?.datum?.datum ?? null;
  };

  <template>
    <div class='flex'>
      <div class='min-col'>
        {{#let (generateSine 51) as |data|}}
          <div class='demo-two-fluid-chart'>
            <Fluid class='demo-two-fluid-chart__plot' as |width height|>
              {{#let
                (scaleLinear range=(array 0 width))
                (scaleLinear range=(array height 0))
                as |xScale yScale|
              }}
                <svg class='demo-two-line-chart demo-two-fluid-chart__svg'>
                  <title>A sine wave with an increasing magnitude</title>
                  <desc>
                    A sine wave with the function f(x) = sin(x) * x/5 plotted with x values
                    ranging from 0 to 50.
                  </desc>
                  {{#if (and xScale.isValid yScale.isValid)}}
                    <GridLines
                      @scale={{yScale}}
                      @direction='horizontal'
                      @length={{width}}
                    />
                    <GridLines
                      @scale={{xScale}}
                      @direction='vertical'
                      @length={{height}}
                      @lineValues={{array 5 11 17 23.5 30 36 42 48.5}}
                    />
                    <Axis
                      @scale={{yScale}}
                      @orientation='left'
                      aria-hidden='true'
                    />
                    <Axis
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
                  <Line
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
                      {{interactorCartesianHorizontal
                        data=data
                        xScale=xScale
                        x='x'
                        y='y'
                        onSeek=this.updateActiveDatum
                      }}
                    />
                  {{/if}}
                </svg>
                {{#if this.activeDatum}}
                  <div
                    class='chart-tooltip'
                    role='status'
                    style={{concat
                      "--x:" (str (xScale.compute this.activeDatum.x))
                      ";--y:" (str (yScale.compute this.activeDatum.y))
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
            </Fluid>
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
    </div>
  </template>
}
```

And here's the CSS that uses the computed `--x` and `--y` properties to translate the tooltip. There's also a lot more going on here, but the point is that all the styles get to live together.

```css
.chart-tooltip {
  position: absolute;
  transform-style: preserve-3d;
  top: 25px;
  left: 25px;
  pointer-events: none;
  background: var(--c-base-0);
  padding: 1rem;
  width: min-content;
  transform: translate(
      calc(1px * var(--x, 0)),
      calc(-100% + 1px * var(--y, 0) - 1rem)
    )
    rotate(-30deg);
  transform-origin: bottom left;
  z-index: 100;

  &::before {
    content: ' ';
    position: absolute;
    bottom: -2px;
    left: -2px;
    width: 30px;
    height: 30px;
    background: black;
    transform: translateZ(-1px);
  }
}
```

## Accessibility

One of the many magics of the web platform is how we get for free due to rich ecosystem of tools and subsystems that are built on the declarative DOM, including the accessibility tree. For the small price of writing semantic markup we get keyboard support, narration, structure-based navigation, and so much more.

But we're off the beaten path at this point.

If we need a custom modifier to give us fancy mouse events, we can't expect to then get a11y conformance for free. Well, we actually can expect to get _some_ conformance for free because some of it is a matter of implementing _more_ events.

Have you tried using a keyboard on the above chart? `interactor-cartesian-horizontal` will also add a listener to `keydown` for reasonable keyboard support. Left and right arrows for seeking, space/enter for selection, and esc for clearing a selection.

This is done in a non-intrusive opt-in way, which is to say you need to add `tabindex='0'` yourself to the element the modifier is on to enable keyboard events. The modifier could do this on its own, but it seemed inappropriate to force this on consumers. Let me know if you disagree.

Keyboard support is great, but it is only one aspect of a11y. If we want to suport screen readers we'll need to get the tooltip to be narrated when seeking. Since the interactor doesn't know or care if you are using it to make a tooltip, this behavior doesn't come for me.

Fortunately ARIA was designed during the peak of the interactive web and has goodies for us, but I'll warn you now we're dealing with power tools.

ARIA live regions are a way to declare content as important enough to _interrupt current user behavior and be narrated when the content changes_. If this sounds scary it is. Again, power tools. In our case, we will only be changing content as a result of user behavior, so this cause and effect loop means there is no interrupting the user while they perform another task.

To further drive home how important it is that this tool be used wisely, we won't even use a live region directly. Instead we'll use `role='status'` which is a semantic shorthand for what amounts to `aria-live='polite'`. It shouldn't need to be said, but I'll say it anyway: don't use `role='status'` on elements that aren't communicating status.

This too is already in the above example. Honestly, compared to the 100+ lines in the interactor modifier, getting screen reader support in one line is pretty dreamy.

## Embracing Pluralism

Accessibility helps remind us that not everyone is interacting with what we build in the same way. This is true because every person is different, but it's also true because hardware is different. There has been a lot of tooltip talk in the second half of this post, but we shouldn't forget that "hover" and "mousemove" are hardware concepts intrinsic to pointer devices.

Mobile browsers will abide by these events, diligently transposing a touch to a pointer, but the experience lacks. First, touches are blobs with centroids while cursors are pixel perfect. But even if a finger could be used with the precision of a mouse, your fleshy form is still obscuring the screen.

This is compounded if we design tooltips that are themselves loaded with links or an abundance if info. Suddenly we have made an interface with a difficulty curve akin to a video game.

Lineal dodges this problem by not having tooltips, but it's always top of mind while designing these abstractions. Frankly, it seems more than likely that Lineal will eventually have a tooltip component if not only to provide an exemplar to all the engineers who want to implement their own for their own organizations with their own brand's details.

There will also be more interactors as well as keyboard traversal strategies for more complex charts like dense scatterplots, or more prescriptive charts like stacked bars.

# Administration & Announcements

Milestone 1 is almost complete! There are a couple more marks and maybe some rough edges to work on, but I'm quite happy with the progress.

More excitingly, Lineal now has two consumers!! A Consul team and a Vault team are both using Lineal to create donuts and line charts respectively.

## Where things have been bad

Reading these dev logs might sound like success story after success story, but that's because detailing all the time spent pacing and deleting code just to rewrite five minutes later isn't very interesting.

Here's a few things that sound out as misses though:

1. **Bounds class:** This thing is proving to be goofy. I still like the idea of it, but the interaction between tracked properties and the qualify method means that a scale cannot be constructed and qualified in the same render pass. This is not at all ergonomic feeling when making custom scales in JS.
2. **Fluid and resize observer:** I cut a patch release to provide the full resize observer entry from the `Lineal::Fluid` component. Dunno why I didn't include it originally. I think a principle going forward will be to never withold information from consumers. Oh also the native resize observer of course isn't runloop aware so I need to think through a better testing strategy here.
3. **Embroider macros and `@cached`:** This one is just a lot. It's not my wheelhouse, so peep the issue that started it all and applaud the community for taking care of things. [ember-auto-import#536](https://github.com/ef4/ember-auto-import/issues/536).

## Next steps

- Finish milestone 1
- Start working on pattern support (this unblocks Nomad refactors)
- Were you reading through these code snippets thinking "wow, there's some reptition in these arguments"? Yeah, that's foreshadow.
