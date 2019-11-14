package ru.neoflex.nfcore.base.scheduler.impl;

import org.springframework.retry.backoff.*;
import org.springframework.scheduling.TaskScheduler;
import ru.neoflex.nfcore.base.scheduler.*;
import ru.neoflex.nfcore.base.services.Context;

import java.util.Date;
import java.util.concurrent.ScheduledFuture;

public class SchedulerFactoryExt extends SchedulerFactoryImpl {
    @Override
    public ScheduledTask createScheduledTask() {
        return new ScheduledTaskImpl() {
            @Override
            public void refreshScheduler() throws Exception {
                Context.getCurrent().getScheduler().refreshSchedulerInt();
            }
        };
    }

    @Override
    public NoBackOffPolicyFactory createNoBackOffPolicyFactory() {
        return new NoBackOffPolicyFactoryImpl() {
            @Override
            public BackOffPolicy createPolicy() {
                return new NoBackOffPolicy();
            }
        };
    }

    @Override
    public FixedBackOffPolicyFactory createFixedBackOffPolicyFactory() {
        return new FixedBackOffPolicyFactoryImpl() {
            @Override
            public BackOffPolicy createPolicy() {
                FixedBackOffPolicy result = new FixedBackOffPolicy();
                Long backOffPeriod = getBackOffPeriod();
                if (backOffPeriod != null) {
                    result.setBackOffPeriod(backOffPeriod);
                }
                return result;
            }
        };
    }

    @Override
    public ExponentialBackOffPolicyFactory createExponentialBackOffPolicyFactory() {
        return new ExponentialBackOffPolicyFactoryImpl() {
            @Override
            public BackOffPolicy createPolicy() {
                ExponentialBackOffPolicy result = new ExponentialBackOffPolicy();
                Long initialInterval = getInitialInterval();
                if (initialInterval != null) {
                    result.setInitialInterval(initialInterval);
                }
                Long maxInterval = getMaxInterval();
                if (maxInterval != null) {
                    result.setMaxInterval(maxInterval);
                }
                Double multiplier = getMultiplier();
                if (multiplier != null) {
                    result.setMultiplier(multiplier);
                }
                return result;
            }
        };
    }

    @Override
    public ExponentialRandomBackOffPolicyFactory createExponentialRandomBackOffPolicyFactory() {
        return new ExponentialRandomBackOffPolicyFactoryImpl() {
            @Override
            public BackOffPolicy createPolicy() {
                ExponentialRandomBackOffPolicy result = new ExponentialRandomBackOffPolicy();
                Long initialInterval = getInitialInterval();
                if (initialInterval != null) {
                    result.setInitialInterval(initialInterval);
                }
                Long maxInterval = getMaxInterval();
                if (maxInterval != null) {
                    result.setMaxInterval(maxInterval);
                }
                Double multiplier = getMultiplier();
                if (multiplier != null) {
                    result.setMultiplier(multiplier);
                }
                return result;
            }
        };
    }

    @Override
    public UniformRandomBackOffPolicyFactory createUniformRandomBackOffPolicyFactory() {
        return new UniformRandomBackOffPolicyFactoryImpl() {
            @Override
            public BackOffPolicy createPolicy() {
                UniformRandomBackOffPolicy result = new UniformRandomBackOffPolicy();
                Long minBackOffPeriod = getMinBackOffPeriod();
                if (minBackOffPeriod != null) {
                    result.setMinBackOffPeriod(minBackOffPeriod);
                }
                Long maxBackOffPeriod = getMaxBackOffPeriod();
                if (maxBackOffPeriod != null) {
                    result.setMaxBackOffPeriod(maxBackOffPeriod);
                }
                return result;
            }
        };
    }

    @Override
    public OnceSchedulingPolicy createOnceSchedulingPolicy() {
        return new OnceSchedulingPolicyImpl() {
            @Override
            public ScheduledFuture<?> schedule(TaskScheduler taskScheduler, Runnable runnable) {
                Date startTime = getStartTime();
                if (startTime == null) {
                    return taskScheduler.schedule(runnable, new Date());
                } else {
                    return taskScheduler.schedule(runnable, startTime);
                }
            }
        };
    }

    @Override
    public CronSchedulingPolicy createCronSchedulingPolicy() {
        return super.createCronSchedulingPolicy();
    }

    @Override
    public DelaySchedulingPolicy createDelaySchedulingPolicy() {
        return super.createDelaySchedulingPolicy();
    }

    @Override
    public PeriodSchedulingPolicy createPeriodSchedulingPolicy() {
        return super.createPeriodSchedulingPolicy();
    }

    @Override
    public RetryableException createRetryableException() {
        return super.createRetryableException();
    }

    @Override
    public SimpleRetryPolicyFactory createSimpleRetryPolicyFactory() {
        return super.createSimpleRetryPolicyFactory();
    }

    @Override
    public AlwaysRetryPolicyFactory createAlwaysRetryPolicyFactory() {
        return super.createAlwaysRetryPolicyFactory();
    }

    @Override
    public NeverRetryPolicyFactory createNeverRetryPolicyFactory() {
        return super.createNeverRetryPolicyFactory();
    }

    @Override
    public TimeoutRetryPolicyFactory createTimeoutRetryPolicyFactory() {
        return super.createTimeoutRetryPolicyFactory();
    }
}
