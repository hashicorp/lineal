/**
 * Copyright IBM Corp. 2020, 2026
 */
import { Encoding } from '../utils/encoding.ts';
import type { Accessor } from '../utils/encoding.ts';
import type { Scale } from '../utils/scale.ts';
/**
 * The available arguments to the `interactor-cartesian-horizontal` modifier.
 */
export interface InteractorArgs {
    /** A dataset of any type of data. */
    data: any[];
    /** The scale the represents the x-axis of the plot being interacted with. */
    xScale: Scale;
    /** The accessor for the x encoding of the plot being interacted with. */
    x: Accessor;
    /** The accessor (or accessors) for looking up data encoded on the y-axis. */
    y: Accessor | Accessor[];
    /** How sensitive rounding is when determining if near data should be included in
     * a selection. Measured in pixel space (i.e., after values have been computed by scales). */
    distanceThreshold: number;
    /** Called when the the modified element receives mouse movement or left/right arrow key input. */
    onSeek?: (data: ActiveData | null) => void;
    /** Called when the the modified element receives mouse click or space/enter key input. */
    onSelect?: (datum: ActiveDatum | null) => void;
}
export interface ActiveDatum {
    /** The encoding that corresponds to the `datum`. Useful for determining which
     * series the `datum` belongs to. */
    encoding: Encoding;
    /** An element from the data array provided to the Modifier. */
    datum: any;
}
export interface ActiveData {
    /** The element from the data array provided to the Modifier that is
     * closest to the interaction point. */
    datum: ActiveDatum;
    /** Surrounding data from the data array provided to the Modifier that is close
     * to the interaction point (as determined by the `distanceThreshold`). */
    data: ActiveDatum[];
}
declare const _default: import("ember-modifier").FunctionBasedModifier<{
    Args: {
        Positional: unknown[];
        Named: InteractorArgs;
    };
    Element: HTMLElement;
}>;
export default _default;
//# sourceMappingURL=interactor-cartesian-horizontal.d.ts.map