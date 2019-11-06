package ru.neoflex.nfcore.application;

import org.assertj.core.util.Lists;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Workspace;
import ru.neoflex.nfcore.base.services.providers.GitDBTransactionProvider;
import ru.neoflex.nfcore.locales.LocModule;
import ru.neoflex.nfcore.locales.LocalesPackage;

import java.nio.file.Files;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"repo.name=testapp"})
public class ApplicationTests {
    @Autowired
    Context context;
    @Test
    public void contextLoads() {
    }

    @Test
    public void generateLocModule() throws Exception {
        context.getWorkspace().withClassLoaderInTransaction(true, ()->{
            LocModule locModule = (LocModule) context.getGroovy().eval(LocalesPackage.Literals.LOC_MODULE, "generatePackagesModule", Lists.emptyList());
            Assert.assertEquals(context.getRegistry().getEPackages().size(), locModule.getChildren().size());
            context.getGroovy().eval(LocalesPackage.Literals.LOC_MODULE, "generateLocales", Lists.emptyList());
            Assert.assertTrue(Files.exists(Transaction.getCurrent().getFileSystem().getPath("public/locales/en/packages.json")));
            return 0;
        });
    }

}
