/**
 *
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>Placemark</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.Placemark#getName <em>Name</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.Placemark#getDescription <em>Description</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.Placemark#getPoint <em>Point</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getPlacemark()
 * @model
 * @generated
 */
public interface Placemark extends EObject {
    /**
     * Returns the value of the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Name</em>' attribute.
     * @see #setName(String)
     * @see ru.neoflex.meta.test.TestPackage#getPlacemark_Name()
     * @model unique="false"
     *        annotation="http://orientdb.com/meta indexType='FULLTEXT'"
     * @generated
     */
    String getName();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.Placemark#getName <em>Name</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Name</em>' attribute.
     * @see #getName()
     * @generated
     */
    void setName(String value);

    /**
     * Returns the value of the '<em><b>Description</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Description</em>' attribute.
     * @see #setDescription(String)
     * @see ru.neoflex.meta.test.TestPackage#getPlacemark_Description()
     * @model unique="false"
     *        annotation="http://orientdb.com/meta indexType='FULLTEXT'"
     * @generated
     */
    String getDescription();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.Placemark#getDescription <em>Description</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Description</em>' attribute.
     * @see #getDescription()
     * @generated
     */
    void setDescription(String value);

    /**
     * Returns the value of the '<em><b>Point</b></em>' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Point</em>' containment reference.
     * @see #setPoint(OShape)
     * @see ru.neoflex.meta.test.TestPackage#getPlacemark_Point()
     * @model containment="true"
     *        annotation="http://orientdb.com/meta indexType='SPATIAL'"
     * @generated
     */
    OShape getPoint();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.Placemark#getPoint <em>Point</em>}' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Point</em>' containment reference.
     * @see #getPoint()
     * @generated
     */
    void setPoint(OShape value);

} // Placemark
