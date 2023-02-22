# @lineal-viz/lineal

## 0.4.0

### Minor Changes

- 68f6212: New scale.ticks getter for scales that support ticks
- f721209: Upgrade ember-cached-decorator-polyfill so everyone gets to benefit from @cached
- 73e0a03: Fixed a bug where ScaleThreshold used the wrong scale & DivergignPow/Log didn't expose exponent/base
- e13330c: New Scale#derive method available on all scales

### Patch Changes

- 12f95f0: Update package.json so properly state MPL-2.0 license instead of MIT
- 7636725: Bounds.parse converts two value arrays into Bounds instances

## 0.3.0

### Minor Changes

- 83378f2: A block form for Lineal::Points
- a1a4468: New ScalePoint and ScaleBand classes and helpers
- 9371b12: Introduces Lineal::Bars mark
- c7b49d6: Introduces Lineal::Points mark

## 0.2.2

### Patch Changes

- 98eda1d: Pass ResizeOberserverEntry object along through Lineal::Fluid

## 0.2.1

### Patch Changes

- 7c206da: Bug fixes: Yield the iteration index and the tick value from Lineal::Axis

## 0.2.0

### Minor Changes

- e1c39b4: Keyboard events for interactor-cartesian-horizontal
- 94a0aab: Introduce the `interactor-cartesian-horizontal` interactor
- 87d8957: Add a block form for Axis that gives total control of tick customization

## 0.1.1

### Patch Changes

- f50c62d: Bugfix: Correctly look up color by index or use the color accessor
- 52934cd: Bugfix: Do not sort pie slices.

## 0.1.0

### Minor Changes

- a35df60: Introduces scale-fn-compute helper for scale.compute helper compatibility
- e7de6a0: Introducing the Lineal::Fluid component for getting the dimensions of fluid elements

### Patch Changes

- 38c2cfb: Introduces a compatibility cached package for when cached is undefined downstream
