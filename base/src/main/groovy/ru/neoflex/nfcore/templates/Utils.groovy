package ru.neoflex.nfcore.templates

import org.eclipse.emf.ecore.EObject

class Utils {
    static String generate(String name, Map binding, int shift=0) {
        def resource = Thread.currentThread().getContextClassLoader().getResource(name)
        def path = java.nio.file.Paths.get(resource.toURI())
        def templateText = new String(java.nio.file.Files.readAllBytes(path), "utf-8")
        def template = new groovy.text.StreamingTemplateEngine().createTemplate(templateText)
        def code = template.make(binding).toString()
        return code.split("\r?\n", -1).join("\n" + " "*shift)
    }

    static String generateEcoreBuilder(EObject eObject) {
        return generate("templates/ecoreBuilder.gsp", [object: eObject])
    }
}
