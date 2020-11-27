/**
 *
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>DB Entity</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.DBEntity#getQName <em>QName</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.DBEntity#getPKey <em>PKey</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getDBEntity()
 * @model abstract="true"
 * @generated
 */
public interface DBEntity extends EObject {
    /**
     * Returns the value of the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>QName</em>' attribute.
     * @see #setQName(String)
     * @see ru.neoflex.meta.test.TestPackage#getDBEntity_QName()
     * @model unique="false"
     * @generated
     */
    String getQName();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.DBEntity#getQName <em>QName</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>QName</em>' attribute.
     * @see #getQName()
     * @generated
     */
    void setQName(String value);

    /**
     * Returns the value of the '<em><b>PKey</b></em>' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>PKey</em>' containment reference.
     * @see #setPKey(PKey)
     * @see ru.neoflex.meta.test.TestPackage#getDBEntity_PKey()
     * @model containment="true"
     * @generated
     */
    PKey getPKey();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.DBEntity#getPKey <em>PKey</em>}' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>PKey</em>' containment reference.
     * @see #getPKey()
     * @generated
     */
    void setPKey(PKey value);

} // DBEntity
