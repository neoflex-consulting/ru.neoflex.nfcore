/**
 *
 */
package ru.neoflex.meta.test;

import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EDataType;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EReference;

/**
 * <!-- begin-user-doc -->
 * The <b>Package</b> for the model.
 * It contains accessors for the meta objects to represent
 * <ul>
 *   <li>each class,</li>
 *   <li>each feature of each class,</li>
 *   <li>each operation of each class,</li>
 *   <li>each enum,</li>
 *   <li>and each data type</li>
 * </ul>
 * <!-- end-user-doc -->
 * @see ru.neoflex.meta.test.TestFactory
 * @model kind="package"
 *        annotation="http://www.eclipse.org/emf/2011/Xcore orientdb='http://orientdb.com/meta'"
 * @generated
 */
public interface TestPackage extends EPackage {
    /**
     * The package name.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    String eNAME = "test";

    /**
     * The package namespace URI.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    String eNS_URI = "ru.neoflex.meta.test";

    /**
     * The package namespace name.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    String eNS_PREFIX = "test";
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.AuthorityImpl <em>Authority</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.AuthorityImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getAuthority()
     * @generated
     */
    int AUTHORITY = 0;
    /**
     * The feature id for the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int AUTHORITY__QNAME = 0;
    /**
     * The number of structural features of the '<em>Authority</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int AUTHORITY_FEATURE_COUNT = 1;
    /**
     * The number of operations of the '<em>Authority</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int AUTHORITY_OPERATION_COUNT = 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.GroupImpl <em>Group</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.GroupImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getGroup()
     * @generated
     */
    int GROUP = 1;
    /**
     * The feature id for the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int GROUP__QNAME = AUTHORITY__QNAME;
    /**
     * The number of structural features of the '<em>Group</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int GROUP_FEATURE_COUNT = AUTHORITY_FEATURE_COUNT + 0;
    /**
     * The number of operations of the '<em>Group</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int GROUP_OPERATION_COUNT = AUTHORITY_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.UserImpl <em>User</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.UserImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getUser()
     * @generated
     */
    int USER = 2;
    /**
     * The feature id for the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int USER__QNAME = AUTHORITY__QNAME;
    /**
     * The feature id for the '<em><b>Group</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int USER__GROUP = AUTHORITY_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>User</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int USER_FEATURE_COUNT = AUTHORITY_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>User</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int USER_OPERATION_COUNT = AUTHORITY_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.ColumnImpl <em>Column</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.ColumnImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getColumn()
     * @generated
     */
    int COLUMN = 3;
    /**
     * The feature id for the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COLUMN__NAME = 0;
    /**
     * The feature id for the '<em><b>Db Type</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COLUMN__DB_TYPE = 1;
    /**
     * The number of structural features of the '<em>Column</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COLUMN_FEATURE_COUNT = 2;
    /**
     * The number of operations of the '<em>Column</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COLUMN_OPERATION_COUNT = 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.DBKeyImpl <em>DB Key</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.DBKeyImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getDBKey()
     * @generated
     */
    int DB_KEY = 4;
    /**
     * The feature id for the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_KEY__NAME = 0;
    /**
     * The feature id for the '<em><b>Columns</b></em>' reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_KEY__COLUMNS = 1;
    /**
     * The number of structural features of the '<em>DB Key</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_KEY_FEATURE_COUNT = 2;
    /**
     * The number of operations of the '<em>DB Key</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_KEY_OPERATION_COUNT = 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.PKeyImpl <em>PKey</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.PKeyImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getPKey()
     * @generated
     */
    int PKEY = 5;
    /**
     * The feature id for the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PKEY__NAME = DB_KEY__NAME;
    /**
     * The feature id for the '<em><b>Columns</b></em>' reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PKEY__COLUMNS = DB_KEY__COLUMNS;
    /**
     * The number of structural features of the '<em>PKey</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PKEY_FEATURE_COUNT = DB_KEY_FEATURE_COUNT + 0;
    /**
     * The number of operations of the '<em>PKey</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PKEY_OPERATION_COUNT = DB_KEY_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.IEKeyImpl <em>IE Key</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.IEKeyImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getIEKey()
     * @generated
     */
    int IE_KEY = 6;
    /**
     * The feature id for the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int IE_KEY__NAME = DB_KEY__NAME;
    /**
     * The feature id for the '<em><b>Columns</b></em>' reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int IE_KEY__COLUMNS = DB_KEY__COLUMNS;
    /**
     * The feature id for the '<em><b>Is Unique</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int IE_KEY__IS_UNIQUE = DB_KEY_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>IE Key</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int IE_KEY_FEATURE_COUNT = DB_KEY_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>IE Key</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int IE_KEY_OPERATION_COUNT = DB_KEY_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.FKeyImpl <em>FKey</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.FKeyImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getFKey()
     * @generated
     */
    int FKEY = 7;
    /**
     * The feature id for the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int FKEY__NAME = DB_KEY__NAME;
    /**
     * The feature id for the '<em><b>Columns</b></em>' reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int FKEY__COLUMNS = DB_KEY__COLUMNS;
    /**
     * The feature id for the '<em><b>Entity</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int FKEY__ENTITY = DB_KEY_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>FKey</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int FKEY_FEATURE_COUNT = DB_KEY_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>FKey</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int FKEY_OPERATION_COUNT = DB_KEY_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.DBEntityImpl <em>DB Entity</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.DBEntityImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getDBEntity()
     * @generated
     */
    int DB_ENTITY = 8;
    /**
     * The feature id for the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_ENTITY__QNAME = 0;
    /**
     * The feature id for the '<em><b>PKey</b></em>' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_ENTITY__PKEY = 1;
    /**
     * The number of structural features of the '<em>DB Entity</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_ENTITY_FEATURE_COUNT = 2;
    /**
     * The number of operations of the '<em>DB Entity</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_ENTITY_OPERATION_COUNT = 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.DBTableImpl <em>DB Table</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.DBTableImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getDBTable()
     * @generated
     */
    int DB_TABLE = 9;
    /**
     * The feature id for the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_TABLE__QNAME = DB_ENTITY__QNAME;
    /**
     * The feature id for the '<em><b>PKey</b></em>' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_TABLE__PKEY = DB_ENTITY__PKEY;
    /**
     * The feature id for the '<em><b>Columns</b></em>' containment reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_TABLE__COLUMNS = DB_ENTITY_FEATURE_COUNT + 0;
    /**
     * The feature id for the '<em><b>Indexes</b></em>' containment reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_TABLE__INDEXES = DB_ENTITY_FEATURE_COUNT + 1;
    /**
     * The feature id for the '<em><b>FKeys</b></em>' containment reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_TABLE__FKEYS = DB_ENTITY_FEATURE_COUNT + 2;
    /**
     * The number of structural features of the '<em>DB Table</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_TABLE_FEATURE_COUNT = DB_ENTITY_FEATURE_COUNT + 3;
    /**
     * The number of operations of the '<em>DB Table</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_TABLE_OPERATION_COUNT = DB_ENTITY_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.DBViewImpl <em>DB View</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.DBViewImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getDBView()
     * @generated
     */
    int DB_VIEW = 10;
    /**
     * The feature id for the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_VIEW__QNAME = DB_ENTITY__QNAME;
    /**
     * The feature id for the '<em><b>PKey</b></em>' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_VIEW__PKEY = DB_ENTITY__PKEY;
    /**
     * The feature id for the '<em><b>Columns</b></em>' reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_VIEW__COLUMNS = DB_ENTITY_FEATURE_COUNT + 0;
    /**
     * The feature id for the '<em><b>Is Materialized</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_VIEW__IS_MATERIALIZED = DB_ENTITY_FEATURE_COUNT + 1;
    /**
     * The number of structural features of the '<em>DB View</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_VIEW_FEATURE_COUNT = DB_ENTITY_FEATURE_COUNT + 2;
    /**
     * The number of operations of the '<em>DB View</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int DB_VIEW_OPERATION_COUNT = DB_ENTITY_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.MetaViewImpl <em>Meta View</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.MetaViewImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getMetaView()
     * @generated
     */
    int META_VIEW = 11;
    /**
     * The feature id for the '<em><b>QName</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int META_VIEW__QNAME = 0;
    /**
     * The feature id for the '<em><b>APackage</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int META_VIEW__APACKAGE = 1;
    /**
     * The feature id for the '<em><b>AClass</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int META_VIEW__ACLASS = 2;
    /**
     * The feature id for the '<em><b>AObject</b></em>' reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int META_VIEW__AOBJECT = 3;
    /**
     * The number of structural features of the '<em>Meta View</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int META_VIEW_FEATURE_COUNT = 4;
    /**
     * The number of operations of the '<em>Meta View</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int META_VIEW_OPERATION_COUNT = 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.OShapeImpl <em>OShape</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.OShapeImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOShape()
     * @generated
     */
    int OSHAPE = 12;
    /**
     * The number of structural features of the '<em>OShape</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OSHAPE_FEATURE_COUNT = 0;
    /**
     * The number of operations of the '<em>OShape</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OSHAPE_OPERATION_COUNT = 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.OPointImpl <em>OPoint</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.OPointImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOPoint()
     * @generated
     */
    int OPOINT = 13;
    /**
     * The feature id for the '<em><b>Coordinates</b></em>' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OPOINT__COORDINATES = OSHAPE_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>OPoint</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OPOINT_FEATURE_COUNT = OSHAPE_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>OPoint</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OPOINT_OPERATION_COUNT = OSHAPE_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.OMultiPointImpl <em>OMulti Point</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.OMultiPointImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOMultiPoint()
     * @generated
     */
    int OMULTI_POINT = 14;
    /**
     * The feature id for the '<em><b>Coordinates</b></em>' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_POINT__COORDINATES = OSHAPE_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>OMulti Point</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_POINT_FEATURE_COUNT = OSHAPE_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>OMulti Point</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_POINT_OPERATION_COUNT = OSHAPE_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.OLineStringImpl <em>OLine String</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.OLineStringImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOLineString()
     * @generated
     */
    int OLINE_STRING = 15;
    /**
     * The feature id for the '<em><b>Coordinates</b></em>' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OLINE_STRING__COORDINATES = OSHAPE_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>OLine String</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OLINE_STRING_FEATURE_COUNT = OSHAPE_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>OLine String</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OLINE_STRING_OPERATION_COUNT = OSHAPE_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.OMultiLineStringImpl <em>OMulti Line String</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.OMultiLineStringImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOMultiLineString()
     * @generated
     */
    int OMULTI_LINE_STRING = 16;
    /**
     * The feature id for the '<em><b>Coordinates</b></em>' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_LINE_STRING__COORDINATES = OSHAPE_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>OMulti Line String</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_LINE_STRING_FEATURE_COUNT = OSHAPE_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>OMulti Line String</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_LINE_STRING_OPERATION_COUNT = OSHAPE_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.OPolygonImpl <em>OPolygon</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.OPolygonImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOPolygon()
     * @generated
     */
    int OPOLYGON = 17;
    /**
     * The feature id for the '<em><b>Coordinates</b></em>' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OPOLYGON__COORDINATES = OSHAPE_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>OPolygon</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OPOLYGON_FEATURE_COUNT = OSHAPE_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>OPolygon</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OPOLYGON_OPERATION_COUNT = OSHAPE_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.OMultiPolygonImpl <em>OMulti Polygon</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.OMultiPolygonImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOMultiPolygon()
     * @generated
     */
    int OMULTI_POLYGON = 18;
    /**
     * The feature id for the '<em><b>Coordinates</b></em>' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_POLYGON__COORDINATES = OSHAPE_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>OMulti Polygon</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_POLYGON_FEATURE_COUNT = OSHAPE_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>OMulti Polygon</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OMULTI_POLYGON_OPERATION_COUNT = OSHAPE_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.ORectangleImpl <em>ORectangle</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.ORectangleImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getORectangle()
     * @generated
     */
    int ORECTANGLE = 19;
    /**
     * The feature id for the '<em><b>Coordinates</b></em>' attribute list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int ORECTANGLE__COORDINATES = OSHAPE_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>ORectangle</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int ORECTANGLE_FEATURE_COUNT = OSHAPE_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>ORectangle</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int ORECTANGLE_OPERATION_COUNT = OSHAPE_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.OGeometryCollectionImpl <em>OGeometry Collection</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.OGeometryCollectionImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOGeometryCollection()
     * @generated
     */
    int OGEOMETRY_COLLECTION = 20;
    /**
     * The feature id for the '<em><b>Geometries</b></em>' containment reference list.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OGEOMETRY_COLLECTION__GEOMETRIES = OSHAPE_FEATURE_COUNT + 0;
    /**
     * The number of structural features of the '<em>OGeometry Collection</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OGEOMETRY_COLLECTION_FEATURE_COUNT = OSHAPE_FEATURE_COUNT + 1;
    /**
     * The number of operations of the '<em>OGeometry Collection</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int OGEOMETRY_COLLECTION_OPERATION_COUNT = OSHAPE_OPERATION_COUNT + 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.PlacemarkImpl <em>Placemark</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.PlacemarkImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getPlacemark()
     * @generated
     */
    int PLACEMARK = 21;
    /**
     * The feature id for the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PLACEMARK__NAME = 0;
    /**
     * The feature id for the '<em><b>Description</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PLACEMARK__DESCRIPTION = 1;
    /**
     * The feature id for the '<em><b>Point</b></em>' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PLACEMARK__POINT = 2;
    /**
     * The number of structural features of the '<em>Placemark</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PLACEMARK_FEATURE_COUNT = 3;
    /**
     * The number of operations of the '<em>Placemark</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int PLACEMARK_OPERATION_COUNT = 0;
    /**
     * The meta object id for the '{@link ru.neoflex.meta.test.impl.CountryImpl <em>Country</em>}' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see ru.neoflex.meta.test.impl.CountryImpl
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getCountry()
     * @generated
     */
    int COUNTRY = 22;
    /**
     * The feature id for the '<em><b>Gid</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COUNTRY__GID = 0;
    /**
     * The feature id for the '<em><b>Name</b></em>' attribute.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COUNTRY__NAME = 1;
    /**
     * The feature id for the '<em><b>Geometry</b></em>' containment reference.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COUNTRY__GEOMETRY = 2;
    /**
     * The number of structural features of the '<em>Country</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COUNTRY_FEATURE_COUNT = 3;
    /**
     * The number of operations of the '<em>Country</em>' class.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     * @ordered
     */
    int COUNTRY_OPERATION_COUNT = 0;
    /**
     * The meta object id for the '<em>List Of Double</em>' data type.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see java.util.List
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getListOfDouble()
     * @generated
     */
    int LIST_OF_DOUBLE = 23;
    /**
     * The meta object id for the '<em>List2 Of Double</em>' data type.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see java.util.List
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getList2OfDouble()
     * @generated
     */
    int LIST2_OF_DOUBLE = 24;
    /**
     * The meta object id for the '<em>List3 Of Double</em>' data type.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @see java.util.List
     * @see ru.neoflex.meta.test.impl.TestPackageImpl#getList3OfDouble()
     * @generated
     */
    int LIST3_OF_DOUBLE = 25;
    /**
     * The singleton instance of the package.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @generated
     */
    TestPackage eINSTANCE = ru.neoflex.meta.test.impl.TestPackageImpl.init();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.Authority <em>Authority</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>Authority</em>'.
     * @see ru.neoflex.meta.test.Authority
     * @generated
     */
    EClass getAuthority();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.Authority#getQName <em>QName</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>QName</em>'.
     * @see ru.neoflex.meta.test.Authority#getQName()
     * @see #getAuthority()
     * @generated
     */
    EAttribute getAuthority_QName();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.Group <em>Group</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>Group</em>'.
     * @see ru.neoflex.meta.test.Group
     * @generated
     */
    EClass getGroup();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.User <em>User</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>User</em>'.
     * @see ru.neoflex.meta.test.User
     * @generated
     */
    EClass getUser();

    /**
     * Returns the meta object for the reference '{@link ru.neoflex.meta.test.User#getGroup <em>Group</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the reference '<em>Group</em>'.
     * @see ru.neoflex.meta.test.User#getGroup()
     * @see #getUser()
     * @generated
     */
    EReference getUser_Group();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.Column <em>Column</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>Column</em>'.
     * @see ru.neoflex.meta.test.Column
     * @generated
     */
    EClass getColumn();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.Column#getName <em>Name</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Name</em>'.
     * @see ru.neoflex.meta.test.Column#getName()
     * @see #getColumn()
     * @generated
     */
    EAttribute getColumn_Name();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.Column#getDbType <em>Db Type</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Db Type</em>'.
     * @see ru.neoflex.meta.test.Column#getDbType()
     * @see #getColumn()
     * @generated
     */
    EAttribute getColumn_DbType();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.DBKey <em>DB Key</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>DB Key</em>'.
     * @see ru.neoflex.meta.test.DBKey
     * @generated
     */
    EClass getDBKey();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.DBKey#getName <em>Name</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Name</em>'.
     * @see ru.neoflex.meta.test.DBKey#getName()
     * @see #getDBKey()
     * @generated
     */
    EAttribute getDBKey_Name();

    /**
     * Returns the meta object for the reference list '{@link ru.neoflex.meta.test.DBKey#getColumns <em>Columns</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the reference list '<em>Columns</em>'.
     * @see ru.neoflex.meta.test.DBKey#getColumns()
     * @see #getDBKey()
     * @generated
     */
    EReference getDBKey_Columns();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.PKey <em>PKey</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>PKey</em>'.
     * @see ru.neoflex.meta.test.PKey
     * @generated
     */
    EClass getPKey();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.IEKey <em>IE Key</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>IE Key</em>'.
     * @see ru.neoflex.meta.test.IEKey
     * @generated
     */
    EClass getIEKey();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.IEKey#isIsUnique <em>Is Unique</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Is Unique</em>'.
     * @see ru.neoflex.meta.test.IEKey#isIsUnique()
     * @see #getIEKey()
     * @generated
     */
    EAttribute getIEKey_IsUnique();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.FKey <em>FKey</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>FKey</em>'.
     * @see ru.neoflex.meta.test.FKey
     * @generated
     */
    EClass getFKey();

    /**
     * Returns the meta object for the reference '{@link ru.neoflex.meta.test.FKey#getEntity <em>Entity</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the reference '<em>Entity</em>'.
     * @see ru.neoflex.meta.test.FKey#getEntity()
     * @see #getFKey()
     * @generated
     */
    EReference getFKey_Entity();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.DBEntity <em>DB Entity</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>DB Entity</em>'.
     * @see ru.neoflex.meta.test.DBEntity
     * @generated
     */
    EClass getDBEntity();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.DBEntity#getQName <em>QName</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>QName</em>'.
     * @see ru.neoflex.meta.test.DBEntity#getQName()
     * @see #getDBEntity()
     * @generated
     */
    EAttribute getDBEntity_QName();

    /**
     * Returns the meta object for the containment reference '{@link ru.neoflex.meta.test.DBEntity#getPKey <em>PKey</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the containment reference '<em>PKey</em>'.
     * @see ru.neoflex.meta.test.DBEntity#getPKey()
     * @see #getDBEntity()
     * @generated
     */
    EReference getDBEntity_PKey();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.DBTable <em>DB Table</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>DB Table</em>'.
     * @see ru.neoflex.meta.test.DBTable
     * @generated
     */
    EClass getDBTable();

    /**
     * Returns the meta object for the containment reference list '{@link ru.neoflex.meta.test.DBTable#getColumns <em>Columns</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the containment reference list '<em>Columns</em>'.
     * @see ru.neoflex.meta.test.DBTable#getColumns()
     * @see #getDBTable()
     * @generated
     */
    EReference getDBTable_Columns();

    /**
     * Returns the meta object for the containment reference list '{@link ru.neoflex.meta.test.DBTable#getIndexes <em>Indexes</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the containment reference list '<em>Indexes</em>'.
     * @see ru.neoflex.meta.test.DBTable#getIndexes()
     * @see #getDBTable()
     * @generated
     */
    EReference getDBTable_Indexes();

    /**
     * Returns the meta object for the containment reference list '{@link ru.neoflex.meta.test.DBTable#getFKeys <em>FKeys</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the containment reference list '<em>FKeys</em>'.
     * @see ru.neoflex.meta.test.DBTable#getFKeys()
     * @see #getDBTable()
     * @generated
     */
    EReference getDBTable_FKeys();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.DBView <em>DB View</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>DB View</em>'.
     * @see ru.neoflex.meta.test.DBView
     * @generated
     */
    EClass getDBView();

    /**
     * Returns the meta object for the reference list '{@link ru.neoflex.meta.test.DBView#getColumns <em>Columns</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the reference list '<em>Columns</em>'.
     * @see ru.neoflex.meta.test.DBView#getColumns()
     * @see #getDBView()
     * @generated
     */
    EReference getDBView_Columns();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.DBView#isIsMaterialized <em>Is Materialized</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Is Materialized</em>'.
     * @see ru.neoflex.meta.test.DBView#isIsMaterialized()
     * @see #getDBView()
     * @generated
     */
    EAttribute getDBView_IsMaterialized();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.MetaView <em>Meta View</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>Meta View</em>'.
     * @see ru.neoflex.meta.test.MetaView
     * @generated
     */
    EClass getMetaView();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.MetaView#getQName <em>QName</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>QName</em>'.
     * @see ru.neoflex.meta.test.MetaView#getQName()
     * @see #getMetaView()
     * @generated
     */
    EAttribute getMetaView_QName();

    /**
     * Returns the meta object for the reference '{@link ru.neoflex.meta.test.MetaView#getAPackage <em>APackage</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the reference '<em>APackage</em>'.
     * @see ru.neoflex.meta.test.MetaView#getAPackage()
     * @see #getMetaView()
     * @generated
     */
    EReference getMetaView_APackage();

    /**
     * Returns the meta object for the reference '{@link ru.neoflex.meta.test.MetaView#getAClass <em>AClass</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the reference '<em>AClass</em>'.
     * @see ru.neoflex.meta.test.MetaView#getAClass()
     * @see #getMetaView()
     * @generated
     */
    EReference getMetaView_AClass();

    /**
     * Returns the meta object for the reference '{@link ru.neoflex.meta.test.MetaView#getAObject <em>AObject</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the reference '<em>AObject</em>'.
     * @see ru.neoflex.meta.test.MetaView#getAObject()
     * @see #getMetaView()
     * @generated
     */
    EReference getMetaView_AObject();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.OShape <em>OShape</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>OShape</em>'.
     * @see ru.neoflex.meta.test.OShape
     * @generated
     */
    EClass getOShape();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.OPoint <em>OPoint</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>OPoint</em>'.
     * @see ru.neoflex.meta.test.OPoint
     * @generated
     */
    EClass getOPoint();

    /**
     * Returns the meta object for the attribute list '{@link ru.neoflex.meta.test.OPoint#getCoordinates <em>Coordinates</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute list '<em>Coordinates</em>'.
     * @see ru.neoflex.meta.test.OPoint#getCoordinates()
     * @see #getOPoint()
     * @generated
     */
    EAttribute getOPoint_Coordinates();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.OMultiPoint <em>OMulti Point</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>OMulti Point</em>'.
     * @see ru.neoflex.meta.test.OMultiPoint
     * @generated
     */
    EClass getOMultiPoint();

    /**
     * Returns the meta object for the attribute list '{@link ru.neoflex.meta.test.OMultiPoint#getCoordinates <em>Coordinates</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute list '<em>Coordinates</em>'.
     * @see ru.neoflex.meta.test.OMultiPoint#getCoordinates()
     * @see #getOMultiPoint()
     * @generated
     */
    EAttribute getOMultiPoint_Coordinates();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.OLineString <em>OLine String</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>OLine String</em>'.
     * @see ru.neoflex.meta.test.OLineString
     * @generated
     */
    EClass getOLineString();

    /**
     * Returns the meta object for the attribute list '{@link ru.neoflex.meta.test.OLineString#getCoordinates <em>Coordinates</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute list '<em>Coordinates</em>'.
     * @see ru.neoflex.meta.test.OLineString#getCoordinates()
     * @see #getOLineString()
     * @generated
     */
    EAttribute getOLineString_Coordinates();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.OMultiLineString <em>OMulti Line String</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>OMulti Line String</em>'.
     * @see ru.neoflex.meta.test.OMultiLineString
     * @generated
     */
    EClass getOMultiLineString();

    /**
     * Returns the meta object for the attribute list '{@link ru.neoflex.meta.test.OMultiLineString#getCoordinates <em>Coordinates</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute list '<em>Coordinates</em>'.
     * @see ru.neoflex.meta.test.OMultiLineString#getCoordinates()
     * @see #getOMultiLineString()
     * @generated
     */
    EAttribute getOMultiLineString_Coordinates();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.OPolygon <em>OPolygon</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>OPolygon</em>'.
     * @see ru.neoflex.meta.test.OPolygon
     * @generated
     */
    EClass getOPolygon();

    /**
     * Returns the meta object for the attribute list '{@link ru.neoflex.meta.test.OPolygon#getCoordinates <em>Coordinates</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute list '<em>Coordinates</em>'.
     * @see ru.neoflex.meta.test.OPolygon#getCoordinates()
     * @see #getOPolygon()
     * @generated
     */
    EAttribute getOPolygon_Coordinates();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.OMultiPolygon <em>OMulti Polygon</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>OMulti Polygon</em>'.
     * @see ru.neoflex.meta.test.OMultiPolygon
     * @generated
     */
    EClass getOMultiPolygon();

    /**
     * Returns the meta object for the attribute list '{@link ru.neoflex.meta.test.OMultiPolygon#getCoordinates <em>Coordinates</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute list '<em>Coordinates</em>'.
     * @see ru.neoflex.meta.test.OMultiPolygon#getCoordinates()
     * @see #getOMultiPolygon()
     * @generated
     */
    EAttribute getOMultiPolygon_Coordinates();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.ORectangle <em>ORectangle</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>ORectangle</em>'.
     * @see ru.neoflex.meta.test.ORectangle
     * @generated
     */
    EClass getORectangle();

    /**
     * Returns the meta object for the attribute list '{@link ru.neoflex.meta.test.ORectangle#getCoordinates <em>Coordinates</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute list '<em>Coordinates</em>'.
     * @see ru.neoflex.meta.test.ORectangle#getCoordinates()
     * @see #getORectangle()
     * @generated
     */
    EAttribute getORectangle_Coordinates();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.OGeometryCollection <em>OGeometry Collection</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>OGeometry Collection</em>'.
     * @see ru.neoflex.meta.test.OGeometryCollection
     * @generated
     */
    EClass getOGeometryCollection();

    /**
     * Returns the meta object for the containment reference list '{@link ru.neoflex.meta.test.OGeometryCollection#getGeometries <em>Geometries</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the containment reference list '<em>Geometries</em>'.
     * @see ru.neoflex.meta.test.OGeometryCollection#getGeometries()
     * @see #getOGeometryCollection()
     * @generated
     */
    EReference getOGeometryCollection_Geometries();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.Placemark <em>Placemark</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>Placemark</em>'.
     * @see ru.neoflex.meta.test.Placemark
     * @generated
     */
    EClass getPlacemark();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.Placemark#getName <em>Name</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Name</em>'.
     * @see ru.neoflex.meta.test.Placemark#getName()
     * @see #getPlacemark()
     * @generated
     */
    EAttribute getPlacemark_Name();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.Placemark#getDescription <em>Description</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Description</em>'.
     * @see ru.neoflex.meta.test.Placemark#getDescription()
     * @see #getPlacemark()
     * @generated
     */
    EAttribute getPlacemark_Description();

    /**
     * Returns the meta object for the containment reference '{@link ru.neoflex.meta.test.Placemark#getPoint <em>Point</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the containment reference '<em>Point</em>'.
     * @see ru.neoflex.meta.test.Placemark#getPoint()
     * @see #getPlacemark()
     * @generated
     */
    EReference getPlacemark_Point();

    /**
     * Returns the meta object for class '{@link ru.neoflex.meta.test.Country <em>Country</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for class '<em>Country</em>'.
     * @see ru.neoflex.meta.test.Country
     * @generated
     */
    EClass getCountry();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.Country#getGid <em>Gid</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Gid</em>'.
     * @see ru.neoflex.meta.test.Country#getGid()
     * @see #getCountry()
     * @generated
     */
    EAttribute getCountry_Gid();

    /**
     * Returns the meta object for the attribute '{@link ru.neoflex.meta.test.Country#getName <em>Name</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the attribute '<em>Name</em>'.
     * @see ru.neoflex.meta.test.Country#getName()
     * @see #getCountry()
     * @generated
     */
    EAttribute getCountry_Name();

    /**
     * Returns the meta object for the containment reference '{@link ru.neoflex.meta.test.Country#getGeometry <em>Geometry</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for the containment reference '<em>Geometry</em>'.
     * @see ru.neoflex.meta.test.Country#getGeometry()
     * @see #getCountry()
     * @generated
     */
    EReference getCountry_Geometry();

    /**
     * Returns the meta object for data type '{@link java.util.List <em>List Of Double</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for data type '<em>List Of Double</em>'.
     * @see java.util.List
     * @model instanceClass="java.util.List&lt;java.lang.Double&gt;"
     * @generated
     */
    EDataType getListOfDouble();

    /**
     * Returns the meta object for data type '{@link java.util.List <em>List2 Of Double</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for data type '<em>List2 Of Double</em>'.
     * @see java.util.List
     * @model instanceClass="java.util.List&lt;java.util.List&lt;java.lang.Double&gt;&gt;"
     * @generated
     */
    EDataType getList2OfDouble();

    /**
     * Returns the meta object for data type '{@link java.util.List <em>List3 Of Double</em>}'.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the meta object for data type '<em>List3 Of Double</em>'.
     * @see java.util.List
     * @model instanceClass="java.util.List&lt;java.util.List&lt;java.util.List&lt;java.lang.Double&gt;&gt;&gt;"
     * @generated
     */
    EDataType getList3OfDouble();

    /**
     * Returns the factory that creates the instances of the model.
     * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
     * @return the factory that creates the instances of the model.
     * @generated
     */
    TestFactory getTestFactory();

    /**
     * <!-- begin-user-doc -->
     * Defines literals for the meta objects that represent
     * <ul>
     *   <li>each class,</li>
     *   <li>each feature of each class,</li>
     *   <li>each operation of each class,</li>
     *   <li>each enum,</li>
     *   <li>and each data type</li>
     * </ul>
     * <!-- end-user-doc -->
     * @generated
     */
    interface Literals {
        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.AuthorityImpl <em>Authority</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.AuthorityImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getAuthority()
         * @generated
         */
        EClass AUTHORITY = eINSTANCE.getAuthority();

        /**
         * The meta object literal for the '<em><b>QName</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute AUTHORITY__QNAME = eINSTANCE.getAuthority_QName();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.GroupImpl <em>Group</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.GroupImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getGroup()
         * @generated
         */
        EClass GROUP = eINSTANCE.getGroup();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.UserImpl <em>User</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.UserImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getUser()
         * @generated
         */
        EClass USER = eINSTANCE.getUser();

        /**
         * The meta object literal for the '<em><b>Group</b></em>' reference feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference USER__GROUP = eINSTANCE.getUser_Group();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.ColumnImpl <em>Column</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.ColumnImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getColumn()
         * @generated
         */
        EClass COLUMN = eINSTANCE.getColumn();

        /**
         * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute COLUMN__NAME = eINSTANCE.getColumn_Name();

        /**
         * The meta object literal for the '<em><b>Db Type</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute COLUMN__DB_TYPE = eINSTANCE.getColumn_DbType();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.DBKeyImpl <em>DB Key</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.DBKeyImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getDBKey()
         * @generated
         */
        EClass DB_KEY = eINSTANCE.getDBKey();

        /**
         * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute DB_KEY__NAME = eINSTANCE.getDBKey_Name();

        /**
         * The meta object literal for the '<em><b>Columns</b></em>' reference list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference DB_KEY__COLUMNS = eINSTANCE.getDBKey_Columns();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.PKeyImpl <em>PKey</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.PKeyImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getPKey()
         * @generated
         */
        EClass PKEY = eINSTANCE.getPKey();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.IEKeyImpl <em>IE Key</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.IEKeyImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getIEKey()
         * @generated
         */
        EClass IE_KEY = eINSTANCE.getIEKey();

        /**
         * The meta object literal for the '<em><b>Is Unique</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute IE_KEY__IS_UNIQUE = eINSTANCE.getIEKey_IsUnique();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.FKeyImpl <em>FKey</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.FKeyImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getFKey()
         * @generated
         */
        EClass FKEY = eINSTANCE.getFKey();

        /**
         * The meta object literal for the '<em><b>Entity</b></em>' reference feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference FKEY__ENTITY = eINSTANCE.getFKey_Entity();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.DBEntityImpl <em>DB Entity</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.DBEntityImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getDBEntity()
         * @generated
         */
        EClass DB_ENTITY = eINSTANCE.getDBEntity();

        /**
         * The meta object literal for the '<em><b>QName</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute DB_ENTITY__QNAME = eINSTANCE.getDBEntity_QName();

        /**
         * The meta object literal for the '<em><b>PKey</b></em>' containment reference feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference DB_ENTITY__PKEY = eINSTANCE.getDBEntity_PKey();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.DBTableImpl <em>DB Table</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.DBTableImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getDBTable()
         * @generated
         */
        EClass DB_TABLE = eINSTANCE.getDBTable();

        /**
         * The meta object literal for the '<em><b>Columns</b></em>' containment reference list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference DB_TABLE__COLUMNS = eINSTANCE.getDBTable_Columns();

        /**
         * The meta object literal for the '<em><b>Indexes</b></em>' containment reference list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference DB_TABLE__INDEXES = eINSTANCE.getDBTable_Indexes();

        /**
         * The meta object literal for the '<em><b>FKeys</b></em>' containment reference list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference DB_TABLE__FKEYS = eINSTANCE.getDBTable_FKeys();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.DBViewImpl <em>DB View</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.DBViewImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getDBView()
         * @generated
         */
        EClass DB_VIEW = eINSTANCE.getDBView();

        /**
         * The meta object literal for the '<em><b>Columns</b></em>' reference list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference DB_VIEW__COLUMNS = eINSTANCE.getDBView_Columns();

        /**
         * The meta object literal for the '<em><b>Is Materialized</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute DB_VIEW__IS_MATERIALIZED = eINSTANCE.getDBView_IsMaterialized();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.MetaViewImpl <em>Meta View</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.MetaViewImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getMetaView()
         * @generated
         */
        EClass META_VIEW = eINSTANCE.getMetaView();

        /**
         * The meta object literal for the '<em><b>QName</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute META_VIEW__QNAME = eINSTANCE.getMetaView_QName();

        /**
         * The meta object literal for the '<em><b>APackage</b></em>' reference feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference META_VIEW__APACKAGE = eINSTANCE.getMetaView_APackage();

        /**
         * The meta object literal for the '<em><b>AClass</b></em>' reference feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference META_VIEW__ACLASS = eINSTANCE.getMetaView_AClass();

        /**
         * The meta object literal for the '<em><b>AObject</b></em>' reference feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference META_VIEW__AOBJECT = eINSTANCE.getMetaView_AObject();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.OShapeImpl <em>OShape</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.OShapeImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOShape()
         * @generated
         */
        EClass OSHAPE = eINSTANCE.getOShape();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.OPointImpl <em>OPoint</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.OPointImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOPoint()
         * @generated
         */
        EClass OPOINT = eINSTANCE.getOPoint();

        /**
         * The meta object literal for the '<em><b>Coordinates</b></em>' attribute list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute OPOINT__COORDINATES = eINSTANCE.getOPoint_Coordinates();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.OMultiPointImpl <em>OMulti Point</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.OMultiPointImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOMultiPoint()
         * @generated
         */
        EClass OMULTI_POINT = eINSTANCE.getOMultiPoint();

        /**
         * The meta object literal for the '<em><b>Coordinates</b></em>' attribute list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute OMULTI_POINT__COORDINATES = eINSTANCE.getOMultiPoint_Coordinates();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.OLineStringImpl <em>OLine String</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.OLineStringImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOLineString()
         * @generated
         */
        EClass OLINE_STRING = eINSTANCE.getOLineString();

        /**
         * The meta object literal for the '<em><b>Coordinates</b></em>' attribute list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute OLINE_STRING__COORDINATES = eINSTANCE.getOLineString_Coordinates();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.OMultiLineStringImpl <em>OMulti Line String</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.OMultiLineStringImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOMultiLineString()
         * @generated
         */
        EClass OMULTI_LINE_STRING = eINSTANCE.getOMultiLineString();

        /**
         * The meta object literal for the '<em><b>Coordinates</b></em>' attribute list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute OMULTI_LINE_STRING__COORDINATES = eINSTANCE.getOMultiLineString_Coordinates();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.OPolygonImpl <em>OPolygon</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.OPolygonImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOPolygon()
         * @generated
         */
        EClass OPOLYGON = eINSTANCE.getOPolygon();

        /**
         * The meta object literal for the '<em><b>Coordinates</b></em>' attribute list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute OPOLYGON__COORDINATES = eINSTANCE.getOPolygon_Coordinates();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.OMultiPolygonImpl <em>OMulti Polygon</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.OMultiPolygonImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOMultiPolygon()
         * @generated
         */
        EClass OMULTI_POLYGON = eINSTANCE.getOMultiPolygon();

        /**
         * The meta object literal for the '<em><b>Coordinates</b></em>' attribute list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute OMULTI_POLYGON__COORDINATES = eINSTANCE.getOMultiPolygon_Coordinates();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.ORectangleImpl <em>ORectangle</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.ORectangleImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getORectangle()
         * @generated
         */
        EClass ORECTANGLE = eINSTANCE.getORectangle();

        /**
         * The meta object literal for the '<em><b>Coordinates</b></em>' attribute list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute ORECTANGLE__COORDINATES = eINSTANCE.getORectangle_Coordinates();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.OGeometryCollectionImpl <em>OGeometry Collection</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.OGeometryCollectionImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getOGeometryCollection()
         * @generated
         */
        EClass OGEOMETRY_COLLECTION = eINSTANCE.getOGeometryCollection();

        /**
         * The meta object literal for the '<em><b>Geometries</b></em>' containment reference list feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference OGEOMETRY_COLLECTION__GEOMETRIES = eINSTANCE.getOGeometryCollection_Geometries();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.PlacemarkImpl <em>Placemark</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.PlacemarkImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getPlacemark()
         * @generated
         */
        EClass PLACEMARK = eINSTANCE.getPlacemark();

        /**
         * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute PLACEMARK__NAME = eINSTANCE.getPlacemark_Name();

        /**
         * The meta object literal for the '<em><b>Description</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute PLACEMARK__DESCRIPTION = eINSTANCE.getPlacemark_Description();

        /**
         * The meta object literal for the '<em><b>Point</b></em>' containment reference feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference PLACEMARK__POINT = eINSTANCE.getPlacemark_Point();

        /**
         * The meta object literal for the '{@link ru.neoflex.meta.test.impl.CountryImpl <em>Country</em>}' class.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see ru.neoflex.meta.test.impl.CountryImpl
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getCountry()
         * @generated
         */
        EClass COUNTRY = eINSTANCE.getCountry();

        /**
         * The meta object literal for the '<em><b>Gid</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute COUNTRY__GID = eINSTANCE.getCountry_Gid();

        /**
         * The meta object literal for the '<em><b>Name</b></em>' attribute feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EAttribute COUNTRY__NAME = eINSTANCE.getCountry_Name();

        /**
         * The meta object literal for the '<em><b>Geometry</b></em>' containment reference feature.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @generated
         */
        EReference COUNTRY__GEOMETRY = eINSTANCE.getCountry_Geometry();

        /**
         * The meta object literal for the '<em>List Of Double</em>' data type.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see java.util.List
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getListOfDouble()
         * @generated
         */
        EDataType LIST_OF_DOUBLE = eINSTANCE.getListOfDouble();

        /**
         * The meta object literal for the '<em>List2 Of Double</em>' data type.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see java.util.List
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getList2OfDouble()
         * @generated
         */
        EDataType LIST2_OF_DOUBLE = eINSTANCE.getList2OfDouble();

        /**
         * The meta object literal for the '<em>List3 Of Double</em>' data type.
         * <!-- begin-user-doc -->
         * <!-- end-user-doc -->
         * @see java.util.List
         * @see ru.neoflex.meta.test.impl.TestPackageImpl#getList3OfDouble()
         * @generated
         */
        EDataType LIST3_OF_DOUBLE = eINSTANCE.getList3OfDouble();

    }

} //TestPackage
