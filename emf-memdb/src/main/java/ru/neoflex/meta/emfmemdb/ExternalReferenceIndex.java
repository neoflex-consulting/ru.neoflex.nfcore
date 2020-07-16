package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EReference;
import org.eclipse.emf.ecore.InternalEObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.util.EcoreUtil;

import java.util.ArrayList;
import java.util.List;

public class ExternalReferenceIndex implements DBIndex {
    @Override
    public String getName() {
        return "ExternalReferenceIndex";
    }

    @Override
    public String[] getFields() {
        return new String[] {"toId", "toFragment", "fromId", "fromFragment", "feature", "index", "toClass"};
    }

    @Override
    public List<String[]> getEntries(Resource resource) {
        List<String[]> result = new ArrayList<>();
        String fromId = MemDBServer.getId(resource.getURI());
        new EcoreUtil.ExternalCrossReferencer(resource) {
            {
                crossReference();
            }
            protected void add(InternalEObject internalEObject, EReference eReference, EObject crossReferencedEObject) {
                if (!eReference.isDerived() && !eReference.isTransient() && !eReference.isContainer() && internalEObject.eIsSet(eReference)) {
                    String fromFragment = resource.getURIFragment(internalEObject);
                    String feature = eReference.getName();
                    int index = !eReference.isMany() ? -1 : ((EList) internalEObject.eGet(eReference)).indexOf(crossReferencedEObject);
                    String toId = MemDBServer.getId(crossReferencedEObject.eResource().getURI());
                    String toFragment = crossReferencedEObject.eResource().getURIFragment(crossReferencedEObject);
                    String toClass = EcoreUtil.getURI(crossReferencedEObject.eClass()).toString();
                    result.add(new String[]{toId, toFragment, fromId, fromFragment, feature, String.valueOf(index), toClass});
                }
            }
        };
        return result;
    }
}
