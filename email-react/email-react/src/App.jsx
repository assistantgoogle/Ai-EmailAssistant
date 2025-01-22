import React, { useState } from 'react';
import axios from 'axios'; // Ensure axios is imported
import './App.css';
import {
  Container,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material'; // Importing Material-UI components
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async () => {
    if (!emailContent) {
      setError("Email content is required");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      console.log("Sending data to backend:", { emailContent, tone });
      const response = await axios.post("http://localhost:8089/api/email/generate", {
        emailContent,
        tone,
      });
      console.log("Response received:", response);
      setGeneratedReply(
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Error occurred:", error);
      setError(error.response?.data?.message || "Failed to generate email reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h3" component="h1" gutterBottom>
            Email Reply Generator
          </Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={handleThemeChange} />}
            label="Dark Mode"
          />
        </Box>

        <Box sx={{ mx: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Original Email Content"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mb: 2 }}
            error={Boolean(error)}
            helperText={error}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tone-select-label">Tone (optional)</InputLabel>
            <Select
              labelId="tone-select-label"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              label="Tone (optional)"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!emailContent || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Generate Reply"}
          </Button>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {generatedReply && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                Generated Reply:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={generatedReply || ''}
                slotProps={{ htmlInput: { readOnly: true } }}
              />
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigator.clipboard.writeText(generatedReply)}
              >
                Copy to Clipboard
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;