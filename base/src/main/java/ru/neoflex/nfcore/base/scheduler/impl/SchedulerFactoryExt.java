package ru.neoflex.nfcore.base.scheduler.impl;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.retry.RetryPolicy;
import org.springframework.retry.backoff.*;
import org.springframework.retry.policy.AlwaysRetryPolicy;
import org.springframework.retry.policy.NeverRetryPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.policy.TimeoutRetryPolicy;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import ru.neoflex.nfcore.base.scheduler.*;
import ru.neoflex.nfcore.base.services.Context;

import java.util.*;
import java.util.concurrent.ScheduledFuture;

public class SchedulerFactoryExt extends SchedulerFactoryImpl {
    private static final Logger logger = LoggerFactory.getLogger(SchedulerFactoryExt.class);

    @Override
    public ScheduledTask createScheduledTask() {
        return new ScheduledTaskImpl() {
            @Override
            public Object refreshScheduler() throws Exception {
                return Context.getCurrent().getScheduler().refreshScheduler();
            }

            @Override
            public Object debugRescheduleAll() throws Exception {
                return Context.getCurrent().getScheduler().debugRescheduleAll();
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
        return new CronSchedulingPolicyImpl() {
            @Override
            public ScheduledFuture<?> schedule(TaskScheduler taskScheduler, Runnable runnable) {
                String cronExpression = getCronExpression();
                if (StringUtils.isEmpty(cronExpression)) {
                    logger.error("cronExpression undefined");
                    return null;
                }
                return taskScheduler.schedule(runnable, new CronTrigger(cronExpression));
            }
        };
    }

    @Override
    public DelaySchedulingPolicy createDelaySchedulingPolicy() {
        return new DelaySchedulingPolicyImpl() {
            @Override
            public ScheduledFuture<?> schedule(TaskScheduler taskScheduler, Runnable runnable) {
                Date startTime = getStartTime();
                Long delay = getDelay();
                if (delay == null) {
                    logger.error("Delay undefined");
                    return null;
                }
                if (startTime == null) {
                    return  taskScheduler.scheduleWithFixedDelay(runnable, delay);
                } else {
                    return taskScheduler.scheduleWithFixedDelay(runnable, startTime, delay);
                }
            }
        };
    }

    @Override
    public PeriodSchedulingPolicy createPeriodSchedulingPolicy() {
        return new PeriodSchedulingPolicyImpl() {
            @Override
            public ScheduledFuture<?> schedule(TaskScheduler taskScheduler, Runnable runnable) {
                Date startTime = getStartTime();
                Long period = getPeriod();
                if (period == null) {
                    logger.error("Period undefined");
                    return null;
                }
                if (startTime == null) {
                    return taskScheduler.scheduleAtFixedRate(runnable, period);
                } else {
                    return taskScheduler.scheduleAtFixedRate(runnable, startTime, period);
                }
            }
        };
    }

    @Override
    public SimpleRetryPolicyFactory createSimpleRetryPolicyFactory() {
        return new SimpleRetryPolicyFactoryImpl() {
            @Override
            public RetryPolicy createPolicy() {
                Integer maxAttempts = getMaxAttempts();
                if (maxAttempts == null) {
                    maxAttempts = SimpleRetryPolicy.DEFAULT_MAX_ATTEMPTS;
                }
                Map<Class<? extends Throwable>, Boolean> res = new HashMap<>();
                List<RetryableException> retryableExceptions = getRetryableExceptions();
                if (retryableExceptions.size() == 0) {
                    res = Collections.singletonMap(Exception.class, true);
                }
                else {
                    for (RetryableException re: retryableExceptions) {
                        String exceptionClass = re.getExceptionClass();
                        try {
                            res.put((Class<? extends Throwable>) Class.forName(exceptionClass), re.isRetryable() == true);
                        }
                        catch (Throwable t) {
                            logger.error("Throwable class " + exceptionClass + " not found", t);
                        }
                    }
                }
                return new SimpleRetryPolicy(maxAttempts, res);
            }
        };
    }

    @Override
    public AlwaysRetryPolicyFactory createAlwaysRetryPolicyFactory() {
        return new AlwaysRetryPolicyFactoryImpl() {
            @Override
            public RetryPolicy createPolicy() {
                return new AlwaysRetryPolicy();
            }
        };
    }

    @Override
    public NeverRetryPolicyFactory createNeverRetryPolicyFactory() {
        return new NeverRetryPolicyFactoryImpl() {
            @Override
            public RetryPolicy createPolicy() {
                return new NeverRetryPolicy();
            }
        };
    }

    @Override
    public TimeoutRetryPolicyFactory createTimeoutRetryPolicyFactory() {
        return new TimeoutRetryPolicyFactoryImpl() {
            @Override
            public RetryPolicy createPolicy() {
                TimeoutRetryPolicy result = new TimeoutRetryPolicy();
                Long timeout = getTimeout();
                if (timeout != null) {
                    result.setTimeout(timeout);
                }
                return result;
            }
        };
    }
}
