/**
 */
package ru.neoflex.meta.test.impl;

import java.util.Collection;

import org.eclipse.emf.common.notify.NotificationChain;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;

import org.eclipse.emf.ecore.util.EObjectContainmentEList;
import org.eclipse.emf.ecore.util.InternalEList;

import ru.neoflex.meta.test.Column;
import ru.neoflex.meta.test.DBTable;
import ru.neoflex.meta.test.FKey;
import ru.neoflex.meta.test.IEKey;
import ru.neoflex.meta.test.TestPackage;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>DB Table</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.impl.DBTableImpl#getColumns <em>Columns</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.DBTableImpl#getIndexes <em>Indexes</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.DBTableImpl#getFKeys <em>FKeys</em>}</li>
 * </ul>
 *
 * @generated
 */
public class DBTableImpl extends DBEntityImpl implements DBTable {
	/**
	 * The cached value of the '{@link #getColumns() <em>Columns</em>}' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getColumns()
	 * @generated
	 * @ordered
	 */
	protected EList<Column> columns;

	/**
	 * The cached value of the '{@link #getIndexes() <em>Indexes</em>}' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getIndexes()
	 * @generated
	 * @ordered
	 */
	protected EList<IEKey> indexes;

	/**
	 * The cached value of the '{@link #getFKeys() <em>FKeys</em>}' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getFKeys()
	 * @generated
	 * @ordered
	 */
	protected EList<FKey> fKeys;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected DBTableImpl() {
		super();
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	protected EClass eStaticClass() {
		return TestPackage.Literals.DB_TABLE;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public EList<Column> getColumns() {
		if (columns == null) {
			columns = new EObjectContainmentEList<Column>(Column.class, this, TestPackage.DB_TABLE__COLUMNS);
		}
		return columns;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public EList<IEKey> getIndexes() {
		if (indexes == null) {
			indexes = new EObjectContainmentEList<IEKey>(IEKey.class, this, TestPackage.DB_TABLE__INDEXES);
		}
		return indexes;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public EList<FKey> getFKeys() {
		if (fKeys == null) {
			fKeys = new EObjectContainmentEList<FKey>(FKey.class, this, TestPackage.DB_TABLE__FKEYS);
		}
		return fKeys;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationChain msgs) {
		switch (featureID) {
			case TestPackage.DB_TABLE__COLUMNS:
				return ((InternalEList<?>)getColumns()).basicRemove(otherEnd, msgs);
			case TestPackage.DB_TABLE__INDEXES:
				return ((InternalEList<?>)getIndexes()).basicRemove(otherEnd, msgs);
			case TestPackage.DB_TABLE__FKEYS:
				return ((InternalEList<?>)getFKeys()).basicRemove(otherEnd, msgs);
		}
		return super.eInverseRemove(otherEnd, featureID, msgs);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public Object eGet(int featureID, boolean resolve, boolean coreType) {
		switch (featureID) {
			case TestPackage.DB_TABLE__COLUMNS:
				return getColumns();
			case TestPackage.DB_TABLE__INDEXES:
				return getIndexes();
			case TestPackage.DB_TABLE__FKEYS:
				return getFKeys();
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
			case TestPackage.DB_TABLE__COLUMNS:
				getColumns().clear();
				getColumns().addAll((Collection<? extends Column>)newValue);
				return;
			case TestPackage.DB_TABLE__INDEXES:
				getIndexes().clear();
				getIndexes().addAll((Collection<? extends IEKey>)newValue);
				return;
			case TestPackage.DB_TABLE__FKEYS:
				getFKeys().clear();
				getFKeys().addAll((Collection<? extends FKey>)newValue);
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
			case TestPackage.DB_TABLE__COLUMNS:
				getColumns().clear();
				return;
			case TestPackage.DB_TABLE__INDEXES:
				getIndexes().clear();
				return;
			case TestPackage.DB_TABLE__FKEYS:
				getFKeys().clear();
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
			case TestPackage.DB_TABLE__COLUMNS:
				return columns != null && !columns.isEmpty();
			case TestPackage.DB_TABLE__INDEXES:
				return indexes != null && !indexes.isEmpty();
			case TestPackage.DB_TABLE__FKEYS:
				return fKeys != null && !fKeys.isEmpty();
		}
		return super.eIsSet(featureID);
	}

} //DBTableImpl
