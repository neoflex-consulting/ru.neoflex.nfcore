package ru.neoflex.nfcore.masterdata.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.id.ORID;
import com.orientechnologies.orient.core.record.OElement;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MasterdataExporter {
    private final static Pattern ridPattern = Pattern.compile("^#([0-9]+):([0-9]+)$");
    private final static Log logger = LogFactory.getLog(MasterdataExporter.class);
    MasterdataProvider provider;

    MasterdataExporter(MasterdataProvider provider) {
        this.provider = provider;
    }

    public void export(String sql, Consumer<String> consumer) {
        provider.withDatabase(db -> {
            export(db, sql, consumer);
            return null;
        });
    }

    public void export(ODatabaseDocument db, String sql, Consumer<String> consumer) {
        Set<ORID> oridSet = new HashSet<>();
        try (OResultSet rs = db.query(sql, new HashMap())) {
            while (rs.hasNext()) {
                OResult oResult = rs.next();
                oResult.getElement().ifPresent(oElement -> {
                    export(db, oridSet, oElement, consumer);
                });
            }
        }
    }

    public void export(ODatabaseDocument db, Set<ORID> oridSet, OElement oElement, Consumer<String> consumer) {
        ORID orid = oElement.getIdentity();
        if (orid != null) {
            if (oridSet.contains(oElement.getIdentity())) {
                return;
            }
            oridSet.add(oElement.getIdentity());
        }
        for(String name: oElement.getPropertyNames()) {
            exportRefs(db, oridSet, oElement.getProperty(name), consumer);
        }
        if (orid != null) {
            String json = oElement.toJSON();
            logger.info(json);
            consumer.accept(json);
        }
    }

    private void exportRefs(ODatabaseDocument db, Set<ORID> oridSet, Object value, Consumer<String> consumer) {
        if (value instanceof List) {
            for (Object element: (List)value) {
                exportRefs(db, oridSet, element, consumer);
            }
        }
        else if (value instanceof Map) {
            for (Object element: ((Map) value).keySet()) {
                exportRefs(db, oridSet, element, consumer);
            }
        }
        else if (value instanceof ODocument) {
            ODocument oDocument = (ODocument) value;
            export(db, oridSet, oDocument, consumer);
        }
        else if (value instanceof OElement) {
            OElement oElement = (OElement) value;
            for(String name: oElement.getPropertyNames()) {
                exportRefs(db, oridSet, oElement.getProperty(name), consumer);
            }
        }
        else if (value instanceof ORID) {
            ODocument oDocument = db.load((ORID) value);
            export(db, oridSet, oDocument, consumer);
        }
    }

    public void import_(ODatabaseDocument db, Map<String, String> oridMap, Supplier<String> supplier) {
        ObjectMapper mapper = new ObjectMapper();
        while (true) {
            String json = supplier.get();
            if (json == null) {
                break;
            }
            try {
                ObjectNode objectNode = (ObjectNode) mapper.readTree(json);
                replaceOridsInNode(oridMap, objectNode);
                String oldOrid = objectNode.get("@rid").asText();
                if (oridMap.containsKey(oldOrid)) {
                    continue; // already imported
                }
                objectNode.remove("@rid");
                String newOrid = findODocumentByIndexes(db, objectNode);
                if (newOrid != null) {
                    provider.update(db, objectNode);
                }
                else {
                    newOrid = provider.insert(db, objectNode).getRid();
                }
                oridMap.put(oldOrid, newOrid);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private String findODocumentByIndexes(ODatabaseDocument db, ObjectNode objectNode) {
        return null;
    }

    private void replaceOridsInNode(Map<String, String> oridMap, JsonNode value) {
        if (value.isArray()) {
            ArrayNode arrayNode = (ArrayNode) value;
            for (int i = 0; i < arrayNode.size(); ++i) {
                JsonNode element = arrayNode.get(i);
                int index = i;
                replaceOrid(oridMap, element, node -> arrayNode.set(index, node));
            }
        }
        else if (value.isObject()) {
            ObjectNode objectNode = (ObjectNode) value;
            Iterator<Map.Entry<String, JsonNode>> fields = objectNode.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                JsonNode node = entry.getValue();
                replaceOrid(oridMap, node, textNode -> objectNode.set(entry.getKey(), textNode));
            }
        }
    }

    private void replaceOrid(Map<String, String> oridMap, JsonNode element, Consumer<JsonNode> consumer) {
        if (element.isTextual()) {
            String oldOrid = element.asText("");
            Matcher matcher = ridPattern.matcher(oldOrid);
            if (matcher.matches()) {
                String newOrid = oridMap.get(oldOrid);
                if (newOrid == null) {
                    logger.warn(String.format("New orid for %s not found", oldOrid));
                }
                else {
                    consumer.accept(new TextNode(newOrid));
                }
                return;
            }
        }
        replaceOridsInNode(oridMap, element);
    }
}
