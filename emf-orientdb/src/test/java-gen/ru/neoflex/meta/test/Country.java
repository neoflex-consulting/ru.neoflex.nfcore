/**
 *
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Country</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.Country#getGid <em>Gid</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.Country#getName <em>Name</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.Country#getGeometry <em>Geometry</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getCountry()
 * @model
 * @generated
 */
public interface Country extends EObject {
    /**
     * Returns the value of the '<em><b>Gid</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Gid</em>' attribute.
     * @see #setGid(String)
     * @see ru.neoflex.meta.test.TestPackage#getCountry_Gid()
     * @model unique="false"
     * @generated
     */
    String getGid();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.Country#getGid <em>Gid</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Gid</em>' attribute.
     * @see #getGid()
     * @generated
     */
    void setGid(String value);

    /**
     * Returns the value of the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Name</em>' attribute.
     * @see #setName(String)
     * @see ru.neoflex.meta.test.TestPackage#getCountry_Name()
     * @model unique="false"
     *        annotation="http://orientdb.com/meta indexType='FULLTEXT'"
     * @generated
     */
    String getName();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.Country#getName <em>Name</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Name</em>' attribute.
     * @see #getName()
     * @generated
     */
    void setName(String value);

    /**
     * Returns the value of the '<em><b>Geometry</b></em>' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Geometry</em>' containment reference.
     * @see #setGeometry(OMultiPolygon)
     * @see ru.neoflex.meta.test.TestPackage#getCountry_Geometry()
     * @model containment="true"
     * @generated
     */
    OMultiPolygon getGeometry();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.Country#getGeometry <em>Geometry</em>}' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Geometry</em>' containment reference.
     * @see #getGeometry()
     * @generated
     */
    void setGeometry(OMultiPolygon value);

} // Country
