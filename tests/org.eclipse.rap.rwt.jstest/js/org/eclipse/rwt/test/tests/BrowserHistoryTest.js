/*******************************************************************************
 * Copyright (c) 2012 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/

qx.Class.define( "org.eclipse.rwt.test.tests.BrowserHistoryTest", {

  extend : qx.core.Object,

  members : {

    testCreateBrowserHistoryByProtocol : function() {
      var browserHistory = this._createBrowserHistoryByProtocol();
      assertTrue( browserHistory instanceof rwt.client.History );
      assertFalse( browserHistory._timer.getEnabled() );
    },

    testSetHasNavigationListenerByProtocol : function() {
      var browserHistory = this._createBrowserHistoryByProtocol();
      rwt.protocol.MessageProcessor.processOperation( {
        "target" : "bh",
        "action" : "listen",
        "properties" : {
          "navigation" : true
        }
      } );
      assertTrue( browserHistory._hasNavigationListener );
      assertTrue( browserHistory.hasEventListeners( "request" ) );
      assertTrue( browserHistory._timer.getEnabled() );
      browserHistory.setHasNavigationListener( false );
    },

    testAddByProtocol : function() {
      var browserHistory = this._createBrowserHistoryByProtocol();
      rwt.protocol.MessageProcessor.processOperation( {
        "target" : "bh",
        "action" : "call",
        "method" : "add",
        "properties" : {
          "entries" : [ [ "id1", "text1" ] ]
        }
      } );
      assertEquals( "text1", browserHistory._titles[ "id1" ] );
    },

    testSendNavigated : [
      function() {
        var browserHistory = this._createBrowserHistoryByProtocol();
        rwt.protocol.MessageProcessor.processOperation( {
          "target" : "bh",
          "action" : "call",
          "method" : "add",
          "properties" : {
            "entries" : [ [ "id1", "text1" ], [ "id2", "text2" ] ]
          }
        } );
        rwt.protocol.MessageProcessor.processOperation( {
          "target" : "bh",
          "action" : "listen",
          "properties" : {
            "navigation" : true
          }
        } );
        org.eclipse.rwt.test.fixture.TestUtil.store( browserHistory );
        org.eclipse.rwt.test.fixture.TestUtil.delayTest( 200 );
      },
      function( browserHistory) {
        browserHistory.__getState = function() { return "id1"; };
        org.eclipse.rwt.test.fixture.TestUtil.forceInterval( browserHistory._timer );

        var message = org.eclipse.rwt.test.fixture.TestUtil.getMessageObject();
        assertEquals( "id1", message.findNotifyProperty( "bh", "historyNavigated", "entryId") );
      }
    ],

    /////////
    // Helper

    _createBrowserHistoryByProtocol : function() {
      rwt.protocol.MessageProcessor.processOperation( {
        "target" : "bh",
        "action" : "create",
        "type" : "rwt.BrowserHistory"
      } );
      return rwt.protocol.ObjectRegistry.getObject( "bh" );
    }

  }

} );