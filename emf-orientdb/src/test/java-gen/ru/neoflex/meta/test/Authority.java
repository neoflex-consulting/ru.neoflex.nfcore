/**
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Authority</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.Authority#getQName <em>QName</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getAuthority()
 * @model abstract="true"
 * @generated
 */
public interface Authority extends EObject {
	/**
	 * Returns the value of the '<em><b>QName</b></em>' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>QName</em>' attribute.
	 * @see #setQName(String)
	 * @see ru.neoflex.meta.test.TestPackage#getAuthority_QName()
	 * @model unique="false"
	 * @generated
	 */
	String getQName();

	/**
	 * Sets the value of the '{@link ru.neoflex.meta.test.Authority#getQName <em>QName</em>}' attribute.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param value the new value of the '<em>QName</em>' attribute.
	 * @see #getQName()
	 * @generated
	 */
	void setQName(String value);

} // Authority
