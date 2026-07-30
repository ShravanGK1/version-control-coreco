import React, { useMemo } from 'react';
import { VersionRecord } from '../../types/version';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Layers, CheckCircle2 } from 'lucide-react';

interface VersionChartsProps {
  versions: VersionRecord[];
}

const TYPE_COLORS = {
  major: '#8b5cf6', // Violet/Purple
  minor: '#06b6d4', // Cyan
  'bug-fix': '#f59e0b', // Amber
};

const STATUS_COLORS = {
  active: '#10b981', // Emerald green
  inactive: '#ef4444', // Red
};

// Custom dark mode tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        {label && <p className="chart-tooltip-label">{label}</p>}
        <div className="chart-tooltip-list">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="chart-tooltip-item">
              <span className="tooltip-dot" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="tooltip-name">{entry.name}:</span>
              <span className="tooltip-value">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const VersionCharts: React.FC<VersionChartsProps> = ({ versions }) => {
  // Aggregate data by Project for Bar Chart
  const projectData = useMemo(() => {
    const map = new Map<string, { projectName: string; major: number; minor: number; 'bug-fix': number; total: number }>();

    versions.forEach((v) => {
      const name = v.projectName || `Project #${v.projectId}`;
      if (!map.has(name)) {
        map.set(name, { projectName: name, major: 0, minor: 0, 'bug-fix': 0, total: 0 });
      }
      const entry = map.get(name)!;
      if (v.version === 'major') entry.major += 1;
      else if (v.version === 'minor') entry.minor += 1;
      else if (v.version === 'bug-fix') entry['bug-fix'] += 1;
      entry.total += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [versions]);

  // Aggregate data by Version Type for Pie Chart 1
  const versionTypeData = useMemo(() => {
    let majorCount = 0;
    let minorCount = 0;
    let bugfixCount = 0;

    versions.forEach((v) => {
      if (v.version === 'major') majorCount++;
      else if (v.version === 'minor') minorCount++;
      else if (v.version === 'bug-fix') bugfixCount++;
    });

    return [
      { name: 'Major Release', value: majorCount, color: TYPE_COLORS.major, typeKey: 'major' },
      { name: 'Minor Release', value: minorCount, color: TYPE_COLORS.minor, typeKey: 'minor' },
      { name: 'Bug-Fix Release', value: bugfixCount, color: TYPE_COLORS['bug-fix'], typeKey: 'bug-fix' },
    ].filter((item) => item.value > 0 || versions.length === 0);
  }, [versions]);

  // Aggregate data by Active / Inactive Status for Pie Chart 2
  const statusData = useMemo(() => {
    let activeCount = 0;
    let inactiveCount = 0;

    versions.forEach((v) => {
      if (v.isActive) activeCount++;
      else inactiveCount++;
    });

    return [
      { name: 'Active Records', value: activeCount, color: STATUS_COLORS.active },
      { name: 'Inactive / Soft Deleted', value: inactiveCount, color: STATUS_COLORS.inactive },
    ].filter((item) => item.value > 0 || versions.length === 0);
  }, [versions]);

  if (versions.length === 0) {
    return (
      <div className="charts-empty-card">
        <Layers size={32} className="text-muted mb-2" />
        <p>No data available to display visual analytics for current filters.</p>
      </div>
    );
  }

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <div className="analytics-title">
          <BarChart3 size={20} className="analytics-icon" />
          <h3>Release Analytics & Data Visualizations</h3>
        </div>
        <span className="analytics-subtitle">
          Real-time metrics calculated from {versions.length} release record{versions.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="charts-grid">
        {/* Bar Chart Card: Releases per Project */}
        <div className="chart-card chart-card-wide">
          <div className="chart-card-header">
            <div className="chart-card-title">
              <BarChart3 size={18} className="text-primary" />
              <h4>Release Distribution by Project</h4>
            </div>
            <span className="chart-badge">Bar Chart</span>
          </div>
          <p className="chart-description">
            Breakdown of major, minor, and bug-fix release versions deployed per project.
          </p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={projectData}
                margin={{ top: 15, right: 25, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="projectName"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={{ stroke: '#334155' }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: '0.85rem' }}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      major: 'Major Releases',
                      minor: 'Minor Releases',
                      'bug-fix': 'Bug-Fix Releases',
                    };
                    return <span style={{ color: '#f8fafc' }}>{labels[value] || value}</span>;
                  }}
                />
                <Bar dataKey="major" name="major" fill={TYPE_COLORS.major} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="minor" name="minor" fill={TYPE_COLORS.minor} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="bug-fix" name="bug-fix" fill={TYPE_COLORS['bug-fix']} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart 1 Card: Version Types Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">
              <PieIcon size={18} style={{ color: TYPE_COLORS.major }} />
              <h4>Version Types</h4>
            </div>
            <span className="chart-badge">Pie / Donut</span>
          </div>
          <p className="chart-description">Proportion of Major, Minor, and Bug-Fix releases.</p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={versionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {versionTypeData.map((entry, index) => (
                    <Cell key={`cell-type-${index}`} fill={entry.color} stroke="#1e293b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-legend-custom">
            {versionTypeData.map((item) => (
              <div key={item.name} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.color }} />
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart 2 Card: Active vs Inactive Status */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">
              <CheckCircle2 size={18} className="text-success" />
              <h4>Release Status</h4>
            </div>
            <span className="chart-badge">Pie / Donut</span>
          </div>
          <p className="chart-description">Active releases vs soft deleted records.</p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} stroke="#1e293b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-legend-custom">
            {statusData.map((item) => (
              <div key={item.name} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.color }} />
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
