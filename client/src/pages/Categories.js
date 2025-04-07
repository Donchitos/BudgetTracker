import React from 'react';
import { Box, Typography } from '@mui/material';
import CategoryList from '../components/categories/CategoryList';

const Categories = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Categories
      </Typography>
      <Typography variant="body1" paragraph>
        Create and manage your expense categories to better organize your spending.
        You can set monthly budgets for each category to help track your spending goals.
      </Typography>
      
      <CategoryList />
    </Box>
  );
};

export default Categories;