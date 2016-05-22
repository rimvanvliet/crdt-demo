/*jslint node: true */

var LogootCausal = require('./logoot-causal');
var CrdtDemoCtrlr = require('./crdtDemoCtrlr');


var lA = new LogootCausal('lcA');
var lB = new LogootCausal('lcB');

var crdtDemoCtrlr = new CrdtDemoCtrlr(lA, lB);


