package ru.neoflex.nfcore.base.commands;

import com.github.fonimus.ssh.shell.SshContext;
import com.github.fonimus.ssh.shell.SshShellCommandFactory;
import com.github.fonimus.ssh.shell.SshShellHelper;
import com.github.fonimus.ssh.shell.commands.SshShellComponent;
import groovy.lang.Binding;
import jline.TerminalFactory;
import org.codehaus.groovy.tools.shell.AnsiDetector;
import org.codehaus.groovy.tools.shell.Groovysh;
import org.codehaus.groovy.tools.shell.IO;
import org.fusesource.jansi.Ansi;
import org.fusesource.jansi.AnsiConsole;
import org.springframework.shell.standard.ShellMethod;
import ru.neoflex.nfcore.base.components.SpringContext;
import ru.neoflex.nfcore.base.services.Context;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;

@SshShellComponent
public class GroovyCommands {
    private final SshShellHelper helper;

    public GroovyCommands(SshShellHelper helper) {
        this.helper = helper;
    }

    @ShellMethod("Groovy shell")
    public int repl() throws Exception {
        Context context = SpringContext.getBean(Context.class);
        return context.inContextWithClassLoaderInTransaction(() -> {
            Binding binding = new Binding();
            SshContext sshContext = SshShellCommandFactory.SSH_THREAD_CONTEXT.get();
            InputStream is = sshContext.getTerminal().input();
            OutputStream os = sshContext.getTerminal().output();
            binding.setProperty("out", new PrintWriter(os, true));
            binding.setProperty("current", Context.getCurrent());
            AnsiConsole.systemInstall();
            Ansi.setDetector(new AnsiDetector());
            System.setProperty(TerminalFactory.JLINE_TERMINAL, "none");
            Groovysh sh = new Groovysh(binding, new IO(is, os, os));
            return sh.run(null);
        });
    }

}
