/**
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.common.util.EList;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>OPoint</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.OPoint#getCoordinates <em>Coordinates</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getOPoint()
 * @model annotation="http://orientdb.com/meta oClassName='OPoint'"
 * @generated
 */
public interface OPoint extends OShape {
	/**
	 * Returns the value of the '<em><b>Coordinates</b></em>' attribute list.
	 * The list contents are of type {@link java.lang.Double}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Coordinates</em>' attribute list.
	 * @see ru.neoflex.meta.test.TestPackage#getOPoint_Coordinates()
	 * @model unique="false"
	 * @generated
	 */
	EList<Double> getCoordinates();

} // OPoint
