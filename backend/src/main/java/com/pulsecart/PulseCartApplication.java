package com.pulsecart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PulseCartApplication {

    public static void main(String[] args) {
        SpringApplication.run(PulseCartApplication.class, args);
    }
}
