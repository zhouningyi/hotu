'use strict';

require(['./config'], function(a) {
  require(['./controller'], function(Controller) {
    return new Controller();
  })
});
