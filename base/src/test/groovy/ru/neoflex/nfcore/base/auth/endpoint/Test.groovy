package ru.neoflex.nfcore.base.auth.endpoint

import com.fasterxml.jackson.databind.node.ObjectNode
import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.Role
import ru.neoflex.nfcore.base.util.EmfJson

class Test {
    static int permitted(Role role, EObject eObject) {
        return role.isEObjectPermitted(eObject)
    }
    static int permitted(ObjectNode jsonNode) {
        def mapper = EmfJson.createMapper()
        def role = mapper.reader().treeToValue(jsonNode.get("role"), Role.class)
        def eObject = mapper.reader().treeToValue(jsonNode.get("eObject"), EObject.class)
        return role.isEObjectPermitted(eObject)
    }
}
