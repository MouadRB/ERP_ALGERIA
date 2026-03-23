package com.dz.erp.shared.config;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

    @Component
    public class MessageResolver {

        private static MessageSource messageSource;

        public MessageResolver(MessageSource ms) {
            MessageResolver.messageSource = ms;
        }

        public static String resolve(String key, Object... params) {
            if (key == null || messageSource == null) return key;
            try {
                return messageSource.getMessage(key, params, LocaleContextHolder.getLocale());
            } catch (Exception e) {
                return key;
            }
        }
    }

