const express = require('express');
const router = express.Router();
const { 
    getKPIs, 
    getDistribution, 
    getTrends, 
    getRawData, 
    getFilterOptions, 
    getInsights 
} = require('../services/dataService');

router.get('/options', (req, res) => {
    try {
        res.json(getFilterOptions());
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch options' });
    }
});

router.get('/insights', (req, res) => {
    try {
        res.json(getInsights(req.query));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

router.get('/kpis', (req, res) => {
  try {
    const kpis = getKPIs(req.query);
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

router.get('/charts/distribution', (req, res) => {
  try {
    const dist = getDistribution(req.query);
    res.json(dist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch distribution metrics' });
  }
});

router.get('/charts/trends', (req, res) => {
  try {
    const trends = getTrends(req.query);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends data' });
  }
});

router.get('/table', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // table also respects filters
    const data = getRawData(req.query);
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedData = data.slice(startIndex, endIndex);
    
    res.json({
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit) || 1,
      data: paginatedData
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

module.exports = router;
