package ru.neoflex.nfcore.base;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.eclipse.emf.ecore.xmi.impl.EcoreResourceFactoryImpl;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.testng.Assert;
import ru.neoflex.nfcore.base.auth.AuthFactory;
import ru.neoflex.nfcore.base.auth.GrantType;
import ru.neoflex.nfcore.base.auth.Permission;
import ru.neoflex.nfcore.base.auth.Role;

import org.eclipse.emf.ecore.xcore.XcoreStandaloneSetup;
import org.eclipse.xtext.resource.XtextResourceSet;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"dbtype=orientdb", "orientdb.dbname=modelstest"})
public class XcoreTests {

    @Test
    public void loadXcore() throws IOException {
        XcoreStandaloneSetup.doSetup();
        ResourceSet rs = new XtextResourceSet();
        URI uri = URI.createURI("classpath:/metamodel/application.xcore");
        Resource resource = rs.getResource(uri, true);
        Assert.assertNotNull(resource);
        EcoreResourceFactoryImpl ef = new EcoreResourceFactoryImpl();
        Resource er = rs.createResource(URI.createURI("application.ecore"));
        er.getContents().add(EcoreUtil.copy(resource.getContents().get(0)));
        Assert.assertNotNull(er);
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        er.save(os, null);
        String ecore = os.toString();
        Assert.assertNotNull(ecore);
    }

    @Test
    public void createTest() throws ClassNotFoundException, IllegalAccessException, InstantiationException {
        Role superAdmin = AuthFactory.eINSTANCE.createRole();
        superAdmin.setName("SuperAdmin");
        Permission allPermission = AuthFactory.eINSTANCE.createAllPermission();
        allPermission.setGrantType(GrantType.ALL);
        superAdmin.getGrants().add(allPermission);
        Role securityOfficer = AuthFactory.eINSTANCE.createRole();
        securityOfficer.setName("SecurityOfficer");
    }
}
