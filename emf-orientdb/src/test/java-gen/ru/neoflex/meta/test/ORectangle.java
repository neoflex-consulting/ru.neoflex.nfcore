/**
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.common.util.EList;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>ORectangle</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.ORectangle#getCoordinates <em>Coordinates</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getORectangle()
 * @model annotation="http://orientdb.com/meta oClassName='ORectangle'"
 * @generated
 */
public interface ORectangle extends OShape {
	/**
	 * Returns the value of the '<em><b>Coordinates</b></em>' attribute list.
	 * The list contents are of type {@link java.lang.Double}.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the value of the '<em>Coordinates</em>' attribute list.
	 * @see ru.neoflex.meta.test.TestPackage#getORectangle_Coordinates()
	 * @model unique="false"
	 * @generated
	 */
	EList<Double> getCoordinates();

} // ORectangle
