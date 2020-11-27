/**
 *
 */
package ru.neoflex.meta.test.util;

import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;

import org.eclipse.emf.ecore.util.Switch;

import ru.neoflex.meta.test.*;

/**
 * <!-- begin-user-doc -->
 * The <b>Switch</b> for the model's inheritance hierarchy.
 * It supports the call {@link #doSwitch(EObject) doSwitch(object)}
 * to invoke the <code>caseXXX</code> method for each class of the model,
 * starting with the actual class of the object
 * and proceeding up the inheritance hierarchy
 * until a non-null result is returned,
 * which is the result of the switch.
 * <!-- end-user-doc -->
 * @see ru.neoflex.meta.test.TestPackage
 * @generated
 */
public class TestSwitch<T> extends Switch<T> {
    /**
     * The cached model package
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    protected static TestPackage modelPackage;

    /**
     * Creates an instance of the switch.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    public TestSwitch() {
        if (modelPackage == null) {
            modelPackage = TestPackage.eINSTANCE;
        }
    }

    /**
     * Checks whether this is a switch for the given package.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @param ePackage the package in question.
     * @return whether this is a switch for the given package.
     * @generated
     */
    @Override
    protected boolean isSwitchFor(EPackage ePackage) {
        return ePackage == modelPackage;
    }

    /**
     * Calls <code>caseXXX</code> for each class of the model until one returns a non null result; it yields that result.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the first non-null result returned by a <code>caseXXX</code> call.
     * @generated
     */
    @Override
    protected T doSwitch(int classifierID, EObject theEObject) {
        switch (classifierID) {
            case TestPackage.AUTHORITY: {
                Authority authority = (Authority) theEObject;
                T result = caseAuthority(authority);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.GROUP: {
                Group group = (Group) theEObject;
                T result = caseGroup(group);
                if (result == null) result = caseAuthority(group);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.USER: {
                User user = (User) theEObject;
                T result = caseUser(user);
                if (result == null) result = caseAuthority(user);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.COLUMN: {
                Column column = (Column) theEObject;
                T result = caseColumn(column);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.DB_KEY: {
                DBKey dbKey = (DBKey) theEObject;
                T result = caseDBKey(dbKey);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.PKEY: {
                PKey pKey = (PKey) theEObject;
                T result = casePKey(pKey);
                if (result == null) result = caseDBKey(pKey);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.IE_KEY: {
                IEKey ieKey = (IEKey) theEObject;
                T result = caseIEKey(ieKey);
                if (result == null) result = caseDBKey(ieKey);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.FKEY: {
                FKey fKey = (FKey) theEObject;
                T result = caseFKey(fKey);
                if (result == null) result = caseDBKey(fKey);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.DB_ENTITY: {
                DBEntity dbEntity = (DBEntity) theEObject;
                T result = caseDBEntity(dbEntity);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.DB_TABLE: {
                DBTable dbTable = (DBTable) theEObject;
                T result = caseDBTable(dbTable);
                if (result == null) result = caseDBEntity(dbTable);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.DB_VIEW: {
                DBView dbView = (DBView) theEObject;
                T result = caseDBView(dbView);
                if (result == null) result = caseDBEntity(dbView);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.META_VIEW: {
                MetaView metaView = (MetaView) theEObject;
                T result = caseMetaView(metaView);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.OSHAPE: {
                OShape oShape = (OShape) theEObject;
                T result = caseOShape(oShape);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.OPOINT: {
                OPoint oPoint = (OPoint) theEObject;
                T result = caseOPoint(oPoint);
                if (result == null) result = caseOShape(oPoint);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.OMULTI_POINT: {
                OMultiPoint oMultiPoint = (OMultiPoint) theEObject;
                T result = caseOMultiPoint(oMultiPoint);
                if (result == null) result = caseOShape(oMultiPoint);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.OLINE_STRING: {
                OLineString oLineString = (OLineString) theEObject;
                T result = caseOLineString(oLineString);
                if (result == null) result = caseOShape(oLineString);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.OMULTI_LINE_STRING: {
                OMultiLineString oMultiLineString = (OMultiLineString) theEObject;
                T result = caseOMultiLineString(oMultiLineString);
                if (result == null) result = caseOShape(oMultiLineString);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.OPOLYGON: {
                OPolygon oPolygon = (OPolygon) theEObject;
                T result = caseOPolygon(oPolygon);
                if (result == null) result = caseOShape(oPolygon);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.OMULTI_POLYGON: {
                OMultiPolygon oMultiPolygon = (OMultiPolygon) theEObject;
                T result = caseOMultiPolygon(oMultiPolygon);
                if (result == null) result = caseOShape(oMultiPolygon);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.ORECTANGLE: {
                ORectangle oRectangle = (ORectangle) theEObject;
                T result = caseORectangle(oRectangle);
                if (result == null) result = caseOShape(oRectangle);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.OGEOMETRY_COLLECTION: {
                OGeometryCollection oGeometryCollection = (OGeometryCollection) theEObject;
                T result = caseOGeometryCollection(oGeometryCollection);
                if (result == null) result = caseOShape(oGeometryCollection);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.PLACEMARK: {
                Placemark placemark = (Placemark) theEObject;
                T result = casePlacemark(placemark);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            case TestPackage.COUNTRY: {
                Country country = (Country) theEObject;
                T result = caseCountry(country);
                if (result == null) result = defaultCase(theEObject);
                return result;
            }
            default:
                return defaultCase(theEObject);
        }
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>Authority</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>Authority</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseAuthority(Authority object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>Group</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>Group</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseGroup(Group object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>User</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>User</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseUser(User object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>Column</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>Column</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseColumn(Column object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>DB Key</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>DB Key</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseDBKey(DBKey object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>PKey</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>PKey</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T casePKey(PKey object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>IE Key</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>IE Key</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseIEKey(IEKey object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>FKey</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>FKey</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseFKey(FKey object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>DB Entity</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>DB Entity</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseDBEntity(DBEntity object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>DB Table</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>DB Table</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseDBTable(DBTable object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>DB View</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>DB View</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseDBView(DBView object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>Meta View</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>Meta View</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseMetaView(MetaView object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>OShape</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>OShape</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseOShape(OShape object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>OPoint</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>OPoint</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseOPoint(OPoint object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>OMulti Point</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>OMulti Point</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseOMultiPoint(OMultiPoint object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>OLine String</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>OLine String</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseOLineString(OLineString object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>OMulti Line String</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>OMulti Line String</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseOMultiLineString(OMultiLineString object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>OPolygon</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>OPolygon</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseOPolygon(OPolygon object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>OMulti Polygon</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>OMulti Polygon</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseOMultiPolygon(OMultiPolygon object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>ORectangle</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>ORectangle</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseORectangle(ORectangle object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>OGeometry Collection</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>OGeometry Collection</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseOGeometryCollection(OGeometryCollection object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>Placemark</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>Placemark</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T casePlacemark(Placemark object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>Country</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>Country</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject) doSwitch(EObject)
     * @generated
     */
    public T caseCountry(Country object) {
        return null;
    }

    /**
     * Returns the result of interpreting the object as an instance of '<em>EObject</em>'.
     * <!-- begin-user-doc -->
     * This implementation returns null;
     * returning a non-null result will terminate the switch, but this is the last case anyway.
     * <!-- end-user-doc -->
     * @param object the target of the switch.
     * @return the result of interpreting the object as an instance of '<em>EObject</em>'.
     * @see #doSwitch(org.eclipse.emf.ecore.EObject)
     * @generated
     */
    @Override
    public T defaultCase(EObject object) {
        return null;
    }

} //TestSwitch
