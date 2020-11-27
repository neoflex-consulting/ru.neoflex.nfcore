/**
 *
 */
package ru.neoflex.meta.test;


/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>FKey</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.FKey#getEntity <em>Entity</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getFKey()
 * @model
 * @generated
 */
public interface FKey extends DBKey {
    /**
     * Returns the value of the '<em><b>Entity</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Entity</em>' reference.
     * @see #setEntity(DBEntity)
     * @see ru.neoflex.meta.test.TestPackage#getFKey_Entity()
     * @model annotation="http://orientdb.com/meta embedded='true'"
     * @generated
     */
    DBEntity getEntity();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.FKey#getEntity <em>Entity</em>}' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Entity</em>' reference.
     * @see #getEntity()
     * @generated
     */
    void setEntity(DBEntity value);

} // FKey
