/**
 *
 */
package ru.neoflex.meta.test.impl;

import java.util.List;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EDataType;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;

import org.eclipse.emf.ecore.impl.EFactoryImpl;

import org.eclipse.emf.ecore.plugin.EcorePlugin;

import ru.neoflex.meta.test.*;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model <b>Factory</b>.
 * <!-- end-user-doc -->
 * @generated
 */
public class TestFactoryImpl extends EFactoryImpl implements TestFactory {
    /**
     * Creates an instance of the factory.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public TestFactoryImpl() {
        super();
    }

    /**
     * Creates the default factory implementation.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public static TestFactory init() {
        try {
            TestFactory theTestFactory = (TestFactory) EPackage.Registry.INSTANCE.getEFactory(TestPackage.eNS_URI);
            if (theTestFactory != null) {
                return theTestFactory;
            }
        } catch (Exception exception) {
            EcorePlugin.INSTANCE.log(exception);
        }
        return new TestFactoryImpl();
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @deprecated
     * @generated
     */
    @Deprecated
    public static TestPackage getPackage() {
        return TestPackage.eINSTANCE;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public EObject create(EClass eClass) {
        switch (eClass.getClassifierID()) {
            case TestPackage.GROUP:
                return createGroup();
            case TestPackage.USER:
                return createUser();
            case TestPackage.COLUMN:
                return createColumn();
            case TestPackage.PKEY:
                return createPKey();
            case TestPackage.IE_KEY:
                return createIEKey();
            case TestPackage.FKEY:
                return createFKey();
            case TestPackage.DB_TABLE:
                return createDBTable();
            case TestPackage.DB_VIEW:
                return createDBView();
            case TestPackage.META_VIEW:
                return createMetaView();
            case TestPackage.OPOINT:
                return createOPoint();
            case TestPackage.OMULTI_POINT:
                return createOMultiPoint();
            case TestPackage.OLINE_STRING:
                return createOLineString();
            case TestPackage.OMULTI_LINE_STRING:
                return createOMultiLineString();
            case TestPackage.OPOLYGON:
                return createOPolygon();
            case TestPackage.OMULTI_POLYGON:
                return createOMultiPolygon();
            case TestPackage.ORECTANGLE:
                return createORectangle();
            case TestPackage.OGEOMETRY_COLLECTION:
                return createOGeometryCollection();
            case TestPackage.PLACEMARK:
                return createPlacemark();
            case TestPackage.COUNTRY:
                return createCountry();
            default:
                throw new IllegalArgumentException("The class '" + eClass.getName() + "' is not a valid classifier");
        }
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public Object createFromString(EDataType eDataType, String initialValue) {
        switch (eDataType.getClassifierID()) {
            case TestPackage.LIST_OF_DOUBLE:
                return createListOfDoubleFromString(eDataType, initialValue);
            case TestPackage.LIST2_OF_DOUBLE:
                return createList2OfDoubleFromString(eDataType, initialValue);
            case TestPackage.LIST3_OF_DOUBLE:
                return createList3OfDoubleFromString(eDataType, initialValue);
            default:
                throw new IllegalArgumentException("The datatype '" + eDataType.getName() + "' is not a valid classifier");
        }
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public String convertToString(EDataType eDataType, Object instanceValue) {
        switch (eDataType.getClassifierID()) {
            case TestPackage.LIST_OF_DOUBLE:
                return convertListOfDoubleToString(eDataType, instanceValue);
            case TestPackage.LIST2_OF_DOUBLE:
                return convertList2OfDoubleToString(eDataType, instanceValue);
            case TestPackage.LIST3_OF_DOUBLE:
                return convertList3OfDoubleToString(eDataType, instanceValue);
            default:
                throw new IllegalArgumentException("The datatype '" + eDataType.getName() + "' is not a valid classifier");
        }
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public Group createGroup() {
        GroupImpl group = new GroupImpl();
        return group;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public User createUser() {
        UserImpl user = new UserImpl();
        return user;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public Column createColumn() {
        ColumnImpl column = new ColumnImpl();
        return column;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public PKey createPKey() {
        PKeyImpl pKey = new PKeyImpl();
        return pKey;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public IEKey createIEKey() {
        IEKeyImpl ieKey = new IEKeyImpl();
        return ieKey;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public FKey createFKey() {
        FKeyImpl fKey = new FKeyImpl();
        return fKey;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public DBTable createDBTable() {
        DBTableImpl dbTable = new DBTableImpl();
        return dbTable;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public DBView createDBView() {
        DBViewImpl dbView = new DBViewImpl();
        return dbView;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public MetaView createMetaView() {
        MetaViewImpl metaView = new MetaViewImpl();
        return metaView;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public OPoint createOPoint() {
        OPointImpl oPoint = new OPointImpl();
        return oPoint;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public OMultiPoint createOMultiPoint() {
        OMultiPointImpl oMultiPoint = new OMultiPointImpl();
        return oMultiPoint;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public OLineString createOLineString() {
        OLineStringImpl oLineString = new OLineStringImpl();
        return oLineString;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public OMultiLineString createOMultiLineString() {
        OMultiLineStringImpl oMultiLineString = new OMultiLineStringImpl();
        return oMultiLineString;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public OPolygon createOPolygon() {
        OPolygonImpl oPolygon = new OPolygonImpl();
        return oPolygon;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public OMultiPolygon createOMultiPolygon() {
        OMultiPolygonImpl oMultiPolygon = new OMultiPolygonImpl();
        return oMultiPolygon;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public ORectangle createORectangle() {
        ORectangleImpl oRectangle = new ORectangleImpl();
        return oRectangle;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public OGeometryCollection createOGeometryCollection() {
        OGeometryCollectionImpl oGeometryCollection = new OGeometryCollectionImpl();
        return oGeometryCollection;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public Placemark createPlacemark() {
        PlacemarkImpl placemark = new PlacemarkImpl();
        return placemark;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public Country createCountry() {
        CountryImpl country = new CountryImpl();
        return country;
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @SuppressWarnings("unchecked")
    public List<Double> createListOfDoubleFromString(EDataType eDataType, String initialValue) {
        return (List<Double>) super.createFromString(initialValue);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public String convertListOfDoubleToString(EDataType eDataType, Object instanceValue) {
        return super.convertToString(instanceValue);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @SuppressWarnings("unchecked")
    public List<List<Double>> createList2OfDoubleFromString(EDataType eDataType, String initialValue) {
        return (List<List<Double>>) super.createFromString(initialValue);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public String convertList2OfDoubleToString(EDataType eDataType, Object instanceValue) {
        return super.convertToString(instanceValue);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @SuppressWarnings("unchecked")
    public List<List<List<Double>>> createList3OfDoubleFromString(EDataType eDataType, String initialValue) {
        return (List<List<List<Double>>>) super.createFromString(initialValue);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public String convertList3OfDoubleToString(EDataType eDataType, Object instanceValue) {
        return super.convertToString(instanceValue);
    }

    /**
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    @Override
    public TestPackage getTestPackage() {
        return (TestPackage) getEPackage();
    }

} //TestFactoryImpl
