/**
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Column</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.Column#getName <em>Name</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.Column#getDbType <em>Db Type</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getColumn()
 * @model
 * @generated
 */
public interface Column extends EObject {
	/**
	 * Returns the value of the '<em><b>Name</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Name</em>' attribute.
	 * @see #setName(String)
	 * @see ru.neoflex.meta.test.TestPackage#getColumn_Name()
	 * @model unique="false"
	 * @generated
	 */
	String getName();

	/**
	 * Sets the value of the '{@link ru.neoflex.meta.test.Column#getName <em>Name</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Name</em>' attribute.
	 * @see #getName()
	 * @generated
	 */
	void setName(String value);

	/**
	 * Returns the value of the '<em><b>Db Type</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Db Type</em>' attribute.
	 * @see #setDbType(String)
	 * @see ru.neoflex.meta.test.TestPackage#getColumn_DbType()
	 * @model unique="false"
	 * @generated
	 */
	String getDbType();

	/**
	 * Sets the value of the '{@link ru.neoflex.meta.test.Column#getDbType <em>Db Type</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Db Type</em>' attribute.
	 * @see #getDbType()
	 * @generated
	 */
	void setDbType(String value);

} // Column
