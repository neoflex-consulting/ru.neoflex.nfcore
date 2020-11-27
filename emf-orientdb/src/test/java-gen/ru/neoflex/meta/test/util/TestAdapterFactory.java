/**
 *
 */
package ru.neoflex.meta.test.util;

import org.eclipse.emf.common.notify.Adapter;
import org.eclipse.emf.common.notify.Notifier;

import org.eclipse.emf.common.notify.impl.AdapterFactoryImpl;

import org.eclipse.emf.ecore.EObject;

import ru.neoflex.meta.test.*;

/**
 * <!-- begin-user-doc -->
 * The <b>Adapter Factory</b> for the model.
 * It provides an adapter <code>createXXX</code> method for each class of the model.
 * <!-- end-user-doc -->
 * @see ru.neoflex.meta.test.TestPackage
 * @generated
 */
public class TestAdapterFactory extends AdapterFactoryImpl {
    /**
     * The cached model package.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    protected static TestPackage modelPackage;
    /**
     * The switch that delegates to the <code>createXXX</code> methods.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    protected TestSwitch<Adapter> modelSwitch =
            new TestSwitch<Adapter>() {
                @Override
                public Adapter caseAuthority(Authority object) {
                    return createAuthorityAdapter();
                }

                @Override
                public Adapter caseGroup(Group object) {
                    return createGroupAdapter();
                }

                @Override
                public Adapter caseUser(User object) {
                    return createUserAdapter();
                }

                @Override
                public Adapter caseColumn(Column object) {
                    return createColumnAdapter();
                }

                @Override
                public Adapter caseDBKey(DBKey object) {
                    return createDBKeyAdapter();
                }

                @Override
                public Adapter casePKey(PKey object) {
                    return createPKeyAdapter();
                }

                @Override
                public Adapter caseIEKey(IEKey object) {
                    return createIEKeyAdapter();
                }

                @Override
                public Adapter caseFKey(FKey object) {
                    return createFKeyAdapter();
                }

                @Override
                public Adapter caseDBEntity(DBEntity object) {
                    return createDBEntityAdapter();
                }

                @Override
                public Adapter caseDBTable(DBTable object) {
                    return createDBTableAdapter();
                }

                @Override
                public Adapter caseDBView(DBView object) {
                    return createDBViewAdapter();
                }

                @Override
                public Adapter caseMetaView(MetaView object) {
                    return createMetaViewAdapter();
                }

                @Override
                public Adapter caseOShape(OShape object) {
                    return createOShapeAdapter();
                }

                @Override
                public Adapter caseOPoint(OPoint object) {
                    return createOPointAdapter();
                }

                @Override
                public Adapter caseOMultiPoint(OMultiPoint object) {
                    return createOMultiPointAdapter();
                }

                @Override
                public Adapter caseOLineString(OLineString object) {
                    return createOLineStringAdapter();
                }

                @Override
                public Adapter caseOMultiLineString(OMultiLineString object) {
                    return createOMultiLineStringAdapter();
                }

                @Override
                public Adapter caseOPolygon(OPolygon object) {
                    return createOPolygonAdapter();
                }

                @Override
                public Adapter caseOMultiPolygon(OMultiPolygon object) {
                    return createOMultiPolygonAdapter();
                }

                @Override
                public Adapter caseORectangle(ORectangle object) {
                    return createORectangleAdapter();
                }

                @Override
                public Adapter caseOGeometryCollection(OGeometryCollection object) {
                    return createOGeometryCollectionAdapter();
                }

                @Override
                public Adapter casePlacemark(Placemark object) {
                    return createPlacemarkAdapter();
                }

                @Override
                public Adapter caseCountry(Country object) {
                    return createCountryAdapter();
                }

                @Override
                public Adapter defaultCase(EObject object) {
                    return createEObjectAdapter();
                }
            };

    /**
     * Creates an instance of the adapter factory.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public TestAdapterFactory() {
        if (modelPackage == null) {
            modelPackage = TestPackage.eINSTANCE;
        }
    }

    /**
     * Returns whether this factory is applicable for the type of the object.
     * <!-- begin-user-doc -->
     * This implementation returns <code>true</code> if the object is either the model's package or is an instance object of the model.
     * <!-- end-user-doc -->
     * @return whether this factory is applicable for the type of the object.
     * @generated
     */
    @Override
    public boolean isFactoryForType(Object object) {
        if (object == modelPackage) {
            return true;
        }
        if (object instanceof EObject) {
            return ((EObject) object).eClass().getEPackage() == modelPackage;
        }
        return false;
    }

    /**
     * Creates an adapter for the <code>target</code>.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param target the object to adapt.
     * @return the adapter for the <code>target</code>.
     * @generated
     */
    @Override
    public Adapter createAdapter(Notifier target) {
        return modelSwitch.doSwitch((EObject) target);
    }


    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.Authority <em>Authority</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.Authority
     * @generated
     */
    public Adapter createAuthorityAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.Group <em>Group</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.Group
     * @generated
     */
    public Adapter createGroupAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.User <em>User</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.User
     * @generated
     */
    public Adapter createUserAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.Column <em>Column</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.Column
     * @generated
     */
    public Adapter createColumnAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.DBKey <em>DB Key</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.DBKey
     * @generated
     */
    public Adapter createDBKeyAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.PKey <em>PKey</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.PKey
     * @generated
     */
    public Adapter createPKeyAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.IEKey <em>IE Key</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.IEKey
     * @generated
     */
    public Adapter createIEKeyAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.FKey <em>FKey</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.FKey
     * @generated
     */
    public Adapter createFKeyAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.DBEntity <em>DB Entity</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.DBEntity
     * @generated
     */
    public Adapter createDBEntityAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.DBTable <em>DB Table</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.DBTable
     * @generated
     */
    public Adapter createDBTableAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.DBView <em>DB View</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.DBView
     * @generated
     */
    public Adapter createDBViewAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.MetaView <em>Meta View</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.MetaView
     * @generated
     */
    public Adapter createMetaViewAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.OShape <em>OShape</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.OShape
     * @generated
     */
    public Adapter createOShapeAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.OPoint <em>OPoint</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.OPoint
     * @generated
     */
    public Adapter createOPointAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.OMultiPoint <em>OMulti Point</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.OMultiPoint
     * @generated
     */
    public Adapter createOMultiPointAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.OLineString <em>OLine String</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.OLineString
     * @generated
     */
    public Adapter createOLineStringAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.OMultiLineString <em>OMulti Line String</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.OMultiLineString
     * @generated
     */
    public Adapter createOMultiLineStringAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.OPolygon <em>OPolygon</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.OPolygon
     * @generated
     */
    public Adapter createOPolygonAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.OMultiPolygon <em>OMulti Polygon</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.OMultiPolygon
     * @generated
     */
    public Adapter createOMultiPolygonAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.ORectangle <em>ORectangle</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.ORectangle
     * @generated
     */
    public Adapter createORectangleAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.OGeometryCollection <em>OGeometry Collection</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.OGeometryCollection
     * @generated
     */
    public Adapter createOGeometryCollectionAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.Placemark <em>Placemark</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.Placemark
     * @generated
     */
    public Adapter createPlacemarkAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for an object of class '{@link ru.neoflex.meta.test.Country <em>Country</em>}'.
     * <!-- begin-user-doc -->
     * This default implementation returns null so that we can easily ignore cases;
     * it's useful to ignore a case when inheritance will catch all the cases anyway.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @see ru.neoflex.meta.test.Country
     * @generated
     */
    public Adapter createCountryAdapter() {
        return null;
    }

    /**
     * Creates a new adapter for the default case.
     * <!-- begin-user-doc -->
     * This default implementation returns null.
     * <!-- end-user-doc -->
     * @return the new adapter.
     * @generated
     */
    public Adapter createEObjectAdapter() {
        return null;
    }

} //TestAdapterFactory
