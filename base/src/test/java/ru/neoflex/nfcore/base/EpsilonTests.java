package ru.neoflex.nfcore.base;

import com.fasterxml.jackson.databind.JsonNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.eclipse.epsilon.emc.emf.EmfModel;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.meta.emfgit.TransactionClassLoader;
import ru.neoflex.nfcore.base.auth.AuthPackage;
import ru.neoflex.nfcore.base.auth.User;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Epsilon;
import ru.neoflex.nfcore.base.util.DocFinder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"dbtype=orientdb", "orientdb.dbname=modelstest"})
public class EpsilonTests {
    @Autowired
    Context context;

    @Test
    public void testCreateModelByURI() throws Exception {
        EmfModel model = context.getStore().inTransaction(true, tx -> {
            JsonNode result = getUserFinder().execute().getResult();
            JsonNode doc = result.withArray("docs").get(0);
            String id = doc.get("_id").textValue();
            String rev = doc.get("_rev").textValue();
            URI uri = context.getStore().getUriByIdAndRev(id, rev);
            return context.getEpsilon().createModel("s", uri);
        });
        Assert.assertEquals(1, model.getAllOfType("User").size());
    }

    public DocFinder getUserFinder() {
        URI classURI = EcoreUtil.getURI(AuthPackage.Literals.USER);
        DocFinder docFinder = DocFinder.create(context.getStore());
        docFinder.selector().with("contents").put("eClass", classURI.toString());
        return docFinder;
    }

    @Test
    public void testCreateModelByResourceSet() throws Exception {
        EmfModel model = context.getStore().inTransaction(true, tx -> {
            ResourceSet resourceSet = getUserFinder().execute().getResourceSet();
            return context.getEpsilon().createModel("s", resourceSet);
        });
        Assert.assertTrue(model.getAllOfType("User").size() > 0);
        Assert.assertTrue(model.getAllOfType("Role").size() > 0);
    }

    @Test
    public void testModels() throws Exception {
        String text  = context.getStore().inTransaction(true, tx -> {
            ResourceSet resourceSet = getUserFinder().execute().getResourceSet();
            String template = "[%=User.all().select(u|u.name=='admin').first().name%]!";
            for (Resource resource: resourceSet.getResources()) {
                User user = (User) resource.getContents().get(0);
                if (user.getName().equals("admin")) {
                    String text1 = context.getEpsilon().generateFromString(template, null, resource.getURI(), resourceSet);
                    Assert.assertEquals("admin!", text1);
                    String text2 = context.getEpsilon().generateFromString(template, null, user);
                    Assert.assertEquals("admin!", text2);
                    break;
                }
            }
            return context.getEpsilon().generateFromString(template, null, resourceSet);
        });
        Assert.assertEquals("admin!", text);
    }

    @Test
    public void testImport() throws Exception {
        String text  = context.getStore().inTransaction(true, tx -> {
            ResourceSet resourceSet = getUserFinder().execute().getResourceSet();
            return context.getEpsilon().generate("ToValid.egl", null, resourceSet);
        });
        Assert.assertEquals("_12_", text);
    }

    @Test
    public void testJustString() throws Exception {
        String template = "[%=x.toLowerCase()%]";
        String text = context.getEpsilon().generateFromString(template, new HashMap<String, Object>(){{put("x", "Ok");}});
        Assert.assertEquals("ok", text);
    }

    @Test
    public void testClassLoader() throws Exception {
        TransactionClassLoader.withClassLoader(()->{
            String text = context.getStore().inTransaction(true, tx -> {
                return context.getWorkspace().getDatabase().inTransaction("master", Transaction.LockType.WRITE, tx1 -> {
                    ResourceSet resourceSet = getUserFinder().execute().getResourceSet();
                    Path resourcePath = Paths.get(Thread.currentThread().getContextClassLoader().getResource(Epsilon.EPSILON_TEMPLATE_ROOT + "/Utils.egl").toURI());
                    Path newResourcePath = tx1.getFileSystem().getPath("/" + Epsilon.EPSILON_TEMPLATE_ROOT + "/Utils2.egl");
                    Files.createDirectories(newResourcePath.getParent());
                    Files.copy(resourcePath, newResourcePath, REPLACE_EXISTING);
                    String program = "[%import \"Utils2.egl\";%]" +
                            "[%=toValidName('12,')%]";
                    Path newProgramPath = tx1.getFileSystem().getPath("/" + Epsilon.EPSILON_TEMPLATE_ROOT + "/ToValid2.egl");
                    Files.write(newProgramPath, program.getBytes());
                    String result = context.getEpsilon().generate("ToValid2.egl", null, resourceSet);
                    tx1.commit("Written Utils2.egl, ToValid2.egl", "orlov", "");
                    return result;
                });
            });
            Assert.assertEquals("_12_", text);
            try (Transaction tx = context.getWorkspace().createTransaction(Transaction.LockType.WRITE)) {
                Path resourcePath = tx.getFileSystem().getPath("/" + Epsilon.EPSILON_TEMPLATE_ROOT + "/Utils2.egl");
                Files.delete(resourcePath);
                Path newResourcePath = tx.getFileSystem().getPath("/" + Epsilon.EPSILON_TEMPLATE_ROOT + "/ToValid2.egl");
                Files.delete(newResourcePath);
                tx.commit("Deleted Utils2.egl, ToValid2.egl");
            }
            return 0;
        });
    }

    @Test
    public void testUserToGroup() throws Exception {
        context.getStore().inTransaction(true, tx -> {
            ResourceSet inputSet = getUserFinder().execute().getResourceSet();
            EObject eObject = inputSet.getResources().get(0).getContents().get(0);
            context.getStore().createEmptyResource().getContents().add(eObject);
            ResourceSet outputSet = context.getEpsilon().transform(Epsilon.EPSILON_TEMPLATE_ROOT + "/UserToGroup.etl",
                    null, eObject);
            Assert.assertEquals(1, outputSet.getResources().size());
            for (Resource resource: outputSet.getResources()) {
                context.getStore().deleteResource(resource.getURI());
            }
            return 0;
        });
    }

}
