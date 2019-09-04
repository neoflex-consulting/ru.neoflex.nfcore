package org.emfjson.couchdb.streams;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.URIConverter.Saveable;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.emfjson.couchdb.CouchHandler;
import org.emfjson.couchdb.client.CouchClient;
import org.emfjson.couchdb.client.CouchDocument;
import org.emfjson.couchdb.client.DB;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.resource.JsonResource;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

public class CouchOutputStream extends ByteArrayOutputStream implements Saveable {

	private final URI uri;
	private final Map<?, ?> options;
	private final CouchClient client;
	private final ObjectMapper mapper;

	public CouchOutputStream(CouchClient client, URI uri, Map<?, ?> options, ObjectMapper mapper) {
		this.client = client;
		this.uri = uri;
		this.options = options;
		this.mapper = mapper;
	}

	@Override
	public void saveResource(Resource resource) throws IOException {
		final String dbName = uri.segment(0);
		final String docName = uri.segment(1);
		final DB db = client.db(dbName);

		if (!db.exist()) {
			db.create();
		}

		if (docName == null) {
			throw new IOException("Cannot save undefined document");
		}

		final CouchDocument doc = db.doc(docName);
		final JsonNode status;
		if (docName.isEmpty()) {
			status = doc.createNew(toJson(resource));
		}
		else {
			status = doc.create(toJson(resource));
		}
		CouchHandler.checkStatus(status);
		if (status.has("ok") && status.get("ok").asBoolean()) {
			String id = status.get("id").asText();
			String rev = status.get("rev").asText();
			URI newURI = resource.getURI().trimFragment().trimQuery().trimSegments(1).appendSegment(id).appendQuery("rev=" + rev);
			resource.setURI(newURI);
			//if (resource instanceof JsonResource && resource.getContents().size() == 1) {
			//	((JsonResource) resource).setID(resource.getContents().get(0), id);
			//}
		}
	}

	private JsonNode toJson(Resource resource) {
		ResourceSet resourceSet = resource.getResourceSet();
		if (resourceSet == null) {
			resourceSet = new ResourceSetImpl();
		}

		ObjectMapper objectMapper = mapper;
		if (objectMapper == null) {
			objectMapper = new ObjectMapper();
			objectMapper.registerModule(new EMFModule());
		}
		final ObjectNode resourceNode = documentFromURI(uri, objectMapper);
		//JsonNode id = resourceNode.get("_id");
		//if (id != null && resource instanceof JsonResource && resource.getContents().size() == 1) {
		//	((JsonResource) resource).setID(resource.getContents().get(0), id.textValue());
		//}
		final JsonNode contents = objectMapper.valueToTree(resource);
		resourceNode.set("contents", contents);

		return resourceNode;
	}

	public static ObjectNode documentFromURI(URI uri, ObjectMapper mapper) {
		final ObjectNode resourceNode = mapper.createObjectNode();
		final String id = uri.segment(1);
		if (!id.isEmpty()) {
			resourceNode.put("_id", id);
		}
		final String query = uri.query();
		if (query != null && query.startsWith("rev=")) {
			resourceNode.put("_rev", query.substring(4));
		}
		return resourceNode;
	}
}
