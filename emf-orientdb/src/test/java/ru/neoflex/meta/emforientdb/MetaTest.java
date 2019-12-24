package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import ru.neoflex.meta.test.TestPackage;

import java.util.ArrayList;

public class MetaTest extends TestBase {
    @BeforeClass
    public static void startUp() throws Exception {
        server = refreshDatabase(new ArrayList<EPackage>() {{
            add(EcorePackage.eINSTANCE);
            add(TestPackage.eINSTANCE);
        }});
    }

    @AfterClass
    public static void tearDown() {
        server.close();
    }

    @Test
    public void testMetadata() throws Exception {
        server.inTransaction(session -> {
            ResourceSet rs = session.createResourceSet();
            for (EPackage ePackage: EcoreUtil.copyAll(server.getPackages())) {
                if (session.query("select from ecore_EPackage where name=?", ePackage.getNsPrefix()).isEmpty()) {
                    Resource ePackageResource = rs.createResource(server.createURI());
                    ePackageResource.getContents().add(ePackage);
                    ePackageResource.save(null);
                }
            }
        });
        Resource testPackageResource = server.inTransaction(session -> {
            return session.query("select from ecore_EPackage where name=?", TestPackage.eINSTANCE.getNsPrefix()).get(0);
        });
        EPackage ePackage = (EPackage) testPackageResource.getContents().get(0);
        Assert.assertEquals(TestPackage.eINSTANCE.getNsURI(), ePackage.getNsURI());
//        sleepForever();
    }

}
