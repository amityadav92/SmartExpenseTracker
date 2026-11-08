const Transaction = require("../models/Transaction");

// ======================================
// 1. GET ALL TRANSACTIONS
// ======================================
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// 2. ADD TRANSACTION
// ======================================
exports.addTransaction = async (req, res) => {
    try {
        const { title, category, amount, type, date } = req.body;

        if (!title || !category || amount === undefined || !type) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const transaction = await Transaction.create({
            title,
            category,
            amount,
            type,
            date
        });

        res.status(201).json({
            success: true,
            message: "Transaction added successfully",
            transaction
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// 3. UPDATE TRANSACTION
// ======================================
exports.updateTransaction = async (req, res) => {
    try {
        const { title, category, amount, type, date } = req.body;

        if (!title || !category || amount === undefined || !type) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            {
                title,
                category,
                amount,
                type,
                date
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            transaction
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// 4. DELETE TRANSACTION
// ======================================
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// 5. GET TRANSACTION SUMMARY
// ======================================
exports.getSummary = async (req, res) => {
    try {
        const transactions = await Transaction.find();

        const totalIncome = transactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        res.status(200).json({
            success: true,
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            totalTransactions: transactions.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};