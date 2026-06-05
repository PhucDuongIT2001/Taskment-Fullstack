package com.example.Taskment.config;

import com.example.Taskment.entity.*;
import com.example.Taskment.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            HumanInfoRepository humanInfoRepository,
            PasswordEncoder passwordEncoder,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            TaskStatusRepository taskStatusRepository,
            PriorityRepository priorityRepository,
            SprintRepository sprintRepository,
            IssueTypeRepository issueTypeRepository) {

        return args -> {
            // 1. Seed Roles
            String[] roles = { "ROLE_ADMIN", "ROLE_STAFF_LEADER", "ROLE_STAFF_MEMBER", "ROLE_CUSTOMER" };
            for (String r : roles) {
                if (roleRepository.findByRole(r).isEmpty()) {
                    roleRepository.save(new Role(r, r.replace("ROLE_", "")));
                }
            }

            // 2. Seed Admin "phucduongadmin"
            var adminRole = roleRepository.findByRole("ROLE_ADMIN").orElseThrow();
            User adminUser = userRepository.findByUsername("phucduongadmin").orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername("phucduongadmin");
                newUser.setEmail("phucduongadmin@taskment.com");
                newUser.setFullName("Phuc Duong Admin");
                return newUser;
            });
            adminUser.setRoles(Set.of(adminRole));
            adminUser.setPassword(passwordEncoder.encode("123456789"));
            userRepository.save(adminUser);

            if (humanInfoRepository.findByUserId(adminUser.getId()).isEmpty()) {
                HumanInfo profile = new HumanInfo();
                profile.setUser(adminUser);
                profile.setFirstName("Phuc");
                profile.setLastName("Duong");
                humanInfoRepository.save(profile);
            }

            // 3. Seed Leader "leader"
            var leaderRole = roleRepository.findByRole("ROLE_STAFF_LEADER").orElseThrow();
            userRepository.findByUsername("leader").orElseGet(() -> {
                User leaderUser = new User();
                leaderUser.setUsername("leader");
                leaderUser.setEmail("leader@taskment.com");
                leaderUser.setFullName("Test Leader");
                leaderUser.setRoles(Set.of(leaderRole));
                leaderUser.setPassword(passwordEncoder.encode("123456"));
                userRepository.save(leaderUser);
                System.out.println(">>> [DataSeeder] TẠO THÀNH CÔNG LEADER: leader / 123456");
                return leaderUser;
            });

            // 4. Seed Member "member"
            var memberRole = roleRepository.findByRole("ROLE_STAFF_MEMBER").orElseThrow();
            userRepository.findByUsername("member").orElseGet(() -> {
                User memberUser = new User();
                memberUser.setUsername("member");
                memberUser.setEmail("member@taskment.com");
                memberUser.setFullName("Test Member");
                memberUser.setRoles(Set.of(memberRole));
                memberUser.setPassword(passwordEncoder.encode("123456"));
                userRepository.save(memberUser);
                System.out.println(">>> [DataSeeder] TẠO THÀNH CÔNG MEMBER: member / 123456");
                return memberUser;
            });

            // 5. Seed Customer "customer"
            var customerRole = roleRepository.findByRole("ROLE_CUSTOMER").orElseThrow();
            userRepository.findByUsername("customer").orElseGet(() -> {
                User customerUser = new User();
                customerUser.setUsername("customer");
                customerUser.setEmail("customer@taskment.com");
                customerUser.setFullName("Test Customer");
                customerUser.setRoles(Set.of(customerRole));
                customerUser.setPassword(passwordEncoder.encode("123456"));
                userRepository.save(customerUser);
                System.out.println(">>> [DataSeeder] TẠO THÀNH CÔNG CUSTOMER: customer / 123456");
                return customerUser;
            });


            // 6. Seed Statuses, Priorities, IssueTypes (Nếu rỗng)
            TaskStatus todoStatus = taskStatusRepository.findByName("TO DO").orElseGet(() -> taskStatusRepository.save(new TaskStatus("TO DO")));
            TaskStatus inProgressStatus = taskStatusRepository.findByName("IN PROGRESS").orElseGet(() -> taskStatusRepository.save(new TaskStatus("IN PROGRESS")));
            TaskStatus doneStatus = taskStatusRepository.findByName("DONE").orElseGet(() -> taskStatusRepository.save(new TaskStatus("DONE")));

            Priority highPriority = priorityRepository.findByName("HIGH").orElseGet(() -> priorityRepository.save(new Priority("HIGH", 1)));
            Priority mediumPriority = priorityRepository.findByName("MEDIUM").orElseGet(() -> priorityRepository.save(new Priority("MEDIUM", 2)));
            
            IssueType taskType = issueTypeRepository.findByName("Task").orElseGet(() -> issueTypeRepository.save(new IssueType("Task")));
            IssueType bugType = issueTypeRepository.findByName("Bug").orElseGet(() -> issueTypeRepository.save(new IssueType("Bug")));


            // 7. Seed Project, Sprints và Task mẫu (CHỈ KHI CHƯA CÓ PROJECT NÀO)
            if (projectRepository.count() == 0) {
                System.out.println(">>> [DataSeeder] Tạo Project, Sprints và Task mẫu...");
                Project sampleProject = new Project();
                sampleProject.setName("Dự án Alpha");
                sampleProject.setDescription("Đây là dự án demo đầu tiên");
                sampleProject.setStatus("ACTIVE");
                sampleProject.setLeader(adminUser);
                projectRepository.save(sampleProject);

                // Tạo Sprint mẫu
                Sprint sprint1 = new Sprint();
                sprint1.setName("Sprint 1 - Kế hoạch quý 1");
                sprint1.setProject(sampleProject);
                sprint1.setStatus("ACTIVE");
                sprintRepository.save(sprint1);

                Sprint sprint2 = new Sprint();
                sprint2.setName("Sprint 2 - Ra mắt tính năng mới");
                sprint2.setProject(sampleProject);
                sprint2.setStatus("PLANNING");
                sprintRepository.save(sprint2);

                // Tạo Task mẫu
                Task task1 = new Task();
                task1.setTitle("Thiết kế giao diện Dashboard");
                task1.setProject(sampleProject);
                task1.setReporter(adminUser);
                task1.setAssignee(adminUser);
                task1.setStatus(inProgressStatus);
                task1.setPriority(highPriority);
                task1.setStoryPoints(8);
                task1.setSprint(sprint1);
                task1.setIssueType(taskType);

                Task task2 = new Task();
                task2.setTitle("Viết API cho phần đăng nhập");
                task2.setProject(sampleProject);
                task2.setReporter(adminUser);
                task2.setAssignee(adminUser);
                task2.setStatus(doneStatus);
                task2.setPriority(highPriority);
                task2.setStoryPoints(5);
                task2.setSprint(sprint1);
                task2.setIssueType(bugType);

                Task task3 = new Task();
                task3.setTitle("Chuẩn bị báo cáo tiến độ");
                task3.setProject(sampleProject);
                task3.setReporter(adminUser);
                task3.setAssignee(adminUser);
                task3.setStatus(todoStatus);
                task3.setPriority(mediumPriority);
                task3.setStoryPoints(3);
                task3.setSprint(sprint2);
                task3.setIssueType(taskType);

                taskRepository.saveAll(List.of(task1, task2, task3));
            }
        };
    }
}
