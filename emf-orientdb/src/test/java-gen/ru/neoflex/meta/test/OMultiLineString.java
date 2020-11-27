/**
 *
 */
package ru.neoflex.meta.test;

import java.util.List;

import org.eclipse.emf.common.util.EList;

/**
 * <!-- begin-user-doc -->
 * A representation of the model object '<em><b>OMulti Line String</b></em>'.
 * <!-- end-user-doc -->
 *
 * <p>
 * The following features are supported:
 * </p>
 * <ul>
 *   <li>{@link ru.neoflex.meta.test.OMultiLineString#getCoordinates <em>Coordinates</em>}</li>
 * </ul>
 *
 * @see ru.neoflex.meta.test.TestPackage#getOMultiLineString()
 * @model annotation="http://orientdb.com/meta oClassName='OMultiLineString'"
 * @generated
 */
public interface OMultiLineString extends OShape {
    /**
     * Returns the value of the '<em><b>Coordinates</b></em>' attribute list.
     * The list contents are of type {@link java.util.List}<code>&lt;java.util.List&lt;java.lang.Double&gt;&gt;</code>.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the value of the '<em>Coordinates</em>' attribute list.
     * @see ru.neoflex.meta.test.TestPackage#getOMultiLineString_Coordinates()
     * @model unique="false" dataType="ru.neoflex.meta.test.List2OfDouble"
     * @generated
     */
    EList<List<List<Double>>> getCoordinates();

} // OMultiLineString
