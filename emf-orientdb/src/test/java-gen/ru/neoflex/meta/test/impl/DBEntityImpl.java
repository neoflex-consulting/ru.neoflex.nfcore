/**
 *
 */
package ru.neoflex.meta.test.impl;

import org.eclipse.emf.common.notify.Notification;
import org.eclipse.emf.common.notify.NotificationChain;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;

import org.eclipse.emf.ecore.impl.ENotificationImpl;
import org.eclipse.emf.ecore.impl.MinimalEObjectImpl;

import ru.neoflex.meta.test.DBEntity;
import ru.neoflex.meta.test.PKey;
import ru.neoflex.meta.test.TestPackage;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>DB Entity</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.impl.DBEntityImpl#getQName <em>QName</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.DBEntityImpl#getPKey <em>PKey</em>}</li>
 * </ul>
 *
 * @generated
 */
public abstract class DBEntityImpl extends MinimalEObjectImpl implements DBEntity {
    /**
     * The default value of the '{@link #getQName() <em>QName</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getQName()
     * @generated
     * @ordered
     */
    protected static final String QNAME_EDEFAULT = null;

    /**
     * The cached value of the '{@link #getQName() <em>QName</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getQName()
     * @generated
     * @ordered
     */
    protected String qName = QNAME_EDEFAULT;

    /**
     * The cached value of the '{@link #getPKey() <em>PKey</em>}' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getPKey()
     * @generated
     * @ordered
     */
    protected PKey pKey;

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    protected DBEntityImpl() {
        super();
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    protected EClass eStaticClass() {
        return TestPackage.Literals.DB_ENTITY;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public String getQName() {
        return qName;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void setQName(String newQName) {
        String oldQName = qName;
        qName = newQName;
        if (eNotificationRequired())
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.DB_ENTITY__QNAME, oldQName, qName));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public PKey getPKey() {
        return pKey;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void setPKey(PKey newPKey) {
        if (newPKey != pKey) {
            NotificationChain msgs = null;
            if (pKey != null)
                msgs = ((InternalEObject) pKey).eInverseRemove(this, EOPPOSITE_FEATURE_BASE - TestPackage.DB_ENTITY__PKEY, null, msgs);
            if (newPKey != null)
                msgs = ((InternalEObject) newPKey).eInverseAdd(this, EOPPOSITE_FEATURE_BASE - TestPackage.DB_ENTITY__PKEY, null, msgs);
            msgs = basicSetPKey(newPKey, msgs);
            if (msgs != null) msgs.dispatch();
        } else if (eNotificationRequired())
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.DB_ENTITY__PKEY, newPKey, newPKey));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public NotificationChain basicSetPKey(PKey newPKey, NotificationChain msgs) {
        PKey oldPKey = pKey;
        pKey = newPKey;
        if (eNotificationRequired()) {
            ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, TestPackage.DB_ENTITY__PKEY, oldPKey, newPKey);
            if (msgs == null) msgs = notification;
            else msgs.add(notification);
        }
        return msgs;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationChain msgs) {
        switch (featureID) {
            case TestPackage.DB_ENTITY__PKEY:
                return basicSetPKey(null, msgs);
        }
        return super.eInverseRemove(otherEnd, featureID, msgs);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public Object eGet(int featureID, boolean resolve, boolean coreType) {
        switch (featureID) {
            case TestPackage.DB_ENTITY__QNAME:
                return getQName();
            case TestPackage.DB_ENTITY__PKEY:
                return getPKey();
        }
        return super.eGet(featureID, resolve, coreType);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void eSet(int featureID, Object newValue) {
        switch (featureID) {
            case TestPackage.DB_ENTITY__QNAME:
                setQName((String) newValue);
                return;
            case TestPackage.DB_ENTITY__PKEY:
                setPKey((PKey) newValue);
                return;
        }
        super.eSet(featureID, newValue);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void eUnset(int featureID) {
        switch (featureID) {
            case TestPackage.DB_ENTITY__QNAME:
                setQName(QNAME_EDEFAULT);
                return;
            case TestPackage.DB_ENTITY__PKEY:
                setPKey((PKey) null);
                return;
        }
        super.eUnset(featureID);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public boolean eIsSet(int featureID) {
        switch (featureID) {
            case TestPackage.DB_ENTITY__QNAME:
                return QNAME_EDEFAULT == null ? qName != null : !QNAME_EDEFAULT.equals(qName);
            case TestPackage.DB_ENTITY__PKEY:
                return pKey != null;
        }
        return super.eIsSet(featureID);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public String toString() {
        if (eIsProxy()) return super.toString();

        StringBuilder result = new StringBuilder(super.toString());
        result.append(" (qName: ");
        result.append(qName);
        result.append(')');
        return result.toString();
    }

} //DBEntityImpl
