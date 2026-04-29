package com.dz.erp.pim.ocr.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class OcrAsyncConfig {

    @Bean(name = "ocrTaskExecutor")
    public Executor ocrTaskExecutor() {
        var ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(2);
        ex.setMaxPoolSize(4);
        ex.setQueueCapacity(50);
        ex.setThreadNamePrefix("ocr-worker-");
        ex.initialize();
        return ex;
    }
}
