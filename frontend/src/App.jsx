import { useState, useEffect, useMemo, useCallback } from "react";

import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  MoreHorizontal,
  DollarSign,
  Pencil,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  Filter,
  ArrowUpDown,
  PieChart as PieIcon,
  Moon,
  Sun,
  RotateCcw,
  CircleAlert,
  CheckCircle2,
  IndianRupee,
  FileSpreadsheet,
  SlidersHorizontal,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getTransactions,
  addTransactionAPI,
  updateTransactionAPI,
  deleteTransactionAPI,
} from "./services/api";

import "./App.css";


const ITEMS_PER_PAGE = 5;

const CATEGORIES = [
  "Food",
  "Shopping",
  "Electronics",
  "Travel",
  "Housing",
  "Education",
  "Healthcare",
  "Entertainment",
  "Salary",
  "Other",
];

const CATEGORY_COLORS = [
  "#16a34a",
  "#3b82f6",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#eab308",
  "#64748b",
];

const CATEGORY_ICONS = {
  Shopping: ShoppingBag,
  Electronics: CreditCard,
  Food: Utensils,
  Travel: Car,
  Housing: Home,
  Salary: Wallet,
  Education: FileSpreadsheet,
  Healthcare: CircleAlert,
  Entertainment: PieIcon,
  Other: DollarSign,
};


function App() {

  // =====================================
  // STATES
  // =====================================

  const [transactions, setTransactions] = useState([]);

  const [activePage, setActivePage] = useState("Dashboard");

  const [mobileMenu, setMobileMenu] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [toast, setToast] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("expenseflow-theme") === "dark"
  );

  // =====================================
  // FORM STATE
  // =====================================

  const initialForm = {
    title: "",
    category: "Food",
    amount: "",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
  };

  const [form, setForm] = useState(initialForm);

  // =====================================
  // FILTER STATES
  // =====================================

  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");

  const [typeFilter, setTypeFilter] = useState("All");

  const [dateFilter, setDateFilter] = useState("All");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  // =====================================
  // SORTING
  // =====================================

  const [sortBy, setSortBy] = useState("date");

  const [sortOrder, setSortOrder] = useState("desc");

  // =====================================
  // PAGINATION
  // =====================================

  const [currentPage, setCurrentPage] = useState(1);

  // =====================================
  // ANALYTICS PERIOD
  // =====================================

  const [analyticsPeriod, setAnalyticsPeriod] = useState("This Year");


  // =====================================
  // TOAST NOTIFICATION
  // =====================================

  const showToast = (message, type = "success") => {

    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3500);

  };


  // =====================================
  // FORMAT CURRENCY
  // =====================================

  const formatCurrency = (amount) => {

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  };


  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {

    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  };


  // =====================================
  // FETCH TRANSACTIONS
  // =====================================

  const fetchTransactions = useCallback(async (showLoader = true) => {

    try {

      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const data = await getTransactions();

      if (data.success) {

        setTransactions(data.transactions || []);

      } else {

        throw new Error(
          data.message || "Unable to load transactions"
        );

      }

    } catch (err) {

      console.error("Fetch Error:", err);

      setError(
        err.message || "Failed to connect with backend"
      );

    } finally {

      setLoading(false);

    }

  }, []);


  useEffect(() => {

    fetchTransactions();

  }, [fetchTransactions]);


  // =====================================
  // THEME
  // =====================================

  useEffect(() => {

    localStorage.setItem(
      "expenseflow-theme",
      darkMode ? "dark" : "light"
    );

    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );

  }, [darkMode]);


  // =====================================
  // FINANCIAL SUMMARY
  // =====================================

  const totalIncome = useMemo(() => {

    return transactions
      .filter((t) => t.type === "income")
      .reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );

  }, [transactions]);


  const totalExpense = useMemo(() => {

    return transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );

  }, [transactions]);


  const balance = totalIncome - totalExpense;


  // =====================================
  // MONTHLY SUMMARY
  // =====================================

  const currentMonth = new Date().getMonth();

  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((t) => {

    const date = new Date(t.date);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );

  });


  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);


  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);


  // =====================================
  // SEARCH + FILTER
  // =====================================

  const filteredTransactions = useMemo(() => {

    return transactions.filter((transaction) => {

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =

        transaction.title?.toLowerCase().includes(search) ||

        transaction.category?.toLowerCase().includes(search) ||

        transaction.type?.toLowerCase().includes(search);


      const matchesCategory =

        categoryFilter === "All" ||

        transaction.category === categoryFilter;


      const matchesType =

        typeFilter === "All" ||

        transaction.type === typeFilter;


      const transactionDate = new Date(transaction.date);

      const now = new Date();

      let matchesDate = true;


      if (dateFilter === "This Month") {

        matchesDate =

          transactionDate.getMonth() === now.getMonth() &&

          transactionDate.getFullYear() === now.getFullYear();

      }


      if (dateFilter === "Last Month") {

        const lastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );

        matchesDate =

          transactionDate.getMonth() === lastMonth.getMonth() &&

          transactionDate.getFullYear() === lastMonth.getFullYear();

      }


      if (dateFilter === "This Year") {

        matchesDate =
          transactionDate.getFullYear() === now.getFullYear();

      }


      if (dateFilter === "Custom") {

        const transactionTime = transactionDate.getTime();

        const startTime = startDate
          ? new Date(startDate + "T00:00:00").getTime()
          : null;

        const endTime = endDate
          ? new Date(endDate + "T23:59:59").getTime()
          : null;

        if (startTime && transactionTime < startTime) {
          matchesDate = false;
        }

        if (endTime && transactionTime > endTime) {
          matchesDate = false;
        }

      }


      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesDate
      );

    });

  }, [
    transactions,
    searchTerm,
    categoryFilter,
    typeFilter,
    dateFilter,
    startDate,
    endDate,
  ]);


  // =====================================
  // SORT TRANSACTIONS
  // =====================================

  const sortedTransactions = useMemo(() => {

    const sorted = [...filteredTransactions];

    sorted.sort((a, b) => {

      let valueA;
      let valueB;

      if (sortBy === "amount") {

        valueA = Number(a.amount || 0);

        valueB = Number(b.amount || 0);

      } else if (sortBy === "title") {

        valueA = (a.title || "").toLowerCase();

        valueB = (b.title || "").toLowerCase();

      } else if (sortBy === "category") {

        valueA = (a.category || "").toLowerCase();

        valueB = (b.category || "").toLowerCase();

      } else {

        valueA = new Date(a.date || 0).getTime();

        valueB = new Date(b.date || 0).getTime();

      }

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;

      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;

      return 0;

    });

    return sorted;

  }, [filteredTransactions, sortBy, sortOrder]);


  // =====================================
  // PAGINATION
  // =====================================

  const totalPages = Math.max(
    1,
    Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE)
  );


  const paginatedTransactions = useMemo(() => {

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return sortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  }, [sortedTransactions, currentPage]);


  useEffect(() => {

    setCurrentPage(1);

  }, [
    searchTerm,
    categoryFilter,
    typeFilter,
    dateFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);


  useEffect(() => {

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

  }, [currentPage, totalPages]);


  // =====================================
  // CLEAR FILTERS
  // =====================================

  const clearFilters = () => {

    setSearchTerm("");

    setCategoryFilter("All");

    setTypeFilter("All");

    setDateFilter("All");

    setStartDate("");

    setEndDate("");

    setSortBy("date");

    setSortOrder("desc");

    setCurrentPage(1);

  };


  // =====================================
  // RESET FORM
  // =====================================

  const resetTransactionForm = () => {

    setForm({
      ...initialForm,
      date: new Date().toISOString().slice(0, 10),
    });

    setEditingId(null);

    setShowModal(false);

  };


  // =====================================
  // OPEN ADD MODAL
  // =====================================

  const openAddModal = () => {

    setEditingId(null);

    setForm({
      ...initialForm,
      date: new Date().toISOString().slice(0, 10),
    });

    setShowModal(true);

  };


  // =====================================
  // OPEN EDIT MODAL
  // =====================================

  const openEditModal = (transaction) => {

    setEditingId(transaction._id);

    setForm({

      title: transaction.title || "",

      category: transaction.category || "Food",

      amount: String(transaction.amount ?? ""),

      type: transaction.type || "expense",

      date: transaction.date
        ? new Date(transaction.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),

    });

    setShowModal(true);

  };


  // =====================================
  // ADD / UPDATE TRANSACTION
  // =====================================

  const handleSaveTransaction = async (e) => {

    e.preventDefault();

    if (!form.title.trim()) {

      showToast("Please enter transaction title.", "error");

      return;

    }

    if (!form.amount || Number(form.amount) <= 0) {

      showToast("Please enter a valid amount.", "error");

      return;

    }

    if (!form.date) {

      showToast("Please select transaction date.", "error");

      return;

    }


    try {

      setSaving(true);

      const transactionData = {

        title: form.title.trim(),

        category: form.category,

        amount: Number(form.amount),

        type: form.type,

        date: new Date(form.date + "T12:00:00").toISOString(),

      };


      let data;

      if (editingId) {

        data = await updateTransactionAPI(
          editingId,
          transactionData
        );

      } else {

        data = await addTransactionAPI(transactionData);

      }


      if (data.success) {

        await fetchTransactions(false);

        resetTransactionForm();

        showToast(
          editingId
            ? "Transaction updated successfully!"
            : "Transaction added successfully!"
        );

      } else {

        throw new Error(
          data.message || "Transaction operation failed"
        );

      }

    } catch (err) {

      console.error("Save Error:", err);

      showToast(
        err.message || "Failed to save transaction",
        "error"
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================
  // DELETE TRANSACTION
  // =====================================

  const handleDeleteTransaction = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;


    try {

      setDeletingId(id);

      const data = await deleteTransactionAPI(id);

      if (data.success) {

        await fetchTransactions(false);

        showToast("Transaction deleted successfully!");

      } else {

        throw new Error(
          data.message || "Unable to delete transaction"
        );

      }

    } catch (err) {

      console.error("Delete Error:", err);

      showToast(
        err.message || "Failed to delete transaction",
        "error"
      );

    } finally {

      setDeletingId(null);

    }

  };


  // =====================================
  // EXPORT CSV
  // =====================================

  const exportTransactionsCSV = () => {

    if (sortedTransactions.length === 0) {

      showToast("No transactions available to export.", "error");

      return;

    }

    const headers = [
      "Transaction ID",
      "Title",
      "Category",
      "Type",
      "Amount",
      "Date",
    ];


    const rows = sortedTransactions.map((t) => [

      t._id || "",

      t.title || "",

      t.category || "",

      t.type || "",

      Number(t.amount || 0),

      t.date ? new Date(t.date).toLocaleDateString("en-IN") : "",

    ]);


    const csvContent = [

      headers,

      ...rows,

    ].map((row) =>

      row.map((value) => {

        const safeValue = String(value).replace(/"/g, '""');

        return `"${safeValue}"`;

      }).join(",")

    ).join("\n");


    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );


    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `ExpenseFlow_Transactions_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("CSV file exported successfully!");

  };


  // =====================================
  // DYNAMIC CHART DATA
  // =====================================

  const chartData = useMemo(() => {

    const now = new Date();

    const year = now.getFullYear();

    const months = [
      "Jan", "Feb", "Mar", "Apr",
      "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec",
    ];

    let data = [];

    if (analyticsPeriod === "This Year") {

      data = months.map((month, index) => {

        const monthTransactions = transactions.filter((t) => {

          const date = new Date(t.date);

          return (
            date.getMonth() === index &&
            date.getFullYear() === year
          );

        });

        return {

          month,

          income: monthTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount || 0), 0),

          expense: monthTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount || 0), 0),

        };

      });

    } else {

      const lastYear = year - 1;

      data = months.map((month, index) => {

        const monthTransactions = transactions.filter((t) => {

          const date = new Date(t.date);

          return (
            date.getMonth() === index &&
            date.getFullYear() === lastYear
          );

        });

        return {

          month,

          income: monthTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount || 0), 0),

          expense: monthTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount || 0), 0),

        };

      });

    }

    return data;

  }, [transactions, analyticsPeriod]);


  // =====================================
  // CATEGORY ANALYTICS
  // =====================================

  const categoryData = useMemo(() => {

    const expenses = transactions.filter(
      (t) => t.type === "expense"
    );

    const grouped = {};

    expenses.forEach((t) => {

      const category = t.category || "Other";

      grouped[category] =
        (grouped[category] || 0) + Number(t.amount || 0);

    });


    return Object.entries(grouped).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

  }, [transactions]);


  // =====================================
  // NAVIGATION
  // =====================================

  const navItems = [

    { name: "Dashboard", icon: LayoutDashboard },

    { name: "Transactions", icon: ArrowLeftRight },

    { name: "Analytics", icon: ChartNoAxesCombined },

    { name: "Wallet", icon: Wallet },

    { name: "Settings", icon: Settings },

  ];


  const changePage = (page) => {

    setActivePage(page);

    setMobileMenu(false);

    setShowNotifications(false);

  };


  // =====================================
  // TRANSACTION TABLE
  // =====================================

  const renderTransactionTable = (items, showActions = true) => {

    return (

      <div className="table-wrapper">

        <table className="transactions-table">

          <thead>

            <tr>

              <th>TRANSACTION</th>

              <th>CATEGORY</th>

              <th>DATE</th>

              <th>TYPE</th>

              <th>AMOUNT</th>

              {showActions && <th>ACTIONS</th>}

            </tr>

          </thead>

          <tbody>

            {items.length > 0 ? (

              items.map((transaction) => {

                const Icon =
                  CATEGORY_ICONS[transaction.category] || DollarSign;

                return (

                  <tr key={transaction._id}>

                    <td>

                      <div className="transaction-name">

                        <div className="transaction-icon">

                          <Icon size={18} />

                        </div>

                        <div>

                          <strong>{transaction.title}</strong>

                          <small>
                            {transaction.type === "income"
                              ? "Money received"
                              : "Money spent"}
                          </small>

                        </div>

                      </div>

                    </td>

                    <td>{transaction.category}</td>

                    <td>{formatDate(transaction.date)}</td>

                    <td>

                      <span className={`type-badge ${transaction.type}`}>

                        {transaction.type}

                      </span>

                    </td>

                    <td className={`amount-cell ${transaction.type}`}>

                      {transaction.type === "income" ? "+" : "-"}

                      {formatCurrency(transaction.amount)}

                    </td>

                    {showActions && (

                      <td>

                        <div className="table-actions">

                          <button
                            className="edit-action"
                            onClick={() => openEditModal(transaction)}
                            disabled={saving || deletingId === transaction._id}
                            title="Edit transaction"
                          >

                            <Pencil size={15} />

                          </button>

                          <button
                            className="delete-action"
                            onClick={() => handleDeleteTransaction(transaction._id)}
                            disabled={deletingId === transaction._id}
                            title="Delete transaction"
                          >

                            {deletingId === transaction._id
                              ? <RefreshCw size={15} className="spin" />
                              : <Trash2 size={15} />}

                          </button>

                        </div>

                      </td>

                    )}

                  </tr>

                );

              })

            ) : (

              <tr>

                <td
                  colSpan={showActions ? 6 : 5}
                  className="empty-table"
                >

                  <div className="empty-state">

                    <Wallet size={30} />

                    <h3>No transactions found</h3>

                    <p>Try changing your filters or add a new transaction.</p>

                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    );

  };


  // =====================================
  // PAGINATION COMPONENT
  // =====================================

  const renderPagination = () => {

    if (sortedTransactions.length <= ITEMS_PER_PAGE) return null;

    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;

    const end = Math.min(
      currentPage * ITEMS_PER_PAGE,
      sortedTransactions.length
    );

    return (

      <div className="pagination">

        <p>
          Showing <strong>{start}-{end}</strong> of{" "}
          <strong>{sortedTransactions.length}</strong> transactions
        </p>

        <div className="pagination-controls">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft size={17} />
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight size={17} />
          </button>

        </div>

      </div>

    );

  };


  // =====================================
  // FILTER TOOLBAR
  // =====================================

  const renderFilterToolbar = () => (

    <>

      <div className="filter-toolbar">

        <div className="transaction-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (

            <button onClick={() => setSearchTerm("")}>
              <X size={15} />
            </button>

          )}

        </div>


        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >

          <option value="All">All Categories</option>

          {CATEGORIES.map((category) => (

            <option key={category} value={category}>
              {category}
            </option>

          ))}

        </select>


        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >

          <option value="All">All Types</option>

          <option value="income">Income</option>

          <option value="expense">Expense</option>

        </select>


        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >

          <option value="All">All Time</option>

          <option value="This Month">This Month</option>

          <option value="Last Month">Last Month</option>

          <option value="This Year">This Year</option>

          <option value="Custom">Custom Range</option>

        </select>


        <button
          className="clear-filter-btn"
          onClick={clearFilters}
          title="Clear all filters"
        >

          <RotateCcw size={15} />

          Clear

        </button>

      </div>


      {dateFilter === "Custom" && (

        <div className="custom-date-filter">

          <label>
            From
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>

        </div>

      )}


      <div className="sorting-toolbar">

        <span>
          <SlidersHorizontal size={15} />
          Sort by
        </span>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >

          <option value="date">Date</option>

          <option value="amount">Amount</option>

          <option value="title">Title</option>

          <option value="category">Category</option>

        </select>


        <button
          onClick={() =>
            setSortOrder((prev) =>
              prev === "asc" ? "desc" : "asc"
            )
          }
        >

          <ArrowUpDown size={15} />

          {sortOrder === "asc" ? "Ascending" : "Descending"}

        </button>

        <span className="result-count">
          {sortedTransactions.length} results
        </span>

      </div>

    </>

  );


  // =====================================
  // DASHBOARD PAGE
  // =====================================

  const renderDashboard = () => (

    <>

      <section className="summary-section">

        <div className="section-heading">

          <div>

            <h2>Financial Overview</h2>

            <p>Your complete financial summary</p>

          </div>

          <button className="add-btn" onClick={openAddModal}>

            <Plus size={18} />

            Add Transaction

          </button>

        </div>


        <div className="summary-grid">

          <div className="summary-card">

            <div className="card-top">

              <div className="card-icon purple">
                <Wallet />
              </div>

              <span className="card-tag">Available</span>

            </div>

            <p>Total Balance</p>

            <h2>{formatCurrency(balance)}</h2>

            <div className="card-footer">
              <TrendingUp size={15} />
              Income - Expenses
            </div>

          </div>


          <div className="summary-card">

            <div className="card-top">

              <div className="card-icon green">
                <TrendingUp />
              </div>

              <span className="positive-tag">Income</span>

            </div>

            <p>Total Income</p>

            <h2>{formatCurrency(totalIncome)}</h2>

            <div className="card-footer positive">
              <ArrowUpRight size={15} />
              Money received
            </div>

          </div>


          <div className="summary-card">

            <div className="card-top">

              <div className="card-icon red">
                <TrendingDown />
              </div>

              <span className="negative-tag">Expense</span>

            </div>

            <p>Total Expenses</p>

            <h2>{formatCurrency(totalExpense)}</h2>

            <div className="card-footer negative">
              <ArrowDownRight size={15} />
              Money spent
            </div>

          </div>


          <div className="summary-card">

            <div className="card-top">

              <div className="card-icon blue">
                <CreditCard />
              </div>

              <span className="card-tag">Activity</span>

            </div>

            <p>Total Transactions</p>

            <h2>{transactions.length}</h2>

            <div className="card-footer">
              <ArrowUpRight size={15} />
              Recorded transactions
            </div>

          </div>

        </div>

      </section>


      <section className="monthly-overview">

        <div className="monthly-card">

          <span>This Month's Income</span>

          <h3>{formatCurrency(monthlyIncome)}</h3>

        </div>

        <div className="monthly-card">

          <span>This Month's Expenses</span>

          <h3>{formatCurrency(monthlyExpense)}</h3>

        </div>

        <div className="monthly-card">

          <span>This Month's Savings</span>

          <h3>{formatCurrency(monthlyIncome - monthlyExpense)}</h3>

        </div>

      </section>


      <section className="chart-section">

        <div className="section-heading">

          <div>

            <h2>Income vs Expenses</h2>

            <p>Real transaction data from your account</p>

          </div>

          <select
            className="period-select"
            value={analyticsPeriod}
            onChange={(e) => setAnalyticsPeriod(e.target.value)}
          >

            <option>This Year</option>

            <option>Last Year</option>

          </select>

        </div>


        <div className="chart-container">

          <ResponsiveContainer width="100%" height={300}>

            <AreaChart data={chartData}>

              <defs>

                <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />

                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />

                </linearGradient>


                <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />

                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />

                </linearGradient>

              </defs>


              <CartesianGrid strokeDasharray="4 4" vertical={false} />


              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
              />


              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />


              <Tooltip
                formatter={(value) => formatCurrency(value)}
              />


              <Area
                type="monotone"
                dataKey="income"
                stroke="#16a34a"
                fill="url(#incomeColor)"
                strokeWidth={3}
              />


              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f97316"
                fill="url(#expenseColor)"
                strokeWidth={3}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>


        <div className="chart-legend">

          <span>
            <i className="income-dot"></i>
            Income
          </span>

          <span>
            <i className="expense-dot"></i>
            Expenses
          </span>

        </div>

      </section>


      <section className="transactions-section">

        <div className="section-heading">

          <div>

            <h2>Recent Transactions</h2>

            <p>Your latest financial activities</p>

          </div>

          <button
            className="view-all"
            onClick={() => changePage("Transactions")}
          >
            View All →
          </button>

        </div>


        {renderTransactionTable(
          [...transactions]
            .sort((a, b) =>
              new Date(b.date) - new Date(a.date)
            )
            .slice(0, 5),
          false
        )}

      </section>

    </>

  );


  // =====================================
  // TRANSACTIONS PAGE
  // =====================================

  const renderTransactionsPage = () => (

    <section className="transactions-page">

      <div className="section-heading">

        <div>

          <h2>All Transactions</h2>

          <p>Manage your income and expenses</p>

        </div>


        <div className="heading-actions">

          <button
            className="export-btn"
            onClick={exportTransactionsCSV}
          >

            <Download size={17} />

            Export CSV

          </button>


          <button className="add-btn" onClick={openAddModal}>

            <Plus size={18} />

            Add Transaction

          </button>

        </div>

      </div>


      {renderFilterToolbar()}


      {renderTransactionTable(paginatedTransactions, true)}


      {renderPagination()}

    </section>

  );


  // =====================================
  // ANALYTICS PAGE
  // =====================================

  const renderAnalyticsPage = () => (

    <section className="analytics-page">

      <div className="section-heading">

        <div>

          <h2>Financial Analytics</h2>

          <p>Understand your spending habits</p>

        </div>

      </div>


      <div className="analytics-summary">

        <div className="analytics-card">

          <span>Total Income</span>

          <h2>{formatCurrency(totalIncome)}</h2>

        </div>

        <div className="analytics-card">

          <span>Total Expenses</span>

          <h2>{formatCurrency(totalExpense)}</h2>

        </div>

        <div className="analytics-card">

          <span>Net Savings</span>

          <h2>{formatCurrency(balance)}</h2>

        </div>

      </div>


      <div className="analytics-grid">

        <div className="chart-section">

          <div className="section-heading">

            <div>

              <h3>Income & Expenses</h3>

              <p>Monthly comparison</p>

            </div>

          </div>

          <div className="chart-container">

            <ResponsiveContainer width="100%" height={300}>

              <AreaChart data={chartData}>

                <CartesianGrid strokeDasharray="4 4" vertical={false} />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip formatter={(value) => formatCurrency(value)} />

                <Area
                  dataKey="income"
                  stroke="#16a34a"
                  fill="#dcfce7"
                />

                <Area
                  dataKey="expense"
                  stroke="#f97316"
                  fill="#ffedd5"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>


        <div className="chart-section">

          <div className="section-heading">

            <div>

              <h3>Expense by Category</h3>

              <p>Category-wise spending</p>

            </div>

          </div>


          {categoryData.length > 0 ? (

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                >

                  {categoryData.map((entry, index) => (

                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />

                  ))}

                </Pie>

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          ) : (

            <div className="empty-state">

              <PieIcon size={30} />

              <p>No expense data available.</p>

            </div>

          )}

        </div>

      </div>


      <section className="transactions-section">

        <h3>Category Breakdown</h3>

        <div className="category-breakdown">

          {categoryData.length > 0 ? (

            categoryData.map((item, index) => (

              <div className="category-row" key={item.name}>

                <div className="category-info">

                  <span
                    className="category-color"
                    style={{
                      background: CATEGORY_COLORS[
                        index % CATEGORY_COLORS.length
                      ],
                    }}
                  />

                  <strong>{item.name}</strong>

                </div>

                <strong>{formatCurrency(item.value)}</strong>

              </div>

            ))

          ) : (

            <p>No category data available.</p>

          )}

        </div>

      </section>

    </section>

  );


  // =====================================
  // WALLET PAGE
  // =====================================

  const renderWalletPage = () => (

    <section className="wallet-page">

      <div className="section-heading">

        <div>

          <h2>My Wallet</h2>

          <p>Your financial account overview</p>

        </div>

      </div>


      <div className="wallet-card">

        <div className="wallet-card-top">

          <Wallet size={30} />

          <span>ExpenseFlow Wallet</span>

        </div>

        <p>Total Available Balance</p>

        <h1>{formatCurrency(balance)}</h1>

        <div className="wallet-card-bottom">

          <span>Personal Account</span>

          <span>INR ₹</span>

        </div>

      </div>


      <div className="analytics-summary">

        <div className="analytics-card">

          <span>Total Income</span>

          <h2>{formatCurrency(totalIncome)}</h2>

        </div>

        <div className="analytics-card">

          <span>Total Expense</span>

          <h2>{formatCurrency(totalExpense)}</h2>

        </div>

      </div>


      <section className="transactions-section">

        <div className="section-heading">

          <div>

            <h2>Recent Activity</h2>

            <p>Your latest wallet transactions</p>

          </div>

        </div>

        {renderTransactionTable(
          [...transactions]
            .sort((a, b) =>
              new Date(b.date) - new Date(a.date)
            )
            .slice(0, 5),
          false
        )}

      </section>

    </section>

  );


  // =====================================
  // SETTINGS PAGE
  // =====================================

  const renderSettingsPage = () => (

    <section className="settings-page">

      <div className="section-heading">

        <div>

          <h2>Settings</h2>

          <p>Manage your application preferences</p>

        </div>

      </div>


      <div className="settings-card">

        <div className="settings-item">

          <div className="settings-icon">

            <Moon size={20} />

          </div>

          <div className="settings-info">

            <h3>Appearance</h3>

            <p>Switch between light and dark theme.</p>

          </div>

          <button
            className={`theme-toggle ${darkMode ? "enabled" : ""}`}
            onClick={() => setDarkMode((prev) => !prev)}
          >

            {darkMode ? <Moon size={16} /> : <Sun size={16} />}

            {darkMode ? "Dark Mode" : "Light Mode"}

          </button>

        </div>


        <div className="settings-item">

          <div className="settings-icon">

            <IndianRupee size={20} />

          </div>

          <div className="settings-info">

            <h3>Currency</h3>

            <p>Default currency used throughout ExpenseFlow.</p>

          </div>

          <strong>Indian Rupee (INR)</strong>

        </div>


        <div className="settings-item">

          <div className="settings-icon">

            <RefreshCw size={20} />

          </div>

          <div className="settings-info">

            <h3>Refresh Data</h3>

            <p>Fetch the latest transactions from the server.</p>

          </div>

          <button
            className="settings-action"
            onClick={() => fetchTransactions()}
          >

            <RefreshCw size={15} />

            Refresh

          </button>

        </div>


        <div className="settings-item">

          <div className="settings-icon">

            <Download size={20} />

          </div>

          <div className="settings-info">

            <h3>Export Transactions</h3>

            <p>Download all filtered transactions as CSV.</p>

          </div>

          <button
            className="settings-action"
            onClick={exportTransactionsCSV}
          >

            <Download size={15} />

            Export

          </button>

        </div>

      </div>


      <div className="settings-about">

        <h3>About ExpenseFlow</h3>

        <p>
          ExpenseFlow is a personal finance management application
          developed to track income, expenses and financial activities.
        </p>

        <span>Version 1.0.0</span>

      </div>

    </section>

  );


  // =====================================
  // PAGE CONTENT
  // =====================================

  const renderPage = () => {

    switch (activePage) {

      case "Dashboard":
        return renderDashboard();

      case "Transactions":
        return renderTransactionsPage();

      case "Analytics":
        return renderAnalyticsPage();

      case "Wallet":
        return renderWalletPage();

      case "Settings":
        return renderSettingsPage();

      default:
        return renderDashboard();

    }

  };


  // =====================================
  // MAIN RETURN
  // =====================================

  return (

    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>

      {/* MOBILE OVERLAY */}

      {mobileMenu && (

        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenu(false)}
        />

      )}


      {/* SIDEBAR */}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>

        <div className="brand">

          <div className="brand-icon">

            <Wallet size={23} />

          </div>

          <h2>
            Expense<span>Flow</span>
          </h2>

          <button
            className="close-menu"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >

            <X />

          </button>

        </div>


        <div className="sidebar-label">MENU</div>


        <nav className="navigation">

          {navItems.map((item) => (

            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => changePage(item.name)}
            >

              <item.icon size={20} />

              <span>{item.name}</span>

            </button>

          ))}

        </nav>


        <div className="sidebar-bottom">

          <div className="upgrade-card">

            <div className="upgrade-icon">✦</div>

            <h3>Manage Money Better</h3>

            <p>
              Track your expenses and achieve your financial goals.
            </p>

            <button onClick={() => changePage("Analytics")}>

              Explore Analytics

            </button>

          </div>


          <div className="profile">

            <div className="avatar">AY</div>

            <div>

              <h4>Amit Yadav</h4>

              <p>Personal Account</p>

            </div>

            <MoreHorizontal size={20} />

          </div>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* HEADER */}

        <header className="topbar">

          <div className="topbar-left">

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >

              <Menu />

            </button>

            <div className="welcome">

              <h1>{activePage}</h1>

              <p>Welcome back! Here's your financial overview.</p>

            </div>

          </div>


          <div className="topbar-actions">

            <button
              className="header-refresh"
              onClick={() => fetchTransactions()}
              title="Refresh data"
            >

              <RefreshCw size={17} />

            </button>


            <button
              className="notification-btn"
              onClick={() =>
                setShowNotifications((prev) => !prev)
              }
              aria-label="Notifications"
            >

              <Bell size={20} />

              {transactions.length > 0 && <span />}

            </button>


            <div className="top-avatar">AY</div>


            {showNotifications && (

              <div className="notification-panel">

                <h3>Notifications</h3>

                <p>
                  {transactions.length > 0
                    ? `${transactions.length} transactions available in your account.`
                    : "No transactions available yet."}
                </p>

                <button
                  onClick={() => {
                    changePage("Transactions");
                    setShowNotifications(false);
                  }}
                >

                  View Transactions

                </button>

              </div>

            )}

          </div>

        </header>


        {/* LOADING */}

        {loading && (

          <div className="status-card">

            <RefreshCw className="spin" size={28} />

            <h2>Loading Transactions...</h2>

            <p>Please wait while we fetch your financial data.</p>

          </div>

        )}


        {/* ERROR */}

        {!loading && error && (

          <div className="status-card error-card">

            <CircleAlert size={32} />

            <h2>Unable to Load Transactions</h2>

            <p>{error}</p>

            <button
              className="add-btn"
              onClick={() => fetchTransactions()}
            >

              <RefreshCw size={16} />

              Retry

            </button>

          </div>

        )}


        {/* PAGE */}

        {!loading && !error && renderPage()}

      </main>


      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              resetTransactionForm();
            }
          }}
        >

          <div className="transaction-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Transaction"
                    : "Add Transaction"}
                </h2>

                <p>Enter your transaction details</p>

              </div>


              <button
                type="button"
                onClick={resetTransactionForm}
                disabled={saving}
                aria-label="Close modal"
              >

                <X />

              </button>

            </div>


            <form onSubmit={handleSaveTransaction}>

              <label>Transaction Type</label>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >

                <option value="expense">Expense</option>

                <option value="income">Income</option>

              </select>


              <label>Transaction Title</label>

              <input
                type="text"
                placeholder="e.g. Grocery Shopping"
                value={form.title}
                maxLength={80}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                required
              />


              <label>Category</label>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
              >

                {CATEGORIES.map((category) => (

                  <option key={category} value={category}>
                    {category}
                  </option>

                ))}

              </select>


              <label>Amount (₹)</label>

              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value,
                  })
                }
                required
              />


              <label>Transaction Date</label>

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value,
                  })
                }
                required
              />


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetTransactionForm}
                  disabled={saving}
                >

                  Cancel

                </button>


                <button
                  className="submit-btn"
                  type="submit"
                  disabled={saving}
                >

                  {saving ? (

                    <>
                      <RefreshCw size={16} className="spin" />

                      {editingId ? "Updating..." : "Saving..."}

                    </>

                  ) : (

                    editingId
                      ? "Update Transaction"
                      : "Save Transaction"

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* TOAST */}

      {toast && (

        <div className={`toast ${toast.type}`}>

          {toast.type === "success"
            ? <CheckCircle2 size={19} />
            : <CircleAlert size={19} />}

          <span>{toast.message}</span>

          <button onClick={() => setToast(null)}>

            <X size={16} />

          </button>

        </div>

      )}

    </div>

  );

}

export default App;