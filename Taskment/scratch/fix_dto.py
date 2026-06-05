import re

with open('src/main/java/com/example/Taskment/dto/RegisterRequest.java', 'r') as f:
    lines = f.readlines()

with open('src/main/java/com/example/Taskment/dto/RegisterRequest.java', 'w') as f:
    for i, line in enumerate(lines):
        if i >= 67 and i <= 89:
            continue
        f.write(line)

with open('src/main/java/com/example/Taskment/dto/TaskDTO.java', 'r') as f:
    content = f.read()

content = re.sub(r'import lombok\..+;\n?', '', content)
content = re.sub(r'@Builder\n?', '', content)
content = re.sub(r'@NoArgsConstructor\n?', '', content)
content = re.sub(r'@AllArgsConstructor\n?', '', content)

constructor_empty = "\n    public TaskDTO() {}\n"
constructor_full = """
    public TaskDTO(Long id, String title, String description, java.time.LocalDateTime dueDate, java.time.LocalDateTime createdAt, Long projectId, String projectName, Long statusId, String statusName, Long priorityId, String priorityName, Long assigneeId, String assigneeUsername) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.projectId = projectId;
        this.projectName = projectName;
        this.statusId = statusId;
        this.statusName = statusName;
        this.priorityId = priorityId;
        this.priorityName = priorityName;
        this.assigneeId = assigneeId;
        this.assigneeUsername = assigneeUsername;
    }
"""

content = content.replace("public class TaskDTO {", "public class TaskDTO {" + constructor_empty + constructor_full)

with open('src/main/java/com/example/Taskment/dto/TaskDTO.java', 'w') as f:
    f.write(content)

