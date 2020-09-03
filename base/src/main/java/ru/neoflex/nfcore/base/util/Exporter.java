package ru.neoflex.nfcore.base.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceFactoryImpl;
import ru.neoflex.nfcore.base.services.Authorization;
import ru.neoflex.nfcore.base.services.Store;

import java.io.*;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class Exporter {
    private final static Log logger = LogFactory.getLog(Exporter.class);
    public static final String EXTERNAL_REFERENCES = "externalReferences";
    public static final String REF_OBJECT = "refObject";
    public static final String FEATURES = "features";
    public static final String FRAGMENT = "fragment";
    public static final String INDEX = "index";
    public static final String NAME = "name";
    public static final String XMI = ".xmi";
    public static final String REFS = ".refs";
    public static final String GROOVY = ".groovy";

    Store store;
    public Exporter(Store store) {
        this.store = store;
    }

    public ObjectNode objectToTree(EObject eObject) {
        ObjectNode objectNode = new ObjectMapper().createObjectNode();
        EObject rootContainer = EcoreUtil.getRootContainer(eObject);
        String fragment = EcoreUtil.getRelativeURIFragmentPath(rootContainer, eObject);
        objectNode.put("eClass", eClass2String(rootContainer.eClass()));
        EStructuralFeature nameAttribute = Store.qualifiedNameDelegate.apply(rootContainer.eClass());
        if (nameAttribute == null) {
            throw new IllegalArgumentException("Qualified name not found in " + eClass2String(rootContainer.eClass()));
        }
        objectNode.put(NAME, (String) rootContainer.eGet(nameAttribute));
        objectNode.put(FRAGMENT, fragment);
        return objectNode;
    }

    public byte[] exportExternalRefs(EObject eObject) throws JsonProcessingException {
        ObjectNode objectNode = objectToTree(eObject);
        ArrayNode externalReferences = objectNode.withArray(EXTERNAL_REFERENCES);
        Map<EObject, Collection<EStructuralFeature.Setting>> crs = EcoreUtil.ExternalCrossReferencer.find(Collections.singleton(eObject));
        if (crs.size() == 0) {
            return null;
        }
        for (EObject refObject: crs.keySet()) {
            ObjectNode externalReference = externalReferences.addObject();
            externalReference.set(REF_OBJECT, objectToTree(refObject));
            ArrayNode features = externalReference.putArray(FEATURES);
            for (EStructuralFeature.Setting setting: crs.get(refObject)) {
                ObjectNode feature = features.addObject();
                feature.put(NAME, setting.getEStructuralFeature().getName());
                EObject child = setting.getEObject();
                String fragment = EcoreUtil.getRelativeURIFragmentPath(eObject, child);
                feature.put(FRAGMENT, fragment);
                EStructuralFeature sf = setting.getEStructuralFeature();
                int index = -1;
                if (sf.isMany()) {
                    EList eList = (EList) child.eGet(sf);
                    index = eList.indexOf(refObject);
                }
                feature.put(INDEX, index);

            }
        }
        return new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsBytes(objectNode);
    }

    public byte[] exportEObjectWithoutExternalRefs(EObject eObject) throws IOException {
        ResourceSet resourceSet = new ResourceSetImpl();
        resourceSet.getResourceFactoryRegistry().getExtensionToFactoryMap()
                .put(Resource.Factory.Registry.DEFAULT_EXTENSION, new XMIResourceFactoryImpl());
        Resource resource = resourceSet.createResource(eObject.eResource().getURI());
        EObject copyObject = EcoreUtil.copy(eObject);
        resource.getContents().add(copyObject);
        unsetExternalReferences(copyObject);
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        resource.save(os, null);
        return os.toByteArray();
    }

    public void unsetExternalReferences(EObject eObject) {
        Map<EObject, Collection<EStructuralFeature.Setting>> crs = EcoreUtil.ExternalCrossReferencer.find(Collections.singleton(eObject));
        for (EObject refObject: crs.keySet()) {
            for (EStructuralFeature.Setting setting: crs.get(refObject)) {
                EStructuralFeature sf = setting.getEStructuralFeature();
                if (!sf.isMany()) {
                    setting.unset();
                }
                else {
                    EObject owner = setting.getEObject();
                    EList eList = (EList) owner.eGet(sf);
                    eList.remove(refObject);
                }
            }
        }
    }


    public EObject treeToObject(JsonNode objectNode) throws IOException {
        String uri = objectNode.get("eClass").textValue();
        String name = objectNode.get(NAME).textValue();
        if (name == null || name.length() == 0) {
            throw new IOException("Object " + uri + " with empty name not found");
        }
        EClass eClass = string2EClass(uri);
        EStructuralFeature nameAttribute = Store.qualifiedNameDelegate.apply(eClass);
        if (nameAttribute == null) {
            throw new IllegalArgumentException("Qualified name not found in " + eClass2String(eClass));
        }
        ResourceSet resourceSet = DocFinder.create(store, eClass, new HashMap<String, String>(){{put(nameAttribute.getName(), name);}})
                .execute().getResourceSet();
        if (resourceSet.getResources().size() != 1) {
            throw new IOException("Object " + uri + "[" + name + "] not found or not unique");
        }
        EObject eObject = resourceSet.getResources().get(0).getContents().get(0);
        String fragment = objectNode.get(FRAGMENT).textValue();
        return fragment == null || fragment.length() == 0 ? eObject : EcoreUtil.getEObject(eObject, fragment);
    }


    public void exportEObject(EObject eObject, Path path) throws IOException {
        EClass eClass = eObject.eClass();
        EPackage ePackage = eClass.getEPackage();
        EStructuralFeature nameAttribute = Store.qualifiedNameDelegate.apply(eClass);
        if (nameAttribute != null) {
            String name = (String) eObject.eGet(nameAttribute);
            if (name != null && name.length() > 0) {
                byte[] bytes = exportEObjectWithoutExternalRefs(eObject);
                String fileName = ePackage.getName() + "_" + eClass.getName() + "_" + name;
                Path filePath = path.resolve(fileName + XMI);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, bytes);
                byte[] refsBytes = exportExternalRefs(eObject);
                if (refsBytes != null) {
                    Path refsPath = path.resolve(fileName + REFS);
                    Files.createDirectories(refsPath.getParent());
                    Files.write(refsPath, refsBytes);
                }
            }
        }
    }

    public void exportResourceSet(ResourceSet resourceSet, Path path) throws IOException {
        for (Resource resource: resourceSet.getResources()) {
            for (EObject eObject: resource.getContents()) {
                exportEObject(eObject, path);
            }
        }
    }

    public void zip(ResourceSet resourceSet, OutputStream outputStream) throws IOException {
        List<Resource> resources = resourceSet.getResources();
        zip(resources, outputStream);
    }

    public void zip(List<Resource> resources, OutputStream outputStream) throws IOException {
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream);) {
            zip(resources, zipOutputStream);
        }
    }

    public void zip(List<Resource> resources, ZipOutputStream zipOutputStream) throws IOException {
        for (Resource resource : resources) {
            zipResource(zipOutputStream, resource);
        }
        for (Resource resource : resources) {
            zipResourceReferences(zipOutputStream, resource);
        }
    }

    public void zipAll(OutputStream outputStream) throws Exception {
        store.inTransaction(true, tx -> {
            List<Resource> all = DocFinder.create(store).getAllResources();
            try (ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream);) {
                zip(all, zipOutputStream);
            }
            return null;
        });
    }

    public void zipResourceReferences(ZipOutputStream zipOutputStream, Resource resource) throws IOException {
        for (EObject eObject: resource.getContents()) {
            if (isInternal(eObject)) {
                continue;
            }
            EClass eClass = eObject.eClass();
            EPackage ePackage = eClass.getEPackage();
            EStructuralFeature nameAttribute = Store.qualifiedNameDelegate.apply(eClass);
            if (nameAttribute != null) {
                String name = (String) eObject.eGet(nameAttribute);
                if (name != null && name.length() > 0) {
                    String fileName = ePackage.getName() + "_" + eClass.getName() + "_" + name;
                    byte[] refsBytes = exportExternalRefs(eObject);
                    if (refsBytes != null) {
                        logger.info("Export " + fileName + REFS);
                        ZipEntry refsEntry = new ZipEntry(fileName + REFS);
                        zipOutputStream.putNextEntry(refsEntry);
                        zipOutputStream.write(refsBytes);
                        zipOutputStream.closeEntry();
                    }
                }
            }
        }
    }

    public static boolean isInternal(EObject eObject) {
        return eObject.eClass().getEAnnotations().stream()
                .filter(eAnnotation -> "ru.neoflex.nfcore".equals(eAnnotation.getSource()))
                .flatMap(eAnnotation -> eAnnotation.getDetails().stream())
                .anyMatch(entry -> "internal".equalsIgnoreCase(entry.getKey()) && "true".equalsIgnoreCase(entry.getValue()));
    }

    public void zipResource(ZipOutputStream zipOutputStream, Resource resource) throws IOException {
        for (EObject eObject: resource.getContents()) {
            if (isInternal(eObject)) {
                continue;
            }
            EClass eClass = eObject.eClass();
            EPackage ePackage = eClass.getEPackage();
            EStructuralFeature nameAttribute = Store.qualifiedNameDelegate.apply(eClass);
            if (nameAttribute != null) {
                String name = (String) eObject.eGet(nameAttribute);
                if (name != null && name.length() > 0) {
                    String fileName = ePackage.getName() + "_" + eClass.getName() + "_" + name;
                    logger.info("Export " + fileName + XMI);
                    byte[] bytes = exportEObjectWithoutExternalRefs(eObject);
                    ZipEntry zipEntry = new ZipEntry(fileName + XMI);
                    zipOutputStream.putNextEntry(zipEntry);
                    zipOutputStream.write(bytes);
                    zipOutputStream.closeEntry();
                }
            }
        }
    }

    public int unzip(InputStream inputStream) throws Exception {
        int entityCount = 0;
        try (ZipInputStream zipInputStream = new ZipInputStream(inputStream);) {
            ZipEntry zipEntry = zipInputStream.getNextEntry();
            while (zipEntry != null) {
                if (!zipEntry.isDirectory()) {
                    String entryName = zipEntry.getName();
                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    byte[] buffer = new byte[4096];
                    int length;
                    while ((length = zipInputStream.read(buffer)) > 0) {
                        outputStream.write(buffer, 0, length);
                    }
                    if (zipEntry.getName().endsWith(XMI)) {
                        logger.info("Import " + zipEntry.getName());
                        store.inTransaction(false, tx -> {
                            importEObject(outputStream.toByteArray());
                            tx.commit("Import database: " + entryName, Authorization.getUserName(), "");
                        });
                        ++entityCount;
                    }
                    else if (zipEntry.getName().endsWith(REFS)) {
                        logger.info("Import " + zipEntry.getName());
                        store.inTransaction(false, tx -> {
                            importExternalRefs(outputStream.toByteArray());
                            tx.commit("Import database: " + entryName, Authorization.getUserName(), "");
                        });
                    }
                }
                zipEntry = zipInputStream.getNextEntry();
            }
        }
        return entityCount;
    }

    public void processZipXmi(Path zipFile) {
        processZipFile(zipFile, XMI, (path, bytes) -> {
            try {
                importEObject(bytes);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            return null;
        });
    }

    public void processZipRefs(Path zipFile) {
        processZipFile(zipFile, REFS, (path, bytes) -> {
            try {
                importExternalRefs(bytes);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            return null;
        });
    }

    public void processZipGroovy(Path zipFile) {
        processZipFile(zipFile, GROOVY, (path, bytes) -> {

//            try {
//            } catch (IOException e) {
//                throw new RuntimeException(e);
//            }
            return null;
        });
    }

    public void processZipFile(Path zipFile, String ext, BiFunction<Path, byte[], Void> processor) {
        processZipFile(zipFile, path -> path.getFileName().toString().toLowerCase().endsWith(ext), processor);
    }

    public void processZipFile(Path zipFile, Function<Path, Boolean> predicate, BiFunction<Path, byte[], Void> processor) {
        Map<String, Object> env = new HashMap<>();
        env.put("useTempFile", Boolean.TRUE);
        java.net.URI uri = java.net.URI.create("jar:" + zipFile.toUri());
        try (FileSystem fileSystem = FileSystems.newFileSystem(uri, env);) {
            for (Path root: fileSystem.getRootDirectories()) {
                Files.walk(root).filter(Files::isRegularFile).filter(file -> predicate.apply(file)).forEach(path -> {
                    try {
                        byte[] content = Files.readAllBytes(path);
                        processor.apply(path, content);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void exportAll(Path path) throws Exception {
        store.inTransaction(true, tx -> {
            List<Resource> all =  DocFinder.create(store).getAllResources();
            for (Resource resource: all) {
                for (EObject eObject: resource.getContents()) {
                    exportEObject(eObject, path);
                }
            }
            return null;
        });
    }

    public EObject importEObject(byte[] image) throws IOException {
        ResourceSet resourceSet = new ResourceSetImpl();
        resourceSet.getResourceFactoryRegistry().getExtensionToFactoryMap()
                .put(Resource.Factory.Registry.DEFAULT_EXTENSION, new XMIResourceFactoryImpl());
        Resource resourceIn = resourceSet.createResource(URI.createURI("temp" + XMI));
        resourceIn.load(new ByteArrayInputStream(image), null);
        EObject eObject = resourceIn.getContents().get(0);
        Resource resource = store.createEmptyResource();
        resource.getContents().add(eObject);
        EClass eClass = eObject.eClass();
        EStructuralFeature nameFeature = Store.qualifiedNameDelegate.apply(eClass);
        if (nameFeature == null) {
            throw new IllegalArgumentException("Qualified name not found in " + eClass2String(eClass));
        }
        String name = (String) eObject.eGet(nameFeature);
        ResourceSet existentRS = DocFinder.create(store, eClass, new HashMap<String, String>() {{put(nameFeature.getName(), name);}})
                .execute().getResourceSet();
        if (existentRS.getResources().size() > 0) {
            Resource r = existentRS.getResources().get(0);
            resource.setURI(r.getURI());
        }
        resource.save(null);
        return eObject;
    }

    private static class Setting {
        EObject referenceeObject;
        EReference eReference;
        EObject refObject;
        int index;
    };
    public EObject importExternalRefs(byte[] refs) throws IOException {
        ObjectNode objectNode = (ObjectNode) new ObjectMapper().readTree(refs);
        EObject eObject = treeToObject(objectNode);
        unsetExternalReferences(eObject);
        List<Setting> settings = new ArrayList<>();
        ArrayNode externalReferences = objectNode.withArray(EXTERNAL_REFERENCES);
        for (JsonNode externalReference: externalReferences) {
            EObject refObject = treeToObject(externalReference.get(REF_OBJECT));
            for (JsonNode feature: externalReference.withArray(FEATURES)) {
                Setting setting = new Setting();
                setting.refObject = refObject;
                String fragment = feature.get(FRAGMENT).textValue();
                setting.referenceeObject = fragment == null || fragment.length() == 0 ? eObject : EcoreUtil.getEObject(eObject, fragment);
                String name = feature.get(NAME).textValue();
                setting.eReference = (EReference) setting.referenceeObject.eClass().getEStructuralFeature(name);
                if (setting.eReference == null || setting.eReference.isContainment()) {
                    logger.warn("Non-contained EReference '" + feature + "' not found in class " + EcoreUtil.getURI(setting.referenceeObject.eClass()));
                    continue;
                }
                JsonNode indexNode = feature.get(INDEX);
                setting.index = indexNode == null ? -1 : objectNode.asInt(-1);
                settings.add(setting);
            }
        }
        settings.sort(Comparator.comparing(s->s.index));
        for (Setting setting: settings) {
            if (setting.eReference.isMany()) {
                EList eList = (EList) setting.referenceeObject.eGet(setting.eReference);
                eList.add(setting.index >= 0 ? setting.index : eList.size(), setting.refObject);
            }
            else {
                setting.referenceeObject.eSet(setting.eReference, setting.refObject);
            }
        }
        eObject.eResource().save(null);
        return eObject;
    }

    public String eClass2String(EClass eClass) {
        return EcoreUtil.getURI(eClass).toString();
    }

    public EClass string2EClass(String uri) throws IOException {
        return (EClass) store.createResourceSet().getEObject(URI.createURI(uri), false);
    }
}
