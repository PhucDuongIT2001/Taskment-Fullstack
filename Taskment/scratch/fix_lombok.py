import os
import re

files_req = [
    "src/main/java/com/example/Taskment/config/DataSeeder.java",
    "src/main/java/com/example/Taskment/service/TaskService.java",
    "src/main/java/com/example/Taskment/controller/TaskController.java",
    "src/main/java/com/example/Taskment/controller/CustomerController.java",
    "src/main/java/com/example/Taskment/controller/StaffController.java",
    "src/main/java/com/example/Taskment/service/CustomerService.java",
    "src/main/java/com/example/Taskment/service/ProjectService.java",
    "src/main/java/com/example/Taskment/service/StaffService.java"
]

for filepath in files_req:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    if '@RequiredArgsConstructor' not in content:
        continue
        
    # Remove the import and annotation
    content = re.sub(r'import lombok\.RequiredArgsConstructor;\n?', '', content)
    content = re.sub(r'@RequiredArgsConstructor\n?', '', content)
    
    # Find class name
    class_match = re.search(r'public class (\w+)', content)
    if not class_match: continue
    class_name = class_match.group(1)
    
    # Find private final fields
    fields = re.findall(r'private final (\w+(?:<\w+>)?)\s+(\w+);', content)
    
    if fields:
        # Generate constructor
        constructor = f"\n    public {class_name}("
        constructor += ", ".join([f"{t} {n}" for t, n in fields])
        constructor += ") {\n"
        for t, n in fields:
            constructor += f"        this.{n} = {n};\n"
        constructor += "    }\n"
        
        # Insert constructor after the last private final field
        last_field = fields[-1]
        pattern = f'private final {last_field[0]} {last_field[1]};'
        content = content.replace(pattern, pattern + "\n" + constructor, 1)
        
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Fixed {filepath}")

# Fix @Data in DTOs
dto_files = [
    "src/main/java/com/example/Taskment/dto/RegisterRequest.java",
    "src/main/java/com/example/Taskment/dto/TaskDTO.java"
]

for filepath in dto_files:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
        
    if '@Data' not in content:
        continue
        
    content = re.sub(r'import lombok\.Data;\n?', '', content)
    content = re.sub(r'@Data\n?', '', content)
    
    # Find all private fields
    fields = re.findall(r'private (\w+(?:<\w+>)?(?:\s*\[\])?)\s+(\w+);', content)
    
    if fields:
        getters_setters = "\n"
        for t, n in fields:
            cap_n = n[0].upper() + n[1:]
            getters_setters += f"    public {t} get{cap_n}() {{ return {n}; }}\n"
            getters_setters += f"    public void set{cap_n}({t} {n}) {{ this.{n} = {n}; }}\n"
            
        # insert before the last brace
        content = re.sub(r'}\s*$', getters_setters + '}\n', content)
        
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Fixed {filepath}")

