package ru.neoflex.nfcore.application;

import org.assertj.core.util.Lists;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.locales.LocModule;
import ru.neoflex.nfcore.locales.LocalesPackage;

@RunWith(SpringRunner.class)
@SpringBootTest
public class ApplicationTests {
    @Autowired
    Context context;
    @Test
    public void contextLoads() {
    }

    @Test
    public void generateLocModule() throws Exception {
        LocModule locModule = (LocModule) context.getGroovy().eval(LocalesPackage.Literals.LOC_MODULE, "generatePackagesModule", Lists.emptyList());
        Assert.assertEquals(context.getRegistry().getEPackages().size(), locModule.getChildren().size());
        context.getGroovy().eval(LocalesPackage.Literals.LOC_MODULE, "generateLocales", Lists.emptyList());
        Assert.assertTrue(context.getWorkspace().getFile("public/locales/en/packages.json").exists());
    }

}
