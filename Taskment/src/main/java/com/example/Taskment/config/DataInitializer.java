package com.example.Taskment.config;

import com.example.Taskment.entity.*;
import com.example.Taskment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskStatusRepository taskStatusRepository;

    @Autowired
    private PriorityRepository priorityRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public void run(String... args) throws Exception {

        // 1. Tạo Status mẫu (Nếu chưa có)
        if (taskStatusRepository.count() == 0) {
            taskStatusRepository.save(new TaskStatus("To Do"));
            taskStatusRepository.save(new TaskStatus("In Progress"));
            taskStatusRepository.save(new TaskStatus("Done"));
            System.out.println(">> Đã khởi tạo danh sách Status!");
        }

        // 2. Tạo Priority mẫu (Nếu chưa có)
        if (priorityRepository.count() == 0) {
            priorityRepository.save(new Priority("High", 1));
            priorityRepository.save(new Priority("Medium", 2));
            priorityRepository.save(new Priority("Low", 3));
            System.out.println(">> Đã khởi tạo danh sách Priority!");
        }

        // 3. Đảm bảo có ít nhất 1 User để test (ID = 1)
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword("123");
            admin.setFullName("Quản trị viên");
            userRepository.save(admin);
            System.out.println(">> Đã tạo User Admin mẫu!");
        }

        // 4. Đảm bảo có ít nhất 1 Project để test (ID = 1)
        if (projectRepository.count() == 0) {
            User owner = userRepository.findAll().get(0);
            Project p = new Project("Dự án Mẫu", "Mô tả dự án test", "ACTIVE", owner);
            projectRepository.save(p);
            System.out.println(">> Đã tạo Project mẫu!");
        }
    }
}