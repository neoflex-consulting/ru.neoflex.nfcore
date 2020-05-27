package ru.neoflex.nfcore.application;

import org.assertj.core.util.Lists;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.locales.LocModule;
import ru.neoflex.nfcore.locales.LocalesPackage;

import java.nio.file.Files;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"dbtype=orientdb", "orientdb.dbname=modelstest"})
public class ApplicationTests {
}
