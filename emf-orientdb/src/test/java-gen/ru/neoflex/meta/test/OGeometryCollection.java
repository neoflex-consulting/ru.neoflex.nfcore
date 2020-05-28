/**
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.common.util.EList;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>OGeometry Collection</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.OGeometryCollection#getGeometries <em>Geometries</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getOGeometryCollection()
 * @model annotation="http://orientdb.com/meta oClassName='OGeometryCollection'"
 * @generated
 */
public interface OGeometryCollection extends OShape {
	/**
	 * Returns the value of the '<em><b>Geometries</b></em>' containment reference list.
	 * The list contents are of type {@link ru.neoflex.meta.test.OShape}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Geometries</em>' containment reference list.
	 * @see ru.neoflex.meta.test.TestPackage#getOGeometryCollection_Geometries()
	 * @model containment="true"
	 * @generated
	 */
	EList<OShape> getGeometries();

} // OGeometryCollection
