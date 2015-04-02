"use strict";

require(['./config', 'model/browser', './controller'], function (a, browser, Controller) {
  return new Controller();
  // require(['./controller'], function (Controller) {
  //   return new Controller();
  // });
});
