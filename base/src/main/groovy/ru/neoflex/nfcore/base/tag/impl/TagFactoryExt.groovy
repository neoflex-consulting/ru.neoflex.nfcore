package ru.neoflex.nfcore.base.tag.impl

import ru.neoflex.nfcore.base.tag.*

public class TagFactoryExt extends TagFactoryImpl{
    @Override
    Tag createTag() {
        return new TagExt();
    }
}
