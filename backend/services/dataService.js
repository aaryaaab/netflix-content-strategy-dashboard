const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let cachedData = [];
let globalMaxYear = 0;

const loadData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, '..', 'data', 'netflix_titles.csv');
    
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`Dataset not found at ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        if (!data.type) return;

        let yearFromRelease = parseInt(data.release_year, 10);
        let yearAdded = yearFromRelease;
        
        if (data.date_added) {
            const parts = data.date_added.split(',');
            if (parts.length > 1) {
                const parsedYear = parseInt(parts[parts.length - 1].trim(), 10);
                if (!isNaN(parsedYear)) {
                    yearAdded = parsedYear;
                }
            }
        }

        if (isNaN(yearAdded)) {
            yearAdded = yearFromRelease;
        }

        if (isNaN(yearAdded)) return; // Skip invalid

        if (yearAdded > globalMaxYear && yearAdded <= new Date().getFullYear() + 1) {
             globalMaxYear = yearAdded;
        }

        const genres = data.listed_in ? data.listed_in.split(',').map(g => g.trim()) : [];

        results.push({
          show_id: data.show_id,
          type: data.type.trim(),
          title: data.title ? data.title.trim() : 'Unknown',
          director: data.director || '',
          cast: data.cast || '',
          country: data.country || '',
          date_added: data.date_added || '',
          added_year: yearAdded,
          release_year: yearFromRelease,
          rating: data.rating || 'Unrated',
          duration: data.duration || '',
          listed_in: genres,
          description: data.description || ''
        });
      })
      .on('end', () => {
        cachedData = results;
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const getFilterOptions = () => {
    const types = new Set();
    const years = new Set();
    const genres = new Set();

    cachedData.forEach(item => {
        types.add(item.type);
        if (!isNaN(item.added_year)) years.add(item.added_year);
        item.listed_in.forEach(g => genres.add(g));
    });

    return {
        types: Array.from(types).sort(),
        years: Array.from(years).sort((a,b) => b - a),
        genres: Array.from(genres).sort()
    };
};

const applyFilters = (filters) => {
    return cachedData.filter(item => {
        if (filters.type && filters.type !== 'All' && item.type !== filters.type) return false;
        if (filters.year && filters.year !== 'All' && item.added_year !== parseInt(filters.year, 10)) return false;
        if (filters.genre && filters.genre !== 'All' && !item.listed_in.includes(filters.genre)) return false;
        return true;
    });
};

const getRawData = (filters) => applyFilters(filters);

const getKPIs = (filters) => {
  const filteredData = applyFilters(filters);
  const baseData = applyFilters({ ...filters, year: 'All' }); // we need un-year-filtered data to calculate YoY relative to selected year

  const explicitYear = filters.year && filters.year !== 'All' ? parseInt(filters.year, 10) : globalMaxYear;
  const currentYear = explicitYear;
  const previousYear = currentYear - 1;

  let totalContent = filteredData.length;
  let totalMovies = 0;
  let totalTVShows = 0;

  filteredData.forEach(item => {
    if (item.type === 'Movie') totalMovies++;
    if (item.type === 'TV Show') totalTVShows++;
  });

  let contentAddedCurrentYear = 0;
  let contentAddedPreviousYear = 0;

  baseData.forEach(item => {
      if (item.added_year === currentYear) contentAddedCurrentYear++;
      if (item.added_year === previousYear) contentAddedPreviousYear++;
  });

  const getYoY = (current, previous) => {
    if (previous === 0 && current === 0) return { value: 'N/A', trend: 'flat' };
    if (previous === 0) return { value: 100, trend: 'up' };
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    return {
      value: Math.abs(percentage),
      trend: diff >= 0 ? 'up' : 'down'
    };
  };

  const additionsYoY = getYoY(contentAddedCurrentYear, contentAddedPreviousYear);
  if (additionsYoY.value === 'N/A') additionsYoY.trend = 'flat';

  return {
    totalContent,
    totalMovies,
    totalTVShows,
    currentYear,
    contentAddedCurrentYear,
    additionsYoY
  };
};

const getDistribution = (filters) => {
  const filteredData = applyFilters(filters);
  let movies = 0;
  let tvShows = 0;
  const ratingsMap = {};

  filteredData.forEach(item => {
    if (item.type === 'Movie') movies++;
    if (item.type === 'TV Show') tvShows++;

    const rating = item.rating || 'Unrated';
    ratingsMap[rating] = (ratingsMap[rating] || 0) + 1;
  });

  const ratings = Object.keys(ratingsMap).map(k => ({
    name: k,
    value: ratingsMap[k]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  return {
    typeSplit: [
      { name: 'Movies', value: movies },
      { name: 'TV Shows', value: tvShows }
    ],
    ratings
  };
};

const getTrends = (filters) => {
   // To show a trend line, we should ignore the precise "year" filter 
   // otherwise the chart just shows 1 point. We show the trend for the applied Type & Genre.
   const trendFilters = { ...filters, year: 'All' };
   const trendDataList = applyFilters(trendFilters);

   const yearMap = {};
   trendDataList.forEach(item => {
        if (item.added_year > 2000 && item.added_year <= globalMaxYear) {
           yearMap[item.added_year] = (yearMap[item.added_year] || 0) + 1;
        }
   });

   return Object.keys(yearMap).sort().map(year => ({
       year: year,
       count: yearMap[year]
   }));
};

const getInsights = (filters) => {
    const data = applyFilters(filters);
    const trendFilters = { ...filters, year: 'All' };
    const allTimeData = applyFilters(trendFilters);
    
    if (data.length === 0) return { insights: ["Insufficient data for insights."], recommendations: [] };

    const insights = [];
    const recommendations = [];

    // 1. Dominant Genre
    const genreCounts = {};
    data.forEach(d => {
        d.listed_in.forEach(g => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
    });
    let dominantGenre = '';
    let maxGenreCount = 0;
    for (const [g, count] of Object.entries(genreCounts)) {
        if (count > maxGenreCount) {
            maxGenreCount = count;
            dominantGenre = g;
        }
    }
    if (dominantGenre) {
        insights.push({
            title: "Dominant Genre",
            description: `${dominantGenre} dominates this segment, accounting for a significant portion of the catalog.`
        });
    }

    // 2. Movie vs TV Show Ratio
    let movies = 0; let tvs = 0;
    data.forEach(d => d.type === 'Movie' ? movies++ : tvs++);
    if (tvs > 0 && movies > 0) {
        const ratio = (movies / tvs).toFixed(1);
        insights.push({
            title: "Content Mix",
            description: `There are approximately ${ratio}x more Movies than TV Shows in this selection.`
        });
    } else if (tvs === 0 && movies > 0) {
        insights.push({ title: "Content Mix", description: "This segment consists entirely of Movies." });
    } else if (movies === 0 && tvs > 0) {
        insights.push({ title: "Content Mix", description: "This segment consists entirely of TV Shows." });
    }

    // 3. Year with highest additions
    const yearCounts = {};
    allTimeData.forEach(d => {
        if (!isNaN(d.added_year)) {
            yearCounts[d.added_year] = (yearCounts[d.added_year] || 0) + 1;
        }
    });
    let peakYear = '';
    let peakCount = 0;
    for (const [y, count] of Object.entries(yearCounts)) {
        if (count > peakCount) {
            peakCount = count;
            peakYear = y;
        }
    }
    if (peakYear) {
        insights.push({
            title: "Peak Additions Year",
            description: `Historically, ${peakYear} saw the highest number of newly added titles (${peakCount} additions) for this segment.`
        });
    }

    // 4. Fastest growing content type (recent 3 years)
    const recentYearsData = allTimeData.filter(d => d.added_year >= globalMaxYear - 2);
    let recentMovies = 0; let recentTvs = 0;
    recentYearsData.forEach(d => d.type === 'Movie' ? recentMovies++ : recentTvs++);
    const totalRecent = recentMovies + recentTvs;
    
    if (totalRecent > 0 && (!filters.type || filters.type === 'All')) {
        const movieRecentPct = (recentMovies / totalRecent) * 100;
        const tvRecentPct = (recentTvs / totalRecent) * 100;
        let fastestGrowing = '';
        if (tvRecentPct > (tvs / (movies+tvs)) * 100 + 5) {
            // TV shows are growing faster recently than historical avg
            fastestGrowing = 'TV Shows';
        } else if (movieRecentPct > (movies / (movies+tvs)) * 100 + 5) {
            fastestGrowing = 'Movies';
        }

        if (fastestGrowing) {
            insights.push({
                title: "Fastest Growing Format",
                description: `In recent years, ${fastestGrowing} have shown accelerated growth compared to historical averages.`
            });
        }
    }

    // Recommendations Generation
    if (tvs > 0 && movies > tvs * 2 && (!filters.type || filters.type === 'All')) {
        recommendations.push("Consider investing heavily in TV Shows. The catalog is heavily skewed towards Movies, but industry trends show strong retention for serialised content.");
    }
    
    if (dominantGenre === 'Documentaries' || dominantGenre === 'International Movies') {
         recommendations.push(`Double down on regional and factual content. ${dominantGenre} proves to be a reliable volume driver.`);
    }

    if (peakYear && parseInt(peakYear) < globalMaxYear - 2) {
         recommendations.push("Content acquisition has slowed down compared to peak years. Evaluate if the current content volume is sufficient for subscriber growth.");
    }

    if (recommendations.length === 0) {
        recommendations.push("Maintain current investment strategy while monitoring viewer engagement metrics across these segments.");
    }

    return {
        insights,
        recommendations
    };
};

module.exports = {
  loadData,
  getFilterOptions,
  getRawData,
  getKPIs,
  getDistribution,
  getTrends,
  getInsights
};
