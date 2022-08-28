export type Accessor = (d: any) => any;

export class Encoding {
  field?: string;
  accessor: Accessor;

  constructor(accessor: string | number | Accessor) {
    if (typeof accessor === 'string') {
      this.field = accessor;
      this.accessor = (d: any) => d[accessor];
    } else if (typeof accessor === 'number') {
      this.accessor = () => accessor;
    } else {
      this.accessor = accessor;
    }
  }
}
