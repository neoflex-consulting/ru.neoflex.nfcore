/**
 *
 */
package ru.neoflex.meta.test;


/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>User</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.User#getGroup <em>Group</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getUser()
 * @model
 * @generated
 */
public interface User extends Authority {
    /**
     * Returns the value of the '<em><b>Group</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Group</em>' reference.
     * @see #setGroup(Group)
     * @see ru.neoflex.meta.test.TestPackage#getUser_Group()
     * @model
     * @generated
     */
    Group getGroup();

    /**
     * Sets the value of the '{@link ru.neoflex.meta.test.User#getGroup <em>Group</em>}' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param value the new value of the '<em>Group</em>' reference.
     * @see #getGroup()
     * @generated
     */
    void setGroup(Group value);

} // User
