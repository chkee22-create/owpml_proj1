import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const DynamicVisualizer = ({ config, fallbackTitle }: { config: any, fallbackTitle?: string }) => {
  // If config is string, try to parse
  let parsed = config;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      return <div>데이터 파싱 오류</div>;
    }
  }

  // AI가 JSON 배열만 반환했을 경우 방어 로직 (이전 버전 호환성)
  if (Array.isArray(parsed)) {
    parsed = {
      type: 'table',
      columns: Array.from(new Set(parsed.flatMap(Object.keys))).map(key => ({ key, label: key })),
      data: parsed
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return <div>유효하지 않은 시각화 데이터입니다.</div>;
  }

  const { type, chartType, xAxisKey, columns, series, data, rows, kind } = parsed;
  
  // 구버전(rows, kind) 호환성 유지
  const safeData = Array.isArray(data) && data.length > 0 ? data : (Array.isArray(rows) ? rows : []);
  const actualType = type || (kind === 'graph' ? 'chart' : kind) || 'table';

  const renderTable = () => {
    const cols = Array.isArray(columns) && columns.length > 0 
      ? columns 
      : Array.from(new Set(safeData.flatMap(Object.keys))).map(key => ({ key, label: key }));

    // AI가 지정한 테마(theme)가 있으면 적용, 없으면 기본값
    const theme = parsed.theme || {};
    const headerBg = theme.headerBackground || '#f1f5f9';
    const headerColor = theme.headerTextColor || '#0f172a';
    const cellBg = theme.cellBackground || '#ffffff';
    const cellColor = theme.cellTextColor || '#334155';
    const borderColor = theme.borderColor || '#cbd5e1';

    return (
      <div className="mini-table" style={{ 
        gridTemplateColumns: `repeat(${Math.max(1, cols.length)}, 1fr)`,
        background: borderColor,
        border: `1px solid ${borderColor}`
      }}>
        {cols.map((col: any, i: number) => (
          <div className="th" key={`th-${i}`} style={{ 
            background: headerBg, 
            color: headerColor, 
            borderBottom: `2px solid ${borderColor}` 
          }}>
            {col.label || col.key}
          </div>
        ))}
        {safeData.flatMap((row: any, rIndex: number) =>
          cols.map((col: any, cIndex: number) => (
            <div key={`td-${rIndex}-${cIndex}`} style={{ background: cellBg, color: cellColor }}>
              {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '-'}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderChart = () => {
    if (!series || !Array.isArray(series) || series.length === 0) {
      return <div>차트 설정(Series)이 누락되었습니다.</div>;
    }

    const xKey = xAxisKey || 'name';

    if (chartType === 'pie') {
      const pieData = safeData;
      const pieColor = series[0]?.color || '#0ea5a4';
      const COLORS = [pieColor, '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey={series[0].dataKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill={pieColor}
              label
            >
              {pieData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const hasRightAxis = series.some((s: any) => s.yAxisId === 'right');

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={safeData} margin={{ top: 20, right: hasRightAxis ? 10 : 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            {hasRightAxis && (
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            )}
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {series.map((s: any, idx: number) => (
              <Line
                key={idx}
                yAxisId={s.yAxisId || 'left'}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color || '#0ea5a4'}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default to Bar chart
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={safeData} margin={{ top: 20, right: hasRightAxis ? 10 : 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          {hasRightAxis && (
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          )}
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {series.map((s: any, idx: number) => (
            <Bar
              key={idx}
              yAxisId={s.yAxisId || 'left'}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              fill={s.color || '#0ea5a4'}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderMindmap = () => {
    // Basic fallback for mindmap
    return (
      <div className="mini-mindmap">
        <div className="center-node">{fallbackTitle || '마인드맵'}</div>
        <div className="tree-trunk" aria-hidden="true"></div>
        <div className="branches">
          {safeData.slice(0, 5).map((branch: any, index: number) => {
            const label = branch.label || branch.name || branch.key || `노드 ${index + 1}`;
            return <span className={`branch branch-${index + 1}`} key={index}>{label}</span>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="dynamic-visualizer" style={{ width: '100%', padding: '16px 0 24px 0', minHeight: '340px' }}>
      {actualType === 'chart' && renderChart()}
      {actualType === 'table' && renderTable()}
      {actualType === 'mindmap' && renderMindmap()}
      {!['chart', 'table', 'mindmap'].includes(actualType) && renderTable()}
    </div>
  );
};
