package ru.neoflex.nfcore.base.commands;

import com.github.fonimus.ssh.shell.SshShellHelper;
import com.github.fonimus.ssh.shell.commands.SshShellComponent;
import com.orientechnologies.orient.etl.OETLProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.shell.standard.ShellOption;
import ru.neoflex.nfcore.base.services.providers.OrientDBStoreProvider;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@SshShellComponent
@ConditionalOnBean(OrientDBStoreProvider.class)
public class OrientDBCommands {
    @Autowired
    OrientDBStoreProvider provider;
    private final SshShellHelper helper;

    public OrientDBCommands(SshShellHelper helper) {
        this.helper = helper;
    }

    @ShellMethod("Vacuum database")
    public String odbVacuum() throws IOException {
        provider.getServer().vacuum();
        return "Done.";
    }

    @ShellMethod("Export database")
    public String odbExport(@ShellOption(defaultValue=ShellOption.NULL) File file) throws IOException {
        File export = file == null ? provider.getServer().exportDatabase() : provider.getServer().exportDatabase(file);
        return "Exported " + export.getAbsolutePath();
    }

    @ShellMethod("Import database")
    public String odbImport(File file, @ShellOption(defaultValue="false") boolean merge) throws IOException {
        provider.getServer().importDatabase(file, merge);
        return "Done.";
    }

    @ShellMethod("List database exports")
    public List<String> odbListExports() {
        List<String> result = new ArrayList<>();
        File exportDir = new File(provider.getServer().getHome(), "exports");
        for (File file: exportDir.listFiles()) {
            if (file.getName().startsWith(provider.getServer().getDbName())) {
                result.add(file.getAbsolutePath().replace("\\", "/"));
            }
        }
        result.sort(String::compareTo);
        return result;
    }

    @ShellMethod("Run OETL processor")
    public void odbOetl(File config, @ShellOption(arity = -1) String args[]) {
        String[] args2 = new ArrayList<String>() {{
            add(config.getPath());
            addAll(Arrays.asList(args));
        }}.toArray(new String[0]);
        OETLProcessor.main(args2);
    }

}
