package com.dz.erp.shared.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.List;
import java.util.Locale;

@Configuration
public class I18nConfig {
    @Bean
    public MessageSource messageSource() {
        var s = new ResourceBundleMessageSource();
        s.setBasenames("i18n/messages");
        s.setDefaultEncoding("UTF-8");
        s.setFallbackToSystemLocale(false);
        s.setDefaultLocale(Locale.FRENCH);
        return s;
    }

    @Bean
    public LocaleResolver localeResolver() {
        var r = new AcceptHeaderLocaleResolver();
        r.setDefaultLocale(Locale.FRENCH);
        r.setSupportedLocales(List.of(Locale.ENGLISH, Locale.FRENCH, Locale.forLanguageTag("ar")));
        return r;
    }
}
