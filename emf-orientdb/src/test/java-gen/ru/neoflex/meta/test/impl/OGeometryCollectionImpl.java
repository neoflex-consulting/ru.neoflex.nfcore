/**
 */
package ru.neoflex.meta.test.impl;

import java.util.Collection;

import org.eclipse.emf.common.notify.NotificationChain;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;

import org.eclipse.emf.ecore.util.EObjectContainmentEList;
import org.eclipse.emf.ecore.util.InternalEList;

import ru.neoflex.meta.test.OGeometryCollection;
import ru.neoflex.meta.test.OShape;
import ru.neoflex.meta.test.TestPackage;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>OGeometry Collection</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.impl.OGeometryCollectionImpl#getGeometries <em>Geometries</em>}</li>
 * </ul>
 *
 * @generated
 */
public class OGeometryCollectionImpl extends OShapeImpl implements OGeometryCollection {
	/**
	 * The cached value of the '{@link #getGeometries() <em>Geometries</em>}' containment reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getGeometries()
	 * @generated
	 * @ordered
	 */
	protected EList<OShape> geometries;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected OGeometryCollectionImpl() {
		super();
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	protected EClass eStaticClass() {
		return TestPackage.Literals.OGEOMETRY_COLLECTION;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public EList<OShape> getGeometries() {
		if (geometries == null) {
			geometries = new EObjectContainmentEList<OShape>(OShape.class, this, TestPackage.OGEOMETRY_COLLECTION__GEOMETRIES);
		}
		return geometries;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationChain msgs) {
		switch (featureID) {
			case TestPackage.OGEOMETRY_COLLECTION__GEOMETRIES:
				return ((InternalEList<?>)getGeometries()).basicRemove(otherEnd, msgs);
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
			case TestPackage.OGEOMETRY_COLLECTION__GEOMETRIES:
				return getGeometries();
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
			case TestPackage.OGEOMETRY_COLLECTION__GEOMETRIES:
				getGeometries().clear();
				getGeometries().addAll((Collection<? extends OShape>)newValue);
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
			case TestPackage.OGEOMETRY_COLLECTION__GEOMETRIES:
				getGeometries().clear();
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
			case TestPackage.OGEOMETRY_COLLECTION__GEOMETRIES:
				return geometries != null && !geometries.isEmpty();
		}
		return super.eIsSet(featureID);
	}

} //OGeometryCollectionImpl
