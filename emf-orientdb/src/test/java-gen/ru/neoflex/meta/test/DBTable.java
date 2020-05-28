/**
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.common.util.EList;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>DB Table</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.DBTable#getColumns <em>Columns</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.DBTable#getIndexes <em>Indexes</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.DBTable#getFKeys <em>FKeys</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getDBTable()
 * @model
 * @generated
 */
public interface DBTable extends DBEntity {
	/**
	 * Returns the value of the '<em><b>Columns</b></em>' containment reference list.
	 * The list contents are of type {@link ru.neoflex.meta.test.Column}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Columns</em>' containment reference list.
	 * @see ru.neoflex.meta.test.TestPackage#getDBTable_Columns()
	 * @model containment="true"
	 * @generated
	 */
	EList<Column> getColumns();

	/**
	 * Returns the value of the '<em><b>Indexes</b></em>' containment reference list.
	 * The list contents are of type {@link ru.neoflex.meta.test.IEKey}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Indexes</em>' containment reference list.
	 * @see ru.neoflex.meta.test.TestPackage#getDBTable_Indexes()
	 * @model containment="true"
	 * @generated
	 */
	EList<IEKey> getIndexes();

	/**
	 * Returns the value of the '<em><b>FKeys</b></em>' containment reference list.
	 * The list contents are of type {@link ru.neoflex.meta.test.FKey}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>FKeys</em>' containment reference list.
	 * @see ru.neoflex.meta.test.TestPackage#getDBTable_FKeys()
	 * @model containment="true"
	 * @generated
	 */
	EList<FKey> getFKeys();

} // DBTable
