package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.noggit.JSONParser;
import org.noggit.ObjectBuilder;
import ru.neoflex.meta.test.*;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Map;
import java.util.zip.GZIPInputStream;

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
            placemark.setName("Trivento (Cathedral)");
            placemark.setDescription("[IT-86029] Trivento (Cathedral) [I-Trivento]");
            OPoint point = TestFactory.eINSTANCE.createOPoint();
            point.getCoordinates().add(14.55126);
            point.getCoordinates().add(41.7834853);
            placemark.setPoint(point);
            Resource placeRes = rs.createResource(server.createURI());
            placeRes.getContents().add(placemark);
            placeRes.save(null);
            return placeRes;
        });
        Placemark placemark = server.inTransaction(session -> {
            Resource r = session.query("select from test_Placemark where name=?", "Trivento (Cathedral)").get(0);
            return (Placemark) r.getContents().get(0);
        });
        Assert.assertEquals("[IT-86029] Trivento (Cathedral) [I-Trivento]", placemark.getDescription());
    }

    public void loadCountries(InputStream is) throws Exception {
        try(BufferedReader br = new BufferedReader(new InputStreamReader(is, "utf-8"))) {
            for(String line; (line = br.readLine()) != null; ) {
                Map map = (Map) ObjectBuilder.getVal(new JSONParser(line));
                Map properties = (Map) map.get("properties");
                String gid = (String) properties.get("GID_0");
                String name = (String) properties.get("NAME_0");
                Map geometry = (Map) map.get("geometry");
                String type = (String) geometry.get("type");
                ArrayList coordinates = (ArrayList) geometry.get("coordinates");
                Country country = TestFactory.eINSTANCE.createCountry();
                country.setGid(gid);
                country.setName(name);
                System.out.println(country.getName());
                OMultiPolygon g = TestFactory.eINSTANCE.createOMultiPolygon();
                g.getCoordinates().addAll(coordinates);
                country.setGeometry(g);
                server.inTransaction(session -> {
                    ResourceSet rs = session.createResourceSet();
                    Resource resource = rs.createResource(server.createURI());
                    resource.getContents().add(country);
                    resource.save(null);
                });
            }
        }
        server.createDatabaseDocument().execute("sql",
                "CREATE INDEX test_Country.geometry ON test_Country(geometry) SPATIAL ENGINE LUCENE").close();
    }

    public void loadPlaces(InputStream is) throws Exception {
        try(BufferedReader br = new BufferedReader(new InputStreamReader(is, "utf-8"))) {
            for(String line; (line = br.readLine()) != null; ) {
                Map map = (Map) ObjectBuilder.getVal(new JSONParser(line));
                Map properties = (Map) map.get("properties");
                String name = (String) properties.get("Name");
                String description = (String) properties.get("description");
                Map geometry = (Map) map.get("geometry");
                String type = (String) geometry.get("type");
                ArrayList coordinates = (ArrayList) geometry.get("coordinates");
                Placemark placemark = TestFactory.eINSTANCE.createPlacemark();
                placemark.setName(name);
                System.out.println(placemark.getName());
                placemark.setDescription(description);
                System.out.println(placemark.getName());
                OPoint point = TestFactory.eINSTANCE.createOPoint();
                point.getCoordinates().addAll(coordinates);
                placemark.setPoint(point);
                server.inTransaction(session -> {
                    ResourceSet rs = session.createResourceSet();
                    Resource resource = rs.createResource(server.createURI());
                    resource.getContents().add(placemark);
                    resource.save(null);
                });
            }
        }
        server.createDatabaseDocument().execute("sql",
                "CREATE INDEX test_Placemark.point ON test_Placemark(point) SPATIAL ENGINE LUCENE").close();
    }
}
