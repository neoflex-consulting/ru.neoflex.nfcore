package org.emfjson.couchdb.streams;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.cfg.ContextAttributes;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.URIConverter.Loadable;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.emfjson.couchdb.client.CouchClient;
import org.emfjson.couchdb.client.CouchDocument;
import org.emfjson.couchdb.client.DB;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.resource.JsonResource;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import static org.emfjson.jackson.databind.EMFContext.Attributes.RESOURCE;

public class CouchInputStream extends InputStream implements Loadable {

	private final URI uri;
	private final Map<?, ?> options;
	private final CouchClient client;
	private final ObjectMapper mapper;

	public CouchInputStream(CouchClient client, URI uri, Map<?, ?> options, ObjectMapper mapper) {
		this.client = client;
		this.uri = uri;
		this.options = options;
		this.mapper = mapper;
	}

	@Override
	public void loadResource(Resource resource) throws IOException {
		final String dbName = uri.segment(0);
		final String docName = uri.segment(1);

		final DB db = client.db(dbName);
		if (!db.exist()) {
			throw new IOException("Database " + dbName + " does not exist");
		}

		if (docName == null) {
			throw new IOException("Cannot load undefined document");
		}

		if (!db.doc(docName).exist()) {
			throw new IOException("Document " + docName + " does not exist");
		}

		final CouchDocument doc = db.doc(docName);

		if (!resource.getContents().isEmpty()) {
			resource.getContents().clear();
		}

		readJson(resource, doc.contentAsBytes());
	}

	private void readJson(final Resource resource, byte[] data) throws IOException {
		ResourceSet resourceSet = resource.getResourceSet();
		if (resourceSet == null) {
			resourceSet = new ResourceSetImpl();
		}

		ObjectMapper objectMapper = mapper;
		if (objectMapper == null) {
			objectMapper = new ObjectMapper();
			final EMFModule module = new EMFModule();
			objectMapper.registerModule(module);
		}

		final ContextAttributes attributes = ContextAttributes
				.getEmpty()
				.withSharedAttribute("resourceSet", resourceSet)
				.withSharedAttribute("resource", resource);

		final JsonNode rootNode = objectMapper.readTree(data);
		final JsonNode contents = rootNode.has("contents") ?
				rootNode.get("contents"):
				null;

		if (contents != null) {
			objectMapper.reader()
					.with(attributes)
					.withValueToUpdate(resource)
					.treeToValue(contents, Resource.class);
		}
		if (rootNode.has("_id") && rootNode.has("_rev")) {
			String id = rootNode.get("_id").asText();
			String rev = rootNode.get("_rev").asText();
			URI newURI = resource.getURI().trimFragment().trimQuery().trimSegments(1).appendSegment(id).appendQuery("rev=" + rev);
			resource.setURI(newURI);
			//if (resource instanceof JsonResource && resource.getContents().size() == 1) {
			//	((JsonResource) resource).setID(resource.getContents().get(0), id);
			//}
		}
	}

	@Override
	public int read() throws IOException {
		return 0;
	}

}
