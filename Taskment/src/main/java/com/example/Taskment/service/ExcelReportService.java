package com.example.Taskment.service;

import com.example.Taskment.dto.ProjectResponseDTO;
import com.example.Taskment.dto.TaskResponseDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelReportService {

    public ByteArrayInputStream generateProjectReport(ProjectResponseDTO project, List<TaskResponseDTO> tasks) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Báo Cáo Công Việc");

            // Define styles
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Title Row
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("BÁO CÁO DỰ ÁN: " + project.getName().toUpperCase());
            
            // Header Row
            Row headerRow = sheet.createRow(2);
            String[] columns = {"ID", "Tên Công Việc", "Trạng Thái", "Độ Ưu Tiên", "Người Thực Hiện", "Ngày Hết Hạn", "Ngày Tạo"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 3;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            
            for (TaskResponseDTO task : tasks) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(task.getId());
                row.createCell(1).setCellValue(task.getTitle() != null ? task.getTitle() : "");
                row.createCell(2).setCellValue(task.getStatusName() != null ? task.getStatusName() : "Chưa có");
                row.createCell(3).setCellValue(task.getPriorityName() != null ? task.getPriorityName() : "Chưa có");
                row.createCell(4).setCellValue(task.getAssigneeName() != null ? task.getAssigneeName() : "Chưa giao");
                row.createCell(5).setCellValue(task.getDueDate() != null ? task.getDueDate().format(formatter) : "");
                row.createCell(6).setCellValue(task.getCreatedAt() != null ? task.getCreatedAt().format(formatter) : "");
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Fail to import data to Excel file: " + e.getMessage());
        }
    }
}
