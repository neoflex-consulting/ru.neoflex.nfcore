package ru.neoflex.nfcore.dsl

class TemplateBuilder {
    Map<String, Closure> closureHashMap = new HashMap<>()
    Writer out = new StringWriter()
    int offset = 0

    static TemplateBuilder build(@DelegatesTo(TemplateBuilder) Closure closure) {
        TemplateBuilder builder = new TemplateBuilder()
        closure.resolveStrategy = Closure.DELEGATE_FIRST
        closure.delegate = builder
        closure.call()
        return builder
    }

    void defineMacro(String name, @DelegatesTo(TemplateBuilder) Closure closure) {
        closure.resolveStrategy = Closure.DELEGATE_FIRST
        closure.delegate = this
        closureHashMap.put(name, closure)
    }

    void write(@DelegatesTo(TemplateBuilder) Closure closure) {
        closure.resolveStrategy = Closure.DELEGATE_FIRST
        closure.delegate = this
        out << closure.call()
    }

    void callMacro(String name, Object ...args) {
        Closure closure = closureHashMap.get(name)
        Object result = closure.call(*args)
        write {result.toString()}
    }

    void callClosure(@DelegatesTo(TemplateBuilder) Closure closure, Object ...args) {
        closure.resolveStrategy = Closure.DELEGATE_FIRST
        closure.delegate = this
        closure.call(*args)
    }
}
