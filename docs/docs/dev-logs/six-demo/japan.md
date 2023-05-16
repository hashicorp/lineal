```hbs template
{{#let (stack-v
  data=this.data
  x='Year'
  y='value'
  z='source'
  offset='silhouette'
  order='insideOut'
) as |stacked|}}
<div class='demo-chart-with-axes with-legend'>
  {{#if this.load.isRunning}}
    <p>Loading&hellip;</p>
  {{else}}
    <Lineal::Fluid as |width height|>
        {{#let
          (scale-linear domain='..' range=(array 0 width))
          (scale-linear domain='..' range='300..0')
          as |xScale yScale|
        }}
      <svg class='fluid energy-streamgraph' height="300">
          <Lineal::Area
            @data={{stacked.data}}
            @xScale={{xScale}}
            @yScale={{yScale}}
            @curve='natural'
            @colorScale={{this.accentNuclear}}
          />
          {{#if (and xScale.isValid yScale.isValid)}}
            <g class='annotation'>
              <line
                x1={{xScale.compute 2011}}
                x2={{xScale.compute 2011}}
                y1='0'
                y2='300'
              />
              <text dx='5' x={{xScale.compute 2011}} y='10'>Fukushima Disaster</text>
            </g>
            <Lineal::Axis
              @scale={{xScale}}
              @tickFormat={{this.passthrough}}
              @orientation='top'
              @includeDomain={{false}}
              transform='translate(0,150)'
            />
            {{#if this.activeStackSlice}}
              <g class='interaction-overlay'>
                <line
                  stroke='var(--c-purple-line)'
                  stroke-width='3'
                  x1={{xScale.compute this.activeStackSlice.datum.datum.Year}}
                  x2={{xScale.compute this.activeStackSlice.datum.datum.Year}}
                  y1='0'
                  y2='300'
                ></line>
                {{#each
                  (stacked.stack (map-by 'datum' this.activeStackSlice.data))
                  as |d|
                }}
                  <circle
                    cx={{xScale.compute d.x}}
                    cy={{yScale.compute d.y}}
                    r='4'
                    fill='var(--c-purple-line)'
                  ></circle>
                {{/each}}
              </g>
            {{/if}}
            <rect
              class='interactor-overlay'
              tabindex='0'
              fill='transparent'
              x='0' y='0' width={{width}} height='300'
              {{interactor-cartesian-horizontal
                data=stacked.dataIn
                xScale=xScale
                x='Year'
                y='value'
                onSeek=this.updateActiveData
              }}
            />
          {{/if}}
      </svg>
      {{#if this.activeStackSlice}}
        <div
          class='rigid-tooltip'
          role='status'
          {{style
            --x=(str (xScale.compute this.activeStackSlice.datum.datum.Year))
          }}
        >
          <h4>Energy Mix in {{this.activeStackSlice.datum.datum.Year}}</h4>
          <dl>
            {{#each stacked.stackedCategories as |cat|}}
              {{#let (find-by 'datum.source' cat this.activeStackSlice.data) as |d|}}
                <dt>{{this.niceLabel d.datum.source}}:</dt>
                <dd>{{fmt d.datum.value}} TWh</dd>
              {{/let}}
            {{/each}}
          </dl>
        </div>
      {{/if}}
        {{/let}}
    </Lineal::Fluid>
  {{/if}}
</div>
{{/let}}
```

```js component
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { flatGroup } from 'd3-array';
import { ScaleOrdinal } from '@lineal-viz/lineal/scale';

export default class extends Component {
  @tracked data = [];
  @tracked activeStackSlice = null;

  load = task(async () => {
    const req = await fetch('/datasets/japan-energy-mix-over-time-records.json');
    this.data = (await req.json()).filter(d => d.value != null);
  });

  constructor(owner, args) {
    super(owner, args);
    this.load.perform();
  }

  niceLabel = (label) => label.split(' -')[0];
  passthrough = (x) => x;

  accentNuclear = new ScaleOrdinal({
    domain: ['Nuclear Consumption - TWh (zero filled)'],
    range: ['#3e9727'],
    unknown: '#928270'
  });

  @action
  updateActiveData(activeData) {
    this.activeStackSlice = activeData;
  }
}
```
