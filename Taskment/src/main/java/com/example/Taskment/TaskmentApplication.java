package com.example.Taskment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.retry.annotation.EnableRetry;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableScheduling
@EnableRetry
@EnableAsync
public class TaskmentApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskmentApplication.class, args);
	}

}
