/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
/**
 * A responsive container component that yields its current pixel dimensions.
 *
 * `Fluid` uses a `ResizeObserver` to track the dimensions of its containing element
 * and yields `width`, `height`, and the raw `ResizeObserverEntry` to its block.
 * This enables responsive charts that adapt to their container size.
 *
 * @example Basic usage
 * ```gts
 * <Fluid as |width height|>
 *   <svg width={{width}} height={{height}}>
 *     <!-- chart content -->
 *   </svg>
 * </Fluid>
 * ```
 *
 * ## Important: Using Scales with Mark Components
 *
 * When using Mark components (Line, Area, Arc, etc.) inside Fluid, **do not use
 * scale helpers** (e.g., `scaleLinear`) to create scales. Instead, define scales
 * as `@cached` class properties and use `.derive()` to create range-specific variants.
 *
 * ### ❌ Incorrect (causes infinite render loop)
 * ```gts
 * <Fluid as |width height|>
 *   {{#let (scaleLinear domain=this.domain range=(array 0 width)) as |xScale|}}
 *     <Line @xScale={{xScale}} ... />
 *   {{/let}}
 * </Fluid>
 * ```
 *
 * ### ✅ Correct (stable scale instances)
 * ```gts
 * import { cached } from '@glimmer/tracking';
 * import { ScaleLinear } from '@lineal-viz/lineal/utils/scale';
 *
 * class MyChart extends Component {
 *   @cached get xScale() {
 *     return new ScaleLinear({ domain: this.domain });
 *   }
 *
 *   <template>
 *     <Fluid as |width height|>
 *       {{#let (this.xScale.derive range=(array 0 width)) as |xScale|}}
 *         <Line @xScale={{xScale}} ... />
 *       {{/let}}
 *     </Fluid>
 *   </template>
 * }
 * ```
 *
 * **Why?** Scale helpers create new instances on every render. Mark components
 * call `qualifyScale()` which schedules domain updates after render. Combined
 * with Fluid's dimension updates, this creates an infinite re-render loop.
 * Using `@cached` properties with `.derive()` maintains stable scale instances.
 */
export interface FluidSignature {
    Blocks: {
        default: [number, number, ResizeObserverEntry | undefined];
    };
    Element: HTMLDivElement;
}
export default class Fluid extends Component<FluidSignature> {
    width: number;
    height: number;
    entry: ResizeObserverEntry | undefined;
    onResize: (entry: ResizeObserverEntry) => void;
}
//# sourceMappingURL=fluid.d.ts.map