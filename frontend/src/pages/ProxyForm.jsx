import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proxyAPI } from '../services/api';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const ProxyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    type: 'http',
    username: '',
    password: '',
    country: '',
    expirationDate: null,
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchProxy();
    }
  }, [id]);

  const fetchProxy = async () => {
    try {
      setLoading(true);
      const response = await proxyAPI.getProxy(id);
      const proxy = response.data;
      
      setFormData({
        host: proxy.host || '',
        port: proxy.port || '',
        type: proxy.type || 'http',
        username: proxy.username || '',
        password: proxy.password || '',
        country: proxy.country || '',
        expirationDate: proxy.expirationDate ? new Date(proxy.expirationDate) : null,
        notes: proxy.notes || ''
      });
    } catch (error) {
      console.error('Error fetching proxy:', error);
      setError('Failed to load proxy data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.host) newErrors.host = 'Host is required';
    if (!formData.port) {
      newErrors.port = 'Port is required';
    } else if (!/^\d+$/.test(formData.port) || parseInt(formData.port) < 1 || parseInt(formData.port) > 65535) {
      newErrors.port = 'Port must be a number between 1-65535';
    }
    
    if (formData.username && !formData.password) {
      newErrors.password = 'Password is required when username is provided';
    }
    
    if (formData.password && !formData.username) {
      newErrors.username = 'Username is required when password is provided';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      expirationDate: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const payload = {
        ...formData,
        port: parseInt(formData.port)
      };
      
      if (isEditMode) {
        await proxyAPI.updateProxy(id, payload);
        setSuccess('Proxy updated successfully');
      } else {
        await proxyAPI.createProxy(payload);
        setSuccess('Proxy created successfully');
        // Reset form in create mode
        if (!isEditMode) {
          setFormData({
            host: '',
            port: '',
            type: 'http',
            username: '',
            password: '',
            country: '',
            expirationDate: null,
            notes: ''
          });
        }
      }
      
      // Navigate back after a short delay in edit mode
      if (isEditMode) {
        setTimeout(() => {
          navigate('/proxies');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving proxy:', error);
      setError(error.response?.data?.message || 'Failed to save proxy. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            {isEditMode ? 'Edit Proxy' : 'Add New Proxy'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Host"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  error={Boolean(errors.host)}
                  helperText={errors.host}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Port"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  error={Boolean(errors.port)}
                  helperText={errors.port}
                  required
                  margin="normal"
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type"
                  >
                    <MenuItem value="http">HTTP</MenuItem>
                    <MenuItem value="https">HTTPS</MenuItem>
                    <MenuItem value="socks4">SOCKS4</MenuItem>
                    <MenuItem value="socks5">SOCKS5</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  margin="normal"
                  placeholder="e.g. US, JP, DE"
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={Boolean(errors.username)}
                  helperText={errors.username}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Expiration Date (Optional)"
                    value={formData.expirationDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        helperText="Leave blank if no expiration date"
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/proxies')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} />
                  ) : isEditMode ? (
                    'Update Proxy'
                  ) : (
                    'Create Proxy'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProxyForm; 