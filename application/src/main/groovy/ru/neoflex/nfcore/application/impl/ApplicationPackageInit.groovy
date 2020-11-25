package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.resource.Resource
import ru.neoflex.nfcore.application.*
import ru.neoflex.nfcore.base.auth.GrantType
import ru.neoflex.nfcore.base.services.Authorization
import ru.neoflex.nfcore.base.services.Context

import java.util.function.Consumer

class ApplicationPackageInit {
    def static processViewElement(ViewElement viewElement) {
        if (viewElement == null) return
        viewElement.grantType = GrantType.WRITE
        if (viewElement.checkRights) {
            int grant = Context.current.authorization.isEObjectPermitted(viewElement)
            viewElement.grantType = Authorization.getGrantType(grant)
        }
        if (viewElement instanceof ViewContainer) viewElement.children.each {c->processViewElement(c)}
    }

    def static processTreeNode(TreeNode treeNode) {
        if (treeNode == null) return
        treeNode.grantType = GrantType.WRITE
        if (treeNode.checkRights) {
            int grant = Context.current.authorization.isEObjectPermitted(treeNode)
            treeNode.grantType = Authorization.getGrantType(grant)
        }
        if (treeNode instanceof CatalogNode) treeNode.children.each {c->processTreeNode(c)}
        else if (treeNode instanceof ViewNode) processViewElement(treeNode.view)
    }

    {
        Context.current.store.registerAfterLoad(new Consumer<Resource>() {
            @Override
            void accept(Resource resource) {
                resource.contents.each {eObject->
                    if (eObject instanceof AppModule) {
                        processViewElement(eObject.view)
                        processTreeNode(eObject.referenceTree)
//                        if (eObject instanceof Application) {
                            eObject.grantType = GrantType.WRITE
                            if (eObject.checkRights) {
                                int grant = Context.current.authorization.isEObjectPermitted(eObject)
                                eObject.grantType = Authorization.getGrantType(grant)
                            }
//                        }
                    }
                }
            }
        })
    }
}
