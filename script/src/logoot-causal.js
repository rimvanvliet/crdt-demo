/*jslint node: true */

var LogootText = require('logoot/lib/logoot-text');

function LogootCausal(agent) {
    "use strict";
    this.agent = agent;
    this.logoot = new LogootText(agent);
    this.cops = [];
    this.seq = 0;
    this.expectedCopSeq = 0;
    this.receivedCops = [];
}

module.exports = LogootCausal;

LogootCausal.prototype.purgeReceivedCops = function () {
    "use strict";
    while (this.receivedCops.length > 0 && this.receivedCops[0][0] === this.expectedCopSeq) {
        this.logoot.applyOp(this.receivedCops[0][1]);
        this.receivedCops.splice(0, 1);
        this.expectedCopSeq += 1;
    }
};

LogootCausal.prototype.addReceivedCop = function (cop) {
    "use strict";
    var found = false, i, l;
    for (i = 0, l = this.receivedCops.length; i < l; i += 1) {
        if (this.receivedCops[i][0] === cop[0]) {
            found = true;
            i = l;
        }
    }
    if (!found) {
        this.receivedCops.push(cop);
        this.receivedCops.sort(function (a, b) {
            return a[0] - b[0];
        });
    }
};

LogootCausal.prototype.pushOp = function (op) {
    "use strict";
    this.cops.push([this.seq, op]);
    this.seq += 1;
};

LogootCausal.prototype.merge = function (cop) {
    "use strict";
    if (this.expectedCopSeq === cop[0]) { // the cop we were waiting for
        this.logoot.applyOp(cop[1]);
        this.expectedCopSeq += 1;
        this.purgeReceivedCops();
    } else if (this.expectedCopSeq < cop[0]) { // the cop is ahead
        this.addReceivedCop(cop);
    } // all other cops are allready received, so ignored 
};

LogootCausal.prototype.sync = function (lc) {
    "use strict";
    var i, l;
    for (i = 0, l = this.cops.length; i < l; i += 1) {
        lc.merge(this.cops[i]);
    }
};

LogootCausal.prototype.clear = function (lc) {
    "use strict";
    this.cops = [];
    this.receivedCops = [];
};