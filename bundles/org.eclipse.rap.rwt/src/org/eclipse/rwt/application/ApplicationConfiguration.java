/*******************************************************************************
 * Copyright (c) 2011, 2012 Frank Appel and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Frank Appel - initial API and implementation
 *    EclipseSource - ongoing development
 ******************************************************************************/
package org.eclipse.rwt.application;

import org.eclipse.rwt.RWT;
import org.eclipse.rwt.branding.AbstractBranding;
import org.eclipse.rwt.lifecycle.IEntryPoint;
import org.eclipse.rwt.lifecycle.IEntryPointFactory;
import org.eclipse.rwt.lifecycle.PhaseListener;
import org.eclipse.rwt.resources.IResource;
import org.eclipse.rwt.resources.ResourceLoader;
import org.eclipse.rwt.service.IServiceHandler;
import org.eclipse.rwt.service.ISettingStoreFactory;
import org.eclipse.rwt.widgets.DialogUtil;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Widget;


/**
 * This interface allows to configure various aspects of an
 * <code>Application</code> before it is started.
 * <p>
 * <strong>Note:</strong> This API is <em>provisional</em>. It is likely to
 * change before the final release.
 * </p>
 *
 * @see Application
 * @see ApplicationConfigurator
 * @noimplement This interface is not intended to be implemented by clients.
 * @since 1.5
 */
public interface ApplicationConfiguration {

  /**
   * Instances of this class represent a mode of operation for a RAP
   * application. The major difference between the operation modes is whether a
   * separate UI thread is started for every session (SWT_COMPATIBILITY) or not
   * (JEE_COMPATIBILITY).
   */
  public static enum OperationMode {
    /**
     * In this mode, the request thread will be marked as UI thread in SWT.
     * Information that is attached to the request thread, such as security or
     * transaction contexts, can be directly accessed. This mode is compatible
     * with the JEE specification.
     * <p>
     * As its only limitation, it does not support the SWT main loop (more
     * specifically, the method {@link Display#sleep()} is not implemented). As
     * a consequence, blocking dialogs aren't possible with this operation mode.
     * Instead of blocking dialogs, the class {@link DialogUtil} allows to
     * attach a callback to react on the closing of a dialog.
     * </p>
     * <p>
     * Unless there is a need for blocking dialogs (e.g. when using the Eclipse
     * workbench), this mode is recommended as it is more lightweight than
     * <code>SWT_COMPATIBILITY</code> .
     * </p>
     */
    JEE_COMPATIBILITY,
    /**
     * In this mode, a separate UI thread will be started for each user session.
     * All UI requests are processed in this thread while the request thread is
     * put on hold. After processing all events, the method
     * {@link Display#sleep()} lets the request thread continue and puts the UI
     * thread to sleep. This approach fully supports the SWT main loop and thus
     * also allows for blocking dialogs.
     * <p>
     * Information that is attached to the request thread, such as security or
     * transaction contexts, can only be accessed using the method
     * {@link RWT#requestThreadExec(Runnable)}.
     * </p>
     */
    SWT_COMPATIBILITY,
    /**
     * This mode behaves just like <code>JEE_COMAPTIBILTIY</code> but in
     * addition it registers the required servlet filter to support clustering.
     * This mode requires the servlet API 3.0.
     */
    SESSION_FAILOVER
  }

  /**
   * The operation mode in which the application will be running. The default is
   * <code>JEE_COMPATIBILITY</code>.
   * 
   * @param operationMode the operation mode to be used, must not be
   *          <code>null</code>
   * @see OperationMode
   */
  void setOperationMode( OperationMode operationMode );

  void addEntryPoint( String entryPointName, Class<? extends IEntryPoint> entryPointType );

  void addEntryPoint( String entryPointName, IEntryPointFactory entryPointFactory );

  void addBranding( AbstractBranding branding );

  void addStyleSheet( String themeId, String styleSheetLocation );

  void addStyleSheet( String themeId, String styleSheetLocation, ResourceLoader resourceLoader );

  void addPhaseListener( PhaseListener phaseListener );

  void setAttribute( String name, Object value );

  void setSettingStoreFactory( ISettingStoreFactory settingStoreFactory );

  void addThemableWidget( Class<? extends Widget> widget );

  void addServiceHandler( String serviceHandlerId, IServiceHandler serviceHandler );

  /////////////////////////////////////////////
  // TODO [fappel]: replace with proper mechanism (Javascript)
  void addResource( IResource resource );
}