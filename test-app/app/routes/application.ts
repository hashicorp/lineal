import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  async model() {
    const data = await fetch(
      'https://raw.githubusercontent.com/vega/vega-datasets/next/data/population.json'
    );
    return await data.json();
  }
}
