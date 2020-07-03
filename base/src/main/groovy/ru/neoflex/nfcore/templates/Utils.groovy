package ru.neoflex.nfcore.templates

import groovy.text.StreamingTemplateEngine
import groovy.text.Template
import org.eclipse.emf.ecore.EObject

import java.nio.file.Files
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
}
