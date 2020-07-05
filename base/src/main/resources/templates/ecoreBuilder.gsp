<%
    org.eclipse.emf.ecore.EObject eObject = object
%>
ru.neoflex.nfcore.dsl.EcoreBuilder.build "<%= eObject.eClass().EPackage.nsPrefix %>", "<%= eObject.eClass().name %>", <%= ru.neoflex.nfcore.templates.Utils.generate("templates/eObject.gsp", [object: eObject])%>
