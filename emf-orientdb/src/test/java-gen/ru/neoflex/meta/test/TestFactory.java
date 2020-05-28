/**
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.ecore.EFactory;

/**
 * <!-- begin-user-doc -->
 * The <b>Factory</b> for the model.
 * It provides a create method for each non-abstract class of the model.
 * <!-- end-user-doc -->
 * @see ru.neoflex.meta.test.TestPackage
 * @generated
 */
public interface TestFactory extends EFactory {
	/**
	 * The singleton instance of the factory.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	TestFactory eINSTANCE = ru.neoflex.meta.test.impl.TestFactoryImpl.init();

	/**
	 * Returns a new object of class '<em>Group</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>Group</em>'.
	 * @generated
	 */
	Group createGroup();

	/**
	 * Returns a new object of class '<em>User</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>User</em>'.
	 * @generated
	 */
	User createUser();

	/**
	 * Returns a new object of class '<em>Column</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>Column</em>'.
	 * @generated
	 */
	Column createColumn();

	/**
	 * Returns a new object of class '<em>PKey</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>PKey</em>'.
	 * @generated
	 */
	PKey createPKey();

	/**
	 * Returns a new object of class '<em>IE Key</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>IE Key</em>'.
	 * @generated
	 */
	IEKey createIEKey();

	/**
	 * Returns a new object of class '<em>FKey</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>FKey</em>'.
	 * @generated
	 */
	FKey createFKey();

	/**
	 * Returns a new object of class '<em>DB Table</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>DB Table</em>'.
	 * @generated
	 */
	DBTable createDBTable();

	/**
	 * Returns a new object of class '<em>DB View</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>DB View</em>'.
	 * @generated
	 */
	DBView createDBView();

	/**
	 * Returns a new object of class '<em>Meta View</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>Meta View</em>'.
	 * @generated
	 */
	MetaView createMetaView();

	/**
	 * Returns a new object of class '<em>OPoint</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>OPoint</em>'.
	 * @generated
	 */
	OPoint createOPoint();

	/**
	 * Returns a new object of class '<em>OMulti Point</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>OMulti Point</em>'.
	 * @generated
	 */
	OMultiPoint createOMultiPoint();

	/**
	 * Returns a new object of class '<em>OLine String</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>OLine String</em>'.
	 * @generated
	 */
	OLineString createOLineString();

	/**
	 * Returns a new object of class '<em>OMulti Line String</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>OMulti Line String</em>'.
	 * @generated
	 */
	OMultiLineString createOMultiLineString();

	/**
	 * Returns a new object of class '<em>OPolygon</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>OPolygon</em>'.
	 * @generated
	 */
	OPolygon createOPolygon();

	/**
	 * Returns a new object of class '<em>OMulti Polygon</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>OMulti Polygon</em>'.
	 * @generated
	 */
	OMultiPolygon createOMultiPolygon();

	/**
	 * Returns a new object of class '<em>ORectangle</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>ORectangle</em>'.
	 * @generated
	 */
	ORectangle createORectangle();

	/**
	 * Returns a new object of class '<em>OGeometry Collection</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>OGeometry Collection</em>'.
	 * @generated
	 */
	OGeometryCollection createOGeometryCollection();

	/**
	 * Returns a new object of class '<em>Placemark</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>Placemark</em>'.
	 * @generated
	 */
	Placemark createPlacemark();

	/**
	 * Returns a new object of class '<em>Country</em>'.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return a new object of class '<em>Country</em>'.
	 * @generated
	 */
	Country createCountry();

	/**
	 * Returns the package supported by this factory.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @return the package supported by this factory.
	 * @generated
	 */
	TestPackage getTestPackage();

} //TestFactory
