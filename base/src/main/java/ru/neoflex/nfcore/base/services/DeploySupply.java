package ru.neoflex.nfcore.base.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.ecore.EObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.neoflex.nfcore.base.services.providers.FinderSPI;
import ru.neoflex.nfcore.base.supply.Supply;
import ru.neoflex.nfcore.base.supply.SupplyFactory;
import ru.neoflex.nfcore.base.supply.SupplyPackage;
import ru.neoflex.nfcore.base.util.DocFinder;
import ru.neoflex.nfcore.base.util.Exporter;
import org.eclipse.emf.ecore.resource.ResourceSet;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class DeploySupply {
    private final static Log logger = LogFactory.getLog(DeploySupply.class);
    @Autowired
    Store store;

    FinderSPI provider;

    @PostConstruct
    void init() throws Exception {
        File directory = new File(new File("").getAbsolutePath() + "\\deploy");
        directory.mkdirs();
        for (File lib : directory.listFiles()) {


            Map<String, String> attr = new HashMap<String, String>()
            {
                {
                    put("name", lib.getName().split(".zip")[0]);
                }
            };
//            Object existsFile1 = DocFinder.create(store, SupplyPackage.Literals.SUPPLY, attr).selector().size();
//            Object existsFile2 = DocFinder.create(store, SupplyPackage.Literals.SUPPLY, attr).selector().findValue("name").equals(lib.getName().split(".zip")[0]);
//            Object existsFile3 = DocFinder.create(store, SupplyPackage.Literals.SUPPLY, attr).selector().findValue("name");

//            if (1 != 1) {
//                byte[] content = null;
//                try {
//                    Path path = Paths.get(lib.getAbsolutePath());
//                    content = Files.readAllBytes(path);
//                } catch (final IOException e) {}
//
//                MultipartFile file = new MockMultipartFile(lib.getName(), lib.getName(), "text/plain", content);
//                new Exporter(store).unzip(file.getInputStream());
//                logger.info("File named " + lib.getName() + " successfully deployed");
//
//                Supply supply = SupplyFactory.eINSTANCE.createSupply();
//                supply.setName(lib.getName());
//                supply.setDate(new Timestamp((new Date()).getTime()));
//                store.createEObject(supply);
//            } else {
//                logger.info("File named " + lib.getName() + " has already been deployed");
//            }
        }
    }
}
