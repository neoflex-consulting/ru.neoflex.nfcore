/**
 *
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Meta View</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.MetaView#getQName <em>QName</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.MetaView#getAPackage <em>APackage</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.MetaView#getAClass <em>AClass</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.MetaView#getAObject <em>AObject</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getMetaView()
 * @model
 * @generated
 */
public interface MetaView extends EObject {
    /**
     * Returns the value of the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>QName</em>' attribute.
     * @see #setQName(String)
     * @see ru.neoflex.meta.test.TestPackage#getMetaView_QName()
     * @model unique="false" id="true"
     * @generated
     */
    String getQName();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.MetaView#getQName <em>QName</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>QName</em>' attribute.
     * @see #getQName()
     * @generated
     */
    void setQName(String value);

    /**
     * Returns the value of the '<em><b>APackage</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>APackage</em>' reference.
     * @see #setAPackage(EPackage)
     * @see ru.neoflex.meta.test.TestPackage#getMetaView_APackage()
     * @model
     * @generated
     */
    EPackage getAPackage();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.MetaView#getAPackage <em>APackage</em>}' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>APackage</em>' reference.
     * @see #getAPackage()
     * @generated
     */
    void setAPackage(EPackage value);

    /**
     * Returns the value of the '<em><b>AClass</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>AClass</em>' reference.
     * @see #setAClass(EClass)
     * @see ru.neoflex.meta.test.TestPackage#getMetaView_AClass()
     * @model
     * @generated
     */
    EClass getAClass();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.MetaView#getAClass <em>AClass</em>}' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>AClass</em>' reference.
     * @see #getAClass()
     * @generated
     */
    void setAClass(EClass value);

    /**
     * Returns the value of the '<em><b>AObject</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>AObject</em>' reference.
     * @see #setAObject(EObject)
     * @see ru.neoflex.meta.test.TestPackage#getMetaView_AObject()
     * @model
     * @generated
     */
    EObject getAObject();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.MetaView#getAObject <em>AObject</em>}' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>AObject</em>' reference.
     * @see #getAObject()
     * @generated
     */
    void setAObject(EObject value);

} // MetaView
