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

import java.io.*;
import java.util.ArrayList;
import java.util.Map;

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

//    @Test
    public void testLoadCountries() throws Exception {
        InputStream is;
        try {
            is = new FileInputStream("C:/Users/arch7/Downloads/gadm36_levels_shp/gadm36_0.json");
        }
        catch (Throwable e) {
            return;
        }
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
    }
}
