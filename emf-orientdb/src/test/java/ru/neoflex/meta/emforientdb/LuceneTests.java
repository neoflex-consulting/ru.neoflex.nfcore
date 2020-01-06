package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import ru.neoflex.meta.test.Placemark;
import ru.neoflex.meta.test.OPoint;
import ru.neoflex.meta.test.TestFactory;

public class LuceneTests extends TestBase {

    @BeforeClass
    public static void startUp() throws Exception {
        server = refreshDatabase(null);
    }

    @AfterClass
    public static void tearDown() {
        server.close();
    }

    @Test
    public void testPoint() throws Exception {
        Resource resource = server.inTransaction(session -> {
            ResourceSet rs = session.createResourceSet();
            Placemark placemark = TestFactory.eINSTANCE.createPlacemark();
            placemark.setName("Test Place");
            placemark.setDescription("My Test Place");
            OPoint point = TestFactory.eINSTANCE.createOPoint();
            point.getCoordinates().add(1.0);
            point.getCoordinates().add(2.0);
            placemark.setPoint(point);
            Resource placeRes = rs.createResource(server.createURI());
            placeRes.getContents().add(placemark);
            placeRes.save(null);
            return placeRes;
        });
        Placemark placemark = server.inTransaction(session -> {
            Resource r = session.query("select from test_Placemark where name=?", "Test Place").get(0);
            return (Placemark) r.getContents().get(0);
        });
        Assert.assertEquals("My Test Place", placemark.getDescription());
    }
}
