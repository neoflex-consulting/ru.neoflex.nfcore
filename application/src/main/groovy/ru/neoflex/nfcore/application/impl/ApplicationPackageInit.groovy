package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.resource.Resource
import ru.neoflex.nfcore.application.*
import ru.neoflex.nfcore.base.services.Authorization
import ru.neoflex.nfcore.base.services.Context

import java.util.function.Consumer

class ApplicationPackageInit {
    def static processViewElement(ViewElement viewElement) {
        if (viewElement == null) return
        if (viewElement.checkRights) {
            def grant = Context.current.authorization.isEObjectPermitted(viewElement)
            viewElement.hidden = !Authorization.canRead(grant)
            viewElement.disabled = !Authorization.canWrite(grant)
        }
        if (viewElement instanceof ViewContainer) viewElement.children.each {c->processViewElement(c)}
    }

    def static processTreeNode(TreeNode treeNode) {
        if (treeNode == null) return
        if (treeNode.checkRights) {
            def grant = Context.current.authorization.isEObjectPermitted(treeNode)
            treeNode.hidden = !Authorization.canRead(grant)
            treeNode.disabled = !Authorization.canWrite(grant)
        }
        if (treeNode instanceof CatalogNode) treeNode.children.each {c->processTreeNode(c)}
        else if (treeNode instanceof ViewNode) processViewElement(treeNode.view)
    }

    {
        Context.current.store.registerAfterLoad(new Consumer<Resource>() {
            @Override
            void accept(Resource resource) {
                def eObject = resource.contents[0]
                if (eObject instanceof AppModule) {
                    processViewElement(eObject.view)
                    processTreeNode(eObject.referenceTree)
                }
            }
        })
    }
}
