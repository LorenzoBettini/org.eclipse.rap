/*******************************************************************************
 * Copyright (c) 2011 Innoopract Informationssysteme GmbH.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Innoopract Informationssysteme GmbH - initial API and implementation
 *     EclipseSource - ongoing development
 ******************************************************************************/
 
namespace( "org.eclipse.rwt" );
 
org.eclipse.rwt.TreeRowContainerWrapper = function() {
  this._fixedColumns = 0;
  this._container = [];
  this._container[ 0 ] = new org.eclipse.rwt.widgets.TreeRowContainer();
  this._container[ 1 ] = new org.eclipse.rwt.widgets.TreeRowContainer();
  this._config = org.eclipse.rwt.widgets.TreeRowContainer.createRenderConfig();
  this._width = 0;
  this._splitOffset = 0;
  this._rowWidth = 0;
  this.addEventListener( "mouseover", this._onRowOver, this );
  this.addEventListener( "mouseout", this._onRowOver, this );
};

org.eclipse.rwt.TreeRowContainerWrapper.createInstance = function() {
  if( !this.prototype._protoInit ) {
    for( var i = 0; i < this._CONTAINER_DELEGATES.length; i++ ) {
      this._createContainerDelegater( this._CONTAINER_DELEGATES[ i ] );
    }
    for( var i = 0; i < this._CONTAINER_GETTER_DELEGATES.length; i++ ) {
      this._createContainerGetterDelegater( this._CONTAINER_GETTER_DELEGATES[ i ] );
    }
    this.prototype._protoInit = true;
  }
  return new org.eclipse.rwt.TreeRowContainerWrapper();
}

org.eclipse.rwt.TreeRowContainerWrapper._createContainerDelegater = function( funcName ) {
  this.prototype[ funcName ] = function() {
    this._container[ 0 ][ funcName ].apply( this._container[ 0 ], arguments );
    this._container[ 1 ][ funcName ].apply( this._container[ 1 ], arguments );
  }
};
    
org.eclipse.rwt.TreeRowContainerWrapper._createContainerGetterDelegater = function( funcName ) {
  this.prototype[ funcName ] = function() {
    return this._container[ 0 ][ funcName ].apply( this._container[ 0 ], arguments );
  }
};
    
org.eclipse.rwt.TreeRowContainerWrapper._CONTAINER_DELEGATES = [
  "setParent", 
  "destroy", 
  "addEventListener", 
  "removeEventListener",
  "setSelectionProvider",
  "setHeight",
  "setTop",
  "setBackgroundColor",
  "setBackgroundImage",
  "setRowHeight",
  "setTopItem",
  "renderItem",
  "setToolTip",
  "renderItemQueue",
  "setBaseAppearance"
];

org.eclipse.rwt.TreeRowContainerWrapper._CONTAINER_GETTER_DELEGATES = [ 
  "getTop",
  "getHeight",
  "getHoverItem",
  "getElement",
  "getChildrenLength"
];

org.eclipse.rwt.TreeRowContainerWrapper.prototype = {

  _protoInit : false,

  ///////////////////
  // Wrapper-only API
  
  getSubContainer : function( pos ) {
    return this._container[ pos ] || null;
  },
  
  setFixedColumns : function( value ) {
    this._fixedColumns = value;
    this._updateConfig();
  },
  
  getFixedColumns : function() {
    return this._fixedColumns;
  },
  
  /////////////////////////////////////////////
  // New Implementation of TreeRowContainer API

  getRenderConfig : function() {
    return this._config;
  },

  setPostRenderFunction : function() {
    // TODO [tb] : Dummy!
  },

  setWidth : function( value ) {
    this._width = value;
    this._layoutX();
  },

  getWidth : function() {
    return this._width;
  },

  setRowWidth : function( value ) {
    this._rowWidth = value;
    this._layoutX();
  },
  
  setScrollLeft : function( value ) {
    this._container[ 1 ].setScrollLeft( value );
  },
  
  findItemByRow : function( row ) {
    var result = this._container[ 0 ].findItemByRow( row );
    if( result == null ) {
      result = this._container[ 1 ].findItemByRow( row );
    }
    return result;
  },

  updateRowLines : function() {
    this._container[ 0 ].getRenderConfig().linesVisible = this._config.linesVisible;
    this._container[ 0 ].updateRowLines();
    this._container[ 1 ].getRenderConfig().linesVisible = this._config.linesVisible;
    this._container[ 1 ].updateRowLines();
  },

  renderAll : function() {
    this._updateConfig();
    this._container[ 0 ].renderAll();
    this._container[ 1 ].renderAll();
  },
  
  _updateConfig : function() {
    var configLeft = this._container[ 0 ].getRenderConfig();
    var configRight = this._container[ 1 ].getRenderConfig();
    for( var key in this._config ) {
      if( this._config[ key ] instanceof Array ) {
        configLeft[ key ] = this._config[ key ].concat();
        configRight[ key ] = this._config[ key ].concat();
      } else {
        configLeft[ key ] = this._config[ key ];
        configRight[ key ] = this._config[ key ];
      }
    }
    configRight.hasCheckBoxes = false;
    var columnOrder = this._getColumnOrder();
    var rightColumnsOffset = 0;
    if( columnOrder.length > this._fixedColumns ) {
      rightColumnsOffset = this._config.itemLeft[ columnOrder[ this._fixedColumns ] ];
    }
    for( var i = 0; i < columnOrder.length; i++ ) {
      var column = columnOrder[ i ];
      if( i < this._fixedColumns ) {
        configRight.itemWidth[ column ] = 0;            
      } else {
        configLeft.itemWidth[ column ] = 0;
        configRight.itemLeft[ column ] -= rightColumnsOffset;
        configRight.itemImageLeft[ column ] -= rightColumnsOffset;
        configRight.itemTextLeft[ column ] -= rightColumnsOffset;
      }
    }
    if( this._splitOffset !== rightColumnsOffset ) {
      this._splitOffset = rightColumnsOffset;
      this._layoutX();
    }
  },

  _layoutX : function() {
    var leftWidth = Math.min( this._splitOffset, this._width );
    this._container[ 0 ].setWidth( leftWidth );
    this._container[ 0 ].setRowWidth( leftWidth );
    this._container[ 1 ].setLeft( leftWidth );
    this._container[ 1 ].setWidth( this._width - leftWidth );
    this._container[ 1 ].setRowWidth( this._rowWidth - leftWidth );
  },

  _getColumnOrder : function() {
    var result = [];
    var offsets = this._config.itemLeft.concat();
    var sorted = offsets.concat().sort( function( a, b ){ return a - b; } );
    for( var i = 0; i < sorted.length; i++ ) {
      var pos = offsets.indexOf( sorted[ i ] );
      result[ i ] = pos;
      offsets[ pos ] = null; // TODO [tb] : test
    }
    return result;
  },

  _onRowOver : function( event ) {
    var eventTarget = event.getCurrentTarget();
    for( var i = 0; i < this._container.length; i++ ) {
      if( this._container[ i ] !== eventTarget ) {
        this._container[ i ].setHoverItem( eventTarget.getHoverItem() );
      }
    }
  }

};