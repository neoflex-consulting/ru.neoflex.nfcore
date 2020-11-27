/**
 *
 */
package ru.neoflex.meta.test.impl;

import org.eclipse.emf.common.notify.Notification;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.InternalEObject;

import org.eclipse.emf.ecore.impl.ENotificationImpl;
import org.eclipse.emf.ecore.impl.MinimalEObjectImpl;

import ru.neoflex.meta.test.MetaView;
import ru.neoflex.meta.test.TestPackage;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>Meta View</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.impl.MetaViewImpl#getQName <em>QName</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.MetaViewImpl#getAPackage <em>APackage</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.MetaViewImpl#getAClass <em>AClass</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.MetaViewImpl#getAObject <em>AObject</em>}</li>
 * </ul>
 *
 * @generated
 */
public class MetaViewImpl extends MinimalEObjectImpl implements MetaView {
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
     * The cached value of the '{@link #getAPackage() <em>APackage</em>}' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getAPackage()
     * @generated
     * @ordered
     */
    protected EPackage aPackage;

    /**
     * The cached value of the '{@link #getAClass() <em>AClass</em>}' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getAClass()
     * @generated
     * @ordered
     */
    protected EClass aClass;

    /**
     * The cached value of the '{@link #getAObject() <em>AObject</em>}' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getAObject()
     * @generated
     * @ordered
     */
    protected EObject aObject;

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    protected MetaViewImpl() {
        super();
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    protected EClass eStaticClass() {
        return TestPackage.Literals.META_VIEW;
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
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.META_VIEW__QNAME, oldQName, qName));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public EPackage getAPackage() {
        if (aPackage != null && aPackage.eIsProxy()) {
            InternalEObject oldAPackage = (InternalEObject) aPackage;
            aPackage = (EPackage) eResolveProxy(oldAPackage);
            if (aPackage != oldAPackage) {
                if (eNotificationRequired())
                    eNotify(new ENotificationImpl(this, Notification.RESOLVE, TestPackage.META_VIEW__APACKAGE, oldAPackage, aPackage));
            }
        }
        return aPackage;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void setAPackage(EPackage newAPackage) {
        EPackage oldAPackage = aPackage;
        aPackage = newAPackage;
        if (eNotificationRequired())
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.META_VIEW__APACKAGE, oldAPackage, aPackage));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public EPackage basicGetAPackage() {
        return aPackage;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public EClass getAClass() {
        if (aClass != null && aClass.eIsProxy()) {
            InternalEObject oldAClass = (InternalEObject) aClass;
            aClass = (EClass) eResolveProxy(oldAClass);
            if (aClass != oldAClass) {
                if (eNotificationRequired())
                    eNotify(new ENotificationImpl(this, Notification.RESOLVE, TestPackage.META_VIEW__ACLASS, oldAClass, aClass));
            }
        }
        return aClass;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void setAClass(EClass newAClass) {
        EClass oldAClass = aClass;
        aClass = newAClass;
        if (eNotificationRequired())
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.META_VIEW__ACLASS, oldAClass, aClass));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public EClass basicGetAClass() {
        return aClass;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public EObject getAObject() {
        if (aObject != null && aObject.eIsProxy()) {
            InternalEObject oldAObject = (InternalEObject) aObject;
            aObject = eResolveProxy(oldAObject);
            if (aObject != oldAObject) {
                if (eNotificationRequired())
                    eNotify(new ENotificationImpl(this, Notification.RESOLVE, TestPackage.META_VIEW__AOBJECT, oldAObject, aObject));
            }
        }
        return aObject;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void setAObject(EObject newAObject) {
        EObject oldAObject = aObject;
        aObject = newAObject;
        if (eNotificationRequired())
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.META_VIEW__AOBJECT, oldAObject, aObject));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public EObject basicGetAObject() {
        return aObject;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public Object eGet(int featureID, boolean resolve, boolean coreType) {
        switch (featureID) {
            case TestPackage.META_VIEW__QNAME:
                return getQName();
            case TestPackage.META_VIEW__APACKAGE:
                if (resolve) return getAPackage();
                return basicGetAPackage();
            case TestPackage.META_VIEW__ACLASS:
                if (resolve) return getAClass();
                return basicGetAClass();
            case TestPackage.META_VIEW__AOBJECT:
                if (resolve) return getAObject();
                return basicGetAObject();
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
            case TestPackage.META_VIEW__QNAME:
                setQName((String) newValue);
                return;
            case TestPackage.META_VIEW__APACKAGE:
                setAPackage((EPackage) newValue);
                return;
            case TestPackage.META_VIEW__ACLASS:
                setAClass((EClass) newValue);
                return;
            case TestPackage.META_VIEW__AOBJECT:
                setAObject((EObject) newValue);
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
            case TestPackage.META_VIEW__QNAME:
                setQName(QNAME_EDEFAULT);
                return;
            case TestPackage.META_VIEW__APACKAGE:
                setAPackage((EPackage) null);
                return;
            case TestPackage.META_VIEW__ACLASS:
                setAClass((EClass) null);
                return;
            case TestPackage.META_VIEW__AOBJECT:
                setAObject((EObject) null);
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
            case TestPackage.META_VIEW__QNAME:
                return QNAME_EDEFAULT == null ? qName != null : !QNAME_EDEFAULT.equals(qName);
            case TestPackage.META_VIEW__APACKAGE:
                return aPackage != null;
            case TestPackage.META_VIEW__ACLASS:
                return aClass != null;
            case TestPackage.META_VIEW__AOBJECT:
                return aObject != null;
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

} //MetaViewImpl
