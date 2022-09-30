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

## When The Basics Aren't Enough

-Not every interaction in data viz maps 1:1 to an element.
-Line charts, force directed graphs, scatter plots
-Dissect how the horizontal scanning approach works

## Introducing Interactors

-Lineal's answer to encapsulating interaction complexity
-Batteries not included (but the wiring is)
-How it works

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
