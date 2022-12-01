declare global {
  interface Assert {
    hasProperties(obj: Object, props: string[], message?: string): void;
  }
}

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
}
