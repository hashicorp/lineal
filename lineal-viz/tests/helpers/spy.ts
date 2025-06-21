/**
 * Copyright IBM Corp. 2020, 2026
 */

export default function spyHelper(
  spy: sinon.SinonSpy,
  ...args: unknown[]
): void {
  spy(...args);
}
