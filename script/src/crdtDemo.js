/*jslint node: true */

var LogootCausal = require('./logoot-causal');
var Views = require('./crdtDemoViews');


var lA = new LogootCausal('lcA');
var lB = new LogootCausal('lcB');

var views = new Views(lA, lB);


