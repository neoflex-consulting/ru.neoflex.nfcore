/**
 */
package ru.neoflex.meta.test.impl;

import java.util.Collection;

import org.eclipse.emf.common.notify.Notification;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EClass;

import org.eclipse.emf.ecore.impl.ENotificationImpl;

import org.eclipse.emf.ecore.util.EObjectResolvingEList;

import ru.neoflex.meta.test.Column;
import ru.neoflex.meta.test.DBView;
import ru.neoflex.meta.test.TestPackage;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>DB View</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.impl.DBViewImpl#getColumns <em>Columns</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.DBViewImpl#isIsMaterialized <em>Is Materialized</em>}</li>
 * </ul>
 *
 * @generated
 */
public class DBViewImpl extends DBEntityImpl implements DBView {
	/**
	 * The cached value of the '{@link #getColumns() <em>Columns</em>}' reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getColumns()
	 * @generated
	 * @ordered
	 */
	protected EList<Column> columns;

	/**
	 * The default value of the '{@link #isIsMaterialized() <em>Is Materialized</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #isIsMaterialized()
	 * @generated
	 * @ordered
	 */
	protected static final boolean IS_MATERIALIZED_EDEFAULT = false;

	/**
	 * The cached value of the '{@link #isIsMaterialized() <em>Is Materialized</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #isIsMaterialized()
	 * @generated
	 * @ordered
	 */
	protected boolean isMaterialized = IS_MATERIALIZED_EDEFAULT;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected DBViewImpl() {
		super();
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	protected EClass eStaticClass() {
		return TestPackage.Literals.DB_VIEW;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public EList<Column> getColumns() {
		if (columns == null) {
			columns = new EObjectResolvingEList<Column>(Column.class, this, TestPackage.DB_VIEW__COLUMNS);
		}
		return columns;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public boolean isIsMaterialized() {
		return isMaterialized;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public void setIsMaterialized(boolean newIsMaterialized) {
		boolean oldIsMaterialized = isMaterialized;
		isMaterialized = newIsMaterialized;
		if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.DB_VIEW__IS_MATERIALIZED, oldIsMaterialized, isMaterialized));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public Object eGet(int featureID, boolean resolve, boolean coreType) {
		switch (featureID) {
			case TestPackage.DB_VIEW__COLUMNS:
				return getColumns();
			case TestPackage.DB_VIEW__IS_MATERIALIZED:
				return isIsMaterialized();
		}
		return super.eGet(featureID, resolve, coreType);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@SuppressWarnings("unchecked")
	@Override
	public void eSet(int featureID, Object newValue) {
		switch (featureID) {
			case TestPackage.DB_VIEW__COLUMNS:
				getColumns().clear();
				getColumns().addAll((Collection<? extends Column>)newValue);
				return;
			case TestPackage.DB_VIEW__IS_MATERIALIZED:
				setIsMaterialized((Boolean)newValue);
				return;
		}
		super.eSet(featureID, newValue);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public void eUnset(int featureID) {
		switch (featureID) {
			case TestPackage.DB_VIEW__COLUMNS:
				getColumns().clear();
				return;
			case TestPackage.DB_VIEW__IS_MATERIALIZED:
				setIsMaterialized(IS_MATERIALIZED_EDEFAULT);
				return;
		}
		super.eUnset(featureID);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public boolean eIsSet(int featureID) {
		switch (featureID) {
			case TestPackage.DB_VIEW__COLUMNS:
				return columns != null && !columns.isEmpty();
			case TestPackage.DB_VIEW__IS_MATERIALIZED:
				return isMaterialized != IS_MATERIALIZED_EDEFAULT;
		}
		return super.eIsSet(featureID);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public String toString() {
		if (eIsProxy()) return super.toString();

		StringBuilder result = new StringBuilder(super.toString());
		result.append(" (isMaterialized: ");
		result.append(isMaterialized);
		result.append(')');
		return result.toString();
	}

} //DBViewImpl
