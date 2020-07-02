<%
    org.eclipse.emf.ecore.EObject eObject = object
    def getFeature = {org.eclipse.emf.ecore.EObject eObj, String name->
        def sf = eObj.eClass().getEStructuralFeature(name)
        if (!sf) throw new IllegalArgumentException(name)
        return eObj.eGet(sf)
    }
    def getAsString = {sf, value->
        org.eclipse.emf.ecore.util.EcoreUtil.convertToString((sf as org.eclipse.emf.ecore.EAttribute).EAttributeType, value)
    }
    def getRootId = {org.eclipse.emf.ecore.EObject eObj->
        def container = org.eclipse.emf.ecore.util.EcoreUtil.getRootContainer(eObject)
        return container.eClass().EPackage.nsPrefix + "_" + container.eClass().name + "_" + getFeature(container, "name")
    }
    def getFragment = {org.eclipse.emf.ecore.EObject eObj->
        def container = org.eclipse.emf.ecore.util.EcoreUtil.getRootContainer(eObject)
        if (container == eObject) {
            return "/"
        }
        return org.eclipse.emf.ecore.util.EcoreUtil.getRelativeURIFragmentPath(container, eObject)
    }
    def getId = {org.eclipse.emf.ecore.EObject eObj->
        def container = org.eclipse.emf.ecore.util.EcoreUtil.getRootContainer(eObject)
        if (container == eObject) {
            return getRootId(container)
        }
        return org.eclipse.emf.ecore.util.EcoreUtil.getRelativeURIFragmentPath(container, eObject)
    }%>{
    id "<%= getId(eObject)%>"<%
    for (sf in eObject.eClass().EAllStructuralFeatures) {
        if (eObject.eIsSet(sf) && !sf.isTransient() && !sf.isDerived()) {
            if (sf instanceof org.eclipse.emf.ecore.EAttribute) {
                if (!sf.isMany())
                {%>
    attr "<%= sf.name %>", "<%= getAsString(sf, eObject.eGet(sf)) %>"<%}
                else {
                    for (obj in (eObject.eGet(sf) as List)) {%>
    attr "<%= sf.name %>", "<%= getAsString(sf, obj) %>"<%}
                }
            }
            else {
                org.eclipse.emf.ecore.EReference eReference = sf;
                if (!eReference.isContainer()) {
                    if (!eReference.isContainment()) {
                        if (!sf.isMany()) {
                            def obj = eObject.eGet(sf) %>
    refers "<%= sf.name %>", "<%= getRootId(obj) %>", "<%= getFragment(obj) %>"<%
                        }
                        else {
                            for (obj in (eObject.eGet(sf) as List)) { %>
    refers "<%= sf.name %>", "<%= getRootId(obj) %>", "<%= getFragment(obj) %>"<%
                            }
                        }
                    }
                    else {
                        if (!sf.isMany()) {
                            org.eclipse.emf.ecore.EObject obj = eObject.eGet(sf) %>
    contains "<%= sf.name %>", "<%= obj.eClass().EPackage.nsPrefix %>", "<%= obj.eClass().name %>", <%= ru.neoflex.nfcore.templates.Utils.generate("eObject.gsp", [object: obj, level: level + 1], (level + 1)*4) %><%
                        }
                        else {
                            for (org.eclipse.emf.ecore.EObject obj in (eObject.eGet(sf) as List)) { %>
    contains "<%= sf.name %>", "<%= obj.eClass().EPackage.nsPrefix %>", "<%= obj.eClass().name %>", <%= ru.neoflex.nfcore.templates.Utils.generate("eObject.gsp", [object: obj, level: level + 1], (level + 1)*4) %><%
                            }
                        }
                    }
                }
            }
        }
    }%>
}