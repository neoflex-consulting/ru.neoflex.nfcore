package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.junit.Assert;
import org.junit.Test;
import org.junit.Before;
import org.junit.runner.RunWith;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class GitdbApplicationTests extends TestBase {
    public static final String GITDB = "gitdbtest";
    Database database;
    ObjectMapper mapper = new ObjectMapper();

    @Before
    public void startUp() throws IOException, GitAPIException {
        deleteDirectory(new File(GITDB));
        database = new Database(GITDB);
        database.createIndex(new Index() {
            @Override
            public String getName() {
                return "type_name";
            }

            @Override
            public List<IndexEntry> getEntries(Entity entity, Transaction transaction) throws IOException {
                IndexEntry entry = new IndexEntry();
                ObjectNode node = (ObjectNode) mapper.readTree(entity.getContent());
                entry.setPath(new String[]{node.get("type").asText(), node.get("name").asText()});
                entry.setContent(entity.getId().getBytes("utf-8"));
                return new ArrayList<IndexEntry>(){{add(entry);}};
            }
        });
        database.createIndex(new Index() {
            @Override
            public String getName() {
                return "input_links";
            }

            @Override
            public List<IndexEntry> getEntries(Entity entity, Transaction transaction) throws IOException {
                ArrayList<IndexEntry> indexes = new ArrayList<>();
                ObjectNode node = (ObjectNode) mapper.readTree(entity.getContent());
                for (JsonNode linkNode: node.get("links")) {
                    String link = linkNode.asText();
                    IndexEntry entry = new IndexEntry();
                    entry.setPath(new String[]{link.substring(0, 2), link.substring(2), entity.getId()});
                    entry.setContent(new byte[0]);
                    indexes.add(entry);
                }
                return indexes;
            }
        });
    }

    public ObjectNode createObject(String type, String name) {
        ObjectNode node = mapper.createObjectNode().put("type", type).put("name", name);
        node.putArray("links");
        return node;
    }

    @Test
    public void createSimpleObject() throws IOException, GitAPIException {
        ObjectNode user;
        Entity userEntity;
        ObjectNode group;
        Entity groupEntity;
        try (Transaction tx = database.createTransaction("master")) {
            group = createObject("Group", "masters");
            groupEntity = new Entity(null, null, mapper.writeValueAsBytes(group));
            tx.create(groupEntity);
            user = createObject("User", "Orlov");
            ((ArrayNode) user.get("links")).add(groupEntity.getId());
            userEntity = new Entity(null, null, mapper.writeValueAsBytes(user));
            tx.create(userEntity);
            Assert.assertNotNull(userEntity.getId());
            Assert.assertNotNull(userEntity.getRev());
            tx.commit("User Orlov and group masters created", "orlov", "");
        }
        try (Transaction tx = database.createTransaction("master")) {
            for (IndexEntry entry : tx.findByIndex("type_name", "User")) {
                Assert.assertEquals(userEntity.getId(), new String(entry.getContent(), "utf-8"));
            }
            for (IndexEntry entry : tx.findByIndex("input_links", groupEntity.getId().substring(0, 2), groupEntity.getId().substring(2))) {
                Assert.assertEquals(userEntity.getId(), entry.getPath()[2]);
            }
            for (EntityId entityId : tx.all()) {
                Entity entity = tx.load(entityId);
                ObjectNode node = (ObjectNode) mapper.readTree(entity.getContent());
                if (node.get("type").asText().equals("User")) {
                    Assert.assertEquals(userEntity.getRev(), entity.getRev());
                } else if (node.get("type").asText().equals("Group")) {
                    Assert.assertEquals(groupEntity.getRev(), entity.getRev());
                }
            }
        }
        database.createBranch("rel.1.0", "master");
        try (Transaction tx = database.createTransaction("rel.1.0")) {
            String id = userEntity.getId();
            String rev = userEntity.getRev();
            user.put("name", "Simanihin");
            userEntity.setContent(mapper.writeValueAsBytes(user));
            tx.update(userEntity);
            Assert.assertEquals(userEntity.getId(), id);
            Assert.assertNotEquals(userEntity.getRev(), rev);
            tx.commit("User Orlov was renamed to Simanihin", "orlov", "");
        }
        try (Transaction tx = database.createTransaction("master")) {
            for (IndexEntry entry : tx.findByIndex("type_name", "User")) {
                EntityId entityId = new EntityId(new String(entry.getContent(), "utf-8"), null);
                Entity entity = tx.load(entityId);
                ObjectNode node = (ObjectNode) mapper.readTree(entity.getContent());
                Assert.assertEquals(node.get("name").asText(), "Orlov");
            }
        }
        try (Transaction tx = database.createTransaction("rel.1.0")) {
            for (IndexEntry entry : tx.findByIndex("type_name", "User")) {
                EntityId entityId = new EntityId(new String(entry.getContent(), "utf-8"), null);
                Entity entity = tx.load(entityId);
                ObjectNode node = (ObjectNode) mapper.readTree(entity.getContent());
                Assert.assertEquals(node.get("name").asText(), "Simanihin");
            }
        }
        try (Transaction tx = database.createTransaction("master")) {
            Assert.assertEquals(1, tx.findByIndex("input_links", groupEntity.getIdPath()).size());
            userEntity = tx.load(userEntity);
            tx.delete(userEntity);
            tx.commit("User Orlov deleted", "orlov", "");
        }
        try (Transaction tx = database.createTransaction("master")) {
            Assert.assertEquals(0, tx.findByIndex("input_links", groupEntity.getIdPath()).size());
        }
    }
}
