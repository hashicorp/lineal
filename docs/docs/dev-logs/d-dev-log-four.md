---
title: Dev Log 04
---

# Dev Log 04: More Scale and More Marks

[Lineal v0.3.0 just shipped](https://www.npmjs.com/package/@lineal-viz/lineal)! This release includes two new scales and two new marks, which lay the foundations for common charts like bars and bubbles.

## Scales Pt. 2

If this is the first time you are hearing about scales, may I suggest you read [Dev Log 01](/docs/dev-logs/a-dev-log-one) and come right back.

Super briefly, the purpose of a scale is mapping a value from data space (`domain`) to pixel space (`range`). Scales broadly fit into four categories:

  1. Continuous domain -> continous range (e.g., Lineal, Power, Logarithmic, Sqrt)
  2. Continuous domain -> discrete range (e.g., Quantize, Quantile)
  3. Discrete domain -> discrete range (e.g., Ordinal)
  4. Discrete domain -> continuous  range

It's this fourth category that the new Band and Point scales fall under.

## Let's make a bar chart

A quintessential type of chart is the histogram. It visualizes the quantity of bins as bars. All the bars shown together captures the distribution of the data across the bins.

Choosing a bin size for a histogram is actually a bit of an open statistics question. Too many bins means you aren't seeing a distribution at all, too few bins means interesting dips in data get clumped together and lost in a single bin.

So what we'll do is side-step that problem entirely (some day Lineal will have utilities for doing [data transformation such binning](https://vega.github.io/vega-lite/docs/bin.html), but not today).

Instead, let's assume the data has already been binned and our task is to draw rectangles with axes and gridlines. The x-axis is our bins and the y-axis is the quantity. Since the y-axis is mapping a continuous domain (quantity) to a continuous range (rectangle y coordinate and height) this one gets to use an existing scale, `ScaleLinear`. But the x-axis is mapping a discrete domain (bins) to a continuous range (rectangle x coordinate and width). So we'll have to use one of the new scales for this.

  - `ScalePoint`: Divides a numeric range into X segments where X is the number of elements in the discrete domain. Calling the scale with a value returns the point in the numeric range that maps to the segment in the scale that corresponds with the value.
  - `ScaleBand`: Divides a numeric range into X segments just like `ScalePoint`. Additionally, the range is divided based on a band width that is tunable using padding values.

Since we need to determine the rectangle x coordinate as well as the width, we want to use the `ScaleBand` since it has the derived `band` value in addition to the partitioning of a range.

**Gridlines and Axes**

With our scales established, let's draw some rectangles. 

**Rectangles**

If you look closely, you'll notice that a third scale snuck in. Recall that there are four encodings for bars: `x`, `y`, `width`, and `height`. `width` is a static number that we get from the band scale, so we need three scales for the remaining encodings.

A neat property of `y` and `height` for this particular chart is that they are supplementary: `y + height == range.max`. Because of this property, `hScale` and `yScale` can be modeled as inverses.

## Let's make a punchcard chart

This is another fun chart for showing distributions across two dimensions. It also conveniently exercises the new `ScalePoint` and `Points` mark. We'll make a fairly typical activity chart here, plotting hours on the x-axis and days of the week on the y-axis. A chart like this helps analysts identity usage patterns (e.g., does activity skew towards a 9-5 schedule? Are weekends less busy than week days?).

**Gridlines and Axes**

This should look pretty much the same as the axes and bars for our bar chart above. The key differences to consider are

  - **Using a fixed domain**: Since we know there are 7 ordered days in a week and 24 ordered hours in a day, we want to specify these rather than letting Lineal determine the domains of the dataset on its own. This would lead to errors in the event that the dataset had no data for a particular day or a particular hour.
  - **Making room for circle sizes**: The range for the size scale for the points will need to fit within the step size of both the x-scale and the y-scale. Assuming the x and y scale ranges are hardcoded, then this math can be done upfront.

**Points**

Points themselves can still feel squishy from an analytics perspective. [Our perception of differences in area isn't very good](), so let's add text.

**Points + Text**

Notice that when circles are too small, the text is instead rendered above a circle instead of within it. This is a little detail that I think goes a long way towards legibility. It's also nice that this little rendering exception is implemented in the template. Imagine your frustration if you were debugging this code and found this conditional deep in some d3 spaghetti in a backing class.

## Accessibility!

As discussed in prior dev logs, the accessibility you get for free with SVGs is much less than what you get with HTML. This is compounded when elements are positioned irrespective of their DOM order. 

Let's go over a couple little things we can do with this punchcard chart to make it more screen reader friendly.

First, let's make sure our data is well-ordered. The `Lineal::Points` component will render points in the order the `@data` array is ordered. Maybe in the future something smarter can be done here, but for now this is the safest approach for Lineal to take. 

If we assume a typical Western reading order of left to right and top to bottom, then what we want to do is pre-sort our data by y encoding and x encoding.

**Sorted**

Compare the DOM here with the DOM above.

Thinking broader, is this actually how the chart is read by visual users? If a data visualization was nothing more than a table, why not just use a table? The whole point is by encoding various dimensions we can create something that is both understand immediately and also studied. Maybe it would actually be better to sort from largest to smallest. Maybe it's the hours with no activity that actually tell the story. A really good chart is going to be designed with some intention behind it that should be carried through implementation.

And even still, a large part of accessibility is accommodating. This is why including a table of the underlying data that can also be downloaded to be used in a tool a person ay be more comfortable with is never a bad thing.

## Bonus chart

All this talk of tables and HTML makes for a good opportunity to use Lineal primitives for non-SVG visualizations. So here's the same punchcard dataset rendered as a heatmap in a basic HTML table. As a toolkit, Lineal wants to be useful in a variety of situations.

**Table**

## That's all folks

Thanks for reading! Next up is pattern support (I mean it this time) and docs!
