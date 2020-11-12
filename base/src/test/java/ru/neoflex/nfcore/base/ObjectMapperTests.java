package ru.neoflex.nfcore.base;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.nfcore.base.auth.GrantType;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.util.EmfJson;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"dbtype=orientdb", "orientdb.dbname=modelstest"})
public class ObjectMapperTests {
    @Autowired
    Context context;

    @Test
    public void simpleTypesTest() throws JsonProcessingException {
        ObjectMapper mapper = EmfJson.createMapper();
        String stringValue = "test";
        Object deserStringValue = mapper.treeToValue(mapper.valueToTree(stringValue), String.class);
        Assert.assertEquals(stringValue, deserStringValue);

        List listValue = new ArrayList<>();
        listValue.add(stringValue);
        Object deserListValue = mapper.treeToValue(mapper.valueToTree(listValue), List.class);
        Assert.assertEquals(listValue, deserListValue);

        Map mapValue = new HashMap<>();
        mapValue.put("key1", stringValue);
        Object deserMapValue = mapper.treeToValue(mapper.valueToTree(mapValue), Map.class);
        Assert.assertEquals(mapValue, deserMapValue);
    }

    @Test
    public void enumTest() throws JsonProcessingException {
        //ObjectMapper mapper = context.getMapper();
        ObjectMapper mapper = new ObjectMapper();
        GrantType grantType = GrantType.WRITE;
        Object deserGrantType = mapper.treeToValue(mapper.valueToTree(grantType), GrantType.class);
        Assert.assertEquals(grantType, deserGrantType);

    }

}
