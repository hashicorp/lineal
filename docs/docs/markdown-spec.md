---
title: Markdown Spec
---

# This is a markdown test!

Here is a preamble

```
ember install lineal-viz
```

Here is a handlebars `preview-template` example

```hbs preview-template
<svg width='400' height='200'>
  <g transform='translate(200 200)'>
    <Lineal::Arcs
      @data={{array (hash v=1) (hash v=10) (hash v=4)}}
      @theta='v'
      @startAngle='270d'
      @endAngle='450d'
      @colorScale='reds'
      as |pie|
    >
      {{#each pie as |slice|}}
        <Lineal::Arc
          @startAngle={{slice.startAngle}}
          @endAngle={{slice.endAngle}}
          @outerRadius={{150}}
          @innerRadius={{100}}
          stroke='white'
          stroke-width='2'
          opacity={{if
            this.activeDatum
            (if (eq slice.data this.activeDatum) 1 0.3)
            1
          }}
          class={{slice.cssClass}}
          {{on 'mouseover' (fn (mut this.activeDatum) slice.data)}}
          {{on 'mouseout' (fn (mut this.activeDatum) null)}}
        />
      {{/each}}
    </Lineal::Arcs>
  </g>
</svg>
```

## Second heading

This is some more content, and I want to try a couple things.

1. First
2. I want to make
3. A list.

After that I want to

- Make another
- list
- unordered this time

### Third heading

~> Is this a note? Probably not

**Note: Is this a note? Probably not**

And lastly, let's try [adding an internal link](example.com) in the middle of a paragraph of text, which means I need to ramble enough to make a line-wrap happen. Given the 1000px width, this might take awhile. Well, this is probably long enough for two lines but I want three lines, so just a little bit more rambling to go. Is this enough? How about now? How about now?
