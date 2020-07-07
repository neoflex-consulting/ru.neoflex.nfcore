<%
    org.eclipse.emf.ecore.EObject eObject = object
    def getQName = {org.eclipse.emf.ecore.EObject eObj->
        def sf = ru.neoflex.nfcore.base.services.Store.qualifiedNameDelegate.apply(eObj.eClass())
        if (!sf) throw new IllegalArgumentException(eObj.eClass().EPackage.nsPrefix + "_" + eObj.eClass().name + "_qName")
        return eObj.eGet(sf) as String
    }
    def getAsString = {sf, value->
        org.eclipse.emf.ecore.util.EcoreUtil.convertToString((sf as org.eclipse.emf.ecore.EAttribute).EAttributeType, value).replaceAll('[\\\\]', '\\\\\\\\')
    }
    def getRootId = {org.eclipse.emf.ecore.EObject eObj->
        def container = org.eclipse.emf.ecore.util.EcoreUtil.getRootContainer(eObj)
        return container.eClass().EPackage.nsPrefix + "_" + container.eClass().name + "_" + getQName(container)
    }
    def getFragment = {org.eclipse.emf.ecore.EObject eObj->
        def container = org.eclipse.emf.ecore.util.EcoreUtil.getRootContainer(eObj)
        if (container == eObj) {
            return "/"
        }
        return org.eclipse.emf.ecore.util.EcoreUtil.getRelativeURIFragmentPath(container, eObj)
    }
    def getId = {org.eclipse.emf.ecore.EObject eObj->
        def container = org.eclipse.emf.ecore.util.EcoreUtil.getRootContainer(eObj)
        if (container == eObj) {
            return getRootId(container)
        }
        return org.eclipse.emf.ecore.util.EcoreUtil.getRelativeURIFragmentPath(container, eObj)
    }%>{
    id "<%= getId(eObject)%>"<%
    for (sf in eObject.eClass().EAllStructuralFeatures) {
        if (eObject.eIsSet(sf) && !sf.isTransient() && !sf.isDerived()) {
            if (sf instanceof org.eclipse.emf.ecore.EAttribute) {
                if (!sf.isMany())
                {%>
    attr "<%= sf.name %>", '''<%= getAsString(sf, eObject.eGet(sf)) %>'''<%}
                else {
                    for (obj in (eObject.eGet(sf) as List)) {%>
    attr "<%= sf.name %>", '''<%= getAsString(sf, obj) %>'''<%}
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
    contains "<%= sf.name %>", "<%= obj.eClass().EPackage.nsPrefix %>", "<%= obj.eClass().name %>", <%= ru.neoflex.nfcore.templates.Utils.generate("templates/eObject.gsp", [object: obj], 4) %><%
                        }
                        else {
                            for (org.eclipse.emf.ecore.EObject obj in (eObject.eGet(sf) as List)) { %>
    contains "<%= sf.name %>", "<%= obj.eClass().EPackage.nsPrefix %>", "<%= obj.eClass().name %>", <%= ru.neoflex.nfcore.templates.Utils.generate("templates/eObject.gsp", [object: obj], 4) %><%
                            }
                        }
                    }
                }
            }
        }
    }%>
}