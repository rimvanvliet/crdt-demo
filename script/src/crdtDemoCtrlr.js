/*jslint node: true */

var $ = require('jquery');
var stringify = require('json-stringify-pretty-compact');

function CrdtDemoCtrlr(lcA, lcB) {
    "use strict";
    this.lcA = lcA;
    this.lcB = lcB;

    function clearErrors() {
        $("#lA_insError").html("&nbsp;");
        $("#lA_delError").html("&nbsp;");
        $("#lB_insError").html("&nbsp;");
        $("#lB_delError").html("&nbsp;");
    }

    function renderCops(lc, cops, id, inclButton) {
        var table = "<table id='T" + id + "'>", i, l;
        if (inclButton) {
            table += "<tr><th>Local operations</th></tr>";
        } else {
            table += "<tr><th>Unprocessed operations (" + lc.expectedCopSeq + ")</th></tr>";
        }
        for (i = 0, l = cops.length; i < l; i += 1) {
            table += "<tr id='" + id + i + "'><td><xmp style='margin:0;'>" + cops[i] + "</xmp></td><td>&nbsp;";
            if (inclButton) {
                table += "<button type='button' class='btn btn-default'>";
                table += "<i class='fa fa-paper-plane' aria-hidden='true'></i></button>";
            }
            table += "</td></tr>";
        }
        return (table + "</table>");
    }

    function actionCops(lc, cops, id) {
        $("#" + id).unbind();
        $("#" + id).on('click', 'tr', function (e) {
            var index = $(this).attr('id').slice(10);
            lc.merge(cops[index]);
            refreshViews();
        });
    }

    function refreshViews() {
        $("#lA_txt").html(lcA.logoot.str);
        $("#lA_json").html(stringify(lcA.logoot, {
            maxLength: 65
        }));
        $("#lB_txt").html(lcB.logoot.str);
        $("#lB_json").html(stringify(lcB.logoot, {
            maxLength: 65
        }));

        $("#lA_ownCops").html(renderCops(lcA, lcA.cops, "lA_ownCops", true));
        $("#lA_recCops").html(renderCops(lcA, lcA.receivedCops, "lA_recCops", false));
        $("#lB_ownCops").html(renderCops(lcB, lcB.cops, "lB_ownCops", true));
        $("#lB_recCops").html(renderCops(lcB, lcB.receivedCops, "lB_recCops", false));

        actionCops(lcB, lcA.cops, "lA_ownCops");
        actionCops(lcA, lcB.cops, "lB_ownCops");
    }

    $("#lA_insertView").on('click', function () {
        clearErrors();
        var insPos = $("#lA_insPos").val(), insTxt = $("#lA_insTxt").val();
        if (isNaN(parseInt(insPos, 10)) || parseInt(insPos, 10) < 0 || parseInt(insPos, 10) > lcA.logoot.str.length) {
            $("#lA_insError").html("Insert pos. must be between 0 and " + (lcA.logoot.str.length));
        } else {
            lcA.logoot.ins(parseInt(insPos, 10), insTxt);
            $("#lA_insPos").val("");
            $("#lA_insTxt").val("");
            refreshViews();
        }
    });

    $("#lA_deleteView").on('click', function () {
        clearErrors();
        var delPos = $("#lA_delPos").val();
        if (isNaN(parseInt(delPos, 10)) || parseInt(delPos, 10) < 0 || parseInt(delPos, 10) > lcA.logoot.str.length - 1) {
            $("#lA_insError").html("Delete pos. must be between 0 and " + (lcA.logoot.str.length - 1));
        } else {
            lcA.logoot.del(parseInt(delPos, 10));
            $("#lA_delPos").val("");
            refreshViews();
        }
    });

    $("#lB_insertView").on('click', function () {
        clearErrors();
        var insPos = $("#lB_insPos").val(), insTxt = $("#lB_insTxt").val();
        if (isNaN(parseInt(insPos, 10)) || parseInt(insPos, 10) < 0 || parseInt(insPos, 10) > lcB.logoot.str.length) {
            $("#lB_insError").html("Insert pos. must be between 0 and " + (lcB.logoot.str.length));
        } else {
            lcB.logoot.ins(parseInt(insPos, 10), insTxt);
            $("#lB_insPos").val("");
            $("#lB_insTxt").val("");
            refreshViews();
        }
    });

    $("#lB_deleteView").on('click', function () {
        clearErrors();
        var delPos = $("#lB_delPos").val();
        if (isNaN(parseInt(delPos, 10)) || parseInt(delPos, 10) < 0 || parseInt(delPos, 10) > lcB.logoot.str.length - 1) {
            $("#lB_insError").html("Delete pos. must be between 0 and " + (lcB.logoot.str.length - 1));
        } else {
            lcB.logoot.del(parseInt(delPos, 10));
            $("#lB_delPos").val("");
            refreshViews();
        }
    });


    function bufferA(op) {
        lcA.pushOp(op);
    }
    lcA.logoot.on('logoot.op', bufferA);

    function bufferB(op) {
        lcB.pushOp(op);
    }
    lcB.logoot.on('logoot.op', bufferB);

    $("#sync").on('click', function () {
        clearErrors();
        lcA.sync(lcB);
        lcB.sync(lcA);
        lcA.clear();
        lcB.clear();
        refreshViews();
    });

    refreshViews();
}

module.exports = CrdtDemoCtrlr;
