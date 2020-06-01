package ru.neoflex.nfcore.base.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.supply.Supply;
import ru.neoflex.nfcore.base.supply.SupplyFactory;
import ru.neoflex.nfcore.base.supply.SupplyPackage;
import ru.neoflex.nfcore.base.util.DocFinder;
import ru.neoflex.nfcore.base.util.Exporter;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.IOException;
import java.nio.file.*;
import java.sql.Timestamp;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import static ru.neoflex.nfcore.base.util.Exporter.GROOVY;

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
        try {
            context.transact("DeploySupply", () -> {
                Path deployPath = Paths.get(deployBase);
                Files.createDirectories(deployPath);
                List<Path> paths = Files.walk(deployPath)
                        .filter(Files::isRegularFile)
                        .filter(path->path.getFileName().toString().toLowerCase().endsWith(".zip"))
                        .filter(path->{
                            DocFinder docFinder = DocFinder.create(
                                    store,
                                    SupplyPackage.Literals.SUPPLY,
                                    new HashMap<String, String>() {{
                                        put("name", path.getFileName().toString());
                                    }});
                            try {
                                return docFinder.execute().getResources().size() == 0;
                            } catch (IOException e) {
                                return false;
                            }
                        }).collect(Collectors.toList());
                paths.sort(Comparator.comparing(o -> o.getFileName().toString()));
                for (Path path: paths) {
                    new Exporter(store).processZipXmi(path);
                    logger.info("File " + path.getFileName().toString() + " successfully deployed (XMI)");
                }
                for (Path path: paths) {
                    new Exporter(store).processZipRefs(path);
                    logger.info("File " + path.getFileName().toString() + " successfully deployed (REFS)");
                }
                for (Path path: paths) {
                    new Exporter(store).processZipFile(path, GROOVY, (p, bytes) -> {
                        if (!p.getFileName().toString().equals("post_install.groovy")) {
                            Path to = Transaction.getCurrent().getFileSystem().getRootPath().resolve(p.toString());
                            try {
                                Files.write(to, bytes);
                            } catch (IOException e) {
                                throw new RuntimeException(e);
                            }
                        }
                        return null;
                    });
                    logger.info("File " + path.getFileName().toString() + " successfully deployed (GROOVY)");
                }
                for (Path path: paths) {
                    new Exporter(store).processZipFile(path, (p) -> p.getFileName().toString().equals("post_install.groovy"), (p, bytes) -> {
                        try {
                            String code = new String(bytes, "utf-8");
                            context.getGroovy().eval(code, new HashMap<>());
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                        return null;
                    });
                    logger.info("File " + path.getFileName().toString() + " successfully evaluated (post_install.groovy)");
                }
                for (Path path: paths) {
                    Supply supply = SupplyFactory.eINSTANCE.createSupply();
                    supply.setName(path.getFileName().toString());
                    supply.setDate(new Timestamp((new Date()).getTime()));
                    store.createEObject(supply);
                    logger.info("Supply " + path.getFileName().toString() + " successfully created");
                }
                return null;
            });
        }
        catch (Throwable e) {
            logger.error("", e);
        }
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
            } catch (Exception e) {
            }
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
