package ru.neoflex.nfcore.dsl


import org.eclipse.emf.common.util.EList
import org.eclipse.emf.ecore.EAttribute
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.EReference
import org.eclipse.emf.ecore.util.EcoreUtil

class EObjectBuilder {
    final EObject eObject
    static class ExtRef {
        EObject eObject
        EReference eReference
        String id
        String fragment
    }
    List<ExtRef> extRefList = new ArrayList<>()
    Map<String, EObject> idToEObjects = new HashMap<>()
    String id

    EObjectBuilder(EObject eObject) {
        this.eObject = eObject
    }

    void attr(String attribute, Object value) {
        EAttribute eAttribute = eObject.eClass().getEStructuralFeature(attribute) as EAttribute;
        def converted = value instanceof String ? EcoreUtil.createFromString(eAttribute.EAttributeType, value) : value
        if (eAttribute.isMany()) {
            List eList = eObject.eGet(eAttribute) as List
            eList.add(converted)
        }
        else {
            eObject.eSet(eAttribute, converted)
        }
    }

    void contains(String containment, String nsPrefix, String className, @DelegatesTo(EObjectBuilder) Closure closure) {
        EReference eReference = eObject.eClass().getEStructuralFeature(containment) as EReference;
        assert eReference.isContainment()
        EObjectBuilder builder = EcoreBuilder.build(nsPrefix, className, closure)
        if (eReference.isMany()) {
            EList<EObject> eList = eObject.eGet(eReference) as EList<EObject>
            eList.add(builder.eObject)
        }
        else {
            eObject.eSet(eReference, builder.eObject)
        }
        idToEObjects.putAll(builder.idToEObjects)
        extRefList.addAll(builder.extRefList)
    }

    void refers(String cross, String id, String fragment=null) {
        EReference eReference = eObject.eClass().getEStructuralFeature(cross) as EReference;
        assert !eReference.isContainment()
        ExtRef ref = new ExtRef()
        ref.id = fragment == null ? "/" : id
        ref.fragment = fragment != null ? fragment : id
        ref.eReference = eReference
        ref.eObject = eObject
        extRefList.add(ref)
    }

    void id(String id) {
        this.id = id
        idToEObjects.put(id, eObject)
    }
}
