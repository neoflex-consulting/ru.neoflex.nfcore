/**
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.common.util.EList;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>DB View</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.DBView#getColumns <em>Columns</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.DBView#isIsMaterialized <em>Is Materialized</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getDBView()
 * @model
 * @generated
 */
public interface DBView extends DBEntity {
	/**
	 * Returns the value of the '<em><b>Columns</b></em>' reference list.
	 * The list contents are of type {@link ru.neoflex.meta.test.Column}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Columns</em>' reference list.
	 * @see ru.neoflex.meta.test.TestPackage#getDBView_Columns()
	 * @model
	 * @generated
	 */
	EList<Column> getColumns();

	/**
	 * Returns the value of the '<em><b>Is Materialized</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Is Materialized</em>' attribute.
	 * @see #setIsMaterialized(boolean)
	 * @see ru.neoflex.meta.test.TestPackage#getDBView_IsMaterialized()
	 * @model unique="false"
	 *        annotation="http://orientdb.com/meta indexType='NOTUNIQUE_HASH_INDEX'"
	 * @generated
	 */
	boolean isIsMaterialized();

	/**
	 * Sets the value of the '{@link ru.neoflex.meta.test.DBView#isIsMaterialized <em>Is Materialized</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Is Materialized</em>' attribute.
	 * @see #isIsMaterialized()
	 * @generated
	 */
	void setIsMaterialized(boolean value);

} // DBView
