/*jshint browsers:true, forin: true, laxbreak: true */
/*global test: true, start: true, stop: true, module: true, ok: true, equal: true, BrowserID:true */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla BrowserID.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
(function() {
  "use strict";

  var controller, el,
      bodyTemplate = "testBodyTemplate",
      waitTemplate = "wait",
      bid = BrowserID,
      mediator = bid.Mediator;

  function createController(options) {
    controller = bid.Modules.PageModule.create(options);
    controller.start();
  }

  module("controllers/page_controller", {
    setup: function() {
      el = $("#controller_head");
      bid.TestHelpers.setup();
    },

    teardown: function() {
      controller.destroy();
      bid.TestHelpers.teardown();
    }
  });

  test("page controller with no template causes no side effects", function() {
    createController();

    var html = el.find("#formWrap .contents").html();
    equal(html, "", "with no template specified, no text is loaded");

    html = el.find("#wait .contents").html();
    equal(html, "", "with no template specified, no text is loaded");
  });

  test("page controller with body template renders in #formWrap .contents", function() {
    createController({
      bodyTemplate: bodyTemplate,
      bodyVars: {
        title: "Test title",
        message: "Test message"
      }
    });

    var html = el.find("#formWrap .contents").html();
    ok(html.length, "with template specified, form text is loaded");

/*

    var input = el.find("input").eq(0);
    ok(input.is(":focus"), "make sure the first input is focused");
*/
    html = el.find("#wait .contents").html();
    equal(html, "", "with body template specified, wait text is not loaded");
  });

  test("page controller with wait template renders in #wait .contents", function() {
    createController({
      waitTemplate: waitTemplate,
      waitVars: {
        title: "Test title",
        message: "Test message"
      }
    });

    var html = el.find("#formWrap .contents").html();
    equal(html, "", "with wait template specified, form is ignored");

    html = el.find("#wait .contents").html();
    ok(html.length, "with wait template specified, wait text is loaded");
  });

  test("page controller with error template renders in #error .contents", function() {
    createController({
      errorTemplate: waitTemplate,
      errorVars: {
        title: "Test title",
        message: "Test message"
      }
    });

    var html = el.find("#formWrap .contents").html();
    equal(html, "", "with error template specified, form is ignored");

    html = el.find("#error .contents").html();
    ok(html.length, "with error template specified, error text is loaded");
  });

  test("renderError renders an error message", function() {
    createController({
      waitTemplate: waitTemplate,
      waitVars: {
        title: "Test title",
        message: "Test message"
      }
    });

    controller.renderError("wait", {
      title: "error title",
      message: "error message"
    });

    var html = el.find("#error .contents").html();
    // XXX underpowered test, we don't actually check the contents.
    ok(html.length, "with error template specified, error text is loaded");
  });

  test("renderError allows us to open expanded error info", function() {
    createController();

    controller.renderError("error", {
      action: {
        title: "expanded action info",
        message: "expanded message"
      }
    });

    var html = el.find("#error .contents").html();

    $("#moreInfo").hide();

    var evt = $.Event("click");
    $("#openMoreInfo").trigger( evt );

    /*
    setTimeout(function() {
      equal($("#showMoreInfo").is(":visible"), false, "button is not visible after clicking expanded info");
      equal($("#moreInfo").is(":visible"), true, "expanded error info is visible after clicking expanded info");
      start();
    }, 500);
    stop();
*/
  });

  test("getErrorDialog gets a function that can be used to render an error message", function() {
    createController({
      waitTemplate: waitTemplate,
      waitVars: {
        title: "Test title",
        message: "Test message"
      }
    });

    // This is the medium level info.
    var func = controller.getErrorDialog({
      title: "medium level info error title",
      message: "medium level info error message"
    });

    equal(typeof func, "function", "a function was returned from getErrorDialog");
    func();

    var html = el.find("#error .contents").html();
    // XXX underpowered test, we don't actually check the contents.
    ok(html.length, "when function is run, error text is loaded");

  });

  asyncTest("bind DOM Events", function() {
    createController();

   controller.bind("body", "click", function(event) {
      event.preventDefault();

      strictEqual(this, controller, "context is correct");
      start();
   });

   $("body").trigger("click");
  });

  asyncTest("unbindAll removes all listeners", function() {
    createController();
    var listenerCalled = false;

    controller.bind("body", "click", function(event) {
      event.preventDefault();

      listenerCalled = true;
    });

    controller.unbindAll();

    $("body").trigger("click");

    setTimeout(function() {
      equal(listenerCalled, false, "all events are unbound, listener should not be called");
      start();
    }, 1);
  });

  asyncTest("publish", function() {
    createController();

    mediator.subscribe("message", function(msg, data) {
      equal(msg, "message", "message is correct");
      equal(data.field, 1, "data passed correctly");
      start();
    });

    controller.publish("message", {
      field: 1
    });
  });

}());

