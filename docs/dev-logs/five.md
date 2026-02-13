---
title: Dev Log 05
order: 5
---

# Dev Log 05: Learning Lineal

I'm a bit tired of writing at the moment, so I'll keep this one brief.

## I wrote a bunch of docs!

The best way to scale teaching a subject is to write things down. As the number of Lineal adopters grows, it was time to do an honest spike on documentation. So here's a brief overview of what is published now and what will be published in the fullness of time.

## Documentation today

Right now there are three forms of documentation.

1. Concept docs
2. API reference docs
3. Source code annotations

### Concept docs

These are hosted right here on this website. Links should be right there in the primary nav. A concept doc introduces, well, a concept, from Lineal and goes through the philosophy of the design decision. If someone reads all the concept docs, they should have a good sense of what the project is about, if it's a good for them, and how to write code in the intended way (not that the unintended way isn't welcome!).

### API reference docs

These are the polar opposite of concept docs. It's exclusively the details of component args, scale interfaces, class methods, etc. These are generated from source code using [TypeDoc](https://typedoc.org/) and are hosted alongside this VitePress site as part of the same Vercel deploy.

### Source code annotations

All classes and components in Lineal have had [TSDoc](https://tsdoc.org/) descriptions sprinkled on them. The beauty of this approach is that not only are those annotations used to generate the TypeDoc API reference docs, but they are available in VSCode/CoC/wherever you run a language server intellisense/tooltips/whatever pattern/noun your editor uses. Why reference a website when the docs are right there as soon as you type `.`? Is this shifting-left? Is that they call it?

## Documentation tomorrow

The goal of this spike was to get to "good enough". I have [long believed](https://mlange.io/talks/open-source-and-the-volunteer-workforce/#114) that doc tooling gets in the way of writing docs, so I wanted to defer the tooling trap. But [ideas are cheap](https://mlange.io/talks/open-source-and-the-volunteer-workforce/#85), so here are my thoughts on how Lineal docs ought to be.

1. Concept docs
2. Tutorials
3. API reference docs
4. Source code annotations
5. Gallery

And in this order! Well, in all reality a user will bounce around all of these documentation modalities and (if I could be so lucky) additional third-party reference material. But I think the common initial journey will go from "what is this?" to "how do I use this?" to "what is in here?" to "how do I achieve the thing I don't even know how to describe?".

### What is this?

This is where the concept docs play the biggest role. Additionally, the Lineal website should have more marketing-forward content, but content marketing is king for dev tools.

### How do I use this?

If the combination of the conceptual docs and social proof are enough to get a person to try Lineal out, they are likely to start with a tutorial rather than a blank slate. A few tutorials can go a long way towards kinesthetic learning.

Really these should be basic and evergreen: make a line chart with this dataset, create a higher-order donut chart component.

### What is in here?

Once someone ventures off on their own with a tool, they will generally be motivated enough to solve their own problems if there are breadcrumbs laid out in front of them. This can take the form of tabbing through a list of public methods/properties on an object, reading detailed docs on component interfaces, or (hopefully in extreme cases) perusing Lineal source code.

This is vital documentation that might traditionally be understood as the "day 2" developer experience. Happy day 2 developers refer more people to become day 1 developers. To improve upon the current TypeDoc API reference docs, I want to leverage the JSON output from TypeDoc to create first-class component/helper/modifier reference docs integrated into the Docfy site that is tailored for Ember consumption instead of general TypeScript consumption.

However, knowing an API inside and out can only get you so far with data visualization. Sometimes what you actually need is an example to point at and say "I want that". Furthermore, sometimes the magic sauce in examples won't even be Lineal things, they'll be SVG or CSS tricks, or they will be really effect visual design. This is where the gallery comes into play.

### How do I achieve the thing I don't even know how to describe?

Galleries have been supremely successful among data viz tools because they both demonstrate the tool well and also serve as inspiration and documentation. A good example in a gallery is worth a thousand StackOverflow questions, they say (no one says this).

Here is a list of good galleries among data viz tools:

1. [VisX](https://airbnb.io/visx/gallery)
2. [D3](https://observablehq.com/@d3/gallery)
3. [Vega Lite](https://vega.github.io/vega-lite/examples/)
4. [Unovis](https://unovis.dev/gallery)
5. [ECharts](https://echarts.apache.org/examples/en/index.html#chart-type-line)

A good gallery has the following:

1. Thumbnails
2. Source code
3. Executed code
4. User generated content
5. Tagging
6. Curation

I'm not yet sure how this will be achieved with the current site tooling, but I'm excited to get to this problem some day ᕕ( ᐛ )ᕗ
