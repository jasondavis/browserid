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

  var bid = BrowserID,
      channel = bid.Channel,
      controller,
      el,
      channelError = false,
      winMock,
      navMock;

  function reset() {
    channelError = false;
  }

  function WinMock() {
    this.location.hash = "#1234";
  }

  WinMock.prototype = {
    setupChannel: function() {
      if (channelError) throw "Channel error";
    },

    // Oh so beautiful.
    opener: {
      frames: {
        1234: {
          BrowserID: {
            Relay: {
              registerClient: function() {
              },

              unregisterClient: function() {
              }
            }
          }
        }
      }
    },

    location: {
    }


  }

  function createController(config) {
    var config = $.extend(config, {
      window: winMock
    });

    controller = BrowserID.Modules.Dialog.create(config);
  }

  module("controllers/dialog_controller", {
    setup: function() {
      winMock = new WinMock();
      channel.init({
        window: winMock,
        navigator: navMock
      });
      reset();
      bid.TestHelpers.setup();
    },

    teardown: function() {
      controller.destroy();
      reset();
      channel.init({
        window: window,
        navigator: navigator
      });
      bid.TestHelpers.teardown();
    }
  });

  test("initialization with channel error", function() {
    channelError = true;
    createController();

    ok($("#error .contents").text().length, "contents have been written");
  });

  test("doOffline", function() {
    createController();
    controller.doOffline();
    ok($("#error .contents").text().length, "contents have been written");
    ok($("#error #offline").text().length, "offline error message has been written");
  });

  test("doXHRError while online, no network info given", function() {
    createController();
    controller.doXHRError();
    ok($("#error .contents").text().length, "contents have been written");
    ok($("#error #action").text().length, "action contents have been written");
    equal($("#error #network").text().length, 0, "no network contents to be written");
  });

  test("doXHRError while online, network info given", function() {
    createController();
    controller.doXHRError({
      network: {
        type: "POST",
        url: "browserid.org/verify"
      }
    });
    ok($("#error .contents").text().length, "contents have been written");
    ok($("#error #action").text().length, "action contents have been written");
    ok($("#error #network").text().length, "network contents have been written");
  });

  test("doXHRError while offline does not update contents", function() {
    createController();
    controller.doOffline();
    $("#error #action").remove();

    controller.doXHRError();
    ok(!$("#error #action").text().length, "XHR error is not reported if the user is offline.");
  });


  /*
  test("doCheckAuth with registered requiredEmail, authenticated", function() {
    createController({
      requiredEmail: "registered@testuser.com"
    });

    controller.doCheckAuth();
  });

  test("doCheckAuth with registered requiredEmail, not authenticated", function() {
    createController({
      requiredEmail: "registered@testuser.com"
    });

    controller.doCheckAuth();
  });

  test("doCheckAuth with unregistered requiredEmail, not authenticated", function() {
    createController({
      requiredEmail: "unregistered@testuser.com"
    });

    controller.doCheckAuth();
  });

  test("doCheckAuth with unregistered requiredEmail, authenticated as other user", function() {
    createController({
      requiredEmail: "unregistered@testuser.com"
    });

    controller.doCheckAuth();
  });
*/

  test("doWinUnload", function() {
    createController({
      requiredEmail: "registered@testuser.com"
    });

    var error;

    try {
      controller.doWinUnload();
    }
    catch(e) {
      error = e;
    }

    equal(typeof error, "undefined", "no error thrown when unloading window");
  });

}());

