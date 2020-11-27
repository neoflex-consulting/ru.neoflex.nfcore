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

import ru.neoflex.meta.test.OShape;
import ru.neoflex.meta.test.Placemark;
import ru.neoflex.meta.test.TestPackage;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>Placemark</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.impl.PlacemarkImpl#getName <em>Name</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.PlacemarkImpl#getDescription <em>Description</em>}</li>
 *   <li>{@link ru.neoflex.meta.test.impl.PlacemarkImpl#getPoint <em>Point</em>}</li>
 * </ul>
 *
 * @generated
 */
public class PlacemarkImpl extends MinimalEObjectImpl implements Placemark {
    /**
     * The default value of the '{@link #getName() <em>Name</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getName()
     * @generated
     * @ordered
     */
    protected static final String NAME_EDEFAULT = null;
    /**
     * The default value of the '{@link #getDescription() <em>Description</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getDescription()
     * @generated
     * @ordered
     */
    protected static final String DESCRIPTION_EDEFAULT = null;
    /**
     * The cached value of the '{@link #getName() <em>Name</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getName()
     * @generated
     * @ordered
     */
    protected String name = NAME_EDEFAULT;
    /**
     * The cached value of the '{@link #getDescription() <em>Description</em>}' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getDescription()
     * @generated
     * @ordered
     */
    protected String description = DESCRIPTION_EDEFAULT;

    /**
     * The cached value of the '{@link #getPoint() <em>Point</em>}' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getPoint()
     * @generated
     * @ordered
     */
    protected OShape point;

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    protected PlacemarkImpl() {
        super();
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    protected EClass eStaticClass() {
        return TestPackage.Literals.PLACEMARK;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public String getName() {
        return name;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void setName(String newName) {
        String oldName = name;
        name = newName;
        if (eNotificationRequired())
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.PLACEMARK__NAME, oldName, name));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public String getDescription() {
        return description;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void setDescription(String newDescription) {
        String oldDescription = description;
        description = newDescription;
        if (eNotificationRequired())
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.PLACEMARK__DESCRIPTION, oldDescription, description));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public OShape getPoint() {
        return point;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public void setPoint(OShape newPoint) {
        if (newPoint != point) {
            NotificationChain msgs = null;
            if (point != null)
                msgs = ((InternalEObject) point).eInverseRemove(this, EOPPOSITE_FEATURE_BASE - TestPackage.PLACEMARK__POINT, null, msgs);
            if (newPoint != null)
                msgs = ((InternalEObject) newPoint).eInverseAdd(this, EOPPOSITE_FEATURE_BASE - TestPackage.PLACEMARK__POINT, null, msgs);
            msgs = basicSetPoint(newPoint, msgs);
            if (msgs != null) msgs.dispatch();
        } else if (eNotificationRequired())
            eNotify(new ENotificationImpl(this, Notification.SET, TestPackage.PLACEMARK__POINT, newPoint, newPoint));
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public NotificationChain basicSetPoint(OShape newPoint, NotificationChain msgs) {
        OShape oldPoint = point;
        point = newPoint;
        if (eNotificationRequired()) {
            ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, TestPackage.PLACEMARK__POINT, oldPoint, newPoint);
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
            case TestPackage.PLACEMARK__POINT:
                return basicSetPoint(null, msgs);
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
            case TestPackage.PLACEMARK__NAME:
                return getName();
            case TestPackage.PLACEMARK__DESCRIPTION:
                return getDescription();
            case TestPackage.PLACEMARK__POINT:
                return getPoint();
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
            case TestPackage.PLACEMARK__NAME:
                setName((String) newValue);
                return;
            case TestPackage.PLACEMARK__DESCRIPTION:
                setDescription((String) newValue);
                return;
            case TestPackage.PLACEMARK__POINT:
                setPoint((OShape) newValue);
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
            case TestPackage.PLACEMARK__NAME:
                setName(NAME_EDEFAULT);
                return;
            case TestPackage.PLACEMARK__DESCRIPTION:
                setDescription(DESCRIPTION_EDEFAULT);
                return;
            case TestPackage.PLACEMARK__POINT:
                setPoint((OShape) null);
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
            case TestPackage.PLACEMARK__NAME:
                return NAME_EDEFAULT == null ? name != null : !NAME_EDEFAULT.equals(name);
            case TestPackage.PLACEMARK__DESCRIPTION:
                return DESCRIPTION_EDEFAULT == null ? description != null : !DESCRIPTION_EDEFAULT.equals(description);
            case TestPackage.PLACEMARK__POINT:
                return point != null;
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
        result.append(" (name: ");
        result.append(name);
        result.append(", description: ");
        result.append(description);
        result.append(')');
        return result.toString();
    }

} //PlacemarkImpl
