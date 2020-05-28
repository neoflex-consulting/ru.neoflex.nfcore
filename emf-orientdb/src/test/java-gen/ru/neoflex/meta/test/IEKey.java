/**
 */
package ru.neoflex.meta.test;


/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>IE Key</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.IEKey#isIsUnique <em>Is Unique</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getIEKey()
 * @model
 * @generated
 */
public interface IEKey extends DBKey {
	/**
	 * Returns the value of the '<em><b>Is Unique</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Is Unique</em>' attribute.
	 * @see #setIsUnique(boolean)
	 * @see ru.neoflex.meta.test.TestPackage#getIEKey_IsUnique()
	 * @model unique="false"
	 * @generated
	 */
	boolean isIsUnique();

	/**
	 * Sets the value of the '{@link ru.neoflex.meta.test.IEKey#isIsUnique <em>Is Unique</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>Is Unique</em>' attribute.
	 * @see #isIsUnique()
	 * @generated
	 */
	void setIsUnique(boolean value);

} // IEKey
