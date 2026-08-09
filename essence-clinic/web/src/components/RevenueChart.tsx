import '../styles/revenue-chart.css';

interface DataPoint {
  month: string;
  revenue: number;
  target: number;
}

interface RevenueChartProps {
  data?: DataPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Mock data - últimos 6 meses
  const defaultData: DataPoint[] = [
    { month: 'Fev', revenue: 8400, target: 10000 },
    { month: 'Mar', revenue: 12500, target: 10000 },
    { month: 'Abr', revenue: 9800, target: 10000 },
    { month: 'Mai', revenue: 15200, target: 10000 },
    { month: 'Jun', revenue: 18900, target: 10000 },
    { month: 'Jul', revenue: 21600, target: 10000 },
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(d => Math.max(d.revenue, d.target))) * 1.1;

  return (
    <div className="revenue-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Faturamento - Últimos 6 Meses</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color actual"></div>
            <span>Receita Real</span>
          </div>
          <div className="legend-item">
            <div className="legend-color target"></div>
            <span>Meta</span>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <div className="chart-y-axis">
          <div className="y-label">R$ {(maxValue / 1000).toFixed(0)}k</div>
          <div className="y-label">R$ {(maxValue * 0.75 / 1000).toFixed(0)}k</div>
          <div className="y-label">R$ {(maxValue * 0.5 / 1000).toFixed(0)}k</div>
          <div className="y-label">R$ {(maxValue * 0.25 / 1000).toFixed(0)}k</div>
          <div className="y-label">R$ 0</div>
        </div>

        <div className="chart">
          <div className="chart-grid">
            {[0.75, 0.5, 0.25, 0].map((ratio, i) => (
              <div key={i} className="grid-line"></div>
            ))}
          </div>

          <div className="bars-container">
            {chartData.map((point, i) => {
              const revenueHeight = (point.revenue / maxValue) * 100;
              const targetHeight = (point.target / maxValue) * 100;

              return (
                <div key={i} className="bar-group">
                  <div className="bars">
                    <div
                      className="bar target"
                      style={{ height: `${targetHeight}%` }}
                      title={`Meta: R$ ${point.target.toLocaleString('pt-BR')}`}
                    ></div>
                    <div
                      className="bar actual"
                      style={{ height: `${revenueHeight}%` }}
                      title={`Receita: R$ ${point.revenue.toLocaleString('pt-BR')}`}
                    ></div>
                  </div>
                  <div className="month-label">{point.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="chart-footer">
        <div className="footer-stat">
          <span className="stat-label">Média Mensal</span>
          <span className="stat-value">
            R$ {(chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length / 1000).toFixed(1)}k
          </span>
        </div>
        <div className="footer-stat">
          <span className="stat-label">Total 6 Meses</span>
          <span className="stat-value">
            R$ {(chartData.reduce((sum, d) => sum + d.revenue, 0) / 1000).toFixed(1)}k
          </span>
        </div>
        <div className="footer-stat">
          <span className="stat-label">Crescimento</span>
          <span className="stat-value growth">
            +{(((chartData[5].revenue - chartData[0].revenue) / chartData[0].revenue) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
