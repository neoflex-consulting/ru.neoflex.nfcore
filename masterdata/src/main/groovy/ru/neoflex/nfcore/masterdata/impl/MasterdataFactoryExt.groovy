package ru.neoflex.nfcore.masterdata.impl

import ru.neoflex.nfcore.masterdata.DocumentType
import ru.neoflex.nfcore.masterdata.EntityType

class MasterdataFactoryExt extends MasterdataFactoryImpl {
    @Override
    EntityType createEntityType() {
        return new EntityTypeExt()
    }

    @Override
    DocumentType createDocumentType() {
        return new DocumentTypeExt()
    }
}
