const express = require("express");

const router = express.Router();

const {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary
} = require("../controllers/transactionController");

// GET ALL TRANSACTIONS
router.get("/", getTransactions);

// ADD TRANSACTION
router.post("/", addTransaction);

// GET SUMMARY
router.get("/summary", getSummary);

// UPDATE TRANSACTION
router.put("/:id", updateTransaction);

// DELETE TRANSACTION
router.delete("/:id", deleteTransaction);

module.exports = router;