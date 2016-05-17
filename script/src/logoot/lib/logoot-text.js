/*jslint node: true */
"use strict";

var Logoot = require('./logoot');
var EventEmitter = require('events').EventEmitter;

/**
 * @param @optional {String} agent
 * @param @optional {Logoot} logoot
 */
function LogootText(agent, logoot) {
    EventEmitter.call(this);
    this.agent = agent;
    this.logoot = logoot = logoot || new Logoot();

    var self = this;
    logoot.on('ins', function (index, char) {
        var str = self.str;
        self.str = str.substring(0, index) + char + str.substring(index, str.length);
    });
    logoot.on('del', function (index) {
        var str = self.str;
        self.str = str.substring(0, index) + str.substring(index + 1, str.length);
    });
    this.str = logoot.reduce(function (str, char) {
        return str + char;
    }, '');
}

module.exports = LogootText;

require('util').inherits(LogootText, EventEmitter);

/**
 * Inserts characters `chars` just before `index` in the given string
 * represented by this LogootText. The update implicitly records that `agent`
 * authored the update.
 *
 * Examples:
 * With string 'abc', ins(1, 'x') results in 'axbc'
 * With string 'abc', ins(3, 'z') results in 'abcz'
 * With string ''   , ins(0, 'a') results in 'a'
 *
 * @param {Number} index inside the string to insert the chars
 * @param {String} chars is the sequence of characters to insert
 * @param {String} agent is the author id
 */
LogootText.prototype.ins = function (index, chars, agent) {
    var logoot = this.logoot,
        ids = logoot.ids,
        i, l, id, op, str;
    if (!agent) {
        agent = this.agent;
    }
    for (i = 0, l = chars.length; i < l; i += 1) {
        id = logoot.genId(ids[index + i], ids[index + i + 1], agent);
        op = logoot.ins(id, chars.charAt(i), agent, index + i);
        this.emit('logoot.op', op);
    }

    str = this.str;
    this.str = str.substring(0, index) + chars + str.substring(index, str.length);
};

/**
 * Deletes the character in the string located at `index`. The update
 * implicitly records that `agent` authored the update.
 *
 * @param {Number} index
 * @param {String} agent
 */
LogootText.prototype.del = function (index, agent) {
    var logoot = this.logoot,
        id, op, str;
    id = logoot.ids[index + 1]; // offset of 1 for Logoot.first
    op = logoot.del(id, agent || this.agent, index + 1);
    this.emit('logoot.op', op);

    str = this.str;
    this.str = str.substring(0, index) + str.substring(index + 1, str.length);
};

/**
 * Applies an operation that is typically received from another author.
 *
 * @param {Array} op can be either ['ins', id, line, agent] or ['del', id, agent]
 */
LogootText.prototype.applyOp = function (op) {
    // This will fire 'ins' and 'del' events, which are handled via the event
    // handlers decalred in our constructor `LogootText`. The event handlers take
    // care of updating `this.str`
    this.logoot.applyOp(op);
};