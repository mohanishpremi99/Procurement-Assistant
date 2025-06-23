import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Custom component to handle different types of formatted content including tables
const FormattedMessage = ({ content, colors }) => {
  // Parse the content to identify tables and other formatted elements
  const parseContent = () => {
    if (!content) return null;

    // Split content by lines to process
    const lines = content.split('\n');
    const elements = [];
    let currentTableRows = [];
    let inTable = false;
    let currentParagraph = '';
    let currentList = [];
    let inList = false;
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for table rows (lines containing multiple | characters)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        // If we were building a paragraph, add it before starting table
        if (currentParagraph) {
          elements.push(
            <Typography 
              key={key++} 
              variant="body1" 
              sx={{ mb: 1.5, lineHeight: 1.6, textAlign: 'left' }}
              dangerouslySetInnerHTML={{ __html: formatText(currentParagraph) }}
            />
          );
          currentParagraph = '';
        }
        
        // If we were building a list, add it before starting table
        if (inList && currentList.length > 0) {
          elements.push(
            <Box component="ul" key={key++} sx={{ pl: 2, mb: 1.5 }}>
              {currentList.map((item, idx) => (
                <Typography 
                  component="li" 
                  key={idx} 
                  variant="body1" 
                  sx={{ mb: 0.5, textAlign: 'left' }}
                  dangerouslySetInnerHTML={{ __html: formatText(item) }}
                />
              ))}
            </Box>
          );
          currentList = [];
          inList = false;
        }

        if (!inTable) {
          inTable = true;
        }
        
        // Add row to the current table
        currentTableRows.push(line);
      } 
      // End of table, render it
      else if (inTable) {
        elements.push(renderTable(currentTableRows, key++, colors));
        currentTableRows = [];
        inTable = false;
        
        // If the current line is not empty, start a new paragraph
        if (line.trim()) {
          currentParagraph = line;
        }
      }
      // Check for bullet list items
      else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        // If we were building a paragraph, add it before starting list
        if (currentParagraph) {
          elements.push(
            <Typography 
              key={key++} 
              variant="body1" 
              sx={{ mb: 1.5, lineHeight: 1.6, textAlign: 'left' }}
              dangerouslySetInnerHTML={{ __html: formatText(currentParagraph) }}
            />
          );
          currentParagraph = '';
        }
        
        inList = true;
        currentList.push(line.trim().substring(1).trim());
      }
      // Handle regular paragraphs
      else {
        // If we were building a list, add it before starting paragraph
        if (inList && currentList.length > 0) {
          elements.push(
            <Box component="ul" key={key++} sx={{ pl: 2, mb: 1.5 }}>
              {currentList.map((item, idx) => (
                <Typography 
                  component="li" 
                  key={idx} 
                  variant="body1" 
                  sx={{ mb: 0.5, textAlign: 'left' }}
                  dangerouslySetInnerHTML={{ __html: formatText(item) }}
                />
              ))}
            </Box>
          );
          currentList = [];
          inList = false;
        }
        
        // Empty line - end paragraph
        if (!line.trim()) {
          if (currentParagraph) {
            elements.push(
              <Typography 
                key={key++} 
                variant="body1" 
                sx={{ mb: 1.5, lineHeight: 1.6, textAlign: 'left' }}
                dangerouslySetInnerHTML={{ __html: formatText(currentParagraph) }}
              />
            );
            currentParagraph = '';
          } else {
            // Add extra spacing between sections
            elements.push(<Box key={key++} sx={{ height: '0.5rem' }} />);
          }
        } 
        // Part of a paragraph
        else {
          currentParagraph = currentParagraph 
            ? `${currentParagraph} ${line}` 
            : line;
        }
      }
    }

    // Add any remaining elements
    if (inTable && currentTableRows.length > 0) {
      elements.push(renderTable(currentTableRows, key++, colors));
    }
    
    if (currentParagraph) {
      elements.push(
        <Typography 
          key={key++} 
          variant="body1" 
          sx={{ mb: 1.5, lineHeight: 1.6, textAlign: 'left' }}
          dangerouslySetInnerHTML={{ __html: formatText(currentParagraph) }}
        />
      );
    }
    
    if (inList && currentList.length > 0) {
      elements.push(
        <Box component="ul" key={key++} sx={{ pl: 2, mb: 1.5 }}>
          {currentList.map((item, idx) => (
            <Typography 
              component="li" 
              key={idx} 
              variant="body1" 
              sx={{ mb: 0.5, textAlign: 'left' }}
              dangerouslySetInnerHTML={{ __html: formatText(item) }}
            />
          ))}
        </Box>
      );
    }

    return elements;
  };

  // Format text with bold, italic, etc.
  const formatText = (text) => {
    if (!text) return '';
    
    // Replace **bold** with <strong>bold</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace *italic* with <em>italic</em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return formatted;
  };

  // Render a table from rows
  const renderTable = (tableRows, key, colors) => {
    if (tableRows.length < 2) return null;

    // Parse header row
    const headerCells = tableRows[0].split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim());
    
    // Parse divider row to determine alignment (skip)
    
    // Parse data rows
    const dataRows = [];
    for (let i = 2; i < tableRows.length; i++) {
      const cells = tableRows[i].split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim());
      
      if (cells.length > 0) {
        dataRows.push(cells);
      }
    }

    return (
      <TableContainer 
        component={Paper} 
        key={key} 
        sx={{ 
          mb: 2, 
          boxShadow: 'none', 
          borderRadius: '10px',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <Table size="small" sx={{ minWidth: 300 }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              '& th': { 
                borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
                fontWeight: 600 
              }
            }}>
              {headerCells.map((cell, index) => (
                <TableCell 
                  key={index} 
                  align="left" 
                  sx={{ 
                    color: colors ? colors.accent : 'inherit',
                    fontSize: '0.8rem',
                    padding: 1.5
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ fontWeight: 600, textAlign: 'left' }}
                    dangerouslySetInnerHTML={{ __html: formatText(cell) }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataRows.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                sx={{ 
                  '&:nth-of-type(even)': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                  },
                  '&:hover': { 
                    backgroundColor: 'rgba(52, 152, 219, 0.08)'
                  },
                  '& td': { 
                    borderBottom: rowIndex === dataRows.length - 1 ? 'none' : `1px solid rgba(255, 255, 255, 0.05)` 
                  }
                }}
              >
                {row.map((cell, cellIndex) => (
                  <TableCell 
                    key={cellIndex} 
                    align="left" 
                    sx={{ 
                      color: colors ? colors.text : 'inherit',
                      fontSize: '0.8rem',
                      padding: 1
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ textAlign: 'left' }}
                      dangerouslySetInnerHTML={{ __html: formatText(cell) }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return <Box sx={{ width: '100%' }}>{parseContent()}</Box>;
};

export default FormattedMessage;