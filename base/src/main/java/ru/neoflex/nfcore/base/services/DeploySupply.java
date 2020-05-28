package ru.neoflex.nfcore.base.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.ecore.resource.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.supply.Supply;
import ru.neoflex.nfcore.base.supply.SupplyFactory;
import ru.neoflex.nfcore.base.supply.SupplyPackage;
import ru.neoflex.nfcore.base.util.DocFinder;
import ru.neoflex.nfcore.base.util.Exporter;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

@Service
public class DeploySupply {
    private final static Log logger = LogFactory.getLog(DeploySupply.class);
    private Thread supply;
    public static final String XMI = ".xmi";
    public static final String REFS = ".refs";

    @Autowired
    Store store;
    @Autowired
    Context context;
    @Value("${deploy.application:${user.dir}/deploy}")
    private
    String deployBase;

    @PostConstruct
    void init() throws Exception {
        context.transact("DeploySupply", () -> {
        File directory = new File(deployBase);
        if (directory.exists()) {
            for (File lib : directory.listFiles()) {
                List<Resource> resources = getResources(lib);
                if (resources.isEmpty()) {
                    Path path = Paths.get(lib.getAbsolutePath());
                    new Exporter(store).unzip(path, XMI);
                    logger.info("File " + lib.getName() + " successfully deployed (XMI)");
                }
            }
            for (File lib : directory.listFiles()) {
                List<Resource> resources = getResources(lib);
                if (resources.isEmpty()) {
                    Path path = Paths.get(lib.getAbsolutePath());
                    new Exporter(store).unzip(path, REFS);
                    logger.info("File " + lib.getName() + " successfully deployed (REFS)");
                }
            }
            for (File lib : directory.listFiles()) {
                List<Resource> resources = getResources(lib);
                if (resources.isEmpty()) {
                    Supply supply = SupplyFactory.eINSTANCE.createSupply();
                    supply.setName(lib.getName());
                    supply.setDate(new Timestamp((new Date()).getTime()));
                    store.createEObject(supply);
                    logger.info("Supply " + lib.getName() + " successfully created");
                }
            }
        } else {
            directory.mkdir();
        }
        return null;
        });
    }

    private List<Resource> getResources(File lib) throws IOException {
        DocFinder docFinder = DocFinder.create(
                store,
                SupplyPackage.Literals.SUPPLY,
                new HashMap<String, String>() {{put("name", lib.getName());}});
        return docFinder.execute().getResources();
    }

    @PostConstruct
    void scheduledSupply() throws Exception {
        supply = new Thread(() -> {
            try {
                WatchService watchService = FileSystems.getDefault().newWatchService();
                Path path = Paths.get(deployBase);

                path.register(
                        watchService,
                        StandardWatchEventKinds.ENTRY_CREATE,
                        StandardWatchEventKinds.ENTRY_DELETE,
                        StandardWatchEventKinds.ENTRY_MODIFY);

                WatchKey key;
                while ((key = watchService.take()) != null) {
                    for (WatchEvent<?> event : key.pollEvents()) {
                if (event.kind() == StandardWatchEventKinds.ENTRY_CREATE) {
                    logger.info("Event kind:" + event.kind()
                            + ". File affected: " + event.context() + ".");
                    this.init();
                }
                    }
                    key.reset();
                }
            } catch (Exception e) {}
        });
        supply.start();
    }

    @PreDestroy
    void fini() throws Exception {
        supply.interrupt();
    }

    public String getDeployBase() {
        return deployBase;
    }
}
