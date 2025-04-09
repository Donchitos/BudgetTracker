import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Badge,
  Tooltip,
  useTheme,
  Menu,
  FormHelperText,
  InputAdornment,
  AvatarGroup
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LinkIcon from '@mui/icons-material/Link';
import BlockIcon from '@mui/icons-material/Block';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { alpha } from '@mui/material/styles';
import { format, addDays, subDays } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as ChartTooltip
} from 'recharts';

/**
 * Component for managing household finances, shared expenses, and multi-user collaboration
 */
const HouseholdManager = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [members, setMembers] = useState([]);
  const [household, setHousehold] = useState(null);
  const [sharedExpenses, setSharedExpenses] = useState([]);
  const [sharedAccounts, setSharedAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [newInviteDialogOpen, setNewInviteDialogOpen] = useState(false);
  
  // Form states
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'viewer',
    permissions: {
      canViewTransactions: true,
      canAddTransactions: false,
      canEditTransactions: false,
      canViewAccounts: true,
      canEditAccounts: false,
      canViewBudgets: true,
      canEditBudgets: false
    }
  });
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString(),
    paidById: '',
    splitType: 'equal', // equal, percentage, custom
    splits: [],
    category: '',
    notes: ''
  });
  
  const [householdSettings, setHouseholdSettings] = useState({
    name: '',
    defaultSplitType: 'equal',
    autoApproveTransactions: true,
    notifyOnNewTransactions: true,
    privacyLevel: 'standard', // standard, enhanced, private
    currency: 'USD'
  });
  
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'viewer',
    message: '',
    expiresIn: 7 // days
  });
  
  // Menu state
  const [memberMenuAnchorEl, setMemberMenuAnchorEl] = useState(null);
  const [expenseMenuAnchorEl, setExpenseMenuAnchorEl] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  
  // Get user data from Redux store
  const { user } = useSelector(state => state.auth);
  
  // Load household data on component mount
  useEffect(() => {
    loadHouseholdData();
  }, []);
  
  // Load household data from API
  const loadHouseholdData = () => {
    setLoading(true);
    setError(null);
    
    // In a real app, this would be an API call
    // For this implementation, we'll use sample data
    setTimeout(() => {
      // Sample user
      const currentUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null
      };
      
      // Sample household data
      const sampleHousehold = {
        id: '1',
        name: 'Doe Family',
        ownerId: '1',
        createdAt: '2023-05-10T10:00:00Z',
        updatedAt: '2023-09-15T14:30:00Z',
        defaultSplitType: 'equal',
        autoApproveTransactions: true,
        notifyOnNewTransactions: true,
        privacyLevel: 'standard',
        currency: 'USD'
      };
      
      // Sample members
      const sampleMembers = [
        {
          id: '1',
          userId: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'owner',
          status: 'active',
          joinedAt: '2023-05-10T10:00:00Z',
          avatar: null,
          permissions: {
            canViewTransactions: true,
            canAddTransactions: true,
            canEditTransactions: true,
            canViewAccounts: true,
            canEditAccounts: true,
            canViewBudgets: true,
            canEditBudgets: true
          }
        },
        {
          id: '2',
          userId: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'admin',
          status: 'active',
          joinedAt: '2023-05-11T10:00:00Z',
          avatar: null,
          permissions: {
            canViewTransactions: true,
            canAddTransactions: true,
            canEditTransactions: true,
            canViewAccounts: true,
            canEditAccounts: true,
            canViewBudgets: true,
            canEditBudgets: true
          }
        },
        {
          id: '3',
          userId: '3',
          name: 'Sam Smith',
          email: 'sam@example.com',
          role: 'member',
          status: 'active',
          joinedAt: '2023-06-15T10:00:00Z',
          avatar: null,
          permissions: {
            canViewTransactions: true,
            canAddTransactions: true,
            canEditTransactions: false,
            canViewAccounts: true,
            canEditAccounts: false,
            canViewBudgets: true,
            canEditBudgets: false
          }
        }
      ];
      
      // Sample shared expenses
      const sampleSharedExpenses = [
        {
          id: '1',
          description: 'Groceries',
          amount: 120.50,
          date: '2023-09-20T10:00:00Z',
          paidById: '1',
          splitType: 'equal',
          splits: [
            { memberId: '1', amount: 40.17, percentage: 33.33, status: 'paid' },
            { memberId: '2', amount: 40.17, percentage: 33.33, status: 'paid' },
            { memberId: '3', amount: 40.16, percentage: 33.33, status: 'pending' }
          ],
          category: 'Groceries',
          notes: 'Weekly shopping',
          createdAt: '2023-09-20T10:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          description: 'Electricity Bill',
          amount: 85.75,
          date: '2023-09-15T10:00:00Z',
          paidById: '2',
          splitType: 'percentage',
          splits: [
            { memberId: '1', amount: 42.88, percentage: 50, status: 'paid' },
            { memberId: '2', amount: 25.73, percentage: 30, status: 'paid' },
            { memberId: '3', amount: 17.14, percentage: 20, status: 'pending' }
          ],
          category: 'Utilities',
          notes: 'September bill',
          createdAt: '2023-09-15T10:00:00Z',
          status: 'active'
        },
        {
          id: '3',
          description: 'Dinner out',
          amount: 95.20,
          date: '2023-09-18T19:30:00Z',
          paidById: '3',
          splitType: 'custom',
          splits: [
            { memberId: '1', amount: 35.00, percentage: 36.76, status: 'pending' },
            { memberId: '2', amount: 35.00, percentage: 36.76, status: 'pending' },
            { memberId: '3', amount: 25.20, percentage: 26.47, status: 'paid' }
          ],
          category: 'Dining Out',
          notes: 'Italian restaurant',
          createdAt: '2023-09-18T22:00:00Z',
          status: 'active'
        }
      ];
      
      // Sample shared accounts
      const sampleSharedAccounts = [
        {
          id: '1',
          name: 'Joint Checking',
          type: 'checking',
          balance: 3500.75,
          institution: 'Chase Bank',
          accountNumber: '****1234',
          sharedWith: ['1', '2'],
          permissions: {
            '1': 'owner',
            '2': 'full'
          }
        },
        {
          id: '2',
          name: 'Household Savings',
          type: 'savings',
          balance: 8500.00,
          institution: 'Ally Bank',
          accountNumber: '****5678',
          sharedWith: ['1', '2', '3'],
          permissions: {
            '1': 'owner',
            '2': 'full',
            '3': 'view'
          }
        }
      ];
      
      // Sample pending invitations
      const sampleInvitations = [
        {
          id: '1',
          email: 'alex@example.com',
          role: 'member',
          status: 'pending',
          sentAt: '2023-09-19T10:00:00Z',
          expiresAt: '2023-09-26T10:00:00Z'
        }
      ];
      
      // Update state with sample data
      setHousehold(sampleHousehold);
      setMembers(sampleMembers);
      setSharedExpenses(sampleSharedExpenses);
      setSharedAccounts(sampleSharedAccounts);
      setInvitations(sampleInvitations);
      setHouseholdSettings({
        name: sampleHousehold.name,
        defaultSplitType: sampleHousehold.defaultSplitType,
        autoApproveTransactions: sampleHousehold.autoApproveTransactions,
        notifyOnNewTransactions: sampleHousehold.notifyOnNewTransactions,
        privacyLevel: sampleHousehold.privacyLevel,
        currency: sampleHousehold.currency
      });
      
      setLoading(false);
    }, 1000);
  };
  
  // Handle adding a new member
  const handleAddMember = () => {
    setNewMember({
      email: '',
      role: 'viewer',
      permissions: {
        canViewTransactions: true,
        canAddTransactions: false,
        canEditTransactions: false,
        canViewAccounts: true,
        canEditAccounts: false,
        canViewBudgets: true,
        canEditBudgets: false
      }
    });
    setMemberDialogOpen(true);
  };
  
  // Handle saving a new member
  const handleSaveMember = () => {
    // Validate email
    if (!newMember.email || !/\S+@\S+\.\S+/.test(newMember.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if email already exists in members
    if (members.some(m => m.email === newMember.email)) {
      setError('This email is already a member of the household');
      return;
    }
    
    // In a real app, this would send an invitation to the email
    // For this implementation, we'll add to pending invitations
    const newInvitation = {
      id: Date.now().toString(),
      email: newMember.email,
      role: newMember.role,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: addDays(new Date(), 7).toISOString()
    };
    
    setInvitations([...invitations, newInvitation]);
    setMemberDialogOpen(false);
    setError(null);
  };
  
  // Handle opening member menu
  const handleOpenMemberMenu = (event, memberId) => {
    setMemberMenuAnchorEl(event.currentTarget);
    setSelectedMemberId(memberId);
  };
  
  // Handle closing member menu
  const handleCloseMemberMenu = () => {
    setMemberMenuAnchorEl(null);
    setSelectedMemberId(null);
  };
  
  // Handle removing a member
  const handleRemoveMember = () => {
    if (!selectedMemberId) return;
    
    // Check if trying to remove owner
    const member = members.find(m => m.id === selectedMemberId);
    if (member && member.role === 'owner') {
      setError('You cannot remove the owner of the household');
      handleCloseMemberMenu();
      return;
    }
    
    if (window.confirm('Are you sure you want to remove this member from the household?')) {
      // In a real app, this would call an API to remove the member
      setMembers(members.filter(m => m.id !== selectedMemberId));
      handleCloseMemberMenu();
    }
  };
  
  // Handle editing a member's role/permissions
  const handleEditMember = () => {
    if (!selectedMemberId) return;
    
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;
    
    setNewMember({
      id: member.id,
      email: member.email,
      role: member.role,
      permissions: { ...member.permissions }
    });
    
    setMemberDialogOpen(true);
    handleCloseMemberMenu();
  };
  
  // Handle update member role/permissions
  const handleUpdateMember = () => {
    if (!newMember.id) return;
    
    // In a real app, this would call an API to update the member
    setMembers(members.map(m => 
      m.id === newMember.id ? 
        { ...m, role: newMember.role, permissions: newMember.permissions } : 
        m
    ));
    
    setMemberDialogOpen(false);
    setError(null);
  };
  
  // Handle changing permission for a member
  const handlePermissionChange = (permission, value) => {
    setNewMember(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };
  
  // Handle role change for a member
  const handleRoleChange = (role) => {
    let permissions = { ...newMember.permissions };
    
    // Set default permissions based on role
    if (role === 'admin') {
      permissions = {
        canViewTransactions: true,
        canAddTransactions: true,
        canEditTransactions: true,
        canViewAccounts: true,
        canEditAccounts: true,
        canViewBudgets: true,
        canEditBudgets: true
      };
    } else if (role === 'member') {
      permissions = {
        canViewTransactions: true,
        canAddTransactions: true,
        canEditTransactions: false,
        canViewAccounts: true,
        canEditAccounts: false,
        canViewBudgets: true,
        canEditBudgets: false
      };
    } else if (role === 'viewer') {
      permissions = {
        canViewTransactions: true,
        canAddTransactions: false,
        canEditTransactions: false,
        canViewAccounts: true,
        canEditAccounts: false,
        canViewBudgets: true,
        canEditBudgets: false
      };
    }
    
    setNewMember(prev => ({
      ...prev,
      role,
      permissions
    }));
  };
  
  // Handle adding a new shared expense
  const handleAddExpense = () => {
    // Initialize splits with all members
    const initialSplits = members.map(member => ({
      memberId: member.id,
      amount: 0,
      percentage: 100 / members.length,
      status: member.id === user?.id ? 'paid' : 'pending'
    }));
    
    setNewExpense({
      description: '',
      amount: 0,
      date: new Date().toISOString(),
      paidById: user?.id || '',
      splitType: household?.defaultSplitType || 'equal',
      splits: initialSplits,
      category: '',
      notes: ''
    });
    
    setExpenseDialogOpen(true);
  };
  
  // Handle saving a new shared expense
  const handleSaveExpense = () => {
    // Validate form
    if (!newExpense.description) {
      setError('Please enter a description for the expense');
      return;
    }
    
    if (newExpense.amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    
    if (!newExpense.paidById) {
      setError('Please select who paid for this expense');
      return;
    }
    
    // Validate splits add up to total
    const totalSplitAmount = newExpense.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplitAmount - newExpense.amount) > 0.01) {
      setError('Split amounts must add up to the total expense amount');
      return;
    }
    
    // Create new expense object
    const expense = {
      ...newExpense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    // In a real app, this would call an API to save the expense
    setSharedExpenses([...sharedExpenses, expense]);
    setExpenseDialogOpen(false);
    setError(null);
  };
  
  // Handle expense amount change and update splits
  const handleExpenseAmountChange = (amount) => {
    const parsedAmount = parseFloat(amount) || 0;
    
    // Update splits based on split type
    let updatedSplits = [...newExpense.splits];
    
    if (newExpense.splitType === 'equal') {
      // Equal split
      const splitAmount = parsedAmount / updatedSplits.length;
      updatedSplits = updatedSplits.map(split => ({
        ...split,
        amount: parseFloat((splitAmount).toFixed(2)),
        percentage: 100 / updatedSplits.length
      }));
      
      // Handle rounding issues by adjusting the last split
      const totalSplitAmount = updatedSplits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplitAmount - parsedAmount) > 0.01) {
        const diff = parsedAmount - totalSplitAmount;
        updatedSplits[updatedSplits.length - 1].amount = parseFloat((updatedSplits[updatedSplits.length - 1].amount + diff).toFixed(2));
      }
    } else if (newExpense.splitType === 'percentage') {
      // Percentage split - keep percentages the same but update amounts
      updatedSplits = updatedSplits.map(split => ({
        ...split,
        amount: parseFloat(((split.percentage / 100) * parsedAmount).toFixed(2))
      }));
    }
    
    setNewExpense(prev => ({
      ...prev,
      amount: parsedAmount,
      splits: updatedSplits
    }));
  };
  
  // Handle split type change
  const handleSplitTypeChange = (splitType) => {
    // Update splits based on new split type
    let updatedSplits = [...newExpense.splits];
    
    if (splitType === 'equal') {
      // Equal split
      const splitAmount = newExpense.amount / updatedSplits.length;
      updatedSplits = updatedSplits.map(split => ({
        ...split,
        amount: parseFloat((splitAmount).toFixed(2)),
        percentage: 100 / updatedSplits.length
      }));
      
      // Handle rounding issues
      const totalSplitAmount = updatedSplits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplitAmount - newExpense.amount) > 0.01) {
        const diff = newExpense.amount - totalSplitAmount;
        updatedSplits[updatedSplits.length - 1].amount = parseFloat((updatedSplits[updatedSplits.length - 1].amount + diff).toFixed(2));
      }
    } else if (splitType === 'percentage') {
      // Default to equal percentages
      const equalPercentage = 100 / updatedSplits.length;
      updatedSplits = updatedSplits.map(split => ({
        ...split,
        percentage: equalPercentage,
        amount: parseFloat(((equalPercentage / 100) * newExpense.amount).toFixed(2))
      }));
    }
    
    setNewExpense(prev => ({
      ...prev,
      splitType,
      splits: updatedSplits
    }));
  };
  
  // Handle custom split amount change
  const handleSplitAmountChange = (memberId, amount) => {
    const parsedAmount = parseFloat(amount) || 0;
    
    // Update the specific split
    const updatedSplits = newExpense.splits.map(split => {
      if (split.memberId === memberId) {
        const newPercentage = newExpense.amount > 0 ? 
          (parsedAmount / newExpense.amount) * 100 : 0;
        
        return {
          ...split,
          amount: parsedAmount,
          percentage: parseFloat(newPercentage.toFixed(2))
        };
      }
      return split;
    });
    
    setNewExpense(prev => ({
      ...prev,
      splits: updatedSplits
    }));
  };
  
  // Handle custom split percentage change
  const handleSplitPercentageChange = (memberId, percentage) => {
    const parsedPercentage = parseFloat(percentage) || 0;
    
    // Update the specific split
    const updatedSplits = newExpense.splits.map(split => {
      if (split.memberId === memberId) {
        return {
          ...split,
          percentage: parsedPercentage,
          amount: parseFloat(((parsedPercentage / 100) * newExpense.amount).toFixed(2))
        };
      }
      return split;
    });
    
    setNewExpense(prev => ({
      ...prev,
      splits: updatedSplits
    }));
  };
  
  // Handle opening household settings dialog
  const handleOpenSettings = () => {
    setHouseholdSettings({
      name: household?.name || '',
      defaultSplitType: household?.defaultSplitType || 'equal',
      autoApproveTransactions: household?.autoApproveTransactions || true,
      notifyOnNewTransactions: household?.notifyOnNewTransactions || true,
      privacyLevel: household?.privacyLevel || 'standard',
      currency: household?.currency || 'USD'
    });
    
    setSettingsDialogOpen(true);
  };
  
  // Handle saving household settings
  const handleSaveSettings = () => {
    // Validate
    if (!householdSettings.name) {
      setError('Please enter a household name');
      return;
    }
    
    // In a real app, this would call an API to update the household settings
    setHousehold(prev => ({
      ...prev,
      name: householdSettings.name,
      defaultSplitType: householdSettings.defaultSplitType,
      autoApproveTransactions: householdSettings.autoApproveTransactions,
      notifyOnNewTransactions: householdSettings.notifyOnNewTransactions,
      privacyLevel: householdSettings.privacyLevel,
      currency: householdSettings.currency
    }));
    
    setSettingsDialogOpen(false);
    setError(null);
  };
  
  // Handle sending a new invitation
  const handleSendInvite = () => {
    // Validate
    if (!newInvite.email || !/\S+@\S+\.\S+/.test(newInvite.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if email already exists in members or invitations
    if (members.some(m => m.email === newInvite.email)) {
      setError('This email is already a member of the household');
      return;
    }
    
    if (invitations.some(i => i.email === newInvite.email && i.status === 'pending')) {
      setError('An invitation has already been sent to this email');
      return;
    }
    
    // Create new invitation
    const invitation = {
      id: Date.now().toString(),
      email: newInvite.email,
      role: newInvite.role,
      message: newInvite.message,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: addDays(new Date(), newInvite.expiresIn).toISOString()
    };
    
    // In a real app, this would call an API to send the invitation
    setInvitations([...invitations, invitation]);
    setNewInviteDialogOpen(false);
    setError(null);
  };
  
  // Cancel an invitation
  const handleCancelInvitation = (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      // In a real app, this would call an API to cancel the invitation
      setInvitations(invitations.filter(i => i.id !== invitationId));
    }
  };
  
  // Handle opening expense menu
  const handleOpenExpenseMenu = (event, expenseId) => {
    setExpenseMenuAnchorEl(event.currentTarget);
    setSelectedExpenseId(expenseId);
  };
  
  // Handle closing expense menu
  const handleCloseExpenseMenu = () => {
    setExpenseMenuAnchorEl(null);
    setSelectedExpenseId(null);
  };
  
  // Handle editing a shared expense
  const handleEditExpense = () => {
    if (!selectedExpenseId) return;
    
    const expense = sharedExpenses.find(e => e.id === selectedExpenseId);
    if (!expense) return;
    
    setNewExpense({
      ...expense
    });
    
    setExpenseDialogOpen(true);
    handleCloseExpenseMenu();
  };
  
  // Handle deleting a shared expense
  const handleDeleteExpense = () => {
    if (!selectedExpenseId) return;
    
    if (window.confirm('Are you sure you want to delete this expense?')) {
      // In a real app, this would call an API to delete the expense
      setSharedExpenses(sharedExpenses.filter(e => e.id !== selectedExpenseId));
      handleCloseExpenseMenu();
    }
  };
  
  // Calculate member balances
  const calculateMemberBalances = () => {
    const balances = {};
    
    // Initialize balances for all members
    members.forEach(member => {
      balances[member.id] = {
        memberId: member.id,
        name: member.name,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0
      };
    });
    
    // Calculate balances from shared expenses
    sharedExpenses.forEach(expense => {
      // Add the full amount to the person who paid
      balances[expense.paidById].totalPaid += expense.amount;
      
      // Add each person's share to what they owe
      expense.splits.forEach(split => {
        if (split.memberId !== expense.paidById) {
          balances[split.memberId].totalOwed += split.amount;
          
          // If already paid, also add to total paid
          if (split.status === 'paid') {
            balances[split.memberId].totalPaid += split.amount;
          }
        }
      });
    });
    
    // Calculate net balance for each member
    Object.keys(balances).forEach(memberId => {
      balances[memberId].balance = balances[memberId].totalPaid - balances[memberId].totalOwed;
    });
    
    return Object.values(balances);
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: household?.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Get role label with appropriate styling
  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return <Chip size="small" color="primary" label="Owner" />;
      case 'admin':
        return <Chip size="small" color="secondary" label="Admin" />;
      case 'member':
        return <Chip size="small" color="success" label="Member" />;
      case 'viewer':
        return <Chip size="small" color="default" label="Viewer" />;
      default:
        return <Chip size="small" label={role} />;
    }
  };
  
  // Get expense data for charts
  const getExpenseChartData = () => {
    const categoryExpenses = {};
    
    sharedExpenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!categoryExpenses[category]) {
        categoryExpenses[category] = 0;
      }
      categoryExpenses[category] += expense.amount;
    });
    
    return Object.keys(categoryExpenses).map(category => ({
      name: category,
      value: categoryExpenses[category]
    }));
  };
  
  // Get member expense data for charts
  const getMemberExpenseChartData = () => {
    const memberExpenses = {};
    
    members.forEach(member => {
      memberExpenses[member.id] = {
        name: member.name,
        paid: 0,
        owed: 0
      };
    });
    
    sharedExpenses.forEach(expense => {
      // Add paid amount
      memberExpenses[expense.paidById].paid += expense.amount;
      
      // Add owed amounts
      expense.splits.forEach(split => {
        if (split.memberId !== expense.paidById) {
          memberExpenses[split.memberId].owed += split.amount;
        }
      });
    });
    
    return Object.values(memberExpenses);
  };
  
  // Get color for balance (positive or negative)
  const getBalanceColor = (balance) => {
    if (balance > 0) {
      return theme.palette.success.main;
    } else if (balance < 0) {
      return theme.palette.error.main;
    }
    return theme.palette.text.primary;
  };
  
  // Get member by ID
  const getMemberById = (memberId) => {
    return members.find(m => m.id === memberId);
  };
  
  // Get color for expense chart
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
    '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'
  ];
  
  // Get permissions explanation
  const getPermissionExplanation = (permission) => {
    switch (permission) {
      case 'canViewTransactions':
        return 'Can view household transactions';
      case 'canAddTransactions':
        return 'Can add new transactions';
      case 'canEditTransactions':
        return 'Can edit or delete transactions';
      case 'canViewAccounts':
        return 'Can view household accounts';
      case 'canEditAccounts':
        return 'Can modify household accounts';
      case 'canViewBudgets':
        return 'Can view household budgets';
      case 'canEditBudgets':
        return 'Can modify household budgets';
      default:
        return permission;
    }
  };
  
  const memberBalances = calculateMemberBalances();
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">
          {household ? household.name : 'Household Manager'}
        </Typography>
        
        <Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ReceiptIcon />}
            onClick={handleAddExpense}
            sx={{ mr: 1 }}
          >
            Add Expense
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PersonAddIcon />}
            onClick={() => setNewInviteDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Invite Member
          </Button>
          
          <IconButton
            color="inherit"
            onClick={handleOpenSettings}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Members" icon={<PeopleIcon />} />
          <Tab label="Shared Expenses" icon={<ReceiptIcon />} />
          <Tab label="Balances" icon={<CompareArrowsIcon />} />
          <Tab label="Accounts" icon={<AccountBalanceIcon />} />
        </Tabs>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Error alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Members Tab */}
            {activeTab === 0 && (
              <>
                {/* Members Summary */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Total Members
                          </Typography>
                          <Typography variant="h4">
                            {members.length}
                          </Typography>
                          <AvatarGroup max={5} sx={{ mt: 2, justifyContent: 'flex-start' }}>
                            {members.map(member => (
                              <Tooltip key={member.id} title={member.name}>
                                <Avatar alt={member.name} src={member.avatar}>
                                  {member.name.charAt(0)}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Owner
                          </Typography>
                          <Typography variant="h6" noWrap>
                            {members.find(m => m.role === 'owner')?.name || 'N/A'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <SecurityIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Created {household && format(new Date(household.createdAt), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Pending Invitations
                          </Typography>
                          <Typography variant="h4">
                            {invitations.filter(i => i.status === 'pending').length}
                          </Typography>
                          {invitations.filter(i => i.status === 'pending').length > 0 && (
                            <Button
                              variant="text"
                              size="small"
                              sx={{ mt: 2 }}
                              onClick={() => document.getElementById('pending-invitations').scrollIntoView({ behavior: 'smooth' })}
                            >
                              View Invitations
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Privacy Level
                          </Typography>
                          <Typography variant="h6">
                            {household?.privacyLevel === 'standard' ? 'Standard' : 
                             household?.privacyLevel === 'enhanced' ? 'Enhanced' : 'Private'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Chip
                              size="small"
                              icon={<SecurityIcon />}
                              label={household?.privacyLevel || 'Standard'}
                              color={
                                household?.privacyLevel === 'private' ? 'secondary' :
                                household?.privacyLevel === 'enhanced' ? 'primary' : 'default'
                              }
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Members List */}
                <Card sx={{ mb: 3 }}>
                  <CardHeader
                    title="Household Members"
                    action={
                      <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setNewInviteDialogOpen(true)}
                        size="small"
                      >
                        Invite
                      </Button>
                    }
                  />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Joined</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  alt={member.name} 
                                  src={member.avatar}
                                  sx={{ mr: 1, width: 28, height: 28 }}
                                >
                                  {member.name.charAt(0)}
                                </Avatar>
                                {member.name}
                              </Box>
                            </TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{getRoleLabel(member.role)}</TableCell>
                            <TableCell>{format(new Date(member.joinedAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={(e) => handleOpenMemberMenu(e, member.id)}
                                disabled={member.role === 'owner' && user?.id !== member.userId}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
                
                {/* Pending Invitations */}
                <Card id="pending-invitations">
                  <CardHeader
                    title="Pending Invitations"
                    subheader={invitations.filter(i => i.status === 'pending').length === 0 ? 
                      'No pending invitations' : `${invitations.filter(i => i.status === 'pending').length} pending invitations`}
                  />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Sent</TableCell>
                          <TableCell>Expires</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invitations.filter(i => i.status === 'pending').map((invitation) => (
                          <TableRow key={invitation.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                {invitation.email}
                              </Box>
                            </TableCell>
                            <TableCell>{getRoleLabel(invitation.role)}</TableCell>
                            <TableCell>{format(new Date(invitation.sentAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Tooltip title="Expires on">
                                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                    {format(new Date(invitation.expiresAt), 'MMM d, yyyy')}
                                  </Box>
                                </Tooltip>
                                
                                {new Date(invitation.expiresAt) < new Date() && (
                                  <Chip 
                                    size="small" 
                                    label="Expired" 
                                    color="error" 
                                    sx={{ ml: 1 }} 
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={() => handleCancelInvitation(invitation.id)}
                              >
                                Cancel
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {invitations.filter(i => i.status === 'pending').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                No pending invitations
                              </Typography>
                              
                              <Button
                                variant="text"
                                startIcon={<PersonAddIcon />}
                                onClick={() => setNewInviteDialogOpen(true)}
                                size="small"
                              >
                                Invite a New Member
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </>
            )}
            
            {/* Shared Expenses Tab */}
            {activeTab === 1 && (
              <>
                {/* Expenses Summary */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Total Expenses
                          </Typography>
                          <Typography variant="h4">
                            {formatCurrency(sharedExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <ReceiptIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              {sharedExpenses.length} shared expenses
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Average per Person
                          </Typography>
                          <Typography variant="h4">
                            {formatCurrency(
                              members.length > 0 ? 
                                sharedExpenses.reduce((sum, expense) => sum + expense.amount, 0) / members.length :
                                0
                            )}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              Split between {members.length} members
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Expense Distribution
                          </Typography>
                          <Box sx={{ height: 100 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getExpenseChartData()}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={40}
                                  dataKey="value"
                                  label={false}
                                >
                                  {getExpenseChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Expenses List */}
                <Card>
                  <CardHeader
                    title="Shared Expenses"
                    action={
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddExpense}
                        size="small"
                      >
                        Add Expense
                      </Button>
                    }
                  />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Paid By</TableCell>
                          <TableCell>Split</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sharedExpenses.map((expense) => {
                          const paidBy = getMemberById(expense.paidById);
                          
                          return (
                            <TableRow key={expense.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {expense.description}
                                  </Typography>
                                </Box>
                                {expense.category && (
                                  <Chip 
                                    size="small" 
                                    label={expense.category}
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                              <TableCell>{formatCurrency(expense.amount)}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    alt={paidBy?.name} 
                                    src={paidBy?.avatar}
                                    sx={{ width: 24, height: 24, mr: 1 }}
                                  >
                                    {paidBy?.name.charAt(0)}
                                  </Avatar>
                                  {paidBy?.name}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  size="small" 
                                  label={expense.splitType === 'equal' ? 'Equal Split' : 
                                         expense.splitType === 'percentage' ? 'Percentage Split' : 
                                         'Custom Split'}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleOpenExpenseMenu(e, expense.id)}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        
                        {sharedExpenses.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                No shared expenses yet
                              </Typography>
                              
                              <Button
                                variant="text"
                                startIcon={<AddIcon />}
                                onClick={handleAddExpense}
                                size="small"
                              >
                                Add Your First Expense
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </>
            )}
            
            {/* Balances Tab */}
            {activeTab === 2 && (
              <>
                {/* Balance Summary */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Card sx={{ mb: 3 }}>
                      <CardHeader title="Member Balances" />
                      <Divider />
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Member</TableCell>
                              <TableCell align="right">Total Paid</TableCell>
                              <TableCell align="right">Total Owed</TableCell>
                              <TableCell align="right">Balance</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {memberBalances.map((balance) => (
                              <TableRow key={balance.memberId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                      alt={balance.name} 
                                      src={getMemberById(balance.memberId)?.avatar}
                                      sx={{ width: 28, height: 28, mr: 1 }}
                                    >
                                      {balance.name.charAt(0)}
                                    </Avatar>
                                    {balance.name}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">{formatCurrency(balance.totalPaid)}</TableCell>
                                <TableCell align="right">{formatCurrency(balance.totalOwed)}</TableCell>
                                <TableCell 
                                  align="right"
                                  sx={{ 
                                    color: getBalanceColor(balance.balance),
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {formatCurrency(balance.balance)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                    
                    {/* Settlement Suggestions */}
                    <Card>
                      <CardHeader 
                        title="Settlement Suggestions" 
                        subheader="Efficient way to settle balances between members"
                      />
                      <Divider />
                      <CardContent>
                        {/* This would be a more complex algorithm in a real app */}
                        {memberBalances.some(b => b.balance < -1) && memberBalances.some(b => b.balance > 1) ? (
                          <List>
                            {memberBalances
                              .filter(b => b.balance < -1)
                              .map(debtor => {
                                const creditor = memberBalances.find(b => b.balance > 1);
                                if (!creditor) return null;
                                
                                const amountToSettleAbs = Math.min(Math.abs(debtor.balance), creditor.balance);
                                
                                return (
                                  <ListItem key={`${debtor.memberId}-${creditor.memberId}`}>
                                    <ListItemIcon>
                                      <CompareArrowsIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography>
                                          <strong>{debtor.name}</strong> should pay <strong>{formatCurrency(amountToSettleAbs)}</strong> to <strong>{creditor.name}</strong>
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                );
                              })}
                          </List>
                        ) : (
                          <Alert severity="success" icon={<DoneAllIcon />}>
                            All balances are settled! No payments needed.
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={5}>
                    {/* Balance Visualization */}
                    <Card sx={{ mb: 3 }}>
                      <CardHeader title="Balance Visualization" />
                      <Divider />
                      <CardContent>
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={memberBalances.map(b => ({
                                  name: b.name,
                                  value: Math.max(0, b.balance) // Only show positive balances
                                }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={1}
                                dataKey="value"
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {memberBalances.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <ChartTooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    {/* Expense Distribution */}
                    <Card>
                      <CardHeader title="Expense Distribution" />
                      <Divider />
                      <CardContent>
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getMemberExpenseChartData().map(m => ({
                                  name: m.name,
                                  value: m.paid
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                dataKey="value"
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {getMemberExpenseChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <ChartTooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
            
            {/* Accounts Tab */}
            {activeTab === 3 && (
              <>
                {/* Shared Accounts */}
                <Card sx={{ mb: 3 }}>
                  <CardHeader 
                    title="Shared Accounts" 
                    action={
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        size="small"
                      >
                        Share Account
                      </Button>
                    }
                  />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Account Name</TableCell>
                          <TableCell>Institution</TableCell>
                          <TableCell>Balance</TableCell>
                          <TableCell>Shared With</TableCell>
                          <TableCell>Access Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sharedAccounts.map((account) => (
                          <TableRow key={account.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {account.type === 'checking' ? (
                                  <AccountBalanceIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                                ) : (
                                  <AccountBalanceWalletIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                                )}
                                {account.name}
                              </Box>
                            </TableCell>
                            <TableCell>{account.institution}</TableCell>
                            <TableCell>{formatCurrency(account.balance)}</TableCell>
                            <TableCell>
                              <AvatarGroup max={3}>
                                {account.sharedWith.map(memberId => {
                                  const member = getMemberById(memberId);
                                  return member ? (
                                    <Tooltip key={memberId} title={member.name}>
                                      <Avatar alt={member.name} src={member.avatar}>
                                        {member.name.charAt(0)}
                                      </Avatar>
                                    </Tooltip>
                                  ) : null;
                                })}
                              </AvatarGroup>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={account.permissions[user?.id] === 'owner' ? 'Owner' : 
                                      account.permissions[user?.id] === 'full' ? 'Full Access' : 'View Only'}
                                color={account.permissions[user?.id] === 'owner' ? 'primary' : 
                                      account.permissions[user?.id] === 'full' ? 'secondary' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {sharedAccounts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                No shared accounts yet
                              </Typography>
                              
                              <Button
                                variant="text"
                                startIcon={<AddIcon />}
                                size="small"
                              >
                                Share an Account
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
                
                {/* Account Access Information */}
                <Card>
                  <CardHeader title="Account Access Information" />
                  <Divider />
                  <CardContent>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="subtitle2">
                        About Account Sharing
                      </Typography>
                      <Typography variant="body2">
                        When you share an account, you can control how much access each member has. 
                        View-only access allows members to see balances and transactions, but not make changes.
                        Full access allows members to manage the account, including adding transactions.
                      </Typography>
                    </Alert>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Access Levels Explained
                    </Typography>
                    
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Owner"
                          secondary="Full control, can share or unshare the account with others"
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <EditIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Full Access"
                          secondary="Can view all account details and add transactions"
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <VisibilityIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="View Only"
                          secondary="Can see account details but cannot make changes"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </Box>
      
      {/* Member dialog */}
      <Dialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {newMember.id ? 'Edit Member Permissions' : 'Add Household Member'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Email */}
            {!newMember.id && (
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  fullWidth
                  required
                  type="email"
                  disabled={!!newMember.id}
                />
              </Grid>
            )}
            
            {/* Role */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newMember.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  label="Role"
                  disabled={newMember.role === 'owner'}
                >
                  {newMember.role === 'owner' && (
                    <MenuItem value="owner">Owner</MenuItem>
                  )}
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
                <FormHelperText>
                  {newMember.role === 'owner' ? 'Household owner has full control' :
                   newMember.role === 'admin' ? 'Administrators have full access to all household data' :
                   newMember.role === 'member' ? 'Members can view and add transactions' :
                   'Viewers can only view household data'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Permissions */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Custom Permissions
                <Tooltip title="These permissions override the defaults for the selected role">
                  <HelpOutlineIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Tooltip>
              </Typography>
              
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  {Object.entries(newMember.permissions).map(([permission, value]) => (
                    <Grid item xs={12} sm={6} key={permission}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                            disabled={newMember.role === 'owner' || 
                                      (newMember.role === 'admin' && ['canViewTransactions', 'canViewAccounts', 'canViewBudgets'].includes(permission))}
                          />
                        }
                        label={
                          <Tooltip title={getPermissionExplanation(permission)}>
                            <Typography variant="body2">
                              {permission.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                          </Tooltip>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setMemberDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={newMember.id ? handleUpdateMember : handleSaveMember}
          >
            {newMember.id ? 'Update' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Shared expense dialog */}
      <Dialog
        open={expenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {newExpense.id ? 'Edit Shared Expense' : 'Add Shared Expense'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Description and Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                value={newExpense.amount}
                onChange={(e) => handleExpenseAmountChange(e.target.value)}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Date and Paid By */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                value={newExpense.date ? format(new Date(newExpense.date), 'yyyy-MM-dd') : ''}
                onChange={(e) => setNewExpense(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                fullWidth
                required
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Paid By</InputLabel>
                <Select
                  value={newExpense.paidById}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, paidById: e.target.value }))}
                  label="Paid By"
                >
                  {members.map(member => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Category and Split Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category (Optional)"
                value={newExpense.category}
                onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Split Type</InputLabel>
                <Select
                  value={newExpense.splitType}
                  onChange={(e) => handleSplitTypeChange(e.target.value)}
                  label="Split Type"
                >
                  <MenuItem value="equal">Equal Split</MenuItem>
                  <MenuItem value="percentage">Percentage Split</MenuItem>
                  <MenuItem value="custom">Custom Split</MenuItem>
                </Select>
                <FormHelperText>
                  {newExpense.splitType === 'equal' ? 'Divide equally among all members' :
                   newExpense.splitType === 'percentage' ? 'Split by percentage' :
                   'Specify exact amounts for each person'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes (Optional)"
                value={newExpense.notes}
                onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            {/* Splits */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Split Details
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Member</TableCell>
                      {newExpense.splitType !== 'equal' && (
                        <TableCell align="right">
                          {newExpense.splitType === 'percentage' ? 'Percentage' : 'Amount'}
                        </TableCell>
                      )}
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newExpense.splits.map((split) => {
                      const member = getMemberById(split.memberId);
                      
                      return (
                        <TableRow key={split.memberId}>
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                alt={member?.name} 
                                src={member?.avatar}
                                sx={{ width: 24, height: 24, mr: 1 }}
                              >
                                {member?.name.charAt(0)}
                              </Avatar>
                              {member?.name}
                            </Box>
                          </TableCell>
                          
                          {newExpense.splitType === 'percentage' && (
                            <TableCell align="right">
                              <TextField
                                value={split.percentage}
                                onChange={(e) => handleSplitPercentageChange(split.memberId, e.target.value)}
                                variant="outlined"
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                          )}
                          
                          {newExpense.splitType === 'custom' && (
                            <TableCell align="right">
                              <TextField
                                value={split.amount}
                                onChange={(e) => handleSplitAmountChange(split.memberId, e.target.value)}
                                variant="outlined"
                                size="small"
                                type="number"
                                inputProps={{ min: 0, step: 0.01 }}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                          )}
                          
                          <TableCell align="right">
                            {newExpense.splitType === 'equal' ? (
                              formatCurrency(split.amount)
                            ) : newExpense.splitType === 'percentage' ? (
                              <Tooltip title={`${split.percentage}% of ${formatCurrency(newExpense.amount)}`}>
                                <span>{formatCurrency(split.amount)}</span>
                              </Tooltip>
                            ) : (
                              formatCurrency(split.amount)
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {/* Total row */}
                    <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                      <TableCell>Total</TableCell>
                      {newExpense.splitType !== 'equal' && (
                        <TableCell align="right">
                          {newExpense.splitType === 'percentage' ? 
                            `${newExpense.splits.reduce((sum, split) => sum + split.percentage, 0).toFixed(1)}%` : 
                            ''}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {formatCurrency(newExpense.splits.reduce((sum, split) => sum + split.amount, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setExpenseDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleSaveExpense}
          >
            {newExpense.id ? 'Update Expense' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Household settings dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Household Settings
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Household Name */}
            <Grid item xs={12}>
              <TextField
                label="Household Name"
                value={householdSettings.name}
                onChange={(e) => setHouseholdSettings(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            
            {/* Default Split Type */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Default Split Type</InputLabel>
                <Select
                  value={householdSettings.defaultSplitType}
                  onChange={(e) => setHouseholdSettings(prev => ({ ...prev, defaultSplitType: e.target.value }))}
                  label="Default Split Type"
                >
                  <MenuItem value="equal">Equal Split</MenuItem>
                  <MenuItem value="percentage">Percentage Split</MenuItem>
                  <MenuItem value="custom">Custom Split</MenuItem>
                </Select>
                <FormHelperText>
                  This will be the default when adding new expenses
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Auto-approve Transactions */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={householdSettings.autoApproveTransactions}
                    onChange={(e) => setHouseholdSettings(prev => ({ ...prev, autoApproveTransactions: e.target.checked }))}
                  />
                }
                label="Auto-approve Transactions"
              />
              <FormHelperText>
                When enabled, transactions added by members don't require approval
              </FormHelperText>
            </Grid>
            
            {/* Notifications */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={householdSettings.notifyOnNewTransactions}
                    onChange={(e) => setHouseholdSettings(prev => ({ ...prev, notifyOnNewTransactions: e.target.checked }))}
                  />
                }
                label="Notify on New Transactions"
              />
              <FormHelperText>
                Receive notifications when new expenses are added
              </FormHelperText>
            </Grid>
            
            {/* Privacy Level */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Privacy Level</InputLabel>
                <Select
                  value={householdSettings.privacyLevel}
                  onChange={(e) => setHouseholdSettings(prev => ({ ...prev, privacyLevel: e.target.value }))}
                  label="Privacy Level"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="enhanced">Enhanced</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
                <FormHelperText>
                  {householdSettings.privacyLevel === 'standard' ? 
                    'Members can see all transaction details' : 
                   householdSettings.privacyLevel === 'enhanced' ? 
                    'Members can see transactions but with limited details' : 
                    'Members can only see transactions they are involved in'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Currency */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={householdSettings.currency}
                  onChange={(e) => setHouseholdSettings(prev => ({ ...prev, currency: e.target.value }))}
                  label="Currency"
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="CAD">CAD (C$)</MenuItem>
                  <MenuItem value="AUD">AUD (A$)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New invitation dialog */}
      <Dialog
        open={newInviteDialogOpen}
        onClose={() => setNewInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Invite to Household
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Email */}
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                value={newInvite.email}
                onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
                required
                type="email"
              />
            </Grid>
            
            {/* Role */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newInvite.role}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, role: e.target.value }))}
                  label="Role"
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
                <FormHelperText>
                  {newInvite.role === 'admin' ? 'Administrators have full access to all household data' :
                   newInvite.role === 'member' ? 'Members can view and add transactions' :
                   'Viewers can only view household data'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Personal Message */}
            <Grid item xs={12}>
              <TextField
                label="Personal Message (Optional)"
                value={newInvite.message}
                onChange={(e) => setNewInvite(prev => ({ ...prev, message: e.target.value }))}
                fullWidth
                multiline
                rows={3}
                placeholder="Add a personal note to your invitation..."
              />
            </Grid>
            
            {/* Expiration */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Invitation Expires In</InputLabel>
                <Select
                  value={newInvite.expiresIn}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, expiresIn: e.target.value }))}
                  label="Invitation Expires In"
                >
                  <MenuItem value={1}>1 day</MenuItem>
                  <MenuItem value={3}>3 days</MenuItem>
                  <MenuItem value={7}>7 days</MenuItem>
                  <MenuItem value={14}>14 days</MenuItem>
                  <MenuItem value={30}>30 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setNewInviteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleSendInvite}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Member menu */}
      <Menu
        anchorEl={memberMenuAnchorEl}
        open={Boolean(memberMenuAnchorEl)}
        onClose={handleCloseMemberMenu}
      >
        <MenuItem onClick={handleEditMember}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Permissions" />
        </MenuItem>
        
        <MenuItem onClick={handleRemoveMember} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Remove from Household" />
        </MenuItem>
      </Menu>
      
      {/* Expense menu */}
      <Menu
        anchorEl={expenseMenuAnchorEl}
        open={Boolean(expenseMenuAnchorEl)}
        onClose={handleCloseExpenseMenu}
      >
        <MenuItem onClick={handleEditExpense}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Expense" />
        </MenuItem>
        
        <MenuItem onClick={handleDeleteExpense} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Expense" />
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default HouseholdManager;