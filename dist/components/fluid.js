import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { didResize } from 'ember-resize-modifier';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
class Fluid extends Component {
  static {
    g(this.prototype, "width", [tracked], function () {
      return 0;
    });
  }
  #width = (i(this, "width"), void 0);
  static {
    g(this.prototype, "height", [tracked], function () {
      return 10;
    });
  }
  #height = (i(this, "height"), void 0);
  static {
    g(this.prototype, "entry", [tracked]);
  }
  #entry = (i(this, "entry"), void 0);
  onResize = entry => {
    this.width = entry.contentRect.width;
    this.height = entry.contentRect.height;
    this.entry = entry;
  };
  static {
    setComponentTemplate(precompileTemplate("<div class=\"lineal-fluid\" ...attributes {{didResize this.onResize}}>\n  {{yield this.width this.height this.entry}}\n</div>", {
      strictMode: true,
      scope: () => ({
        didResize
      })
    }), this);
  }
}

export { Fluid as default };
//# sourceMappingURL=fluid.js.map
