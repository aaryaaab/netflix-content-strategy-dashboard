import React, { useEffect, useState } from 'react';
import { Film, Tv, PlaySquare, CalendarPlus } from 'lucide-react';
import KPICard from './KPICard';
import { TrendChart, TypeDistributionChart, RatingBarChart } from './Charts';
import ContentTable from './ContentTable';
import FilterBar from './FilterBar';
import InsightsPanel from './InsightsPanel';
import { fetchKPIs, fetchTrends, fetchDistribution, fetchTableData, fetchOptions, fetchInsights } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const [filters, setFilters] = useState({ type: 'All', year: 'All', genre: 'All' });
  const [options, setOptions] = useState({ types: [], years: [], genres: [] });
  
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] = useState(null);
  const [insights, setInsights] = useState(null);
  const [tableData, setTableData] = useState({ data: [], page: 1, totalPages: 1 });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load filter options once on mount
  useEffect(() => {
    fetchOptions().then(setOptions).catch(console.error);
  }, []);

  // Fetch all dashboard data when filters change
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [kpiRes, trendsRes, distRes, insightsRes, tableRes] = await Promise.all([
          fetchKPIs(filters),
          fetchTrends(filters),
          fetchDistribution(filters),
          fetchInsights(filters),
          fetchTableData(1, 20, filters)
        ]);

        setKpis(kpiRes);
        setTrends(trendsRes);
        setDistribution(distRes);
        setInsights(insightsRes);
        setTableData(tableRes);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data. Ensure backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [filters]);

  const handlePageChange = async (newPage) => {
    try {
      const res = await fetchTableData(newPage, 20, filters);
      setTableData(res);
    } catch (err) {
      console.error('Failed to paginate', err);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Connection Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      
      <FilterBar filters={filters} options={options} onFilterChange={setFilters} />

      <div style={{ position: 'relative', minHeight: '400px' }}>
        {isLoading && (
          <div className="loading-overlay fade-in">
            <div className="spinner"></div>
            <h3>Generating Insights...</h3>
          </div>
        )}

        <div style={{ opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.3s ease' }}>
          {/* KPI Row */}
          <div className="kpi-grid" style={{ marginBottom: '32px' }}>
            <KPICard 
              title="Total Content" 
              value={kpis?.totalContent ?? 0} 
              icon={<PlaySquare size={24} />} 
              subtitle="Matching filters"
            />
            <KPICard 
              title="Total Movies" 
              value={kpis?.totalMovies ?? 0} 
              icon={<Film size={24} />} 
              subtitle="Matching filters"
            />
            <KPICard 
              title="Total TV Shows" 
              value={kpis?.totalTVShows ?? 0} 
              icon={<Tv size={24} />} 
              subtitle="Matching filters"
            />
            <KPICard 
              title={`Added in ${kpis?.currentYear || 'Latest Year'}`} 
              value={kpis?.contentAddedCurrentYear ?? 0} 
              icon={<CalendarPlus size={24} />} 
              trendData={kpis?.additionsYoY}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <InsightsPanel data={insights} />
          </div>

          {/* Charts Row */}
          <div className="charts-grid" style={{ marginBottom: '32px' }}>
            <div className="chart-card chart-span-2">
              <h3 className="chart-title">Content Addition Trends</h3>
              <TrendChart data={trends} />
            </div>
            
            <div className="chart-card">
              <h3 className="chart-title">Content Distribution</h3>
              <TypeDistributionChart data={distribution?.typeSplit || []} />
            </div>
            
            <div className="chart-card">
              <h3 className="chart-title">Top 5 Ratings</h3>
              <RatingBarChart data={distribution?.ratings || []} />
            </div>
          </div>

          {/* Data Table */}
          <div className="table-section">
            <ContentTable 
              data={tableData.data} 
              page={tableData.page} 
              totalPages={tableData.totalPages} 
              onPageChange={handlePageChange}
              isLoading={false} // Table loading handled globally now
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
