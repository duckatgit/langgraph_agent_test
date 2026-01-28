/**
 * Chart Tool - Returns a static Chart.js configuration
 * This is a mocked tool that provides chart configurations for visualization
 */

export interface ChartConfig {
  type: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options: {
    responsive: boolean;
    plugins: {
      legend: {
        position: string;
      };
      title: {
        display: boolean;
        text: string;
      };
    };
    scales?: any;
  };
}

/**
 * Returns a static Chart.js bar chart configuration
 */
function getChartConfig(): ChartConfig {
  return {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Revenue (in millions)',
          data: [2.5, 3.2, 2.8, 4.1],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Quarterly Revenue Report 2024',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue ($M)',
          },
        },
      },
    },
  };
}

/**
 * Chart generator function - generates chart configurations
 */
export function generateChart(chartType?: string): ChartConfig {
  console.log(`📊 Generating chart: ${chartType || 'bar chart'}`);
  return getChartConfig();
}
