/**
 *
 */
package ru.neoflex.meta.test.impl;

import java.util.Collection;
import java.util.List;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EClass;

import org.eclipse.emf.ecore.util.EDataTypeEList;

import ru.neoflex.meta.test.OMultiPolygon;
import ru.neoflex.meta.test.TestPackage;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>OMulti Polygon</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.impl.OMultiPolygonImpl#getCoordinates <em>Coordinates</em>}</li>
 * </ul>
 *
 * @generated
 */
public class OMultiPolygonImpl extends OShapeImpl implements OMultiPolygon {
    /**
     * The cached value of the '{@link #getCoordinates() <em>Coordinates</em>}' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see #getCoordinates()
     * @generated
     * @ordered
     */
    protected EList<List<List<List<Double>>>> coordinates;

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    protected OMultiPolygonImpl() {
        super();
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    protected EClass eStaticClass() {
        return TestPackage.Literals.OMULTI_POLYGON;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public EList<List<List<List<Double>>>> getCoordinates() {
        if (coordinates == null) {
            coordinates = new EDataTypeEList<List<List<List<Double>>>>(List.class, this, TestPackage.OMULTI_POLYGON__COORDINATES);
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
            case TestPackage.OMULTI_POLYGON__COORDINATES:
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
            case TestPackage.OMULTI_POLYGON__COORDINATES:
                getCoordinates().clear();
                getCoordinates().addAll((Collection<? extends List<List<List<Double>>>>) newValue);
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
            case TestPackage.OMULTI_POLYGON__COORDINATES:
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
            case TestPackage.OMULTI_POLYGON__COORDINATES:
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

} //OMultiPolygonImpl
