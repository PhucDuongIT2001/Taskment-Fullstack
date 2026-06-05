import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskStatusPieChart = ({ tasks }) => {
    // Đếm số lượng task cho mỗi trạng thái
    const statusCounts = tasks.reduce((acc, task) => {
        const statusName = task.statusName || 'Chưa xác định';
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(statusCounts),
        datasets: [
            {
                label: '# of Tasks',
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',  // TO DO
                    'rgba(54, 162, 235, 0.7)', // IN PROGRESS
                    'rgba(255, 206, 86, 0.7)', // IN REVIEW
                    'rgba(75, 192, 192, 0.7)',  // DONE
                    'rgba(153, 102, 255, 0.7)',// OTHERS
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Biểu đồ trạng thái công việc',
                font: {
                    size: 16
                }
            },
        },
    };

    return <Pie data={data} options={options} />;
};

export default TaskStatusPieChart;
