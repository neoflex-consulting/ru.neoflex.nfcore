package ru.neoflex.nfcore.base;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"repo.name=testbase"})
public class BaseApplicationTests {

    @Test
    public void contextLoads() {
    }

}
