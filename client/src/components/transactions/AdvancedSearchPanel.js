import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  InputAdornment,
  IconButton,
  Collapse,
  Divider,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useSelector } from 'react-redux';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const AdvancedSearchPanel = ({ onSearch, initialFilters = null }) => {
  const { categories } = useSelector(state => state.categories);
  const { transactions } = useSelector(state => state.transactions);
  
  // Extract unique subcategories and tags from transactions
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  
  const [expanded, setExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  
  // Search filters state
  const [filters, setFilters] = useState({
    searchText: '',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    type: '',
    categories: [],
    subcategories: [],
    tags: [],
    amountMin: '',
    amountMax: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  // Initialize with provided filters if any
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));
    }
  }, [initialFilters]);
  
  // Load saved filters from localStorage
  useEffect(() => {
    const savedFiltersData = localStorage.getItem('savedTransactionFilters');
    if (savedFiltersData) {
      try {
        const parsedFilters = JSON.parse(savedFiltersData);
        setSavedFilters(parsedFilters);
      } catch (err) {
        console.error('Error loading saved filters:', err);
      }
    }
  }, []);
  
  // Extract unique subcategories and tags from transactions
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Extract subcategories
      const subcats = transactions
        .filter(t => t.subcategory)
        .map(t => t.subcategory);
      setSubcategoryOptions([...new Set(subcats)]);
      
      // Extract tags
      const allTags = transactions.reduce((tags, t) => {
        if (t.tags && t.tags.length > 0) {
          return [...tags, ...t.tags];
        }
        return tags;
      }, []);
      setTagOptions([...new Set(allTags)]);
    }
  }, [transactions]);
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Apply search filters
  const handleSearch = () => {
    // Prepare filters for the API
    const searchParams = {
      ...filters
    };
    
    // Handle date conversion
    if (searchParams.startDate) {
      searchParams.startDate = format(searchParams.startDate, 'yyyy-MM-dd');
    }
    
    if (searchParams.endDate) {
      searchParams.endDate = format(searchParams.endDate, 'yyyy-MM-dd');
    }
    
    // Convert arrays to comma-separated strings
    if (searchParams.categories && searchParams.categories.length > 0) {
      searchParams.categories = searchParams.categories.join(',');
    } else {
      delete searchParams.categories;
    }
    
    if (searchParams.subcategories && searchParams.subcategories.length > 0) {
      searchParams.subcategories = searchParams.subcategories.join(',');
    } else {
      delete searchParams.subcategories;
    }
    
    if (searchParams.tags && searchParams.tags.length > 0) {
      searchParams.tags = searchParams.tags.join(',');
    } else {
      delete searchParams.tags;
    }
    
    // Handle empty values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === '' || searchParams[key] === null) {
        delete searchParams[key];
      }
    });
    
    // Add sorting
    if (searchParams.sortBy && searchParams.sortOrder) {
      searchParams.sortBy = `${searchParams.sortBy}:${searchParams.sortOrder}`;
      delete searchParams.sortOrder;
    }
    
    onSearch(searchParams);
  };
  
  // Reset filters
  const handleReset = () => {
    setFilters({
      searchText: '',
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      type: '',
      categories: [],
      subcategories: [],
      tags: [],
      amountMin: '',
      amountMax: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };
  
  // Save current filters
  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    
    const newSavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: { ...filters }
    };
    
    const updatedFilters = [...savedFilters, newSavedFilter];
    setSavedFilters(updatedFilters);
    
    // Save to localStorage
    localStorage.setItem('savedTransactionFilters', JSON.stringify(updatedFilters));
    
    // Reset dialog
    setFilterName('');
    setSaveFilterDialogOpen(false);
  };
  
  // Apply saved filter
  const handleApplySavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    
    // Apply the search immediately
    onSearch(savedFilter.filters);
  };
  
  // Delete saved filter
  const handleDeleteSavedFilter = (filterId) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updatedFilters);
    
    // Update localStorage
    localStorage.setItem('savedTransactionFilters', JSON.stringify(updatedFilters));
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Search Transactions</Typography>
        <Button
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Less Filters' : 'More Filters'}
        </Button>
      </Box>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Basic search always visible */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Search"
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            placeholder="Search in descriptions and notes"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.searchText && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleFilterChange('searchText', '')}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              label="Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              fullWidth
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          </Stack>
        </Grid>
      </Grid>
      
      {/* Expanded filters */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={filters.startDate}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={categories}
                getOptionLabel={(option) => option.name}
                value={categories.filter(cat => 
                  filters.categories.includes(cat._id)
                )}
                onChange={(event, newValue) => {
                  handleFilterChange('categories', newValue.map(cat => cat._id));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option._id}
                      label={option.name}
                      {...getTagProps({ index })}
                      style={{ backgroundColor: option.color }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categories"
                    placeholder="Select Categories"
                  />
                )}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                freeSolo
                options={subcategoryOptions}
                value={filters.subcategories}
                onChange={(event, newValue) => {
                  handleFilterChange('subcategories', newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subcategories"
                    placeholder="Select Subcategories"
                  />
                )}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={tagOptions}
                value={filters.tags}
                onChange={(event, newValue) => {
                  handleFilterChange('tags', newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Filter by Tags"
                  />
                )}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Minimum Amount"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Maximum Amount"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                  <MenuItem value="description">Description</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  label="Sort Order"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setSaveFilterDialogOpen(true)}
            >
              Save Filter
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Apply Filters
            </Button>
          </Box>
          
          {/* Saved Filters Section */}
          {savedFilters.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Saved Filters
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {savedFilters.map(filter => (
                  <Chip
                    key={filter.id}
                    label={filter.name}
                    icon={<BookmarkIcon />}
                    onClick={() => handleApplySavedFilter(filter)}
                    onDelete={() => handleDeleteSavedFilter(filter.id)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Save Filter Dialog */}
          {saveFilterDialogOpen && (
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Save Current Filter
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Filter Name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  fullWidth
                  size="small"
                  autoFocus
                />
                
                <Button
                  variant="contained"
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim()}
                >
                  Save
                </Button>
                
                <Button
                  variant="text"
                  onClick={() => setSaveFilterDialogOpen(false)}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdvancedSearchPanel;