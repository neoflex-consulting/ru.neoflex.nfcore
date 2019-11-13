package ru.neoflex.nfcore.base.scheduler.impl;

import org.eclipse.emf.ecore.util.EcoreUtil;
import ru.neoflex.nfcore.base.auth.impl.AuthFactoryImpl;
import ru.neoflex.nfcore.base.scheduler.ScheduledTask;
import ru.neoflex.nfcore.base.scheduler.SchedulerPackage;
import ru.neoflex.nfcore.base.services.Context;

public class SchedulerPackageInit extends AuthFactoryImpl {
    {
        SchedulerPackage.eINSTANCE.setEFactoryInstance(new SchedulerFactoryImpl() {
            @Override
            public ScheduledTask createScheduledTask() {
                return new ScheduledTaskImpl() {
                    @Override
                    public void refreshScheduler() throws Exception {
                        Context.getCurrent().getScheduler().refreshScheduler();
                    }
                };
            }
        });
        ScheduledTask task = (ScheduledTask) EcoreUtil.create(SchedulerPackage.Literals.SCHEDULED_TASK);
        try {
            task.refreshScheduler();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
