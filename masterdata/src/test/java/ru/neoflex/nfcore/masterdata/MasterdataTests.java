package ru.neoflex.nfcore.masterdata;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.ecore.resource.Resource;
import org.junit.AfterClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.testng.Assert;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.masterdata.services.MasterdataProvider;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.concurrent.Callable;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"dbtype=orientdb", "orientdb.dbname=modelstest", "masterdata.dbname=masterdatatest"})
public class MasterdataTests {
    @Autowired
    Store store;
    @Autowired
    Context context;
    @Autowired
    MasterdataProvider masterdataProvider;
    Resource customerTypeResource;
    Resource personTypeResource;
    Resource employeeTypeResource;
    public static Callable<Void> fini;

    @PostConstruct
    public void init() throws Exception {
        store.inTransaction(false, tx -> {
            EntityType customerType = MasterdataFactory.eINSTANCE.createEntityType();
            customerType.setName("Customer");
            masterdataProvider.createAttribute(customerType, "customerId", "INTEGER");
            masterdataProvider.createAttribute(customerType, "customerName", "STRING");
            masterdataProvider.createPrimaryKey(customerType, "Customer.pk", "customerId");
            masterdataProvider.createPlainIndex(customerType, true, "Customer.ie1", "customerName");
            masterdataProvider.createFulltextIndex(customerType, "Customer.ie2", "customerName");
            customerTypeResource = store.createEObject(customerType);
            customerType.activate();
            EntityType personType = MasterdataFactory.eINSTANCE.createEntityType();
            personType.setName("Person");
            masterdataProvider.createAttribute(personType, "personId", "INTEGER");
            masterdataProvider.createAttribute(personType, "firstName", "STRING");
            masterdataProvider.createAttribute(personType, "lastName", "STRING");
            masterdataProvider.createPrimaryKey(personType, "Person.pk", "personId");
            masterdataProvider.createFulltextIndex(personType, "Person.ie1", "firstName", "lastName");
            personTypeResource = store.createEObject(personType);
            personType.activate();
            EntityType employeeType = MasterdataFactory.eINSTANCE.createEntityType();
            employeeType.setName("Employee");
            masterdataProvider.createAttribute(employeeType, "customer", "Customer");
            masterdataProvider.createAttribute(employeeType, "customerId", "INTEGER");
            employeeType.getSuperTypes().add(personType);
            masterdataProvider.createForeignKey(employeeType, customerType, "Employee.fk1", "customerId");
            employeeTypeResource = store.createEObject(employeeType);
            employeeType.activate();
        });
        fini = () -> {
            masterdataProvider.withDatabase(database -> {
                database.command(String.format("DROP CLASS %s IF EXISTS UNSAFE", "Customer"));
                database.command(String.format("DROP CLASS %s IF EXISTS UNSAFE", "Employee"));
                database.command(String.format("DROP CLASS %s IF EXISTS UNSAFE", "Person"));
                return null;
            });
            store.inTransaction(false, tx -> {
                store.deleteResource(employeeTypeResource.getURI());
                store.deleteResource(personTypeResource.getURI());
                store.deleteResource(customerTypeResource.getURI());
            });
            return null;
        };
    }

    @AfterClass
    public static void afterClass() throws Exception {
        fini.call();
    }

    @Test
    public void testMasterdata() throws Exception {
        ObjectNode neoflexNode = (ObjectNode) new ObjectMapper().readTree("{\n" +
                "  \"customerId\": 1,\n" +
                "  \"customerName\": \"Neoflex\"\n" +
                "}");
        OEntity neoflex = masterdataProvider.inTransaction(db -> masterdataProvider.create(db, (EntityType) customerTypeResource.getContents().get(0), neoflexNode));
        Assert.assertNotNull(neoflex);
        String neoflexId = neoflex.getRid();
        OEntity neoflex2 = masterdataProvider.inTransaction(db -> {
            return masterdataProvider.load(db, neoflexId);
        });
        Assert.assertNotNull(neoflex);
        Assert.assertEquals(1, neoflex2.getObjectNode().get("customerId").asInt());
        ObjectNode ivanovNode = (ObjectNode) new ObjectMapper().readTree(String.format("{\n" +
                "  \"personId\": 1,\n" +
                "  \"firstName\": \"Ivan\",\n" +
                "  \"lastName\": \"Ivanov\",\n" +
                "  \"customerId\": 1,\n" +
                "  \"customer\": \"%s\"\n" +
                "}", neoflexId));
        OEntity ivanov = masterdataProvider.inTransaction(db -> masterdataProvider.create(db, (EntityType) employeeTypeResource.getContents().get(0), ivanovNode));
        Assert.assertNotNull(ivanov);
        Assert.assertNotNull(ivanov.getRid());
        String sql = "select firstName, lastName, customer.customerName as customerName from Employee";
        ArrayNode nodes = masterdataProvider.queryNode(sql, new HashMap());
        Assert.assertEquals(1, nodes.size());
        //do { Thread.sleep(1000); } while (true);
    }
}
