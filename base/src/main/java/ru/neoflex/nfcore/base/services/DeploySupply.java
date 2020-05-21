package ru.neoflex.nfcore.base.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.ecore.resource.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.neoflex.nfcore.base.supply.Supply;
import ru.neoflex.nfcore.base.supply.SupplyFactory;
import ru.neoflex.nfcore.base.supply.SupplyPackage;
import ru.neoflex.nfcore.base.util.DocFinder;
import ru.neoflex.nfcore.base.util.Exporter;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

@Service
@EnableScheduling
public class DeploySupply {
    private final static Log logger = LogFactory.getLog(DeploySupply.class);
    @Autowired
    Store store;
    @Autowired
    Context context;

    @PostConstruct
    void init() throws Exception {
        context.transact("DeploySupply", () -> {

        File directory = new File(new File("").getAbsolutePath() + "\\deploy");
        if (directory.exists()) {
            for (File lib : directory.listFiles()) {
                DocFinder docFinder = DocFinder.create(
                        store,
                        SupplyPackage.Literals.SUPPLY,
                        new HashMap<String, String>() {{put("name", lib.getName());}});
                List<Resource> resources = docFinder.execute().getResources();
                if (resources.isEmpty()) {
                    byte[] content = null;
                    try {
                        Path path = Paths.get(lib.getAbsolutePath());
                        content = Files.readAllBytes(path);
                    } catch (final IOException e) {}

                    MultipartFile file = new MockMultipartFile(lib.getName(), lib.getName(), "text/plain", content);
                    new Exporter(store).unzip(file.getInputStream());
                    logger.info("File named " + lib.getName() + " successfully deployed");

                    Supply supply = SupplyFactory.eINSTANCE.createSupply();
                    supply.setName(lib.getName());
                    supply.setDate(new Timestamp((new Date()).getTime()));
                    store.createEObject(supply);
                }
            }
        } else {
            directory.mkdir();
        }
        return null;
        });
    };

    @Scheduled(initialDelay = 900000, fixedRate = 900000)
    void ScheduledSupply() throws Exception {
        this.init();
    }
}
