package ru.neoflex.nfcore.base;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.ecore.EObject;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.nfcore.base.auth.*;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Groovy;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class GroovyTests {
    @Autowired
    Groovy groovy;
    @Autowired
    Context context;

    @Test
    public void invokeEval() throws Exception {
        Role superAdmin = createSuperAdminRole();
        List args = new ArrayList();
        args.add(ActionType.CALL);
        args.add(superAdmin);
        Object result =  groovy.eval(superAdmin, "permitted", args);
        Assert.assertEquals(GrantStatus.GRANTED, result);
    }

    public static Role createSuperAdminRole() {
        Role superAdmin = AuthFactory.eINSTANCE.createRole();
        superAdmin.setName("SuperAdmin");
        Permission allPermission = AuthFactory.eINSTANCE.createAllPermission();
        allPermission.setGrantStatus(GrantStatus.GRANTED);
        allPermission.getActionTypes().add(ActionType.ALL);
        superAdmin.getGrants().add(allPermission);
        return superAdmin;
    }

    @Test
    public void invokeDynamic() throws NoSuchMethodException, InvocationTargetException, IllegalAccessException, ClassNotFoundException, InstantiationException {
        Role role = createSuperAdminRole();
        Object actionType =  ActionType.CALL;
        List parameters = new ArrayList();
        parameters.add(role);
        parameters.add(actionType);
        parameters.add(role);
        String svcClassName = "ru.neoflex.nfcore.base.auth.endpoint.Test";
        String methodName = "permitted";
        Class scriptClass = Thread.currentThread().getContextClassLoader().loadClass(svcClassName);
        Method declaredMethod = scriptClass.getDeclaredMethod(methodName, new Class[] {Role.class, ActionType.class, EObject.class} );
        Object result = declaredMethod.invoke(null, new Object[]{role, actionType, role});
        Assert.assertEquals(GrantStatus.GRANTED, result);
    }

    @Test
    public void invokeStatic() throws Exception {
        Role superAdmin = createSuperAdminRole();
        ObjectMapper mapper = context.getStore().createMapper();
        ObjectNode args = mapper.createObjectNode();
        JsonNode superAdminNode = mapper.valueToTree(superAdmin);
        args.set("role", superAdminNode);
        args.set("actionType", mapper.valueToTree(ActionType.CALL));
        args.set("eObject", superAdminNode);
        String svcClassName = "ru.neoflex.nfcore.base.auth.endpoint.Test";
        String methodName = "permitted";
        Object result =  groovy.callStatic(svcClassName, methodName, args);
        Assert.assertEquals(GrantStatus.GRANTED, result);
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
            Object result =  context.withClassLoader(()->{
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
}
