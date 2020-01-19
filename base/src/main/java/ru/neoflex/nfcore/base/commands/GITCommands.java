package ru.neoflex.nfcore.base.commands;

import com.github.fonimus.ssh.shell.SshShellHelper;
import com.github.fonimus.ssh.shell.commands.SshShellComponent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.shell.standard.ShellMethod;
import ru.neoflex.nfcore.base.services.Workspace;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@SshShellComponent
public class GITCommands {
    @Autowired
    Workspace workspace;
    private final SshShellHelper helper;

    public GITCommands(SshShellHelper helper) {
        this.helper = helper;
    }

    @ShellMethod("Print info about branches")
    public List<String> gitBranchInfo() throws IOException {
        List<String> result = new ArrayList<>();
        result.add("Current branch: " + workspace.getCurrentBranch());
        result.add("Default branch: " + workspace.getDefaultBranch());
        result.add("All branches:");
        for (String branch: workspace.getDatabase().getBranches()) {
            result.add("\t" + branch);
        }
        return result;
    }

    @ShellMethod("Set current branch")
    public List<String> gitSetBranch(String name) throws IOException {
        workspace.setCurrentBranch(name);
        return gitBranchInfo();
    }

}
