
import AntdFactory from './AntdFactory'
import {ViewFactory} from './View'

export class ViewRegistry {
    static INSTANCE = new ViewRegistry()
    private registry: Map<string, ViewFactory> = new Map<string, ViewFactory>();
    register(factory: ViewFactory): void {
        this.registry.set(factory.name, factory)
    }
    get(name: string): ViewFactory {
        const factory = this.registry.get(name)
        if (!factory) {
            throw new Error(`ViewFactory ${name} is not defined`)
        }
        return factory
    }
}


ViewRegistry.INSTANCE.register(AntdFactory)
