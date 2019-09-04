package org.emfjson.couchdb;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.impl.URIHandlerImpl;
import org.emfjson.couchdb.client.CouchClient;
import org.emfjson.couchdb.client.CouchDocument;
import org.emfjson.couchdb.client.DB;
import org.emfjson.couchdb.streams.CouchInputStream;
import org.emfjson.couchdb.streams.CouchOutputStream;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.Map;

public class CouchHandler extends URIHandlerImpl {

	URL baseURL;
	ObjectMapper mapper;
	String user;
	String password;

	public CouchHandler() {
	}

	public CouchHandler(ObjectMapper mapper, String user, String password) {
		this.mapper = mapper;
		this.user = user;
		this.password = password;
	}

	@Override
	public boolean canHandle(URI uri) {
		CouchClient client;
		try {
			client = getClient(uri);
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}

		try {
			return client.isConnected();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return false;
	}

	@Override
	public InputStream createInputStream(URI uri, Map<?, ?> options) throws IOException {
		final CouchClient client = getClient(uri);

		return new CouchInputStream(client, uri, options, mapper);
	}

	@Override
	public OutputStream createOutputStream(URI uri, Map<?, ?> options) throws IOException {
		final CouchClient client = getClient(uri);

		return new CouchOutputStream(client, uri, options, mapper);
	}

	public void delete(URI uri, Map<?, ?> options) throws IOException {
		final CouchClient client = getClient(uri);
		final DB db = client.db(uri.segment(0));
		final CouchDocument doc = db.doc(uri.segment(1));
		checkStatus(doc.delete(uri.query()));

	}

	public static void checkStatus(JsonNode status) throws IOException {
		if (status == null) {
			throw new IOException();
		}
		if (status.has("error")) {
			String message = status.get("error").asText() + ": " + status.get("reason").asText();
			throw new IOException(message);
		}
	}

	private CouchClient getClient(URI uri) throws IOException {
		final URI baseURI = uri.trimFragment().trimQuery().trimSegments(uri.segmentCount());
		final URL url = new URL(baseURI.toString());
		if (mapper != null) {
			return new CouchClient(url, mapper, user, password);
		}
		return new CouchClient(url);
	}

}
