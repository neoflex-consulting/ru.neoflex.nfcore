/**
 *
 */
package ru.neoflex.meta.test.impl;

import java.util.Collection;
import java.util.List;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EClass;

import org.eclipse.emf.ecore.util.EDataTypeEList;

import ru.neoflex.meta.test.OLineString;
import ru.neoflex.meta.test.TestPackage;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>OLine String</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.impl.OLineStringImpl#getCoordinates <em>Coordinates</em>}</li>
 * </ul>
 *
 * @generated
 */
public class OLineStringImpl extends OShapeImpl implements OLineString {
    /**
     * The cached value of the '{@link #getCoordinates() <em>Coordinates</em>}' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getCoordinates()
     * @generated
     * @ordered
     */
    protected EList<List<Double>> coordinates;

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    protected OLineStringImpl() {
        super();
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    protected EClass eStaticClass() {
        return TestPackage.Literals.OLINE_STRING;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public EList<List<Double>> getCoordinates() {
        if (coordinates == null) {
            coordinates = new EDataTypeEList<List<Double>>(List.class, this, TestPackage.OLINE_STRING__COORDINATES);
        }
        return coordinates;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public Object eGet(int featureID, boolean resolve, boolean coreType) {
        switch (featureID) {
            case TestPackage.OLINE_STRING__COORDINATES:
                return getCoordinates();
        }
        return super.eGet(featureID, resolve, coreType);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @SuppressWarnings("unchecked")
    @Override
    public void eSet(int featureID, Object newValue) {
        switch (featureID) {
            case TestPackage.OLINE_STRING__COORDINATES:
                getCoordinates().clear();
                getCoordinates().addAll((Collection<? extends List<Double>>) newValue);
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
            case TestPackage.OLINE_STRING__COORDINATES:
                getCoordinates().clear();
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
            case TestPackage.OLINE_STRING__COORDINATES:
                return coordinates != null && !coordinates.isEmpty();
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
        result.append(" (coordinates: ");
        result.append(coordinates);
        result.append(')');
        return result.toString();
    }

} //OLineStringImpl
