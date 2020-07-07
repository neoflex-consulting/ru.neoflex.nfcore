package ru.neoflex.nfcore.templates

import groovy.text.StreamingTemplateEngine
import groovy.text.Template
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource
import ru.neoflex.meta.emfgit.Database
import ru.neoflex.meta.emfgit.Transaction
import ru.neoflex.nfcore.base.components.SpringContext
import ru.neoflex.nfcore.base.services.Store
import ru.neoflex.nfcore.base.services.Workspace
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.function.Function

class Utils {
    static Map<String, Template> templateMap = Collections.synchronizedMap(new HashMap<>());
    static Template getTemplate(String name) {
        return templateMap.computeIfAbsent(name, new Function<String, Template>() {
            @Override
            Template apply(String s) {
                def resource = Thread.currentThread().getContextClassLoader().getResource(name)
                def path = Paths.get(resource.toURI())
                def templateText = new String(Files.readAllBytes(path), "utf-8")
                def template = new StreamingTemplateEngine().createTemplate(templateText)
                return template
            }
        })
    }

    static String generate(String name, Map binding, int shift=0) {
        def template = getTemplate(name)
        def code = template.make(binding).toString()
        return code.split("\r?\n", -1).join("\n" + " "*shift)
    }

    static String generateEcoreBuilder(EObject eObject) {
        return generate("templates/ecoreBuilder.gsp", [object: eObject])
    }

    static String getQName(EObject eObj) {
        def sf = Store.qualifiedNameDelegate.apply(eObj.eClass())
        if (!sf) throw new IllegalArgumentException(eObj.eClass().EPackage.nsPrefix + "_" + eObj.eClass().name + "_qName")
        return eObj.eGet(sf) as String
    }

    static void dumpAll() {
        def store = SpringContext.getBean(Store.class)
        def codeMaps = store.inTransaction(true, new StoreSPI.TransactionalFunction<List<Map>>() {
            @Override
            List<Map> call(TransactionSPI tx) throws Exception {
                List<Resource> all = DocFinder.create(store).getAllResources()
                return all.collect {resource->
                    return resource.contents.collect {eObject->
                        def id = eObject.eClass().EPackage.nsPrefix + "_" + eObject.eClass().name + "_" + getQName(eObject)
                        def code = generateEcoreBuilder(eObject)
                        return [id: id, code: code]
                    }
                }.flatten()
            }
        })
        def workspace = SpringContext.getBean(Workspace.class)
        workspace.database.inTransaction(workspace.currentBranch, Transaction.LockType.WRITE, new Database.Transactional<Void>() {
            @Override
            Void call(Transaction tx) throws Exception {
                Path models = tx.fileSystem.getRootPath().resolve("models")
                if (Files.isDirectory(models)) {
                    workspace.database.deleteRecursive(models);
                }
                Files.createDirectories(models)
                codeMaps.each {
                    Path file = models.resolve(it.id + ".dsl.groovy")
                    Files.write(file, it.code.getBytes("utf-8"))
                }
                tx.commit("dumpAll")
                return null
            }
        })
    }
}
