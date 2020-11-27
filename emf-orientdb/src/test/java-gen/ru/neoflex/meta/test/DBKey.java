/**
 *
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>DB Key</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.DBKey#getName <em>Name</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.DBKey#getColumns <em>Columns</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getDBKey()
 * @model abstract="true"
 * @generated
 */
public interface DBKey extends EObject {
    /**
     * Returns the value of the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Name</em>' attribute.
     * @see #setName(String)
     * @see ru.neoflex.meta.test.TestPackage#getDBKey_Name()
     * @model unique="false"
     * @generated
     */
    String getName();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.DBKey#getName <em>Name</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Name</em>' attribute.
     * @see #getName()
     * @generated
     */
    void setName(String value);

    /**
     * Returns the value of the '<em><b>Columns</b></em>' reference list.
     * The list contents are of type {@link ru.neoflex.meta.test.Column}.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Columns</em>' reference list.
     * @see ru.neoflex.meta.test.TestPackage#getDBKey_Columns()
     * @model annotation="http://orientdb.com/meta embedded='true'"
     * @generated
     */
    EList<Column> getColumns();

} // DBKey
