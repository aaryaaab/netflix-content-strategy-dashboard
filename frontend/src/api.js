const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'All') {
      query.append(key, value);
    }
  });
  return query.toString() ? `?${query.toString()}` : '';
};

export const fetchOptions = async () => {
    const res = await fetch(`${API_BASE}/options`);
    if (!res.ok) throw new Error('Fetch Options failed');
    return res.json();
}

export const fetchInsights = async (filters = {}) => {
    const qs = buildQueryString(filters);
    const res = await fetch(`${API_BASE}/insights${qs}`);
    if (!res.ok) throw new Error('Fetch Insights failed');
    return res.json();
}

export const fetchKPIs = async (filters = {}) => {
  const qs = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/kpis${qs}`);
  if (!res.ok) throw new Error('Fetch KPIs failed');
  return res.json();
};

export const fetchTrends = async (filters = {}) => {
  const qs = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/charts/trends${qs}`);
  if (!res.ok) throw new Error('Fetch Trends failed');
  return res.json();
};

export const fetchDistribution = async (filters = {}) => {
  const qs = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/charts/distribution${qs}`);
  if (!res.ok) throw new Error('Fetch Distribution failed');
  return res.json();
};

export const fetchTableData = async (page = 1, limit = 20, filters = {}) => {
  const qsParams = { ...filters, page, limit };
  const qs = buildQueryString(qsParams);
  const res = await fetch(`${API_BASE}/table${qs}`);
  if (!res.ok) throw new Error('Fetch Table Data failed');
  return res.json();
};
