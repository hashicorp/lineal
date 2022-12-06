declare global {
  interface Assert {
    hasProperties(obj: Object, props: string[], message?: string): void;
    lacksProperties(obj: Object, props: string[], message?: string): void;
  }
}

const without = (arr: string[], subset: string[]): string[] => {
  const asSet = new Set(arr);
  subset.forEach((str) => asSet.delete(str));
  return Array.from(asSet);
};

export default function extend(assert: Assert) {
  assert.hasProperties = function (
    this: Assert,
    obj: Object,
    props: string[],
    message?: string
  ) {
    const missingProps = props.filter((val) => !obj.hasOwnProperty(val));
    const existingProps = props.filter((val) => obj.hasOwnProperty(val));

    const result = missingProps.length === 0;
    this.pushResult({
      result,
      actual: existingProps,
      expected: props,
      message: result
        ? message || 'Has all props'
        : `Missing expected props: ${missingProps.join(', ')}`,
    });
  };

  assert.lacksProperties = function (
    this: Assert,
    obj: Object,
    props: string[],
    message?: string
  ) {
    const unexpectedProps = props.filter((val) => obj.hasOwnProperty(val));
    const keys = Object.keys(obj);

    const result = unexpectedProps.length === 0;
    this.pushResult({
      result,
      actual: keys,
      expected: without(keys, props),
      message: result
        ? message || 'Lacks expected props'
        : `Includes props expected to be missing: ${unexpectedProps.join(
            ', '
          )}`,
    });
  };
}
