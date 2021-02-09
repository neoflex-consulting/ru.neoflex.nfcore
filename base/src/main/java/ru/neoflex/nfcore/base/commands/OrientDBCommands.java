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
    public String odbImport(File file,
                            @ShellOption(defaultValue=ShellOption.NULL) Boolean deleteRIDMapping,
                            @ShellOption(defaultValue=ShellOption.NULL) Boolean preserveClusterIDs,
                            @ShellOption(defaultValue=ShellOption.NULL) Boolean merge,
                            @ShellOption(defaultValue=ShellOption.NULL) Boolean migrateLinks,
                            @ShellOption(defaultValue=ShellOption.NULL) Boolean rebuildIndexes) throws IOException {
        StringBuffer options = new StringBuffer();
        if (deleteRIDMapping != null) options.append("-deleteRIDMapping").append("=").append(deleteRIDMapping).append(" ");
        if (preserveClusterIDs != null) options.append("-preserveClusterIDs").append("=").append(preserveClusterIDs).append(" ");
        if (merge != null) options.append("-merge").append("=").append(merge).append(" ");
        if (migrateLinks != null) options.append("-migrateLinks").append("=").append(migrateLinks).append(" ");
        if (rebuildIndexes != null) options.append("-rebuildIndexes").append("=").append(rebuildIndexes).append(" ");
        provider.getServer().importDatabase(file, options.toString());
        return "Done.";
    }

    @ShellMethod("List database exports")
    public List<String> odbListExports() {
        return provider.getServer().listExports();
    }

    @ShellMethod("Backup database")
    public String odbBackup(@ShellOption(defaultValue=ShellOption.NULL) File file) throws IOException {
        File export = file == null ? provider.getServer().backupDatabase() : provider.getServer().backupDatabase(file);
        return "Backed up " + export.getAbsolutePath();
    }

    @ShellMethod("Restore database")
    public String odbRestore(@ShellOption(defaultValue=ShellOption.NULL) File file) throws IOException {
        provider.getServer().restoreDatabase(file);
        return "Restored " + file.getAbsolutePath();
    }

    @ShellMethod("List database backups")
    public List<String> odbListBackups() {
        return provider.getServer().listBackups();
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
