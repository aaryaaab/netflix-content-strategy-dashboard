import React from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_THEME = {
  text: '#999999',
  grid: '#333333',
  tooltipBg: '#1a1a1a',
  tooltipBorder: '#333333',
  accent: '#e50914',
  accentSecondary: '#b20710',
  pieColors: ['#e50914', '#5c5c5c', '#333333']
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, padding: '10px', borderRadius: '4px' }}>
        <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: 0, fontSize: '14px' }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TrendChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_THEME.accent} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_THEME.accent} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
          <XAxis dataKey="year" stroke={CHART_THEME.text} tick={{fill: CHART_THEME.text}} />
          <YAxis stroke={CHART_THEME.text} tick={{fill: CHART_THEME.text}} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="count" name="Additions" stroke={CHART_THEME.accent} fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TypeDistributionChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_THEME.pieColors[index % CHART_THEME.pieColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RatingBarChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
          <XAxis type="number" stroke={CHART_THEME.text} tick={{fill: CHART_THEME.text}} />
          <YAxis dataKey="name" type="category" stroke={CHART_THEME.text} tick={{fill: CHART_THEME.text}} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Count" fill={CHART_THEME.accentSecondary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
