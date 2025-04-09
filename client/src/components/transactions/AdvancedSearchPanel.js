import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  IconButton,
  Chip,
  MenuItem,
  Collapse,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Slider,
  useTheme,
  Tooltip,
  Switch
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HistoryIcon from '@mui/icons-material/History';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Advanced search component for transactions with multiple filter options
 */
const AdvancedSearchPanel = ({ onSearch, initialFilters = {} }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get categories, tags, and saved searches from Redux store
  const { categories } = useSelector(state => state.category);
  
  // State for search filters
  const [filters, setFilters] = useState({
    searchText: '',
    startDate: subMonths(startOfMonth(new Date()), 2),
    endDate: endOfMonth(new Date()),
    categories: [],
    types: [],
    amountRange: [0, 5000],
    tags: [],
    includeNotes: true,
    savedSearchId: null,
    ...initialFilters
  });
  
  // UI State
  const [expanded, setExpanded] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Load saved searches from localStorage on component mount
  useEffect(() => {
    const savedSearchesJson = localStorage.getItem('savedTransactionSearches');
    if (savedSearchesJson) {
      try {
        const parsedSearches = JSON.parse(savedSearchesJson);
        setSavedSearches(parsedSearches);
      } catch (e) {
        console.error('Error parsing saved searches', e);
      }
    }
    
    const recentSearchesJson = localStorage.getItem('recentTransactionSearches');
    if (recentSearchesJson) {
      try {
        const parsedRecent = JSON.parse(recentSearchesJson);
        setRecentSearches(parsedRecent);
      } catch (e) {
        console.error('Error parsing recent searches', e);
      }
    }
  }, []);
  
  // Handle changes to filter fields
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // Handle text search change
  const handleSearchTextChange = (e) => {
    handleFilterChange('searchText', e.target.value);
  };
  
  // Handle amount range change
  const handleAmountRangeChange = (event, newValue) => {
    handleFilterChange('amountRange', newValue);
  };
  
  // Handle toggling a category
  const handleToggleCategory = (categoryId) => {
    const currentCategories = [...filters.categories];
    const index = currentCategories.indexOf(categoryId);
    
    if (index === -1) {
      currentCategories.push(categoryId);
    } else {
      currentCategories.splice(index, 1);
    }
    
    handleFilterChange('categories', currentCategories);
  };
  
  // Handle toggling a transaction type
  const handleToggleType = (type) => {
    const currentTypes = [...filters.types];
    const index = currentTypes.indexOf(type);
    
    if (index === -1) {
      currentTypes.push(type);
    } else {
      currentTypes.splice(index, 1);
    }
    
    handleFilterChange('types', currentTypes);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      searchText: '',
      startDate: subMonths(startOfMonth(new Date()), 2),
      endDate: endOfMonth(new Date()),
      categories: [],
      types: [],
      amountRange: [0, 5000],
      tags: [],
      includeNotes: true,
      savedSearchId: null
    });
  };
  
  // Save current search
  const handleSaveSearch = () => {
    const searchName = prompt('Enter a name for this search:');
    if (!searchName) return;
    
    const newSavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: { ...filters }
    };
    
    const updatedSavedSearches = [...savedSearches, newSavedSearch];
    setSavedSearches(updatedSavedSearches);
    
    // Save to localStorage
    localStorage.setItem('savedTransactionSearches', JSON.stringify(updatedSavedSearches));
    
    // Set as current search
    setFilters({
      ...filters,
      savedSearchId: newSavedSearch.id
    });
  };
  
  // Load saved search
  const handleLoadSavedSearch = (savedSearchId) => {
    const savedSearch = savedSearches.find(search => search.id === savedSearchId);
    if (savedSearch) {
      setFilters({
        ...savedSearch.filters,
        savedSearchId
      });
    }
  };
  
  // Delete saved search
  const handleDeleteSavedSearch = (e, savedSearchId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved search?')) return;
    
    const updatedSavedSearches = savedSearches.filter(search => search.id !== savedSearchId);
    setSavedSearches(updatedSavedSearches);
    
    // Save to localStorage
    localStorage.setItem('savedTransactionSearches', JSON.stringify(updatedSavedSearches));
    
    // Reset current savedSearchId if it was the deleted one
    if (filters.savedSearchId === savedSearchId) {
      setFilters({
        ...filters,
        savedSearchId: null
      });
    }
  };
  
  // Execute search
  const executeSearch = () => {
    // Save to recent searches
    const recentSearch = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      filters: { ...filters }
    };
    
    const updatedRecentSearches = [recentSearch, ...recentSearches.slice(0, 4)];
    setRecentSearches(updatedRecentSearches);
    
    // Save to localStorage
    localStorage.setItem('recentTransactionSearches', JSON.stringify(updatedRecentSearches));
    
    // Call the onSearch callback with the current filters
    onSearch(filters);
  };
  
  // Function to check if any filter is active
  const hasActiveFilters = () => {
    return (
      filters.searchText !== '' ||
      filters.categories.length > 0 ||
      filters.types.length > 0 ||
      filters.tags.length > 0 ||
      filters.amountRange[0] > 0 ||
      filters.amountRange[1] < 5000 ||
      !filters.includeNotes
    );
  };
  
  // Format amount for display
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mb: 3, 
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'all 0.3s ease'
      }}
    >
      {/* Basic Search Bar */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              value={filters.searchText}
              onChange={handleSearchTextChange}
              placeholder="Search transactions"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: filters.searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange('searchText', '')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  executeSearch();
                }
              }}
            />
          </Grid>
          
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={executeSearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
          
          <Grid item>
            <Tooltip title={expanded ? "Hide filters" : "Show more filters"}>
              <IconButton 
                color={expanded || hasActiveFilters() ? "primary" : "default"}
                onClick={() => setExpanded(!expanded)}
                size="small"
              >
                <FilterListIcon />
                {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        
        {/* Active filter chips */}
        {hasActiveFilters() && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.searchText && (
              <Chip
                label={`Text: ${filters.searchText}`}
                size="small"
                onDelete={() => handleFilterChange('searchText', '')}
              />
            )}
            
            {filters.categories.map(categoryId => {
              const category = categories.find(c => c._id === categoryId);
              return (
                <Chip
                  key={categoryId}
                  label={`Category: ${category ? category.name : 'Unknown'}`}
                  size="small"
                  onDelete={() => handleToggleCategory(categoryId)}
                  sx={{
                    bgcolor: category?.color ? `${category.color}30` : undefined
                  }}
                />
              );
            })}
            
            {filters.types.map(type => (
              <Chip
                key={type}
                label={`Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                size="small"
                onDelete={() => handleToggleType(type)}
                color={type === 'income' ? 'success' : 'error'}
                variant="outlined"
              />
            ))}
            
            {(filters.amountRange[0] > 0 || filters.amountRange[1] < 5000) && (
              <Chip
                label={`Amount: ${formatAmount(filters.amountRange[0])} - ${formatAmount(filters.amountRange[1])}`}
                size="small"
                onDelete={() => handleFilterChange('amountRange', [0, 5000])}
              />
            )}
            
            {filters.tags.map(tag => (
              <Chip
                key={tag}
                label={`Tag: ${tag}`}
                size="small"
                onDelete={() => {
                  const newTags = filters.tags.filter(t => t !== tag);
                  handleFilterChange('tags', newTags);
                }}
              />
            ))}
            
            <Button
              size="small"
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Advanced filters panel */}
      <Collapse in={expanded}>
        <Divider />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Date Range */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Date Range
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="From"
                      value={filters.startDate}
                      onChange={(newValue) => handleFilterChange('startDate', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="To"
                      value={filters.endDate}
                      onChange={(newValue) => handleFilterChange('endDate', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Amount Range */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Amount Range: {formatAmount(filters.amountRange[0])} - {formatAmount(filters.amountRange[1])}
                </Typography>
                <Slider
                  value={filters.amountRange}
                  onChange={handleAmountRangeChange}
                  min={0}
                  max={5000}
                  step={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatAmount(value)}
                />
              </Grid>
              
              {/* Transaction Types */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Transaction Type
                </Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.types.includes('income')}
                        onChange={() => handleToggleType('income')}
                        color="success"
                      />
                    }
                    label="Income"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.types.includes('expense')}
                        onChange={() => handleToggleType('expense')}
                        color="error"
                      />
                    }
                    label="Expense"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.types.includes('transfer')}
                        onChange={() => handleToggleType('transfer')}
                        color="info"
                      />
                    }
                    label="Transfer"
                  />
                </FormGroup>
              </Grid>
              
              {/* Search Settings */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Search Settings
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.includeNotes}
                        onChange={(e) => handleFilterChange('includeNotes', e.target.checked)}
                      />
                    }
                    label="Include notes in search"
                  />
                </FormGroup>
              </Grid>
              
              {/* Categories */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Categories ({filters.categories.length} selected)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories?.map(category => (
                    <Chip
                      key={category._id}
                      label={category.name}
                      onClick={() => handleToggleCategory(category._id)}
                      color={filters.categories.includes(category._id) ? 'primary' : 'default'}
                      variant={filters.categories.includes(category._id) ? 'filled' : 'outlined'}
                      sx={{
                        bgcolor: filters.categories.includes(category._id) && category.color
                          ? `${category.color}30`
                          : undefined
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              
              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Saved Searches
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {savedSearches.map(savedSearch => (
                      <Chip
                        key={savedSearch.id}
                        label={savedSearch.name}
                        onClick={() => handleLoadSavedSearch(savedSearch.id)}
                        onDelete={(e) => handleDeleteSavedSearch(e, savedSearch.id)}
                        color={filters.savedSearchId === savedSearch.id ? 'primary' : 'default'}
                        variant={filters.savedSearchId === savedSearch.id ? 'filled' : 'outlined'}
                        icon={filters.savedSearchId === savedSearch.id ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Searches
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {recentSearches.map(recentSearch => (
                      <Chip
                        key={recentSearch.id}
                        label={
                          recentSearch.filters.searchText || 
                          format(new Date(recentSearch.timestamp), 'MMM d, h:mm a')
                        }
                        onClick={() => setFilters(recentSearch.filters)}
                        icon={<HistoryIcon />}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
            
            {/* Action buttons */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
              
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSearch}
                  sx={{ mr: 1 }}
                >
                  Save Search
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  onClick={executeSearch}
                >
                  Search
                </Button>
              </Box>
            </Box>
          </Box>
        </LocalizationProvider>
      </Collapse>
    </Paper>
  );
};

export default AdvancedSearchPanel;