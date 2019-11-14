package ru.neoflex.nfcore.base.scheduler.impl;

import ru.neoflex.nfcore.base.scheduler.ScheduledTask;
import ru.neoflex.nfcore.base.services.Context;

public class SchedulerFactoryExt extends SchedulerFactoryImpl {
    @Override
    public ScheduledTask createScheduledTask() {
        return new ScheduledTaskImpl() {
            @Override
            public void refreshScheduler() throws Exception {
                Context.getCurrent().getScheduler().refreshScheduler();
            }
        };
    }
}
