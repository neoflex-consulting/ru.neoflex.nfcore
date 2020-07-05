package ru.neoflex.nfcore.base;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.auth.AuthFactory;
import ru.neoflex.nfcore.base.auth.GrantType;
import ru.neoflex.nfcore.base.auth.Permission;
import ru.neoflex.nfcore.base.auth.Role;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Groovy;
import ru.neoflex.nfcore.base.util.EmfJson;
import ru.neoflex.nfcore.dsl.EcoreBuilder;
import ru.neoflex.nfcore.templates.Utils;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static ru.neoflex.nfcore.templates.Utils.generateEcoreBuilder;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"dbtype=orientdb", "orientdb.dbname=modelstest"})
public class GroovyTests {
    @Autowired
    Groovy groovy;
    @Autowired
    Context context;

    @Test
    public void invokeEval() throws Exception {
        Role superAdmin = createSuperAdminRole();
        List args = new ArrayList();
        args.add(superAdmin);
        Object result =  groovy.eval(superAdmin, "isEObjectPermitted", args);
        Assert.assertEquals(GrantType.ALL.getValue(), result);
    }

    public static Role createSuperAdminRole() {
        Role superAdmin = AuthFactory.eINSTANCE.createRole();
        superAdmin.setName("SuperAdmin");
        Permission allPermission = AuthFactory.eINSTANCE.createAllPermission();
        allPermission.setGrantType(GrantType.ALL);
        superAdmin.getGrants().add(allPermission);
        return superAdmin;
    }

    @Test
    public void invokeDynamic() throws NoSuchMethodException, InvocationTargetException, IllegalAccessException, ClassNotFoundException, InstantiationException {
        Role role = createSuperAdminRole();
        List parameters = new ArrayList();
        parameters.add(role);
        parameters.add(role);
        String svcClassName = "ru.neoflex.nfcore.base.auth.endpoint.Test";
        String methodName = "permitted";
        Class scriptClass = Thread.currentThread().getContextClassLoader().loadClass(svcClassName);
        Method declaredMethod = scriptClass.getDeclaredMethod(methodName, new Class[] {Role.class, EObject.class} );
        Object result = declaredMethod.invoke(null, new Object[]{role, role});
        Assert.assertEquals(GrantType.ALL.getValue(), result);
    }

    @Test
    public void invokeStatic() throws Exception {
        Role superAdmin = createSuperAdminRole();
        ObjectMapper mapper = EmfJson.createMapper();
        ObjectNode args = mapper.createObjectNode();
        JsonNode superAdminNode = mapper.valueToTree(superAdmin);
        args.set("role", superAdminNode);
        args.set("eObject", superAdminNode);
        String svcClassName = "ru.neoflex.nfcore.base.auth.endpoint.Test";
        String methodName = "permitted";
        Object result =  groovy.callStatic(svcClassName, methodName, args);
        Assert.assertEquals(GrantType.ALL.getValue(), result);
    }

    @Test
    public void invokeFromGit() throws Exception {
        try (Transaction tx = context.getWorkspace().createTransaction()) {
            String code = "package ru.neoflex.meta.test\n" +
                    "class Test {\n" +
                    "static add(x, y) {\n" +
                    "        return x+y;\n" +
                    "    }\n" +
                    "}";
            Path codePath = tx.getFileSystem().getPath("/ru/neoflex/meta/test/Test.groovy");
            Files.createDirectories(codePath.getParent());
            Files.write(codePath, code.getBytes());
            tx.commit("Created Test.groovy");
            Object result =  context.inContextWithClassLoaderInTransaction(()->{
                return groovy.eval("import ru.neoflex.meta.test.Test\nTest.add(*args)", new ArrayList() {{
                    add(1);
                    add(2);
                }});
            });
            Files.delete(codePath);
            tx.commit("Deleted Test.groovy");
            Assert.assertEquals(3, result);
        }
    }

    private static String getResourceContents(String name) throws IOException, URISyntaxException {
        Path resourcePath = Paths.get(Thread.currentThread().getContextClassLoader().getResource(name).toURI());
        Assert.assertTrue(Files.isRegularFile(resourcePath));
        return new String(Files.readAllBytes(resourcePath), StandardCharsets.UTF_8);
    }

    @Test
    public void testDSL() throws Exception {
        EcoreBuilder builder = new EcoreBuilder();
        String myRole = getResourceContents("auth_Role_MyRole.groovy");
        builder.eval(myRole);
        String myAppModule = getResourceContents("auth_UserProfile_ivanov.groovy");
        builder.eval(myAppModule);
        List<EObject> eObjects = builder.eObjects();
        Assert.assertEquals(2, eObjects.size());
        Role role = (Role) eObjects.get(0);
        Assert.assertEquals("My Role!", role.getName());
        Resource resource = context.getStore().inTransaction(false, tx -> {
            Resource emptyResource = context.getStore().createEmptyResource();
            emptyResource.getContents().addAll(eObjects);
            emptyResource.save(null);
            builder.resolve();
            emptyResource.save(null);
            return emptyResource;
        });
        Resource resource2 = context.getStore().inTransaction(false, tx -> {
            Resource emptyResource = context.getStore().createEmptyResource();
            emptyResource.setURI(resource.getURI());
            emptyResource.load(null);
            EcoreUtil.resolveAll(emptyResource);
            return emptyResource;
        });
        Assert.assertEquals(2, resource2.getContents().size());
        String code = generateEcoreBuilder(resource2.getContents().get(0));
        Assert.assertNotNull(code);
        context.getStore().inTransaction(false, tx -> {
            Resource emptyResource = context.getStore().createEmptyResource();
            emptyResource.setURI(resource2.getURI());
            emptyResource.delete(null);
        });
        EcoreBuilder builder2 = new EcoreBuilder();
        builder2.eval(code);
        Assert.assertEquals("My Role!", ((Role)builder2.eObjects().get(0)).getName());
        Utils.dumpAll();
    }
}
