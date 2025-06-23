import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
// import RefreshIcon from '@mui/icons-material/Refresh';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    TextField,
    IconButton,
    Box,
    Paper,
    Avatar,
    CircularProgress,
    Fade,
    useTheme,
    Divider,
    Slider,
    Button,
    Menu,
    MenuItem,
    ListItemText
} from "@mui/material";
import FormattedMessage from '../components/FormattedMessage';

export const ProcurementAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [userId, setUserId] = useState(`user-${Math.random().toString(36).substring(2, 15)}`);
    const [showLaptopForm, setShowLaptopForm] = useState(false);
    const messagesEndRef = useRef(null);
    const theme = useTheme();
    
    const [laptopTypeMenuAnchor, setLaptopTypeMenuAnchor] = useState(null);
    const [processorTypeMenuAnchor, setProcessorTypeMenuAnchor] = useState(null);
    const [displayQualityMenuAnchor, setDisplayQualityMenuAnchor] = useState(null);
    const [graphicsMenuAnchor, setGraphicsMenuAnchor] = useState(null);
    const [currencyMenuAnchor, setCurrencyMenuAnchor] = useState(null);
    
    const colors = {
        primary: "#1e272e", 
        secondary: "#2c3e50",    
        accent: "#3498db",       
        accentDark: "#2980b9",   
        accentLight: "#5dade2",  
        text: "#ecf0f1",         
        textDark: "#bdc3c7",     
        userBubble: "#0084ff",   
        botBubble: "#2a2a2a",    
        success: "#2ecc71",      
        form: "#1a1a2e"          
    };
    
    const laptopTypeOptions = ["Business", "Gaming", "Office", "Student", "Developer"];
    const processorTypeOptions = ["Intel i5", "Intel i7", "Ryzen 5", "Ryzen 7", "Apple M2"];
    const displayQualityOptions = ["FHD IPS", "FHD TN", "QHD OLED", "Retina"];
    const graphicsOptions = ["Integrated", "NVIDIA RTX 3050", "NVIDIA RTX 4060"];
    const currencyOptions = ["Rs"];
    
    const [formState, setFormState] = useState({
        laptopType: "",
        processorType: [], // Changed to array for multi-select
        memoryRange: [16, 32],
        storageRange: [256, 1024],
        displaySize: [14, 16.1],
        displayQuality: [], // Changed to array for multi-select
        graphics: [], // Changed to array for multi-select
        budgetRange: [50000, 100000],
        currency: "Rs"
    });

    const API_BASE_URL = "http://localhost:9999";
    const AGENT_NAME = "coordinator";

    const handleFormChange = (field, value) => {
        setFormState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSliderChange = (field, value) => {
        setFormState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTextFieldChange = (field, value) => {
        // Convert string input to number for budget fields
        const numValue = field.includes('budget') ? Number(value) : value;
        
        if (field === 'budgetMin') {
            setFormState(prev => ({
                ...prev,
                budgetRange: [numValue, prev.budgetRange[1]]
            }));
        } else if (field === 'budgetMax') {
            setFormState(prev => ({
                ...prev,
                budgetRange: [prev.budgetRange[0], numValue]
            }));
        } else {
            setFormState(prev => ({
                ...prev,
                [field]: numValue
            }));
        }
    };
    
    // Dropdown handlers
    const handleMenuOpen = (event, menuSetter) => {
        menuSetter(event.currentTarget);
    };
    
    const handleMenuClose = (menuSetter) => {
        menuSetter(null);
    };
    
    // Update the handleMenuItemSelect function to handle multi-select
    const handleMenuItemSelect = (menuSetter, field, value) => {
        // For multi-select fields
        if (Array.isArray(formState[field])) {
            if (formState[field].includes(value)) {
                // Remove the value if already selected
                handleFormChange(field, formState[field].filter(item => item !== value));
            } else {
                // Add the value if not selected
                handleFormChange(field, [...formState[field], value]);
            }
        } else {
            // For single-select fields
            handleFormChange(field, value);
            handleMenuClose(menuSetter);
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Initialize session on component mount
    useEffect(() => {
        createSession();
    }, []);
    
    // Create a new session with the backend
    const createSession = async () => {
        setLoading(true);
        setShowLaptopForm(false); // Reset form visibility on new session
        const sessionId = `session-${Date.now()}`;
        
        try {
            const response = await fetch(
                `${API_BASE_URL}/apps/${AGENT_NAME}/users/${userId}/sessions/${sessionId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({})
                }
            );
            
            if (response.ok) {
                setSessionId(sessionId);
                setMessages([
                    {
                        role: "agent",
                        content: "👋 Hello! I'm your Procurement Assistant. What product are you looking for today?",
                        isForm: false
                    }
                ]);
            } else {
                console.error("Failed to create session:", await response.text());
                setMessages([
                    { 
                        role: "agent", 
                        content: "Failed to connect to the procurement assistant. Please try again later."
                    }
                ]);
            }
        } catch (error) {
            console.error("Error creating session:", error);
            setMessages([
                { 
                    role: "agent", 
                    content: "Network error: Could not connect to the server. Please check your connection."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Modified renderFormMessage for dark theme
    const renderFormMessage = () => {
        // Only show the form if showLaptopForm is true
        if (!showLaptopForm) {
            return null;
        }
        
        return (
            <Box sx={{ 
                width: "50%", 
                bgcolor: colors.form, 
                borderRadius: 2, 
                p: 3, 
                color: colors.text,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                border: `1px solid rgba(255, 255, 255, 0.1)`
            }}>
                <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 3, 
                    textAlign: "center",
                    color: colors.accent,
                    letterSpacing: "0.5px"
                }}>
                    Find Your Perfect Laptop
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.8, fontWeight: 500, fontSize: "0.9rem" }}>
                            Laptop Type
                        </Typography>
                        <Paper
                            onClick={(e) => handleMenuOpen(e, setLaptopTypeMenuAnchor)}
                            sx={{
                                p: 1,
                                bgcolor: colors.secondary,
                                borderRadius: 1.5,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                "&:hover": { bgcolor: "#38495a" },
                                height: "30px",
                                border: `1px solid rgba(255, 255, 255, 0.05)`
                            }}
                        >
                            <Typography color={colors.text} fontWeight="500" fontSize="0.9rem">
                                {formState.laptopType || "Select laptop type..."} ▼
                            </Typography>
                        </Paper>
                        <Menu
                            anchorEl={laptopTypeMenuAnchor}
                            open={Boolean(laptopTypeMenuAnchor)}
                            onClose={() => handleMenuClose(setLaptopTypeMenuAnchor)}
                            PaperProps={{
                                sx: { 
                                    maxHeight: 200, 
                                    backgroundColor: colors.secondary,
                                    color: colors.text,
                                    borderRadius: 1.5,
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                                }
                            }}
                        >
                            {laptopTypeOptions.map((option) => (
                                <MenuItem 
                                    key={option}
                                    onClick={() => handleMenuItemSelect(setLaptopTypeMenuAnchor, "laptopType", option)}
                                    selected={formState.laptopType === option}
                                    sx={{
                                        "&.Mui-selected": {
                                            backgroundColor: `${colors.accent} !important`,
                                            color: "white"
                                        },
                                        "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                                        }
                                    }}
                                >
                                    <ListItemText>{option}</ListItemText>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.8, fontWeight: 500, fontSize: "0.9rem" }}>
                            Processor Type
                        </Typography>
                        <Paper
                            onClick={(e) => handleMenuOpen(e, setProcessorTypeMenuAnchor)}
                            sx={{
                                p: 1,
                                bgcolor: colors.secondary,
                                borderRadius: 1.5,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                "&:hover": { bgcolor: "#38495a" },
                                height: "30px",
                                border: `1px solid rgba(255, 255, 255, 0.05)`
                            }}
                        >
                            <Typography color={colors.text} fontWeight="500" fontSize="0.9rem">
                                {formState.processorType.length > 0 
                                    ? formState.processorType.join(", ") 
                                    : "Select processors..."} ▼
                            </Typography>
                        </Paper>
                        <Menu
                            anchorEl={processorTypeMenuAnchor}
                            open={Boolean(processorTypeMenuAnchor)}
                            onClose={() => handleMenuClose(setProcessorTypeMenuAnchor)}
                            PaperProps={{
                                sx: { 
                                    maxHeight: 200, 
                                    backgroundColor: colors.secondary,
                                    color: colors.text,
                                    borderRadius: 1.5,
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                                }
                            }}
                        >
                            {processorTypeOptions.map((option) => (
                                <MenuItem 
                                    key={option}
                                    onClick={() => handleMenuItemSelect(setProcessorTypeMenuAnchor, "processorType", option)}
                                    selected={formState.processorType.includes(option)}
                                    sx={{
                                        "&.Mui-selected": {
                                            backgroundColor: `${colors.accent} !important`,
                                            color: "white"
                                        },
                                        "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                                        }
                                    }}
                                >
                                    <ListItemText>{option}</ListItemText>
                                    {formState.processorType.includes(option) && (
                                        <Typography variant="caption" color={colors.accent} sx={{ ml: 1 }}>✓</Typography>
                                    )}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: "0.9rem", display: "flex", justifyContent: "space-between" }}>
                        <span>Memory Size</span>
                        <span style={{ color: colors.accent }}>{`${formState.memoryRange[0]}GB - ${formState.memoryRange[1]}GB`}</span>
                    </Typography>
                    <Slider
                        value={formState.memoryRange}
                        onChange={(_, newValue) => handleSliderChange("memoryRange", newValue)}
                        min={8}
                        max={64}
                        step={null}
                        marks={[
                            { value: 8, label: '8GB' },
                            { value: 16, label: '16GB' },
                            { value: 32, label: '32GB' },
                            { value: 64, label: '64GB' }
                        ]}
                        sx={{
                            color: colors.accent,
                            height: 4,
                            padding: "13px 0",
                            '& .MuiSlider-thumb': {
                                bgcolor: "white",
                                height: 18,
                                width: 18,
                                boxShadow: "0 0 8px rgba(52, 152, 219, 0.5)",
                                '&:hover, &.Mui-active': {
                                    boxShadow: "0 0 12px rgba(52, 152, 219, 0.8)",
                                }
                            },
                            '& .MuiSlider-rail': {
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                            },
                            '& .MuiSlider-track': {
                                height: 4
                            },
                            '& .MuiSlider-mark': {
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                            },
                            '& .MuiSlider-markLabel': {
                                color: colors.textDark,
                                fontSize: "0.75rem",
                                fontWeight: 500
                            }
                        }}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: "0.9rem", display: "flex", justifyContent: "space-between" }}>
                        <span>Storage Size</span>
                        <span style={{ color: colors.accent }}>
                            {formState.storageRange[0] >= 1024 ? `${formState.storageRange[0]/1024}TB` : `${formState.storageRange[0]}GB`} - 
                            {formState.storageRange[1] >= 1024 ? ` ${formState.storageRange[1]/1024}TB` : ` ${formState.storageRange[1]}GB`}
                        </span>
                    </Typography>
                    <Slider
                        value={formState.storageRange}
                        onChange={(_, newValue) => handleSliderChange("storageRange", newValue)}
                        min={256}
                        max={2048}
                        step={null}
                        marks={[
                            { value: 256, label: '256GB' },
                            { value: 512, label: '512GB' },
                            { value: 1024, label: '1TB' },
                            { value: 2048, label: '2TB' }
                        ]}
                        sx={{
                            color: colors.accent,
                            height: 4,
                            padding: "13px 0",
                            '& .MuiSlider-thumb': {
                                bgcolor: "white",
                                height: 18,
                                width: 18,
                                boxShadow: "0 0 8px rgba(52, 152, 219, 0.5)",
                                '&:hover, &.Mui-active': {
                                    boxShadow: "0 0 12px rgba(52, 152, 219, 0.8)",
                                }
                            },
                            '& .MuiSlider-rail': {
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                            },
                            '& .MuiSlider-track': {
                                height: 4
                            },
                            '& .MuiSlider-mark': {
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                            },
                            '& .MuiSlider-markLabel': {
                                color: colors.textDark,
                                fontSize: "0.75rem",
                                fontWeight: 500
                            }
                        }}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: "0.9rem", display: "flex", justifyContent: "space-between" }}>
                        <span>Display Size</span>
                        <span style={{ color: colors.accent }}>{`${formState.displaySize[0]}" - ${formState.displaySize[1]}"`}</span>
                    </Typography>
                    <Slider
                        value={formState.displaySize}
                        onChange={(_, newValue) => handleSliderChange("displaySize", newValue)}
                        min={14}
                        max={17}
                        step={0.1}
                        marks={[
                            { value: 14, label: '14"' },
                            { value: 15.6, label: '15.6"' },
                            { value: 16, label: '16"' },
                            { value: 17, label: '17"' }
                        ]}
                        sx={{
                            color: colors.accent,
                            height: 4,
                            padding: "13px 0",
                            '& .MuiSlider-thumb': {
                                bgcolor: "white",
                                height: 18,
                                width: 18,
                                boxShadow: "0 0 8px rgba(52, 152, 219, 0.5)",
                                '&:hover, &.Mui-active': {
                                    boxShadow: "0 0 12px rgba(52, 152, 219, 0.8)",
                                }
                            },
                            '& .MuiSlider-rail': {
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                            },
                            '& .MuiSlider-track': {
                                height: 4
                            },
                            '& .MuiSlider-mark': {
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                            },
                            '& .MuiSlider-markLabel': {
                                color: colors.textDark,
                                fontSize: "0.75rem",
                                fontWeight: 500
                            }
                        }}
                    />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.8, fontWeight: 500, fontSize: "0.9rem" }}>
                            Display Quality
                        </Typography>
                        <Paper
                            onClick={(e) => handleMenuOpen(e, setDisplayQualityMenuAnchor)}
                            sx={{
                                p: 1,
                                bgcolor: colors.secondary,
                                borderRadius: 1.5,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                "&:hover": { bgcolor: "#38495a" },
                                height: "30px",
                                border: `1px solid rgba(255, 255, 255, 0.05)`
                            }}
                        >
                            <Typography color={colors.text} fontWeight="500" fontSize="0.9rem">
                                {formState.displayQuality.length > 0 
                                    ? formState.displayQuality.join(", ") 
                                    : "Select display quality..."} ▼
                            </Typography>
                        </Paper>
                        <Menu
                            anchorEl={displayQualityMenuAnchor}
                            open={Boolean(displayQualityMenuAnchor)}
                            onClose={() => handleMenuClose(setDisplayQualityMenuAnchor)}
                            PaperProps={{
                                sx: { 
                                    maxHeight: 200, 
                                    backgroundColor: colors.secondary,
                                    color: colors.text,
                                    borderRadius: 1.5,
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                                }
                            }}
                        >
                            {displayQualityOptions.map((option) => (
                                <MenuItem 
                                    key={option}
                                    onClick={() => handleMenuItemSelect(setDisplayQualityMenuAnchor, "displayQuality", option)}
                                    selected={formState.displayQuality.includes(option)}
                                    sx={{
                                        "&.Mui-selected": {
                                            backgroundColor: `${colors.accent} !important`,
                                            color: "white"
                                        },
                                        "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                                        }
                                    }}
                                >
                                    <ListItemText>{option}</ListItemText>
                                    {formState.displayQuality.includes(option) && (
                                        <Typography variant="caption" color={colors.accent} sx={{ ml: 1 }}>✓</Typography>
                                    )}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.8, fontWeight: 500, fontSize: "0.9rem" }}>
                            Graphics
                        </Typography>
                        <Paper
                            onClick={(e) => handleMenuOpen(e, setGraphicsMenuAnchor)}
                            sx={{
                                p: 1,
                                bgcolor: colors.secondary,
                                borderRadius: 1.5,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                "&:hover": { bgcolor: "#38495a" },
                                height: "30px",
                                border: `1px solid rgba(255, 255, 255, 0.05)`
                            }}
                        >
                            <Typography color={colors.text} fontWeight="500" fontSize="0.9rem">
                                {formState.graphics.length > 0 
                                    ? formState.graphics.join(", ") 
                                    : "Select graphics..."} ▼
                            </Typography>
                        </Paper>
                        <Menu
                            anchorEl={graphicsMenuAnchor}
                            open={Boolean(graphicsMenuAnchor)}
                            onClose={() => handleMenuClose(setGraphicsMenuAnchor)}
                            PaperProps={{
                                sx: { 
                                    maxHeight: 200, 
                                    backgroundColor: colors.secondary,
                                    color: colors.text,
                                    borderRadius: 1.5,
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                                }
                            }}
                        >
                            {graphicsOptions.map((option) => (
                                <MenuItem 
                                    key={option}
                                    onClick={() => handleMenuItemSelect(setGraphicsMenuAnchor, "graphics", option)}
                                    selected={formState.graphics.includes(option)}
                                    sx={{
                                        "&.Mui-selected": {
                                            backgroundColor: `${colors.accent} !important`,
                                            color: "white"
                                        },
                                        "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                                        }
                                    }}
                                >
                                    <ListItemText>{option}</ListItemText>
                                    {formState.graphics.includes(option) && (
                                        <Typography variant="caption" color={colors.accent} sx={{ ml: 1 }}>✓</Typography>
                                    )}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: "0.9rem", display: "flex", justifyContent: "space-between" }}>
                        <span>Budget Range</span>
                        <span style={{ color: colors.accent }}>
                            {`${formState.currency}${formState.budgetRange[0]} - ${formState.currency}${formState.budgetRange[1]}`}
                        </span>
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Min"
                            value={formState.budgetRange[0]}
                            onChange={(e) => handleTextFieldChange("budgetMin", e.target.value)}
                            sx={{
                                width: "100px",
                                "& .MuiOutlinedInput-root": {
                                    height: "38px",
                                    bgcolor: colors.secondary,
                                    color: colors.text,
                                    borderRadius: "8px",
                                    "&:hover": {
                                        bgcolor: "#38495a"
                                    },
                                    "& fieldset": {
                                        borderColor: "rgba(255, 255, 255, 0.1)"
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "rgba(255, 255, 255, 0.2)"
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: colors.accent
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <Typography color={colors.textDark} sx={{ mr: 0.5 }}>
                                        {formState.currency}
                                    </Typography>
                                ),
                            }}
                        />
                        <Typography variant="body2" color={colors.textDark}>to</Typography>
                        <TextField
                            size="small"
                            placeholder="Max"
                            value={formState.budgetRange[1]}
                            onChange={(e) => handleTextFieldChange("budgetMax", e.target.value)}
                            sx={{
                                width: "100px",
                                "& .MuiOutlinedInput-root": {
                                    height: "38px",
                                    bgcolor: colors.secondary,
                                    color: colors.text,
                                    borderRadius: "8px",
                                    "&:hover": {
                                        bgcolor: "#38495a"
                                    },
                                    "& fieldset": {
                                        borderColor: "rgba(255, 255, 255, 0.1)"
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "rgba(255, 255, 255, 0.2)"
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: colors.accent
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <Typography color={colors.textDark} sx={{ mr: 0.5 }}>
                                        {formState.currency}
                                    </Typography>
                                ),
                            }}
                        />
                        <Paper
                            onClick={(e) => handleMenuOpen(e, setCurrencyMenuAnchor)}
                            sx={{
                                height: "38px",
                                px: 1.5,
                                bgcolor: colors.secondary,
                                borderRadius: "8px",
                                cursor: "pointer",
                                "&:hover": { bgcolor: "#38495a" },
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                border: `1px solid rgba(255, 255, 255, 0.1)`
                            }}
                        >
                            <Typography color={colors.text} fontWeight="500" fontSize="0.9rem">
                                {formState.currency} ▼
                            </Typography>
                        </Paper>
                        <Menu
                            anchorEl={currencyMenuAnchor}
                            open={Boolean(currencyMenuAnchor)}
                            onClose={() => handleMenuClose(setCurrencyMenuAnchor)}
                            PaperProps={{
                                sx: { 
                                    backgroundColor: colors.secondary,
                                    color: colors.text,
                                    borderRadius: 1.5,
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                                }
                            }}
                        >
                            {currencyOptions.map((option) => (
                                <MenuItem 
                                    key={option}
                                    onClick={() => handleMenuItemSelect(setCurrencyMenuAnchor, "currency", option)}
                                    selected={formState.currency === option}
                                    sx={{
                                        "&.Mui-selected": {
                                            backgroundColor: `${colors.accent} !important`,
                                            color: "white"
                                        },
                                        "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                                        }
                                    }}
                                >
                                    <ListItemText>{option}</ListItemText>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <Slider
                        value={formState.budgetRange}
                        onChange={(_, newValue) => handleSliderChange("budgetRange", newValue)}
                        min={0}
                        max={150000}
                        sx={{
                            color: colors.accent,
                            height: 4,
                            padding: "13px 0",
                            '& .MuiSlider-thumb': {
                                bgcolor: "white",
                                height: 18,
                                width: 18,
                                boxShadow: "0 0 8px rgba(52, 152, 219, 0.5)",
                                '&:hover, &.Mui-active': {
                                    boxShadow: "0 0 12px rgba(52, 152, 219, 0.8)",
                                }
                            },
                            '& .MuiSlider-rail': {
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                            },
                            '& .MuiSlider-track': {
                                height: 4
                            }
                        }}
                    />
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSearch}
                    sx={{
                        mt: 2,
                        py: 1,
                        bgcolor: colors.accent,
                        color: "white",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                        borderRadius: "10px",
                        textTransform: "none",
                        letterSpacing: "0.5px",
                        boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            bgcolor: colors.accentDark,
                            boxShadow: "0 6px 16px rgba(52, 152, 219, 0.4)",
                            transform: "translateY(-2px)"
                        }
                    }}
                >
                    Search Laptops
                </Button>
            </Box>
        );
    };

    const sendMessage = async () => {
        if (!input.trim() || !sessionId) return;
        
        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        // Check if the user's message contains laptop-related keywords
        const laptopKeywords = ['laptop', 'notebook', 'computer', 'pc'];
        const isLaptopRequest = laptopKeywords.some(keyword => 
            input.toLowerCase().includes(keyword)
        );

        if (isLaptopRequest && !showLaptopForm) {
            // Show the laptop form if the user is asking about laptops
            setShowLaptopForm(true);
            setMessages((prev) => [
                ...prev,
                {
                    role: "agent",
                    content: "Great! I can help you find the perfect laptop. Please fill out this form with your requirements:",
                    isForm: true
                }
            ]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    app_name: AGENT_NAME,
                    user_id: userId,
                    session_id: sessionId,
                    new_message: {
                        role: "user",
                        parts: [{ text: input }]
                    }
                }),
            });

            if (response.ok) {
                const events = await response.json();
                
                // Process response events to extract assistant messages
                for (const event of events) {
                    // Check if this is a model/assistant message with text content
                    if (event.content?.role === "model" && event.content?.parts) {
                        for (const part of event.content.parts) {
                            if (part.text && part.text.trim()) {
                                // Add the message with the author (agent name) if available
                                setMessages((prev) => [
                                    ...prev, 
                                    {
                                        role: "agent", 
                                        content: part.text,
                                        author: event.author || "Assistant"
                                    }
                                ]);
                            }
                        }
                    }
                }
            } else {
                throw new Error(`Error: ${await response.text()}`);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages((prev) => [
                ...prev,
                { role: "agent", content: "Sorry, something went wrong connecting to the assistant." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Update handleSearch to use form state values
    const handleSearch = async () => {
        // Format multi-select values as comma-separated strings
        const formattedProcessorTypes = formState.processorType.length > 0
            ? formState.processorType.join(", ")
            : "any processor";
            
        const formattedDisplayQualities = formState.displayQuality.length > 0
            ? formState.displayQuality.join(", ")
            : "any display quality";
            
        const formattedGraphics = formState.graphics.length > 0
            ? formState.graphics.join(", ")
            : "any graphics";
            
        // Format the memory range with GB units
        const formattedMemoryRange = `[${formState.memoryRange[0]}GB, ${formState.memoryRange[1]}GB]`;
        
        // Format the storage range with appropriate units
        const formatStorage = (value) => {
            return value >= 1024 ? `${value/1024}TB` : `${value}GB`;
        };
        const formattedStorageRange = `[${formatStorage(formState.storageRange[0])}, ${formatStorage(formState.storageRange[1])}]`;
        
        // Format the display size with inch symbol
        const formattedDisplayRange = `[${formState.displaySize[0]}", ${formState.displaySize[1]}"]`;
        
        // Format budget with currency
        const formattedBudgetRange = `[${formState.currency}${formState.budgetRange[0]}, ${formState.currency}${formState.budgetRange[1]}]`;
        
        // Build the complete search query from form state
        const searchQuery = `Search for ${formState.laptopType || "any"} laptops with ${formattedProcessorTypes}, 
            memory between ${formattedMemoryRange}, storage between ${formattedStorageRange}, 
            screen size between ${formattedDisplayRange} with ${formattedDisplayQualities}, 
            ${formattedGraphics}, and price between ${formattedBudgetRange}.`;
        
        const userMessage = { role: "user", content: searchQuery };
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    app_name: AGENT_NAME,
                    user_id: userId,
                    session_id: sessionId,
                    new_message: {
                        role: "user",
                        parts: [{ text: searchQuery }]
                    }
                }),
            });

            if (response.ok) {
                const events = await response.json();
                
                // Process all events in the response
                for (const event of events) {
                    if (event.content?.role === "model" && event.content?.parts) {
                        for (const part of event.content.parts) {
                            if (part.text && part.text.trim()) {
                                setMessages((prev) => [
                                    ...prev, 
                                    {
                                        role: "agent", 
                                        content: part.text,
                                        author: event.author || "Assistant"
                                    }
                                ]);
                            }
                        }
                    }
                }
            } else {
                throw new Error(`Error: ${await response.text()}`);
            }
        } catch (err) {
            console.error("Error sending search query:", err);
            setMessages((prev) => [
                ...prev,
                { role: "agent", content: "Sorry, I couldn't complete the search. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const cardHeaderContent = (
        <CardHeader
            title="Procurement Assistant"
            action={
                <IconButton 
                    onClick={createSession}
                    disabled={loading}
                    title="Start new session"
                    sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                            color: 'white',
                            background: 'rgba(255,255,255,0.05)'
                        }
                    }}
                >
                    {/* <RefreshIcon /> */}
                </IconButton>
            }
            sx={{
                pb: 1,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                "& .MuiCardHeader-title": {
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: colors.text,
                    letterSpacing: "0.5px"
                },
                bgcolor: colors.primary,
                color: colors.text
            }}
        />
    );

    return (
        <Box sx={{
            width: "100vw", // Changed from 100% to 100vw for viewport width
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
            padding: 0,
            margin: 0,
            overflow: 'hidden',
            position: 'absolute', // Added position absolute
            top: 0,              // Position at the top
            left: 0,             // Position at the left
            right: 0,            // Extend to the right edge
            bottom: 0           // Extend to the bottom edge
        }}>
            <Card
                sx={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: 0,
                    boxShadow: "none",
                    overflow: "hidden",
                    background: colors.primary,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }}
            >
                {cardHeaderContent}
                {sessionId && (
                    <Box sx={{ 
                        px: 3, 
                        py: 0.7, 
                        bgcolor: `${colors.secondary}99`, 
                        borderBottom: '1px solid rgba(255,255,255,0.06)' 
                    }}>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                color: colors.textDark,
                                fontSize: '0.7rem'
                            }}
                        >
                            <span style={{ fontWeight: 'bold', color: colors.accent }}>SESSION ID:</span> {sessionId}
                        </Typography>
                    </Box>
                )}
                <CardContent sx={{ 
                    p: 0, 
                    pb: '0 !important', 
                    bgcolor: colors.primary,
                    flex: 1, 
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <Box
                        sx={{
                            flex: 1,
                            p: 3,
                            borderRadius: 0,
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                                width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                                background: "rgba(255,255,255,0.05)",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "rgba(255,255,255,0.15)",
                                borderRadius: "6px",
                            },
                            "&::-webkit-scrollbar-thumb:hover": {
                                background: "rgba(255,255,255,0.25)",
                            },
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    display: "flex",
                                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                    mb: 3,
                                    width: "100%"
                                }}
                            >
                                {msg.role === "agent" && (
                                    <Avatar
                                        sx={{
                                            bgcolor: colors.accent,
                                            width: 36,
                                            height: 36,
                                            mr: 1.5,
                                            alignSelf: "flex-start", // Changed from flex-end to flex-start
                                            mt: 1, // Added margin-top instead of margin-bottom
                                            boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)'
                                        }}
                                    >
                                        {/* <LaptopIcon sx={{ fontSize: 20 }} /> */}
                                    </Avatar>
                                )}

                                {msg.isForm ? (
                                    renderFormMessage()
                                ) : (
                                    <Box sx={{ maxWidth: "70%" }}>
                                        {/* Add author display for agent messages */}
                                        {msg.role === "agent" && msg.author && (
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    ml: 0, // Changed from -10 to 0
                                                    pl: 0,
                                                    mb: 0.5, 
                                                    display: "block", 
                                                    color: colors.accent,
                                                    fontWeight: "600",
                                                    fontSize: "0.7rem"
                                                }}
                                            >
                                                {msg.author.split('_')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')}
                                            </Typography>
                                        )}
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                bgcolor: msg.role === "user"
                                                    ? colors.userBubble
                                                    : colors.botBubble,
                                                color: colors.text,
                                                borderRadius: msg.role === "user"
                                                    ? "18px 18px 4px 18px"
                                                    : "18px 18px 18px 4px",
                                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                                border: msg.role === "user" 
                                                    ? 'none' 
                                                    : '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <FormattedMessage content={msg.content} colors={colors} />
                                        </Paper>
                                    </Box>
                                )}

                                {msg.role === "user" && (
                                    <Avatar
                                        sx={{
                                            bgcolor: '#268bd2',
                                            width: 36,
                                            height: 36,
                                            ml: 1.5,
                                            alignSelf: "flex-start", // Changed from flex-end to flex-start
                                            mt: 1, // Added margin-top instead of margin-bottom
                                        }}
                                    >
                                        U
                                    </Avatar>
                                )}
                            </Box>
                        ))}
                        {loading && (
                            <Box sx={{ display: "flex", mt: 1, ml: 7 }}>
                                <Fade in={loading}>
                                    <Box sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                        padding: '6px 12px',
                                        borderRadius: '12px',
                                        maxWidth: 'fit-content'
                                    }}>
                                        <CircularProgress size={16} thickness={4} sx={{ color: colors.accent }} />
                                        <Typography variant="caption" sx={{ color: colors.textDark }}>
                                            Processing your request...
                                        </Typography>
                                    </Box>
                                </Fade>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>
                    <Box sx={{ 
                        display: "flex", 
                        gap: 1, 
                        p: 2, 
                        pt: 1,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        bgcolor: colors.secondary
                    }}>
                        <TextField
                            fullWidth
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                            disabled={loading}
                            variant="outlined"
                            size="small"
                            multiline
                            maxRows={3}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                    paddingRight: "14px",
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    color: colors.text,
                                    transition: "all 0.3s",
                                    "&:hover": {
                                        backgroundColor: "rgba(255,255,255,0.07)",
                                    },
                                    "&.Mui-focused": {
                                        backgroundColor: "rgba(255,255,255,0.08)",
                                    },
                                    "& fieldset": {
                                        borderColor: "rgba(255,255,255,0.1)",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "rgba(255,255,255,0.2)",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: colors.accent,
                                    }
                                },
                                "& .MuiInputBase-input": {
                                    color: colors.text,
                                    "&::placeholder": {
                                        color: "rgba(255,255,255,0.5)",
                                        opacity: 1
                                    }
                                }
                            }}
                        />
                        <IconButton
                            color="primary"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            sx={{
                                p: 1.5,
                                borderRadius: "12px",
                                bgcolor: colors.accent,
                                color: "white",
                                alignSelf: 'flex-end',
                                height: '40px',
                                width: '40px',
                                transition: 'all 0.2s ease-in-out',
                                "&:hover": {
                                    bgcolor: colors.accentDark,
                                    transform: "scale(1.05)"
                                },
                                "&.Mui-disabled": {
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    color: "rgba(255,255,255,0.3)"
                                }
                            }}
                        >
                            <Send size={10} />
                        </IconButton>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}